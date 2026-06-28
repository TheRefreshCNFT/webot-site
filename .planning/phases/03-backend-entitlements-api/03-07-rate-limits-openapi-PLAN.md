# Phase 03-07 Plan: Rate Limits, Concurrency, and OpenAPI

## Objective

Enforce server-side quotas/rate limits/concurrency and generate an OpenAPI schema from implemented routes.

Requirements: API-01, API-03, DATA-01, SEC-03.

## Dependencies

- `03-03-api-keys-PLAN.md` complete.
- `03-04-usage-ledger-PLAN.md` complete.
- `03-05-jobs-files-rejects-PLAN.md` complete.

## Read First

- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Implement Rate Limit and Concurrency Gates

Files:
- `../webot-platform/lib/rate-limit/index.ts`
- `../webot-platform/lib/rate-limit/concurrency.ts`
- `../webot-platform/supabase/migrations/0007_rate_limit_events.sql`
- `../webot-platform/tests/api/rate-limit-concurrency.test.ts`

Action:
- Enforce per-key and per-account rate limits before accepting resource-consuming requests.
- Enforce account/tier concurrency limits for jobs, and record rate-limit events with account, key, route, reason, and timestamp.
- Rate-limit and concurrency rejects must use customer-safe reject codes without internal queue, worker, model, prompt, or tool details.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/rate-limit-concurrency.test.ts`
- Automated: `grep -E "rate_limit_events|concurrency|account_id|api_key" ../webot-platform/supabase/migrations/0007_rate_limit_events.sql ../webot-platform/lib/rate-limit/index.ts ../webot-platform/lib/rate-limit/concurrency.ts`

Done:
- Quotas, per-key/account limits, and concurrency gates are enforced server-side.

### Task 2: Generate and Test OpenAPI From Implemented Routes

Files:
- `../webot-platform/app/api/v1/openapi.json/route.ts`
- `../webot-platform/lib/openapi/build.ts`
- `../webot-platform/tests/api/openapi-schema.test.ts`

Action:
- Generate `GET /v1/openapi.json` from implemented route schemas for catalog, me, entitlements, usage, jobs, job events, cancel, revision, file presign, API keys, and webhooks where applicable.
- Tests must assert required paths, auth schemes, request/response schemas, error/reject schemas, and quota/rate-limit response examples.
- OpenAPI output must match implemented routes; do not document endpoints that do not exist.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/openapi-schema.test.ts`
- Automated: `cd ../webot-platform && npm run build`

Done:
- API schema is machine-readable, route-backed, and complete enough for docs, SDK examples, and agent consumers.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/api/rate-limit-concurrency.test.ts tests/api/openapi-schema.test.ts`

## Source Coverage Audit

- API-01 covered for remaining route schema coverage.
- API-03 covered by route-backed OpenAPI generation.
- DATA-01 covered for rate limit events.
- SEC-03 covered by quotas, rate limits, concurrency, and idempotent behavior.
