# Phase 03 Plan Index: Backend Entitlements and API

## Objective

Build the production backend/API in smaller executable subphases after Phase 02 security contracts pass. Backend work belongs in `../webot-platform` or `../webot-api`, never inside `webot-site`.

Requirements: ARCH-01, ARCH-03, ARCH-04, API-01, API-02, API-03, API-04, DATA-01, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, STRIPE-02, STRIPE-03.

## Required Subphase Order

Execute these plans in order. Do not start feature implementation until `03-01-bootstrap-platform-PLAN.md` passes its resource inventory, local dev, test, build, Supabase, and owned-runtime readiness checks.

1. `03-01-bootstrap-platform-PLAN.md` - create the service repo/app, resource inventory gate, environment contract, Supabase baseline, tests, CI, and owned-runtime deploy config.
2. `03-02-auth-rls-entitlements-PLAN.md` - implement Supabase Auth, account resolution, RLS, and entitlement reads.
3. `03-03-api-keys-PLAN.md` - implement hashed API key creation, display-once behavior, verification, and account scoping.
4. `03-04-usage-ledger-PLAN.md` - implement append-only usage ledger and quota reads.
5. `03-05-jobs-files-rejects-PLAN.md` - implement catalog, jobs, events, revisions, file presign, retention, and safe rejects.
6. `03-06-stripe-webhooks-PLAN.md` - implement Stripe webhook signatures, idempotency, and entitlement updates.
7. `03-07-rate-limits-openapi-PLAN.md` - implement rate limits, concurrency, quotas, and route-backed OpenAPI.
8. `03-08-api-docs-surface-PLAN.md` - build public/authenticated API docs, schema browser, examples, and screenshot verification.

## Cross-Phase Rules

- Every subphase must preserve account authorization, safe reject hygiene, and no internal model/tool/prompt/queue leakage.
- `GET /v1/openapi.json` is required but not sufficient for API docs. The docs surface must also be browser-visible and agent-friendly.
- Tests must prove behavior; markdown evidence alone cannot mark any backend subphase done.

## Acceptance Tests

- `test -f .planning/phases/03-backend-entitlements-api/03-01-bootstrap-platform-PLAN.md`
- `test -f .planning/phases/03-backend-entitlements-api/03-08-api-docs-surface-PLAN.md`
- After subphase execution: `cd ../webot-platform && npm test && npm run test:e2e && npm run lint && npm run typecheck && npm run build`

## Source Coverage Audit

- ARCH-01, ARCH-03, and ARCH-04 covered by 03-01.
- SEC-01 and SEC-02 covered by 03-02 and 03-03.
- DATA-01 covered by 03-02 through 03-06.
- API-01 and API-02 covered by 03-02 through 03-07.
- API-03 covered by 03-07.
- API-04 covered by 03-08.
- SEC-03 covered by 03-04 and 03-07.
- SEC-04 and SEC-05 covered by 03-05.
- STRIPE-02 and STRIPE-03 entitlement mapping covered by 03-06.
