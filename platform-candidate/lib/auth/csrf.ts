import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { AccountContext } from "./account";

const CSRF_FIELD = "__webot_csrf";
const CSRF_HEADER = "x-webot-csrf-token";
const LEGACY_CSRF_HEADER = "x-webot-csrf";
const TOKEN_VERSION = "v1";
const TOKEN_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const LOCAL_DEV_SECRET = "local-dev-csrf-secret-not-for-production";

export class CsrfError extends Error {
  readonly status = 403;
  readonly code = "csrf_invalid";

  constructor(message = "Dashboard request verification failed.") {
    super(message);
    this.name = "CsrfError";
  }
}

export function createDashboardCsrfToken(
  context: AccountContext,
  options: { now?: Date; env?: NodeJS.ProcessEnv; nonce?: string } = {}
): string {
  const issuedAt = String((options.now ?? new Date()).getTime());
  const nonce = options.nonce ?? randomUUID();
  const body = `${TOKEN_VERSION}.${issuedAt}.${base64UrlEncode(nonce)}`;
  const signature = signTokenBody(body, context, csrfSecret(options.env));

  return `${body}.${signature}`;
}

export function validateDashboardCsrf(
  request: Request,
  context: AccountContext,
  options: { form?: FormData; now?: Date; env?: NodeJS.ProcessEnv } = {}
): void {
  if (!requiresCsrf(request, context)) {
    return;
  }

  const token = readCsrfToken(request, options.form);

  if (!token || !isValidToken(token, context, options)) {
    throw new CsrfError();
  }
}

export function csrfHiddenInput(token: string): { name: string; value: string } {
  return {
    name: CSRF_FIELD,
    value: token
  };
}

export function csrfErrorBody(error: CsrfError, requestId: string): {
  error: {
    code: string;
    message: string;
    request_id: string;
  };
} {
  return {
    error: {
      code: error.code,
      message: error.message,
      request_id: requestId
    }
  };
}

function requiresCsrf(request: Request, context: AccountContext): boolean {
  return context.auth.method === "supabase_session" && hasDashboardSessionCookie(request.headers);
}

function hasDashboardSessionCookie(headers: Headers): boolean {
  const cookie = headers.get("cookie") ?? "";

  return /\b(sb-access-token|access_token|sb-[^=]+-auth-token)=/.test(cookie);
}

function readCsrfToken(request: Request, form?: FormData): string | null {
  const headerToken = request.headers.get(CSRF_HEADER) ?? request.headers.get(LEGACY_CSRF_HEADER);

  if (headerToken?.trim()) {
    return headerToken.trim();
  }

  const formToken = form?.get(CSRF_FIELD);

  return typeof formToken === "string" && formToken.trim() ? formToken.trim() : null;
}

function isValidToken(
  token: string,
  context: AccountContext,
  options: { now?: Date; env?: NodeJS.ProcessEnv }
): boolean {
  const parts = token.split(".");

  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) {
    return false;
  }

  const issuedAt = Number(parts[1]);

  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) {
    return false;
  }

  const now = (options.now ?? new Date()).getTime();

  if (issuedAt > now + 60_000 || now - issuedAt > TOKEN_MAX_AGE_MS) {
    return false;
  }

  const body = parts.slice(0, 3).join(".");
  const expected = signTokenBody(body, context, csrfSecret(options.env));

  return safeEqual(parts[3], expected);
}

function signTokenBody(body: string, context: AccountContext, secret: string): string {
  const subject = [
    context.auth.supabaseUserId,
    context.user.id,
    context.account.id,
    context.membership.role
  ].join(":");

  return createHmac("sha256", secret)
    .update(`${body}.${subject}`)
    .digest("base64url");
}

function csrfSecret(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.WEBOT_CSRF_SECRET?.trim();

  if (configured && !isPlaceholder(configured) && configured.length >= 24) {
    return configured;
  }

  if (env.NODE_ENV === "production") {
    throw new CsrfError("Dashboard request verification is not configured.");
  }

  return LOCAL_DEV_SECRET;
}

function isPlaceholder(value: string): boolean {
  return /replace|placeholder|example|changeme/i.test(value);
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}
