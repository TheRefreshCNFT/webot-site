import { randomUUID } from "node:crypto";
import type { AccountContext } from "../auth/account";
import { isSupabaseRuntimeConfigured, SupabaseRestClient } from "../db/supabase-rest";

export type UsageLedgerUnit = "job" | "credit" | "request" | "unit";

export type UsageLedgerRow = {
  id: string;
  accountId: string;
  apiKeyId: string | null;
  serviceFamily: string;
  jobId: string | null;
  quantity: number;
  unit: UsageLedgerUnit;
  entitlementCode: string;
  idempotencyKey: string;
  createdAt: string;
};

export type UsageLedgerInput = {
  apiKeyId?: string | null;
  serviceFamily: string;
  jobId?: string | null;
  quantity: number;
  unit?: UsageLedgerUnit;
  entitlementCode: string;
  idempotencyKey: string;
};

export type UsageLedgerFilters = {
  periodStart?: string;
  periodEnd?: string;
  jobId?: string;
};

export type AppendUsageResult = {
  row: UsageLedgerRow;
  inserted: boolean;
};

export type UsageLedgerRepository = {
  append(row: UsageLedgerRow): Promise<AppendUsageResult>;
  listByAccountId(accountId: string, filters?: UsageLedgerFilters): Promise<UsageLedgerRow[]>;
  findByIdForAccount(id: string, accountId: string): Promise<UsageLedgerRow | null>;
};

type Clock = () => Date;

type RecordUsageOptions = {
  repository?: UsageLedgerRepository;
  now?: Clock;
};

export class UsageLedgerError extends Error {
  readonly status: 400 | 403 | 404;
  readonly code: "invalid_usage_entry" | "usage_entry_forbidden" | "usage_entry_not_found";

  constructor(status: UsageLedgerError["status"], code: UsageLedgerError["code"], message: string) {
    super(message);
    this.name = "UsageLedgerError";
    this.status = status;
    this.code = code;
  }
}

export class InMemoryUsageLedgerRepository implements UsageLedgerRepository {
  private readonly rows = new Map<string, UsageLedgerRow>();
  private readonly idempotencyIndex = new Map<string, string>();

  async append(row: UsageLedgerRow): Promise<AppendUsageResult> {
    const idempotencyIndexKey = createIdempotencyIndexKey(row.accountId, row.idempotencyKey);
    const existingId = this.idempotencyIndex.get(idempotencyIndexKey);

    if (existingId) {
      const existing = this.rows.get(existingId);

      if (existing) {
        return {
          row: cloneRow(existing),
          inserted: false
        };
      }
    }

    this.rows.set(row.id, cloneRow(row));
    this.idempotencyIndex.set(idempotencyIndexKey, row.id);

    return {
      row: cloneRow(row),
      inserted: true
    };
  }

  async listByAccountId(accountId: string, filters: UsageLedgerFilters = {}): Promise<UsageLedgerRow[]> {
    return Array.from(this.rows.values())
      .filter((row) => row.accountId === accountId)
      .filter((row) => matchesFilters(row, filters))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneRow);
  }

  async findByIdForAccount(id: string, accountId: string): Promise<UsageLedgerRow | null> {
    const row = this.rows.get(id);
    return row && row.accountId === accountId ? cloneRow(row) : null;
  }

  dumpRowsForTests(): UsageLedgerRow[] {
    return Array.from(this.rows.values())
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(cloneRow);
  }
}

type SupabaseUsageLedgerRow = {
  id: string;
  account_id: string;
  api_key_id: string | null;
  service_family: string;
  job_id: string | null;
  quantity: number;
  unit: UsageLedgerUnit;
  entitlement_code: string;
  idempotency_key: string;
  created_at: string;
};

export class SupabaseUsageLedgerRepository implements UsageLedgerRepository {
  private readonly client: SupabaseRestClient;

  constructor(client: SupabaseRestClient = SupabaseRestClient.fromEnv()) {
    this.client = client;
  }

  async append(row: UsageLedgerRow): Promise<AppendUsageResult> {
    const inserted = await this.client.insert<SupabaseUsageLedgerRow>(
      "app_public",
      "usage_ledger",
      toSupabaseRow(row),
      {
        onConflict: "account_id,idempotency_key",
        ignoreDuplicates: true
      }
    );

    if (inserted[0]) {
      return {
        row: fromSupabaseRow(inserted[0]),
        inserted: true
      };
    }

    const existing = await this.client.get<SupabaseUsageLedgerRow>("app_public", "usage_ledger", {
      select: usageLedgerSelect,
      account_id: `eq.${row.accountId}`,
      idempotency_key: `eq.${row.idempotencyKey}`,
      limit: "1"
    });

    return {
      row: fromSupabaseRow(requireOne(existing, "Usage ledger idempotency row was not found.")),
      inserted: false
    };
  }

  async listByAccountId(accountId: string, filters: UsageLedgerFilters = {}): Promise<UsageLedgerRow[]> {
    const query: Record<string, string> = {
      select: usageLedgerSelect,
      account_id: `eq.${accountId}`,
      order: "created_at.desc"
    };

    if (filters.jobId) {
      query.job_id = `eq.${filters.jobId}`;
    }

    if (filters.periodStart && filters.periodEnd) {
      query.and = `(created_at.gte.${filters.periodStart},created_at.lt.${filters.periodEnd})`;
    } else if (filters.periodStart) {
      query.created_at = `gte.${filters.periodStart}`;
    } else if (filters.periodEnd) {
      query.created_at = `lt.${filters.periodEnd}`;
    }

    const rows = await this.client.get<SupabaseUsageLedgerRow>("app_public", "usage_ledger", query);
    return rows.map(fromSupabaseRow);
  }

  async findByIdForAccount(id: string, accountId: string): Promise<UsageLedgerRow | null> {
    const rows = await this.client.get<SupabaseUsageLedgerRow>("app_public", "usage_ledger", {
      select: usageLedgerSelect,
      id: `eq.${id}`,
      account_id: `eq.${accountId}`,
      limit: "1"
    });
    return rows[0] ? fromSupabaseRow(rows[0]) : null;
  }
}

const usageLedgerSelect = [
  "id",
  "account_id",
  "api_key_id",
  "service_family",
  "job_id",
  "quantity",
  "unit",
  "entitlement_code",
  "idempotency_key",
  "created_at"
].join(",");

let defaultRepository: UsageLedgerRepository | null = null;

export function getUsageLedgerRepository(): UsageLedgerRepository {
  if (!defaultRepository) {
    defaultRepository = isSupabaseRuntimeConfigured()
      ? new SupabaseUsageLedgerRepository()
      : new InMemoryUsageLedgerRepository();
  }

  return defaultRepository;
}

export function resetUsageLedgerRepositoryForTests(
  repository: UsageLedgerRepository = new InMemoryUsageLedgerRepository()
): void {
  defaultRepository = repository;
}

export async function recordUsage(
  context: AccountContext,
  input: UsageLedgerInput,
  options: RecordUsageOptions = {}
): Promise<AppendUsageResult> {
  const repository = options.repository ?? getUsageLedgerRepository();
  const normalized = normalizeInput(input);
  const row: UsageLedgerRow = {
    id: randomUUID(),
    accountId: context.account.id,
    apiKeyId: normalized.apiKeyId,
    serviceFamily: normalized.serviceFamily,
    jobId: normalized.jobId,
    quantity: normalized.quantity,
    unit: normalized.unit,
    entitlementCode: normalized.entitlementCode,
    idempotencyKey: normalized.idempotencyKey,
    createdAt: (options.now ?? (() => new Date()))().toISOString()
  };

  return repository.append(row);
}

export async function listAccountUsageLedger(
  context: AccountContext,
  filters: UsageLedgerFilters = {},
  options: { repository?: UsageLedgerRepository } = {}
): Promise<UsageLedgerRow[]> {
  const repository = options.repository ?? getUsageLedgerRepository();
  return repository.listByAccountId(context.account.id, filters);
}

export async function getAccountUsageLedgerEntry(
  context: AccountContext,
  id: string,
  options: { repository?: UsageLedgerRepository } = {}
): Promise<UsageLedgerRow> {
  const repository = options.repository ?? getUsageLedgerRepository();
  const row = await repository.findByIdForAccount(id, context.account.id);

  if (!row) {
    throw new UsageLedgerError(404, "usage_entry_not_found", "Usage entry not found.");
  }

  return row;
}

function normalizeInput(input: UsageLedgerInput): Required<UsageLedgerInput> {
  const serviceFamily = input.serviceFamily.trim();
  const entitlementCode = input.entitlementCode.trim();
  const idempotencyKey = input.idempotencyKey.trim();
  const unit = input.unit ?? "job";

  if (!serviceFamily || !entitlementCode || !idempotencyKey) {
    throw new UsageLedgerError(400, "invalid_usage_entry", "Usage entries require service, entitlement, and idempotency.");
  }

  if (!Number.isInteger(input.quantity) || input.quantity === 0) {
    throw new UsageLedgerError(400, "invalid_usage_entry", "Usage quantity must be a non-zero integer.");
  }

  return {
    apiKeyId: input.apiKeyId ?? null,
    serviceFamily,
    jobId: input.jobId ?? null,
    quantity: input.quantity,
    unit,
    entitlementCode,
    idempotencyKey
  };
}

function matchesFilters(row: UsageLedgerRow, filters: UsageLedgerFilters): boolean {
  if (filters.jobId && row.jobId !== filters.jobId) {
    return false;
  }

  if (filters.periodStart && row.createdAt < filters.periodStart) {
    return false;
  }

  if (filters.periodEnd && row.createdAt >= filters.periodEnd) {
    return false;
  }

  return true;
}

function createIdempotencyIndexKey(accountId: string, idempotencyKey: string): string {
  return `${accountId}:${idempotencyKey}`;
}

function cloneRow(row: UsageLedgerRow): UsageLedgerRow {
  return {
    ...row
  };
}

function toSupabaseRow(row: UsageLedgerRow): SupabaseUsageLedgerRow {
  return {
    id: row.id,
    account_id: row.accountId,
    api_key_id: row.apiKeyId,
    service_family: row.serviceFamily,
    job_id: row.jobId,
    quantity: row.quantity,
    unit: row.unit,
    entitlement_code: row.entitlementCode,
    idempotency_key: row.idempotencyKey,
    created_at: row.createdAt
  };
}

function fromSupabaseRow(row: SupabaseUsageLedgerRow): UsageLedgerRow {
  return {
    id: row.id,
    accountId: row.account_id,
    apiKeyId: row.api_key_id,
    serviceFamily: row.service_family,
    jobId: row.job_id,
    quantity: row.quantity,
    unit: row.unit,
    entitlementCode: row.entitlement_code,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at
  };
}

function requireOne<Row>(rows: Row[], message: string): Row {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
}
