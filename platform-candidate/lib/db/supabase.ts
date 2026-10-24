import type {
  AccountMembershipRow,
  AccountRow,
  AuthResult,
  EntitlementRow,
  ServerDb,
  UserRow
} from "./server";
import { normalizeSupabaseUrl, requireConfigValue } from "./supabase-rest";

type FetchLike = typeof fetch;

type SupabaseServerDbConfig = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  fetchImpl?: FetchLike;
};

type SupabaseAuthUserResponse = {
  id?: unknown;
  email?: unknown;
};

type CookiePart = {
  name: string;
  value: string;
};

type SupabaseUserRow = {
  id: string;
  supabase_user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseAccountMembershipRow = {
  account_id: string;
  user_id: string;
  role: AccountMembershipRow["role"];
  status: AccountMembershipRow["status"];
  created_at: string;
  updated_at: string;
};

type SupabaseAccountRow = {
  id: string;
  name: string;
  slug: string;
  primary_email: string;
  stripe_customer_id: string | null;
  status: AccountRow["status"];
  created_at: string;
  updated_at: string;
};

type SupabaseEntitlementRow = {
  id: string;
  account_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_product_id: string;
  stripe_price_id: string;
  entitlement_code: string;
  tier_family: string;
  tier_level: number;
  monthly_quota: number;
  api_access: boolean;
  dashboard_access: boolean;
  status: EntitlementRow["status"];
  current_period_start: string;
  current_period_end: string;
  source_webhook_event_id: string;
  created_at: string;
  updated_at: string;
};

const userSelect = "id,supabase_user_id,email,display_name,created_at,updated_at";
const membershipSelect = "account_id,user_id,role,status,created_at,updated_at";
const accountSelect = "id,name,slug,primary_email,stripe_customer_id,status,created_at,updated_at";
const entitlementSelect = [
  "id",
  "account_id",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_product_id",
  "stripe_price_id",
  "entitlement_code",
  "tier_family",
  "tier_level",
  "monthly_quota",
  "api_access",
  "dashboard_access",
  "status",
  "current_period_start",
  "current_period_end",
  "source_webhook_event_id",
  "created_at",
  "updated_at"
].join(",");

export class SupabaseServerDb implements ServerDb {
  private readonly supabaseUrl: string;
  private readonly anonKey: string;
  private readonly serviceRoleKey: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: SupabaseServerDbConfig) {
    this.supabaseUrl = normalizeSupabaseUrl(config.supabaseUrl);
    this.anonKey = requireConfigValue(config.anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
    this.serviceRoleKey = requireConfigValue(config.serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env, fetchImpl?: FetchLike): SupabaseServerDb {
    return new SupabaseServerDb({
      supabaseUrl: requireConfigValue(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
      anonKey: requireConfigValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      serviceRoleKey: requireConfigValue(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
      fetchImpl
    });
  }

  async authenticate(headers: Headers): Promise<AuthResult> {
    const bearerToken = selectSupabaseAccessToken(headers);

    if (!bearerToken) {
      return {
        ok: false,
        status: 401,
        code: "unauthorized",
        message: "Authentication is required."
      };
    }

    const response = await this.fetchImpl(`${this.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: this.anonKey,
        authorization: `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status >= 500 ? 500 : 401,
        code: response.status >= 500 ? "auth_not_configured" : "unauthorized",
        message: response.status >= 500
          ? "Authentication is not configured for this environment."
          : "Authentication is required."
      };
    }

    const body = await response.json() as SupabaseAuthUserResponse;

    if (typeof body.id !== "string") {
      return {
        ok: false,
        status: 401,
        code: "unauthorized",
        message: "Authentication is required."
      };
    }

    return {
      ok: true,
      method: "supabase_session",
      user: {
        id: body.id,
        email: typeof body.email === "string" ? body.email : null
      },
      scopes: ["dashboard:read"]
    };
  }

  async getUserBySupabaseId(supabaseUserId: string): Promise<UserRow | null> {
    const rows = await this.restGet<SupabaseUserRow>("users", {
      select: userSelect,
      supabase_user_id: `eq.${supabaseUserId}`,
      limit: "1"
    });
    const row = rows[0];
    return row ? toUserRow(row) : null;
  }

  async listMembershipsByUserId(userId: string): Promise<AccountMembershipRow[]> {
    const rows = await this.restGet<SupabaseAccountMembershipRow>("account_users", {
      select: membershipSelect,
      user_id: `eq.${userId}`,
      order: "created_at.asc"
    });
    return rows.map(toMembershipRow);
  }

  async getAccount(accountId: string): Promise<AccountRow | null> {
    const rows = await this.restGet<SupabaseAccountRow>("accounts", {
      select: accountSelect,
      id: `eq.${accountId}`,
      limit: "1"
    });
    const row = rows[0];
    return row ? toAccountRow(row) : null;
  }

  async listEntitlementsByAccountId(accountId: string): Promise<EntitlementRow[]> {
    const rows = await this.restGet<SupabaseEntitlementRow>("entitlements", {
      select: entitlementSelect,
      account_id: `eq.${accountId}`,
      order: "current_period_end.desc"
    });
    return rows.map(toEntitlementRow);
  }

  private async restGet<Row>(table: string, query: Record<string, string>): Promise<Row[]> {
    const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    const response = await this.fetchImpl(url.toString(), {
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        accept: "application/json",
        "accept-profile": "app_public"
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase ${table} read failed with status ${response.status}.`);
    }

    const body: unknown = await response.json();

    if (!Array.isArray(body)) {
      throw new Error(`Supabase ${table} read returned an invalid payload.`);
    }

    return body as Row[];
  }
}

export function isSupabaseServerDbConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL
      && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      && env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function selectSupabaseAccessToken(headers: Headers): string | null {
  return selectTokenFromCookies(headers.get("cookie")) ?? selectBearerToken(headers);
}

function selectBearerToken(headers: Headers): string | null {
  const authorization = headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1].trim() : null;
}

function selectTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookieHeader(cookieHeader);
  const directToken = findCookieValue(cookies, ["sb-access-token", "access_token"]);

  if (directToken) {
    return directToken;
  }

  const authCookieValue = findSupabaseAuthCookieValue(cookies);

  if (!authCookieValue) {
    return null;
  }

  return extractAccessToken(authCookieValue);
}

function parseCookieHeader(cookieHeader: string): CookiePart[] {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex < 0) {
        return null;
      }

      return {
        name: part.slice(0, separatorIndex).trim(),
        value: safeDecodeCookieValue(part.slice(separatorIndex + 1).trim())
      };
    })
    .filter((part): part is CookiePart => part !== null && part.name.length > 0);
}

function findCookieValue(cookies: CookiePart[], names: string[]): string | null {
  for (const name of names) {
    const cookie = cookies.find((candidate) => candidate.name === name);

    if (cookie && cookie.value.length > 0) {
      return cookie.value;
    }
  }

  return null;
}

function findSupabaseAuthCookieValue(cookies: CookiePart[]): string | null {
  const unchunked = cookies.find((cookie) => /^sb-.+-auth-token$/.test(cookie.name));

  if (unchunked) {
    return unchunked.value;
  }

  const chunks = cookies
    .map((cookie) => {
      const match = /^(sb-.+-auth-token)\.(\d+)$/.exec(cookie.name);
      return match ? { baseName: match[1], index: Number(match[2]), value: cookie.value } : null;
    })
    .filter((chunk): chunk is { baseName: string; index: number; value: string } => chunk !== null);

  const baseName = chunks[0]?.baseName;

  if (!baseName) {
    return null;
  }

  const matchingChunks = chunks
    .filter((chunk) => chunk.baseName === baseName)
    .sort((a, b) => a.index - b.index);

  return matchingChunks.map((chunk) => chunk.value).join("");
}

function extractAccessToken(rawValue: string): string | null {
  const decodedValue = decodeSupabaseCookiePayload(rawValue);

  if (looksLikeJwt(decodedValue)) {
    return decodedValue;
  }

  try {
    return findAccessToken(JSON.parse(decodedValue));
  } catch {
    return null;
  }
}

function decodeSupabaseCookiePayload(rawValue: string): string {
  if (!rawValue.startsWith("base64-")) {
    return rawValue;
  }

  try {
    return Buffer.from(rawValue.slice("base64-".length), "base64url").toString("utf8");
  } catch {
    return rawValue;
  }
}

function findAccessToken(value: unknown): string | null {
  if (typeof value === "string") {
    return looksLikeJwt(value) || value.length > 0 ? value : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const token = findAccessToken(item);

      if (token) {
        return token;
      }
    }

    return null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.access_token === "string" && record.access_token.length > 0) {
      return record.access_token;
    }

    if (record.currentSession) {
      return findAccessToken(record.currentSession);
    }

    if (record.session) {
      return findAccessToken(record.session);
    }
  }

  return null;
}

function safeDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function looksLikeJwt(value: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

function toUserRow(row: SupabaseUserRow): UserRow {
  return {
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toMembershipRow(row: SupabaseAccountMembershipRow): AccountMembershipRow {
  return {
    accountId: row.account_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toAccountRow(row: SupabaseAccountRow): AccountRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    primaryEmail: row.primary_email,
    stripeCustomerId: row.stripe_customer_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toEntitlementRow(row: SupabaseEntitlementRow): EntitlementRow {
  return {
    id: row.id,
    accountId: row.account_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeProductId: row.stripe_product_id,
    stripePriceId: row.stripe_price_id,
    entitlementCode: row.entitlement_code,
    tierFamily: row.tier_family,
    tierLevel: row.tier_level,
    monthlyQuota: row.monthly_quota,
    apiAccess: row.api_access,
    dashboardAccess: row.dashboard_access,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    sourceWebhookEventId: row.source_webhook_event_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
