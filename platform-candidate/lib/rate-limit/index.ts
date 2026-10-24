import { randomUUID } from "node:crypto";
import type { AccountContext } from "../auth/account";
import type { EntitlementRow } from "../db/server";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";
import { mapReject, type SafeRejectCode } from "../rejects";

export type RateLimitReason = "account_rate_limit" | "api_key_rate_limit" | "concurrency_limit_reached";

export type RateLimitEventRow = {
  id: string;
  accountId: string;
  apiKeyId: string | null;
  route: string;
  reason: RateLimitReason;
  rejectCode: SafeRejectCode;
  customerSafeMessage: string;
  customerSafeAction: string;
  retryAfterSeconds: number | null;
  retryAt: string | null;
  createdAt: string;
};

export type RateLimitEventRepository = {
  insert(row: RateLimitEventRow): Promise<RateLimitEventRow>;
  listByAccountId(accountId: string): Promise<RateLimitEventRow[]>;
};

export type RateLimitBucket = {
  limit: number;
  windowMs: number;
};

export type RateLimitPolicy = {
  account: RateLimitBucket;
  apiKey: RateLimitBucket;
};

export type RateLimitDecision = {
  allowed: boolean;
  remaining: {
    account: number;
    api_key: number | null;
  };
  resetAt: string;
};

type RateLimitCounter = {
  count: number;
  resetAtMs: number;
};

type RateLimitCounterConsumeResult = {
  allowed: boolean;
  count: number;
  resetAtMs: number;
};

export type RateLimitCounterStore = {
  consume(key: string, bucket: RateLimitBucket, now: Date): Promise<RateLimitCounterConsumeResult>;
};

type CheckOptions = {
  apiKeyId?: string | null;
  entitlement: Pick<EntitlementRow, "tierLevel">;
  policy?: RateLimitPolicy;
  route: string;
  now?: () => Date;
  counterStore?: RateLimitCounterStore;
};

type RecordOptions = {
  apiKeyId?: string | null;
  retryAfterSeconds?: number | null;
  retryAt?: string | null;
  now?: () => Date;
  repository?: RateLimitEventRepository;
};

export class InMemoryRateLimitEventRepository implements RateLimitEventRepository {
  private readonly rows = new Map<string, RateLimitEventRow>();

  async insert(row: RateLimitEventRow): Promise<RateLimitEventRow> {
    this.rows.set(row.id, cloneEvent(row));
    return cloneEvent(row);
  }

  async listByAccountId(accountId: string): Promise<RateLimitEventRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneEvent);
  }

  dumpRowsForTests(): RateLimitEventRow[] {
    return Array.from(this.rows.values())
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(cloneEvent);
  }
}

type SupabaseRateLimitEventRow = {
  id: string;
  account_id: string;
  api_key_id: string | null;
  route: string;
  reason: RateLimitReason;
  reject_code: SafeRejectCode;
  customer_safe_message: string;
  customer_safe_action: string;
  retry_after_seconds: number | null;
  retry_at: string | null;
  created_at: string;
};

export class SupabaseRateLimitEventRepository implements RateLimitEventRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async insert(row: RateLimitEventRow): Promise<RateLimitEventRow> {
    const rows = await this.client.insert<SupabaseRateLimitEventRow>("app_public", "rate_limit_events", toSupabaseRow(row));
    return fromSupabaseRow(requireOne(rows, "Rate-limit event insert returned no row."));
  }

  async listByAccountId(accountId: string): Promise<RateLimitEventRow[]> {
    const rows = await this.client.get<SupabaseRateLimitEventRow>("app_public", "rate_limit_events", {
      select: rateLimitEventSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc"
    });
    return rows.map(fromSupabaseRow);
  }
}

const rateLimitEventSelect = [
  "id",
  "account_id",
  "api_key_id",
  "route",
  "reason",
  "reject_code",
  "customer_safe_message",
  "customer_safe_action",
  "retry_after_seconds",
  "retry_at",
  "created_at"
].join(",");

export class InMemoryRateLimitCounterStore implements RateLimitCounterStore {
  private readonly counters = new Map<string, RateLimitCounter>();

  async consume(key: string, bucket: RateLimitBucket, now: Date): Promise<RateLimitCounterConsumeResult> {
    const nowMs = now.getTime();
    const existing = this.counters.get(key);
    const current = existing && existing.resetAtMs > nowMs
      ? existing
      : {
          count: 0,
          resetAtMs: nowMs + bucket.windowMs
        };

    current.count += 1;
    this.counters.set(key, current);

    return {
      allowed: current.count <= bucket.limit,
      count: current.count,
      resetAtMs: current.resetAtMs
    };
  }

  clear(): void {
    this.counters.clear();
  }
}

type SupabaseRateLimitCounterResult = {
  counter_count: number;
  counter_reset_at: string;
  counter_allowed: boolean;
};

export class SupabaseRateLimitCounterStore implements RateLimitCounterStore {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async consume(key: string, bucket: RateLimitBucket, now: Date): Promise<RateLimitCounterConsumeResult> {
    const rows = await this.client.rpc<SupabaseRateLimitCounterResult>("app_private", "consume_rate_limit_counter", {
      counter_key: key,
      bucket_limit: bucket.limit,
      window_ms: bucket.windowMs,
      now_at: now.toISOString()
    });
    const row = requireOne(rows, "Rate-limit counter RPC returned no row.");

    return {
      allowed: row.counter_allowed,
      count: row.counter_count,
      resetAtMs: Date.parse(row.counter_reset_at)
    };
  }
}

let defaultEventRepository: RateLimitEventRepository | null = null;
let defaultCounterStore: RateLimitCounterStore | null = null;

export function getRateLimitEventRepository(): RateLimitEventRepository {
  if (!defaultEventRepository) {
    defaultEventRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseRateLimitEventRepository()
      : new InMemoryRateLimitEventRepository();
  }

  return defaultEventRepository;
}

export function resetRateLimitForTests(
  repository: RateLimitEventRepository = new InMemoryRateLimitEventRepository(),
  counterStore: RateLimitCounterStore = new InMemoryRateLimitCounterStore()
): void {
  defaultEventRepository = repository;
  defaultCounterStore = counterStore;
}

export function buildRateLimitPolicy(entitlement: Pick<EntitlementRow, "tierLevel">): RateLimitPolicy {
  const tier = Math.max(1, entitlement.tierLevel);

  return {
    account: {
      limit: 60 * tier,
      windowMs: 60_000
    },
    apiKey: {
      limit: 30 * tier,
      windowMs: 60_000
    }
  };
}

export async function checkRateLimit(
  context: AccountContext,
  options: CheckOptions
): Promise<RateLimitDecision> {
  const policy = options.policy ?? buildRateLimitPolicy(options.entitlement);
  const now = (options.now ?? (() => new Date()))();
  const counterStore = options.counterStore ?? getRateLimitCounterStore();
  const accountResult = await counterStore.consume(
    `account:${context.account.id}:${options.route}`,
    policy.account,
    now
  );
  const apiKeyId = options.apiKeyId ?? context.auth.apiKeyId;
  const apiKeyResult = apiKeyId
    ? await counterStore.consume(`api-key:${apiKeyId}:${options.route}`, policy.apiKey, now)
    : null;
  const resetAtMs = Math.max(accountResult.resetAtMs, apiKeyResult?.resetAtMs ?? accountResult.resetAtMs);

  return {
    allowed: accountResult.allowed && (apiKeyResult?.allowed ?? true),
    remaining: {
      account: Math.max(policy.account.limit - accountResult.count, 0),
      api_key: apiKeyResult ? Math.max(policy.apiKey.limit - apiKeyResult.count, 0) : null
    },
    resetAt: new Date(resetAtMs).toISOString()
  };
}

export async function recordRateLimitEvent(
  context: AccountContext,
  route: string,
  reason: RateLimitReason,
  options: RecordOptions = {}
): Promise<RateLimitEventRow> {
  const safeReject = mapReject(reason === "concurrency_limit_reached" ? "concurrency_limit_reached" : "rate_limit_exceeded");
  const row: RateLimitEventRow = {
    id: randomUUID(),
    accountId: context.account.id,
    apiKeyId: options.apiKeyId ?? context.auth.apiKeyId ?? null,
    route,
    reason,
    rejectCode: safeReject.code,
    customerSafeMessage: safeReject.message,
    customerSafeAction: safeReject.action,
    retryAfterSeconds: normalizeRetryAfterSeconds(options.retryAfterSeconds),
    retryAt: options.retryAt ?? null,
    createdAt: (options.now ?? (() => new Date()))().toISOString()
  };

  return (options.repository ?? getRateLimitEventRepository()).insert(row);
}

function getRateLimitCounterStore(): RateLimitCounterStore {
  if (!defaultCounterStore) {
    defaultCounterStore = isSupabaseRuntimeConfigured()
      ? new SupabaseRateLimitCounterStore()
      : new InMemoryRateLimitCounterStore();
  }

  return defaultCounterStore;
}

function cloneEvent(row: RateLimitEventRow): RateLimitEventRow {
  return {
    ...row
  };
}

function toSupabaseRow(row: RateLimitEventRow): SupabaseRateLimitEventRow {
  return {
    id: row.id,
    account_id: row.accountId,
    api_key_id: row.apiKeyId,
    route: row.route,
    reason: row.reason,
    reject_code: row.rejectCode,
    customer_safe_message: row.customerSafeMessage,
    customer_safe_action: row.customerSafeAction,
    retry_after_seconds: row.retryAfterSeconds,
    retry_at: row.retryAt,
    created_at: row.createdAt
  };
}

function fromSupabaseRow(row: SupabaseRateLimitEventRow): RateLimitEventRow {
  return {
    id: row.id,
    accountId: row.account_id,
    apiKeyId: row.api_key_id,
    route: row.route,
    reason: row.reason,
    rejectCode: row.reject_code,
    customerSafeMessage: row.customer_safe_message,
    customerSafeAction: row.customer_safe_action,
    retryAfterSeconds: row.retry_after_seconds,
    retryAt: row.retry_at,
    createdAt: row.created_at
  };
}

function normalizeRetryAfterSeconds(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Rate-limit retry_after_seconds must be a non-negative integer.");
  }

  return value;
}

function requireOne<Row>(rows: Row[], message: string): Row {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
}
