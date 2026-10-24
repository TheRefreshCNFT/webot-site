import type { AccountContext } from "../auth/account";
import type { EntitlementRow } from "../db/server";
import type { JobRepository } from "../jobs";
import { SafeRejectError } from "../rejects";
import { recordRateLimitEvent, type RateLimitEventRepository } from "./index";

export type ConcurrencyDecision = {
  allowed: boolean;
  activeJobs: number;
  limit: number;
};

type ConcurrencyOptions = {
  apiKeyId?: string | null;
  entitlement: Pick<EntitlementRow, "tierLevel">;
  repository: JobRepository;
  eventRepository?: RateLimitEventRepository;
  route: string;
  now?: () => Date;
};

const activeJobStatuses = [
  "queued",
  "accepted",
  "running",
  "needs_review",
  "ready_for_customer_review"
] as const;

export function getConcurrencyLimit(entitlement: Pick<EntitlementRow, "tierLevel">): number {
  if (entitlement.tierLevel >= 3) {
    return 5;
  }

  if (entitlement.tierLevel === 2) {
    return 3;
  }

  return 1;
}

export async function checkConcurrency(
  context: AccountContext,
  options: ConcurrencyOptions
): Promise<ConcurrencyDecision> {
  const activeJobs = await options.repository.countActiveJobsForAccount(context.account.id, [...activeJobStatuses]);
  const limit = getConcurrencyLimit(options.entitlement);

  return {
    allowed: activeJobs < limit,
    activeJobs,
    limit
  };
}

export async function enforceConcurrency(
  context: AccountContext,
  options: ConcurrencyOptions
): Promise<ConcurrencyDecision> {
  const decision = await checkConcurrency(context, options);

  if (!decision.allowed) {
    await recordRateLimitEvent(context, options.route, "concurrency_limit_reached", {
      apiKeyId: options.apiKeyId,
      repository: options.eventRepository,
      now: options.now
    });
    throw new SafeRejectError("concurrency_limit_reached");
  }

  return decision;
}
