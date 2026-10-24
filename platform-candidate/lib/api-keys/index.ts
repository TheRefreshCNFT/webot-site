import { createHmac, randomBytes as nodeRandomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";

export type ApiKeyStatus = "active" | "revoked";

export type ApiKeyRow = {
  id: string;
  accountId: string;
  name: string;
  prefix: string;
  keyHash: string;
  hashVersion: "hmac-sha256-v1";
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type ApiKeyMetadata = {
  id: string;
  accountId: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type ApiKeyVerification =
  | {
      ok: true;
      apiKey: ApiKeyMetadata;
      accountId: string;
      scopes: string[];
    }
  | {
      ok: false;
      code: "malformed" | "not_found" | "revoked" | "account_mismatch";
    };

export type ApiKeyRepository = {
  insert(row: ApiKeyRow): Promise<ApiKeyRow>;
  listByAccountId(accountId: string): Promise<ApiKeyRow[]>;
  findByIdForAccount(id: string, accountId: string): Promise<ApiKeyRow | null>;
  findByPrefix(prefix: string): Promise<ApiKeyRow | null>;
  update(row: ApiKeyRow): Promise<ApiKeyRow>;
};

type Clock = () => Date;
type RandomBytes = (size: number) => Buffer;

type ApiKeyOptions = {
  repository?: ApiKeyRepository;
  now?: Clock;
};

type CreateApiKeyOptions = ApiKeyOptions & {
  accountId: string;
  name: string;
  scopes?: string[];
  randomBytes?: RandomBytes;
};

type VerifyApiKeyOptions = ApiKeyOptions & {
  expectedAccountId?: string;
};

type RevokeApiKeyOptions = ApiKeyOptions & {
  accountId: string;
  id: string;
};

const keyPrefixPattern = /^[a-f0-9]{12}$/;
const apiKeyPattern = /^wbot_([a-f0-9]{12})_([A-Za-z0-9_-]{32,})$/;
const defaultScopes = ["api:read", "api:write"];

export class ApiKeyError extends Error {
  readonly status: 400 | 403 | 404 | 500;
  readonly code: "invalid_api_key_name" | "api_key_forbidden" | "api_key_not_found" | "api_key_hash_unavailable";

  constructor(
    status: 400 | 403 | 404 | 500,
    code: ApiKeyError["code"],
    message: string
  ) {
    super(message);
    this.name = "ApiKeyError";
    this.status = status;
    this.code = code;
  }
}

export class InMemoryApiKeyRepository implements ApiKeyRepository {
  private readonly rows = new Map<string, ApiKeyRow>();

  async insert(row: ApiKeyRow): Promise<ApiKeyRow> {
    this.rows.set(row.id, cloneRow(row));
    return cloneRow(row);
  }

  async listByAccountId(accountId: string): Promise<ApiKeyRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneRow);
  }

  async findByIdForAccount(id: string, accountId: string): Promise<ApiKeyRow | null> {
    const row = this.rows.get(id);
    return row && row.accountId === accountId ? cloneRow(row) : null;
  }

  async findByPrefix(prefix: string): Promise<ApiKeyRow | null> {
    const row = Array.from(this.rows.values()).find((candidate) => candidate.prefix === prefix);
    return row ? cloneRow(row) : null;
  }

  async update(row: ApiKeyRow): Promise<ApiKeyRow> {
    if (!this.rows.has(row.id)) {
      throw new ApiKeyError(404, "api_key_not_found", "API key not found.");
    }

    this.rows.set(row.id, cloneRow(row));
    return cloneRow(row);
  }

  dumpRowsForTests(): ApiKeyRow[] {
    return Array.from(this.rows.values()).map(cloneRow);
  }
}

type SupabaseApiKeyRow = {
  id: string;
  account_id: string;
  name: string;
  prefix: string;
  key_hash: string;
  hash_version: "hmac-sha256-v1";
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export class SupabaseApiKeyRepository implements ApiKeyRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: ApiKeyRow): Promise<ApiKeyRow> {
    const rows = await this.client.insert<SupabaseApiKeyRow>("app_private", "api_keys", toSupabaseRow(row));
    return fromSupabaseRow(requireOne(rows, "API key insert returned no row."));
  }

  async listByAccountId(accountId: string): Promise<ApiKeyRow[]> {
    const rows = await this.client.get<SupabaseApiKeyRow>("app_private", "api_keys", {
      select: apiKeySelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc"
    });
    return rows.map(fromSupabaseRow);
  }

  async findByIdForAccount(id: string, accountId: string): Promise<ApiKeyRow | null> {
    const rows = await this.client.get<SupabaseApiKeyRow>("app_private", "api_keys", {
      select: apiKeySelect,
      id: `eq.${id}`,
      account_id: `eq.${accountId}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseRow(rows[0]) : null;
  }

  async findByPrefix(prefix: string): Promise<ApiKeyRow | null> {
    const rows = await this.client.get<SupabaseApiKeyRow>("app_private", "api_keys", {
      select: apiKeySelect,
      prefix: `eq.${prefix}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseRow(rows[0]) : null;
  }

  async update(row: ApiKeyRow): Promise<ApiKeyRow> {
    const rows = await this.client.update<SupabaseApiKeyRow>("app_private", "api_keys", {
      id: `eq.${row.id}`
    }, toSupabaseRow(row));

    if (rows.length === 0) {
      throw new ApiKeyError(404, "api_key_not_found", "API key not found.");
    }

    return fromSupabaseRow(rows[0]);
  }
}

const apiKeySelect = [
  "id",
  "account_id",
  "name",
  "prefix",
  "key_hash",
  "hash_version",
  "scopes",
  "created_at",
  "last_used_at",
  "revoked_at"
].join(",");

let defaultRepository: ApiKeyRepository | null = null;

export function getApiKeyRepository(): ApiKeyRepository {
  if (!defaultRepository) {
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseApiKeyRepository()
      : new InMemoryApiKeyRepository();
  }

  return defaultRepository;
}

export function resetApiKeyRepositoryForTests(repository: ApiKeyRepository = new InMemoryApiKeyRepository()): void {
  defaultRepository = repository;
}

export async function createApiKey(options: CreateApiKeyOptions): Promise<{
  plaintext: string;
  apiKey: ApiKeyMetadata;
}> {
  const repository = options.repository ?? getApiKeyRepository();
  const now = (options.now ?? (() => new Date()))().toISOString();
  const name = normalizeName(options.name);
  const prefix = createPrefix(options.randomBytes ?? nodeRandomBytes);
  const tokenBody = createTokenBody(options.randomBytes ?? nodeRandomBytes);
  const plaintext = `wbot_${prefix}_${tokenBody}`;
  const row: ApiKeyRow = {
    id: randomUUID(),
    accountId: options.accountId,
    name,
    prefix,
    keyHash: hashApiKey(plaintext),
    hashVersion: "hmac-sha256-v1",
    scopes: options.scopes ?? defaultScopes,
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null
  };

  await repository.insert(row);

  return {
    plaintext,
    apiKey: toApiKeyMetadata(row)
  };
}

export async function listApiKeyMetadata(accountId: string, options: ApiKeyOptions = {}): Promise<ApiKeyMetadata[]> {
  const repository = options.repository ?? getApiKeyRepository();
  const rows = await repository.listByAccountId(accountId);
  return rows.map(toApiKeyMetadata);
}

export async function revokeApiKey(options: RevokeApiKeyOptions): Promise<ApiKeyMetadata | null> {
  const repository = options.repository ?? getApiKeyRepository();
  const now = (options.now ?? (() => new Date()))().toISOString();
  const row = await repository.findByIdForAccount(options.id, options.accountId);

  if (!row) {
    return null;
  }

  const revoked = row.revokedAt
    ? row
    : {
        ...row,
        revokedAt: now
      };

  const updated = await repository.update(revoked);
  return toApiKeyMetadata(updated);
}

export async function verifyApiKey(plaintext: string, options: VerifyApiKeyOptions = {}): Promise<ApiKeyVerification> {
  const parsed = parseApiKey(plaintext);

  if (!parsed) {
    return {
      ok: false,
      code: "malformed"
    };
  }

  const repository = options.repository ?? getApiKeyRepository();
  const row = await repository.findByPrefix(parsed.prefix);

  if (!row || !safeEqualHex(hashApiKey(plaintext), row.keyHash)) {
    return {
      ok: false,
      code: "not_found"
    };
  }

  if (row.revokedAt) {
    return {
      ok: false,
      code: "revoked"
    };
  }

  if (options.expectedAccountId && options.expectedAccountId !== row.accountId) {
    return {
      ok: false,
      code: "account_mismatch"
    };
  }

  const usedAt = (options.now ?? (() => new Date()))().toISOString();
  const updated = await repository.update({
    ...row,
    lastUsedAt: usedAt
  });
  const apiKey = toApiKeyMetadata(updated);

  return {
    ok: true,
    apiKey,
    accountId: updated.accountId,
    scopes: [...updated.scopes]
  };
}

export function toApiKeyMetadata(row: ApiKeyRow): ApiKeyMetadata {
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    prefix: row.prefix,
    scopes: [...row.scopes],
    status: row.revokedAt ? "revoked" : "active",
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
    revokedAt: row.revokedAt
  };
}

function normalizeName(name: string): string {
  const normalized = name.trim();

  if (normalized.length < 1 || normalized.length > 80) {
    throw new ApiKeyError(400, "invalid_api_key_name", "API key name must be between 1 and 80 characters.");
  }

  return normalized;
}

function createPrefix(randomBytes: RandomBytes): string {
  const prefix = randomBytes(6).toString("hex");

  if (!keyPrefixPattern.test(prefix)) {
    throw new ApiKeyError(500, "api_key_hash_unavailable", "API key generation failed.");
  }

  return prefix;
}

function createTokenBody(randomBytes: RandomBytes): string {
  return randomBytes(32).toString("base64url");
}

function parseApiKey(plaintext: string): { prefix: string } | null {
  const match = apiKeyPattern.exec(plaintext);
  return match ? { prefix: match[1] } : null;
}

function hashApiKey(plaintext: string): string {
  return createHmac("sha256", getApiKeyPepper()).update(plaintext).digest("hex");
}

function getApiKeyPepper(): string {
  const pepper = process.env.API_KEY_PEPPER;

  if (pepper && pepper.length >= 32) {
    return pepper;
  }

  if (process.env.NODE_ENV === "production") {
    throw new ApiKeyError(500, "api_key_hash_unavailable", "API key hashing is not configured.");
  }

  return "webot-platform-local-test-api-key-pepper";
}

function safeEqualHex(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function cloneRow(row: ApiKeyRow): ApiKeyRow {
  return {
    ...row,
    scopes: [...row.scopes]
  };
}

function toSupabaseRow(row: ApiKeyRow): SupabaseApiKeyRow {
  return {
    id: row.id,
    account_id: row.accountId,
    name: row.name,
    prefix: row.prefix,
    key_hash: row.keyHash,
    hash_version: row.hashVersion,
    scopes: [...row.scopes],
    created_at: row.createdAt,
    last_used_at: row.lastUsedAt,
    revoked_at: row.revokedAt
  };
}

function fromSupabaseRow(row: SupabaseApiKeyRow): ApiKeyRow {
  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    prefix: row.prefix,
    keyHash: row.key_hash,
    hashVersion: row.hash_version,
    scopes: [...row.scopes],
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at
  };
}

function requireOne<Row>(rows: Row[], message: string): Row {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
}
