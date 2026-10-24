import type {
  AccountMembershipRow,
  AccountRow,
  AuthMethod,
  ServerDb,
  UserRow
} from "../db/server";
import { getRequestId, getServerDb } from "../db/server";
import { ApiKeyError, verifyApiKey } from "../api-keys";

export type AccountContext = {
  requestId: string;
  auth: {
    method: AuthMethod;
    apiKeyId?: string | null;
    supabaseUserId: string;
    email: string | null;
    scopes: string[];
  };
  user: UserRow;
  account: AccountRow;
  membership: AccountMembershipRow;
};

export type AccountResolutionErrorCode =
  | "unauthorized"
  | "auth_not_configured"
  | "account_not_found"
  | "account_forbidden"
  | "account_inactive"
  | "insufficient_scope";

export class AccountResolutionError extends Error {
  readonly status: 401 | 403 | 404 | 500;
  readonly code: AccountResolutionErrorCode;
  readonly requestId: string;

  constructor(status: 401 | 403 | 404 | 500, code: AccountResolutionErrorCode, message: string, requestId: string) {
    super(message);
    this.name = "AccountResolutionError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

type ResolveAccountOptions = {
  db?: ServerDb;
};

export async function resolveAccountContext(request: Request, options: ResolveAccountOptions = {}): Promise<AccountContext> {
  const db = options.db ?? getServerDb();
  const headers = request.headers;
  const requestId = getRequestId(headers);
  const bearerToken = selectBearerToken(headers);

  if (bearerToken) {
    return resolveApiKeyAccountContext(request, db, bearerToken, requestId);
  }

  const auth = await db.authenticate(headers);

  if (!auth.ok) {
    throw new AccountResolutionError(auth.status, auth.code, auth.message, requestId);
  }

  const user = await db.getUserBySupabaseId(auth.user.id);

  if (!user) {
    throw new AccountResolutionError(401, "unauthorized", "Authentication is required.", requestId);
  }

  const activeMemberships = (await db.listMembershipsByUserId(user.id)).filter(
    (membership) => membership.status === "active"
  );

  if (activeMemberships.length === 0) {
    throw new AccountResolutionError(403, "account_forbidden", "This user is not a member of an active account.", requestId);
  }

  const selectedAccountId = selectRequestedAccountId(request);
  const membership = selectedAccountId
    ? activeMemberships.find((candidate) => candidate.accountId === selectedAccountId)
    : activeMemberships[0];

  if (!membership) {
    throw new AccountResolutionError(403, "account_forbidden", "This account is not available to the authenticated user.", requestId);
  }

  const account = await db.getAccount(membership.accountId);

  if (!account) {
    throw new AccountResolutionError(404, "account_not_found", "Account not found.", requestId);
  }

  if (account.status !== "active") {
    throw new AccountResolutionError(403, "account_inactive", "This account is not active.", requestId);
  }

  return {
    requestId,
    auth: {
      method: auth.method,
      apiKeyId: null,
      supabaseUserId: auth.user.id,
      email: auth.user.email,
      scopes: auth.scopes
    },
    user,
    account,
    membership
  };
}

export function toSafeAccount(account: AccountRow): {
  id: string;
  name: string;
  slug: string;
  primary_email: string;
  status: AccountRow["status"];
} {
  return {
    id: account.id,
    name: account.name,
    slug: account.slug,
    primary_email: account.primaryEmail,
    status: account.status
  };
}

export function accountErrorBody(error: AccountResolutionError): {
  error: {
    code: AccountResolutionErrorCode;
    message: string;
    request_id: string;
  };
} {
  return {
    error: {
      code: error.code,
      message: error.message,
      request_id: error.requestId
    }
  };
}

function selectRequestedAccountId(request: Request): string | null {
  return request.headers.get("x-webot-account-id");
}

async function resolveApiKeyAccountContext(
  request: Request,
  db: ServerDb,
  bearerToken: string,
  requestId: string
): Promise<AccountContext> {
  const selectedAccountId = selectRequestedAccountId(request);
  const verified = await verifyBearerApiKey(bearerToken, selectedAccountId, requestId);

  if (!verified.ok) {
    if (verified.code === "account_mismatch") {
      throw new AccountResolutionError(
        403,
        "account_forbidden",
        "This account is not available to the authenticated API key.",
        requestId
      );
    }

    throw new AccountResolutionError(401, "unauthorized", "Authentication is required.", requestId);
  }

  const account = await db.getAccount(verified.accountId);

  if (!account) {
    throw new AccountResolutionError(404, "account_not_found", "Account not found.", requestId);
  }

  if (account.status !== "active") {
    throw new AccountResolutionError(403, "account_inactive", "This account is not active.", requestId);
  }

  const requiredScopes = requiredApiKeyScopes(request);

  if (!hasRequiredScopes(verified.scopes, requiredScopes)) {
    throw new AccountResolutionError(403, "insufficient_scope", "This API key is not scoped for this request.", requestId);
  }

  const user = toApiKeyServiceUser(account, verified.apiKey.id);
  const membership = toApiKeyServiceMembership(account, user);

  return {
    requestId,
    auth: {
      method: "api_key",
      apiKeyId: verified.apiKey.id,
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      scopes: verified.scopes
    },
    user,
    account,
    membership
  };
}

async function verifyBearerApiKey(
  bearerToken: string,
  expectedAccountId: string | null,
  requestId: string
): ReturnType<typeof verifyApiKey> {
  try {
    return await verifyApiKey(bearerToken, {
      expectedAccountId: expectedAccountId ?? undefined
    });
  } catch (error) {
    if (error instanceof ApiKeyError && error.code === "api_key_hash_unavailable") {
      throw new AccountResolutionError(
        500,
        "auth_not_configured",
        "Authentication is not configured for this environment.",
        requestId
      );
    }

    throw error;
  }
}

function selectBearerToken(headers: Headers): string | null {
  const authorization = headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1].trim() : null;
}

function requiredApiKeyScopes(request: Request): string[] {
  const method = request.method.toUpperCase();

  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return ["api:read"];
  }

  return ["api:write"];
}

function hasRequiredScopes(grantedScopes: string[], requiredScopes: string[]): boolean {
  return requiredScopes.every((requiredScope) => grantedScopes.includes(requiredScope));
}

function toApiKeyServiceUser(account: AccountRow, apiKeyId: string): UserRow {
  return {
    id: `api_key:${apiKeyId}`,
    supabaseUserId: `api_key:${apiKeyId}`,
    email: `api-key-${account.id}@internal.webot.local`,
    displayName: "API key service user",
    createdAt: account.createdAt,
    updatedAt: account.updatedAt
  };
}

function toApiKeyServiceMembership(account: AccountRow, user: UserRow): AccountMembershipRow {
  return {
    accountId: account.id,
    userId: user.id,
    role: "member",
    status: "active",
    createdAt: account.createdAt,
    updatedAt: account.updatedAt
  };
}
