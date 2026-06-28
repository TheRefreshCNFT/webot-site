# Phase 04 Plan: Dashboard, Checkout, and CRM

## Objective

Deliver authenticated customer dashboard flows for payment tiers/options, durable intake, job status/review, files, billing, API keys, usage, jobs, webhooks, and CRM-safe handoff.

Requirements: DASH-01, DASH-02, DASH-03, DASH-04, PRICE-01, PRICE-02, STRIPE-01, STRIPE-02, STRIPE-03, CRM-01, SEC-02.

## Dependencies

- Phase 01 pricing/checkout contract complete.
- Phase 03 backend/API subphases 03-01 through 03-08 complete enough for dashboard, checkout, entitlement, and docs integration tests.
- `04-01-stripe-production-tiers-PLAN.md` complete.

## Read First

- `docs/monetization/pricing-checkout-contract.md`
- `docs/monetization/protected-stripe-links-snapshot.md`
- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`
- `../webot-platform/lib/stripe/entitlement-map.ts`

## Tasks

### Task 1: Build Authenticated Dashboard Shell and Entitlement Views

Files:
- `../webot-platform/app/(dashboard)/layout.tsx`
- `../webot-platform/app/(dashboard)/dashboard/page.tsx`
- `../webot-platform/app/(dashboard)/billing/page.tsx`
- `../webot-platform/components/dashboard/EntitlementSummary.tsx`
- `../webot-platform/components/dashboard/PlanOptions.tsx`
- `../webot-platform/tests/e2e/dashboard-auth-entitlements.spec.ts`

Action:
- Require verified auth/session for all dashboard routes.
- Display Stripe-verified entitlements and plan options for Human, API-only Agent, and Both Basic/Mid/Top.
- Display the nine new STRIPE-03 tiers from server-side Stripe/entitlement configuration, including exact prices, feature access, and verified entitlement state.
- Billing portal access must require an authenticated account and server-side entitlement/customer lookup.
- No page may imply access is active until backend entitlement verification succeeds.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- dashboard-auth-entitlements.spec.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "local model|Ollama|llama|frontier supervision|internal prompt" app components && exit 1 || true`

Done:
- Authenticated customers see verified plans/entitlements and unauthenticated users cannot access dashboard data.

### Task 2: Build Intake, Job Board, Review Actions, and Files

Files:
- `../webot-platform/app/(dashboard)/jobs/page.tsx`
- `../webot-platform/app/(dashboard)/jobs/[id]/page.tsx`
- `../webot-platform/components/jobs/JobIntakeForm.tsx`
- `../webot-platform/components/jobs/JobStatusBoard.tsx`
- `../webot-platform/components/jobs/ReviewActions.tsx`
- `../webot-platform/components/files/FileList.tsx`
- `../webot-platform/tests/e2e/dashboard-jobs-files.spec.ts`

Action:
- Implement durable intake using backend `POST /v1/jobs`.
- Show a job status board backed by `GET /v1/jobs/:id` and job events.
- Add review actions for approve, request revision, and cancel where the API contract permits.
- File UI must use presigned file access and show retention language that matches backend policy.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- dashboard-jobs-files.spec.ts`

Done:
- Customers can submit intake, track job status, review work, request revisions/cancel, and access files within account boundaries.

### Task 3: Build Checkout Safety, API Customer Tools, and CRM Handoff

Files:
- `../webot-platform/app/(dashboard)/api-keys/page.tsx`
- `../webot-platform/app/(dashboard)/usage/page.tsx`
- `../webot-platform/app/(dashboard)/webhooks/page.tsx`
- `../webot-platform/lib/checkout/discounts.ts`
- `../webot-platform/lib/crm/handoff.ts`
- `../webot-platform/tests/e2e/checkout-api-crm.spec.ts`

Action:
- Expose API keys, usage, jobs, and webhook settings for agent/API customers.
- Implement customer-bound discount eligibility from PRICE-02 without public coupon codes.
- Preserve protected existing Stripe links per STRIPE-01 unless Ian explicitly approves replacements, while requiring the new STRIPE-03 tier setup from `04-01-stripe-production-tiers-PLAN.md` for done.
- Implement durable CRM/intake handoff and ensure UI copy does not claim behavior beyond verified implementation per CRM-01.
- E2E checkout tests may open hosted payment pages up to payment submission only.
- E2E checkout tests must prove no dashboard route grants fake entitlement from `?payment=confirmed`, `?session_id=`, `?plan=`, or similar query parameters.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- checkout-api-crm.spec.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "public coupon|fully CRM-wired|guaranteed CRM" app lib components && exit 1 || true`
- Automated: `cd ../webot-platform && grep -R -Ei "payment=confirmed.*entitlement|session_id.*grant|query.*plan.*entitlement" app lib tests && exit 1 || true`

Done:
- Dashboard customers can manage API usage/tools and checkout paths remain charge-safe, customer-bound, and CRM-accurate.

## Acceptance Tests

- `cd ../webot-platform && npm test`
- `cd ../webot-platform && npm run test:e2e`
- `cd ../webot-platform && npm run lint`

## Source Coverage Audit

- DASH-01 through DASH-04 covered by Tasks 1 through 3.
- PRICE-01 and PRICE-02 covered by `04-01-stripe-production-tiers-PLAN.md` and Tasks 1 and 3.
- STRIPE-03 covered by `04-01-stripe-production-tiers-PLAN.md`.
- STRIPE-01, STRIPE-02, CRM-01, and SEC-02 covered by `04-01-stripe-production-tiers-PLAN.md` and Task 3.
