# Phase 03-04 Plan: Usage Ledger and Quotas

## Objective

Implement account-owned usage tracking and quota reads that later jobs, docs, dashboard, and rate limits can rely on.

Requirements: API-01, DATA-01, SEC-02, SEC-03.

## Dependencies

- `03-02-auth-rls-entitlements-PLAN.md` complete.
- `03-03-api-keys-PLAN.md` complete.

## Read First

- `../webot-platform/docs/architecture/data-model.md`
- `../webot-platform/docs/api/v1-contract.md`

## Tasks

### Task 1: Implement Append-Only Usage Ledger

Files:
- `../webot-platform/supabase/migrations/0004_usage_ledger.sql`
- `../webot-platform/lib/usage/ledger.ts`
- `../webot-platform/tests/api/usage-ledger.test.ts`

Action:
- Create an append-only usage ledger for account, API key, service family, job, quantity, unit, entitlement code, idempotency key, and created timestamp.
- Prevent client-side mutation/deletion of ledger rows through RLS and server code.
- Tests must prove duplicate idempotency keys do not double-count and cross-account ledger access fails.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/usage-ledger.test.ts`
- Automated: `grep -E "usage_ledger|idempotency|enable row level security|create policy" ../webot-platform/supabase/migrations/0004_usage_ledger.sql`

Done:
- Billable or quota-consuming behavior has a durable, account-owned ledger before jobs and rate limits consume it.

### Task 2: Implement Usage API and Entitlement Quota Reads

Files:
- `../webot-platform/app/api/v1/usage/route.ts`
- `../webot-platform/lib/usage/quotas.ts`
- `../webot-platform/tests/api/usage-route.test.ts`

Action:
- Implement `GET /v1/usage` with account-scoped summaries by entitlement, service family, billing period, and API key where applicable.
- Quota calculations must use server-side entitlements and ledger rows, not request-provided plan values.
- Responses must hide internal costs, model routing, prompt, queue, reviewer, and worker details.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/usage-route.test.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "prompt|internal tool|queue worker|reviewer" app/api/v1/usage lib/usage && exit 1 || true`

Done:
- Customers can inspect usage and remaining quota through server-calculated account data.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/api/usage-ledger.test.ts tests/api/usage-route.test.ts`

## Source Coverage Audit

- API-01 covered for `/v1/usage`.
- DATA-01 covered for usage ledger.
- SEC-02 and SEC-03 covered by account ownership, idempotency, and quota calculation.
