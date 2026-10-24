import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as postJob } from "../../app/api/v1/jobs/route";
import { resolveAccountContext, type AccountContext } from "../../lib/auth/account";
import { testFixtures } from "../../lib/db/server";
import { createJob, InMemoryJobRepository, resetJobRepositoryForTests } from "../../lib/jobs";
import {
  InMemoryRateLimitEventRepository,
  resetRateLimitForTests,
  type RateLimitCounterStore,
  type RateLimitPolicy
} from "../../lib/rate-limit";
import { InMemoryRejectRepository, resetRejectRepositoryForTests, SafeRejectError } from "../../lib/rejects";
import { InMemoryUsageLedgerRepository, resetUsageLedgerRepositoryForTests } from "../../lib/usage/ledger";

const alphaHeaders = {
  "x-webot-test-user-id": testFixtures.users.alpha,
  "x-webot-test-user-email": "owner.alpha@example.test"
};

const onePerMinutePolicy: RateLimitPolicy = {
  account: {
    limit: 1,
    windowMs: 60_000
  },
  apiKey: {
    limit: 99,
    windowMs: 60_000
  }
};

describe("rate limits and concurrency gates", () => {
  beforeEach(() => {
    resetJobRepositoryForTests();
    resetUsageLedgerRepositoryForTests();
    resetRejectRepositoryForTests();
    resetRateLimitForTests();
  });

  it("enforces per-account route rate limits before accepting another resource-consuming job", async () => {
    const context = await alphaContext();
    const jobs = new InMemoryJobRepository();
    const usage = new InMemoryUsageLedgerRepository();
    const events = new InMemoryRateLimitEventRepository();
    const rejects = new InMemoryRejectRepository();
    resetRejectRepositoryForTests(rejects);
    await createJob(context, validJob("First"), {
      repository: jobs,
      usageRepository: usage,
      rateLimitEventRepository: events,
      rateLimitPolicy: onePerMinutePolicy,
      now: fixedClock()
    });

    await expect(createJob(context, validJob("Second"), {
      repository: jobs,
      usageRepository: usage,
      rateLimitEventRepository: events,
      rateLimitPolicy: onePerMinutePolicy,
      now: fixedClock()
    })).rejects.toMatchObject({
      retryAfterSeconds: 60,
      retryAt: "2026-06-28T14:01:00.000Z",
      safeReject: {
        code: "rate_limit_exceeded",
        message: "This request is over the current rate limit."
      }
    });

    expect(jobs.dumpJobsForTests()).toHaveLength(1);
    expect(events.dumpRowsForTests()).toMatchObject([
      {
        accountId: testFixtures.accounts.alpha,
        apiKeyId: null,
        route: "/api/v1/jobs",
        reason: "account_rate_limit",
        rejectCode: "rate_limit_exceeded",
        customerSafeAction: "Wait briefly before trying again, or reduce request frequency.",
        retryAfterSeconds: 60,
        retryAt: "2026-06-28T14:01:00.000Z"
      }
    ]);
    expect(rejects.dumpRowsForTests()).toMatchObject([
      {
        accountId: testFixtures.accounts.alpha,
        apiKeyId: null,
        rejectCode: "rate_limit_exceeded",
        source: "jobs_api"
      }
    ]);
  });

  it("returns Retry-After and retry timing for route-level rate-limit rejects", async () => {
    const events = new InMemoryRateLimitEventRepository();
    resetRateLimitForTests(events, blockingCounterStore());

    const blocked = await postJob(jsonRequest("https://api.webot.agency/api/v1/jobs", validJob("Blocked by route"), alphaHeaders));
    const body = await blocked.json();
    const retryAfter = Number(blocked.headers.get("retry-after"));

    expect(blocked.status).toBe(429);
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(body.error).toMatchObject({
      code: "rate_limit_exceeded",
      message: "This request is over the current rate limit.",
      action: "Wait briefly before trying again, or reduce request frequency.",
      retry_after_seconds: retryAfter
    });
    expect(Date.parse(body.error.retry_at)).not.toBeNaN();
    expect(events.dumpRowsForTests()).toMatchObject([
      {
        accountId: testFixtures.accounts.alpha,
        route: "/api/v1/jobs",
        reason: "account_rate_limit",
        rejectCode: "rate_limit_exceeded",
        retryAfterSeconds: expect.any(Number),
        retryAt: expect.any(String)
      }
    ]);
    expect(Date.parse(events.dumpRowsForTests()[0]?.retryAt ?? "")).not.toBeNaN();
  });

  it("enforces per-key limits when an authenticated API key id is present", async () => {
    const context = {
      ...(await alphaContext()),
      auth: {
        ...(await alphaContext()).auth,
        method: "api_key" as const,
        apiKeyId: "aaaaaaaa-0000-4000-8000-00000000a111"
      }
    } satisfies AccountContext;
    const jobs = new InMemoryJobRepository();
    const usage = new InMemoryUsageLedgerRepository();
    const events = new InMemoryRateLimitEventRepository();
    const policy: RateLimitPolicy = {
      account: {
        limit: 99,
        windowMs: 60_000
      },
      apiKey: {
        limit: 1,
        windowMs: 60_000
      }
    };

    await createJob(context, validJob("Key first"), {
      repository: jobs,
      usageRepository: usage,
      rateLimitEventRepository: events,
      rateLimitPolicy: policy,
      now: fixedClock()
    });

    await expect(createJob(context, validJob("Key second"), {
      repository: jobs,
      usageRepository: usage,
      rateLimitEventRepository: events,
      rateLimitPolicy: policy,
      now: fixedClock()
    })).rejects.toBeInstanceOf(SafeRejectError);

    expect(jobs.dumpJobsForTests()[0]).toMatchObject({
      apiKeyId: "aaaaaaaa-0000-4000-8000-00000000a111"
    });
    expect(events.dumpRowsForTests()[0]).toMatchObject({
      apiKeyId: "aaaaaaaa-0000-4000-8000-00000000a111",
      reason: "api_key_rate_limit",
      rejectCode: "rate_limit_exceeded"
    });
  });

  it("enforces tier concurrency through the job creation route and ignores client-supplied limits", async () => {
    const events = new InMemoryRateLimitEventRepository();
    resetRateLimitForTests(events);

    for (let index = 0; index < 5; index += 1) {
      const response = await postJob(jsonRequest("https://api.webot.agency/api/v1/jobs", {
        ...validJob(`Concurrent ${index}`),
        plan: "enterprise",
        concurrency_limit: 999
      }, alphaHeaders));

      expect(response.status).toBe(201);
    }

    const blocked = await postJob(jsonRequest("https://api.webot.agency/api/v1/jobs", {
      ...validJob("Blocked"),
      monthly_quota: 999999,
      concurrency_limit: 999
    }, alphaHeaders));
    const body = await blocked.json();
    const serialized = JSON.stringify(body).toLowerCase();

    expect(blocked.status).toBe(429);
    expect(body.error).toMatchObject({
      code: "concurrency_limit_exceeded",
      message: "This account already has the maximum number of active jobs for its current plan.",
      action: "Wait for an active job to finish before creating another job."
    });
    expect(events.dumpRowsForTests()).toHaveLength(1);
    expect(events.dumpRowsForTests()[0]).toMatchObject({
      accountId: testFixtures.accounts.alpha,
      route: "/api/v1/jobs",
      reason: "concurrency_limit_reached",
      rejectCode: "concurrency_limit_exceeded"
    });
    expect(serialized).not.toContain("model");
    expect(serialized).not.toContain("vendor");
    expect(serialized).not.toContain("prompt");
    expect(serialized).not.toContain("queue");
    expect(serialized).not.toContain("worker");
  });

  it("defines an account-scoped append-only rate limit event table", () => {
    const sql = readFileSync("supabase/migrations/0007_rate_limit_events.sql", "utf8").toLowerCase();
    const retrySql = readFileSync("supabase/migrations/0010_rate_limit_event_retry_timing.sql", "utf8").toLowerCase();

    expect(sql).toContain("create table app_public.rate_limit_events");
    expect(sql).toContain("account_id");
    expect(sql).toContain("api_key_id");
    expect(sql).toContain("route");
    expect(sql).toContain("reason");
    expect(sql).toContain("customer_safe_message");
    expect(sql).toContain("customer_safe_action");
    expect(sql).toContain("created_at");
    expect(retrySql).toContain("retry_after_seconds");
    expect(retrySql).toContain("retry_at");
    expect(retrySql).toContain("rate_limit_events_retry_after_nonnegative");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("force row level security");
    expect(sql).toContain("create policy rate_limit_events_member_select");
    expect(sql).not.toMatch(/create policy[\s\S]*rate_limit_events[\s\S]*for insert/);
    expect(sql).not.toMatch(/create policy[\s\S]*rate_limit_events[\s\S]*for update/);
    expect(sql).not.toMatch(/create policy[\s\S]*rate_limit_events[\s\S]*for delete/);
  });
});

async function alphaContext(): Promise<AccountContext> {
  return resolveAccountContext(new Request("https://api.webot.agency/api/v1/jobs", {
    headers: alphaHeaders
  }));
}

function validJob(title: string): Record<string, unknown> {
  return {
    service_family: "create_design",
    service_type: "image_upscale_enhance",
    customer_title: title,
    customer_instructions: "Please brighten the image and keep it natural."
  };
}

function jsonRequest(url: string, body: Record<string, unknown>, headers: Record<string, string>): Request {
  return new Request(url, {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function fixedClock(): () => Date {
  return () => new Date("2026-06-28T14:00:00.000Z");
}

function blockingCounterStore(): RateLimitCounterStore {
  return {
    async consume(_key, bucket, now) {
      return {
        allowed: false,
        count: bucket.limit + 1,
        resetAtMs: now.getTime() + 45_000
      };
    }
  };
}
