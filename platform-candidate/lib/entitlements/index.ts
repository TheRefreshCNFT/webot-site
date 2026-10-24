import type { AccountContext } from "../auth/account";
import { filterWalletGatedEntitlements, type WalletServiceOptions } from "../cardano";
import type { EntitlementRow, EntitlementStatus, ServerDb } from "../db/server";
import { getServerDb } from "../db/server";

export type SafeEntitlement = {
  entitlement_code: string;
  tier_family: string;
  tier_level: number;
  api_access: boolean;
  dashboard_access: boolean;
  monthly_quota: number;
  status: EntitlementStatus;
  current_period_end: string;
};

export type EntitlementSummary = {
  api_access: boolean;
  dashboard_access: boolean;
  active_entitlement_count: number;
  monthly_quota: number;
};

export async function listAccountEntitlements(
  context: AccountContext,
  options: { db?: ServerDb; wallet?: WalletServiceOptions } = {}
): Promise<SafeEntitlement[]> {
  const rows = await listGatedEntitlementRowsByAccountId(context.account.id, options);

  return rows.map(toSafeEntitlement);
}

/**
 * Entitlement rows with the Cardano holder downgrade policy applied:
 * holder_unlimited rows are ignored while the account's verified wallet is
 * missing or below the policy asset threshold (and restored automatically
 * once holdings recover and a refresh runs). All entitlement consumers —
 * dashboard summary, usage quotas, job preflight — read through this.
 */
export async function listGatedEntitlementRowsByAccountId(
  accountId: string,
  options: { db?: ServerDb; wallet?: WalletServiceOptions } = {}
): Promise<EntitlementRow[]> {
  const db = options.db ?? getServerDb();
  const rows = await db.listEntitlementsByAccountId(accountId);

  return filterWalletGatedEntitlements(rows, accountId, options.wallet);
}

export function summarizeEntitlements(entitlements: SafeEntitlement[]): EntitlementSummary {
  const activeEntitlements = entitlements.filter((entitlement) => isActiveEntitlement(entitlement));

  return {
    api_access: activeEntitlements.some((entitlement) => entitlement.api_access),
    dashboard_access: activeEntitlements.some((entitlement) => entitlement.dashboard_access),
    active_entitlement_count: activeEntitlements.length,
    monthly_quota: activeEntitlements.reduce((total, entitlement) => total + entitlement.monthly_quota, 0)
  };
}

export function toSafeEntitlement(entitlement: EntitlementRow): SafeEntitlement {
  return {
    entitlement_code: entitlement.entitlementCode,
    tier_family: entitlement.tierFamily,
    tier_level: entitlement.tierLevel,
    api_access: entitlement.apiAccess,
    dashboard_access: entitlement.dashboardAccess,
    monthly_quota: entitlement.monthlyQuota,
    status: entitlement.status,
    current_period_end: entitlement.currentPeriodEnd
  };
}

function isActiveEntitlement(entitlement: SafeEntitlement): boolean {
  return entitlement.status === "active" || entitlement.status === "trialing";
}
