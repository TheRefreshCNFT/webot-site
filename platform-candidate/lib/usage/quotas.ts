import type { AccountContext } from "../auth/account";
import type { EntitlementRow, ServerDb } from "../db/server";
import { getServerDb } from "../db/server";
import { listGatedEntitlementRowsByAccountId } from "../entitlements";
import { listAccountUsageLedger, type UsageLedgerFilters, type UsageLedgerRepository, type UsageLedgerRow } from "./ledger";

export type UsageSummary = {
  period: {
    start: string | null;
    end: string | null;
  };
  totals: {
    quantity: number;
    quota: number;
    remaining: number;
    unit: "job";
  };
  summaries: {
    by_entitlement: UsageBucket[];
    by_service_family: UsageBucket[];
    by_billing_period: BillingPeriodBucket[];
    by_api_key: ApiKeyUsageBucket[];
  };
  recent_events: SafeUsageEvent[];
};

export type UsageBucket = {
  key: string;
  quantity: number;
  quota?: number;
  remaining?: number;
};

export type BillingPeriodBucket = {
  start: string;
  end: string;
  quantity: number;
  quota: number;
  remaining: number;
};

export type ApiKeyUsageBucket = {
  api_key_id: string;
  quantity: number;
};

export type SafeUsageEvent = {
  id: string;
  created_at: string;
  service_family: string;
  job_id: string | null;
  quantity: number;
  unit: string;
  entitlement_code: string;
  api_key_id: string | null;
};

type UsageSummaryOptions = {
  db?: ServerDb;
  repository?: UsageLedgerRepository;
  filters?: UsageLedgerFilters;
};

type ActiveEntitlement = Pick<
  EntitlementRow,
  "entitlementCode" | "monthlyQuota" | "status" | "currentPeriodStart" | "currentPeriodEnd"
>;

export async function getAccountUsageSummary(
  context: AccountContext,
  options: UsageSummaryOptions = {}
): Promise<UsageSummary> {
  const db = options.db ?? getServerDb();
  const activeEntitlements = (await listGatedEntitlementRowsByAccountId(context.account.id, { db })).filter(isActiveEntitlement);
  const currentPeriod = getCurrentPeriod(activeEntitlements);
  const filters = currentPeriod
    ? {
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end,
        ...options.filters
      }
    : options.filters;
  const rows = await listAccountUsageLedger(context, filters, {
    repository: options.repository
  });
  const totalQuota = activeEntitlements.reduce((total, entitlement) => total + entitlement.monthlyQuota, 0);
  const totalQuantity = sumQuantity(rows);

  return {
    period: currentPeriod ?? {
      start: null,
      end: null
    },
    totals: {
      quantity: totalQuantity,
      quota: totalQuota,
      remaining: Math.max(totalQuota - totalQuantity, 0),
      unit: "job"
    },
    summaries: {
      by_entitlement: summarizeByEntitlement(rows, activeEntitlements),
      by_service_family: summarizeByString(rows, (row) => row.serviceFamily),
      by_billing_period: summarizeByBillingPeriod(rows, activeEntitlements),
      by_api_key: summarizeByApiKey(rows)
    },
    recent_events: rows.slice(0, 20).map(toSafeUsageEvent)
  };
}

function isActiveEntitlement(entitlement: ActiveEntitlement): boolean {
  return entitlement.status === "active" || entitlement.status === "trialing";
}

function getCurrentPeriod(entitlements: ActiveEntitlement[]): { start: string; end: string } | null {
  if (entitlements.length === 0) {
    return null;
  }

  return {
    start: entitlements
      .map((entitlement) => entitlement.currentPeriodStart)
      .sort()[0],
    end: entitlements
      .map((entitlement) => entitlement.currentPeriodEnd)
      .sort()
      .at(-1) as string
  };
}

function summarizeByEntitlement(rows: UsageLedgerRow[], entitlements: ActiveEntitlement[]): UsageBucket[] {
  return entitlements.map((entitlement) => {
    const quantity = sumQuantity(rows.filter((row) => row.entitlementCode === entitlement.entitlementCode));

    return {
      key: entitlement.entitlementCode,
      quantity,
      quota: entitlement.monthlyQuota,
      remaining: Math.max(entitlement.monthlyQuota - quantity, 0)
    };
  });
}

function summarizeByString(rows: UsageLedgerRow[], getKey: (row: UsageLedgerRow) => string): UsageBucket[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    totals.set(getKey(row), (totals.get(getKey(row)) ?? 0) + row.quantity);
  }

  return Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, quantity]) => ({
      key,
      quantity
    }));
}

function summarizeByBillingPeriod(rows: UsageLedgerRow[], entitlements: ActiveEntitlement[]): BillingPeriodBucket[] {
  const periods = new Map<string, BillingPeriodBucket>();

  for (const entitlement of entitlements) {
    const key = `${entitlement.currentPeriodStart}:${entitlement.currentPeriodEnd}`;
    const existing = periods.get(key);

    periods.set(key, {
      start: entitlement.currentPeriodStart,
      end: entitlement.currentPeriodEnd,
      quantity: existing?.quantity ?? 0,
      quota: (existing?.quota ?? 0) + entitlement.monthlyQuota,
      remaining: 0
    });
  }

  for (const row of rows) {
    for (const period of periods.values()) {
      if (row.createdAt >= period.start && row.createdAt < period.end) {
        period.quantity += row.quantity;
        break;
      }
    }
  }

  for (const period of periods.values()) {
    period.remaining = Math.max(period.quota - period.quantity, 0);
  }

  return Array.from(periods.values()).sort((left, right) => left.start.localeCompare(right.start));
}

function summarizeByApiKey(rows: UsageLedgerRow[]): ApiKeyUsageBucket[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (row.apiKeyId) {
      totals.set(row.apiKeyId, (totals.get(row.apiKeyId) ?? 0) + row.quantity);
    }
  }

  return Array.from(totals.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([apiKeyId, quantity]) => ({
      api_key_id: apiKeyId,
      quantity
    }));
}

function sumQuantity(rows: UsageLedgerRow[]): number {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

function toSafeUsageEvent(row: UsageLedgerRow): SafeUsageEvent {
  return {
    id: row.id,
    created_at: row.createdAt,
    service_family: row.serviceFamily,
    job_id: row.jobId,
    quantity: row.quantity,
    unit: row.unit,
    entitlement_code: row.entitlementCode,
    api_key_id: row.apiKeyId
  };
}
