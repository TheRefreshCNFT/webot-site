# WeBot Monetization/API Expansion Handoff

Date: 2026-06-28
Primary repo: `/Users/webot/Projects/webot-site`
Platform repo: `/Users/webot/Projects/webot-platform`

## Objective

Build the WeBot monetization/API expansion to Ian's full definition of done:

- expanded service offerings and family taxonomy
- lower human/API/both pricing
- real Stripe subscription tiers
- secure backend/API
- authenticated dashboard
- API docs
- usage, limits, rejects, files, jobs, and webhook-backed entitlements
- browser/payment-safe validation with screenshots
- public Agency/Studio surfaces updated only after backend and checkout targets are true
- model selections left as the only intended remaining decision

This objective is not complete yet. Keep the goal active.

## Current Resume Point

Resume from:

```bash
cd /Users/webot/Projects/webot-site
```

Then run:

```bash
git status --short --branch
cd /Users/webot/Projects/webot-platform
git status --short --branch
git log --oneline -12
```

Expected current state after this handoff:

- `webot-site` branch `master`, ahead of `origin/master` by local planning/handoff commits.
- `webot-platform` branch `main`, clean at commit:
  - `3d148c4 feat: add stripe subscription tier catalog`
- No live platform deployment has happened yet.
- No live Stripe tier creation has happened yet in this session because the shell did not have Stripe credentials loaded.

## Validation Already Run

Static/public site validation:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh
```

Latest passing output directory:

```text
/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T144933Z
```

Platform validation:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run
npm run lint
npm run typecheck
npm test -- --run tests/stripe/subscription-tier-catalog.test.ts
npm run build
git diff --check
```

Observed results:

- Full unit suite passed with the Stripe tier automation included:
  - `14` test files passed
  - `65` tests passed
- Stripe tier catalog targeted test passed:
  - `1` test file passed
  - `5` tests passed
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `git diff --check` passed.

Stripe script no-credential safety was also verified:

```bash
cd /Users/webot/Projects/webot-platform
npm run stripe:create-tiers -- --mode test --idempotent
npm run stripe:validate-tiers -- --mode test
```

Expected without credentials:

- exit status `1`
- message includes `STRIPE_SECRET_KEY is required to call Stripe. The key value is never printed.`
- no key value is printed

## Credential State

The local shell was checked without printing secret values.

Missing in the current shell:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN`

Because of this:

- live Stripe product/price/payment-link creation has not been run
- live Stripe open-only validation has not been run
- Supabase-backed persistence has not been validated against a real project
- Vercel deployment has not been run

Do not claim production readiness until those gates are executed or explicitly marked NO-GO in release evidence.

## Subagent Usage So Far

Ian explicitly requested subagents: main agent plans, manages, verifies; workers implement bounded slices.

Completed worker slices:

| Worker | Agent id | Slice | Result |
| --- | --- | --- | --- |
| Huygens | `019f0e82-2784-7213-819f-7aa1a95840aa` | Phase 03-04 usage ledger/quotas | closed after manager verification and commit |
| Pasteur | `019f0e8a-8d45-7902-820b-e1644ef6f42d` | Phase 03-05 jobs/files/rejects | closed after manager verification and commit |
| Carson | `019f0e8b-17e1-76e3-bd5a-86783b731620` | Phase 03-06 Stripe webhooks/entitlements | closed after manager verification and commit |
| Poincare | `019f0e96-080a-71a1-9288-50832beb5382` | Phase 03-07 rate limits/OpenAPI | closed after manager verification and commit |
| Russell | `019f0ea1-ef9c-75b3-b441-625686264a80` | Phase 03-08 API docs/screenshots | closed after manager verification and commit |
| Chandrasekhar | `019f0eac-ae24-71b1-adbf-135e91dacdd1` | Phase 04-01 Stripe tier automation | closed/shutdown after manager direct verification and commit |

Important process correction:

- Avoid long blocking `wait_agent` loops.
- Delegate a bounded slice, then do useful non-overlapping work.
- If a worker is quiet for more than a reasonable interval, run `git status` and verify its worktree directly.
- Interrupt or close the worker once enough artifact exists to review.
- Main agent must still run manager verification before commit.

Recommended worker pattern from here:

1. Spawn worker with narrow write scope and exact tests.
2. Wait briefly only when blocked on its result.
3. Inspect worktree directly if it has written files.
4. Run manager verification.
5. Commit one coherent checkpoint.
6. Close worker.

## Platform Commits Landed

`/Users/webot/Projects/webot-platform` currently contains these checkpoints:

```text
3d148c4 feat: add stripe subscription tier catalog
0042003 feat: add api docs surface
2350cdc feat: add rate limits and openapi
476c053 feat: add stripe webhook entitlement sync
9efc805 feat: add job lifecycle and safe rejects
74361e1 feat: add usage ledger and quotas
1bb7a5e feat: add account scoped api keys
9e9bd79 feat: add account auth and entitlements
5e2d39a fix: make secret scan avoid self match
04008d4 feat: bootstrap webot platform service
42618fd docs: define platform architecture and security
```

No remote was configured/pushed during this work.

## What Exists In Platform Now

Backend/API:

- Next.js App Router service baseline.
- `/api/health`.
- account context fixtures and RLS/auth docs.
- entitlement routes:
  - `GET /api/v1/me`
  - `GET /api/v1/entitlements`
- API key routes:
  - `GET /api/v1/api-keys`
  - `POST /api/v1/api-keys`
  - `DELETE /api/v1/api-keys/[id]`
- usage:
  - append-only usage ledger migration
  - `GET /api/v1/usage`
- catalog/jobs/files/rejects:
  - `GET /api/v1/catalog`
  - `POST /api/v1/jobs`
  - `GET /api/v1/jobs/[id]`
  - `GET /api/v1/jobs/[id]/events`
  - `POST /api/v1/jobs/[id]/cancel`
  - `POST /api/v1/jobs/[id]/revision`
  - `POST /api/v1/files/presign`
  - customer-safe reject mapping
- Stripe webhook:
  - `POST /api/stripe/webhook`
  - raw-body signature verification
  - idempotent event ledger
  - nine-tier webhook entitlement mapping
- limits/OpenAPI:
  - account/API-key rate-limit event ledger
  - concurrency checks on job creation
  - `GET /api/v1/openapi.json`
- API docs:
  - `/docs/api`
  - `/docs/api/quickstart`
  - `/docs/api/auth`
  - `/docs/api/openapi`
  - `/docs/api/usage`
  - `/docs/api/webhooks`
  - Playwright screenshots exist in `webot-platform/test-results/`
- Stripe tier automation:
  - `config/stripe-tiers.ts`
  - `scripts/stripe/create-subscription-tiers.ts`
  - `scripts/stripe/validate-subscription-tiers.ts`
  - `lib/checkout/tier-checkout.ts`
  - `docs/stripe/subscription-tier-catalog.md`
  - `tests/stripe/subscription-tier-catalog.test.ts`

## Stripe Tier Contract

The config now defines the exact nine subscription tiers:

| Tier | Amount |
| --- | --- |
| Human Basic | `$10/mo` |
| Human Mid | `$20/mo` |
| Human Top | `$30/mo` |
| API-only Agent Basic | `$7/mo` |
| API-only Agent Mid | `$14/mo` |
| API-only Agent Top | `$21/mo` |
| Both Basic | `$15/mo` |
| Both Mid | `$30/mo` |
| Both Top | `$45/mo` |

Required metadata is represented in config/tests:

- `webot_tier_family`
- `webot_tier_level`
- `webot_entitlement_code`
- `webot_monthly_quota`
- `webot_api_access`
- `webot_dashboard_access`

Stripe object IDs are still placeholders:

```text
pending_live_readback
```

That is intentional until credential-backed Stripe create/validate runs.

## Known Caveats

These are not optional if the final definition of done remains production-ready.

1. Real API-key bearer auth is not fully wired into `resolveAccountContext`.
   - API key creation/hash/revocation exists.
   - rate-limit paths accept/plumb `apiKeyId`.
   - current auth context still primarily uses session/fixture behavior.
   - Before final API readiness, connect bearer `Authorization: Bearer wbot_...` to API-key hash verification and account resolution.

2. Supabase is not yet live-wired.
   - Migrations and repository-shaped modules exist.
   - Many route tests use in-memory repositories/fixtures.
   - Need real Supabase adapter/client integration, migration application, and RLS validation against a local or hosted Supabase project.

3. Stripe live/test catalog creation has not run.
   - Scripts exist and fail closed without `STRIPE_SECRET_KEY`.
   - Need:
     ```bash
     npm run stripe:create-tiers -- --mode test --idempotent
     npm run stripe:validate-tiers -- --mode test
     npm run stripe:create-tiers -- --mode live --idempotent
     npm run stripe:validate-tiers -- --mode live --open-only
     ```
   - After success, update `docs/stripe/subscription-tier-catalog.md` with real product, price, and payment link IDs.

4. No dashboard shell/customer app yet.
   - API docs exist.
   - Dashboard, billing, jobs UI, API-key UI, usage UI, webhook UI, and checkout-safe E2E still need implementation.

5. No platform deployment yet.
   - Vercel config exists.
   - `VERCEL_TOKEN` was missing in the checked shell.

6. Public Agency/Studio surfaces have not yet been updated for the new API subscription model.
   - Do this after dashboard/checkout targets exist.
   - Preserve protected legacy Stripe links unless intentionally migrated.

7. Character/service-family visual assets are not done.
   - Need eight premium, real-human-looking service-family character concepts/assets.
   - No AI-looking artifacts.
   - Must pass browser screenshot QA.

8. Model/runtime selection is intentionally deferred.
   - Build placeholders and eval gates first.
   - Do not publicly mention local models, frontier supervision, internal prompts, internal tools, queue internals, or runtime implementation.

## Next Execution Plan

Continue with subagents, but keep each slice narrow and manager-verified.

### Slice A: Finish API-Key Bearer Auth

Recommended worker scope:

- `lib/auth/account.ts`
- `lib/api-keys/index.ts`
- API auth tests
- maybe `docs/api/*` wording if behavior changes

Goal:

- `Authorization: Bearer <wbot key>` resolves to account context.
- hash verification uses `API_KEY_PEPPER`.
- revoked/expired/wrong-scope keys fail closed.
- last-used updates safely.
- no plaintext key storage.

Verification:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/api/api-key-routes.test.ts tests/api/auth-entitlements.test.ts tests/api/rate-limit-concurrency.test.ts
npm run lint
npm run typecheck
npm run build
git diff --check
```

### Slice B: Dashboard Shell + Billing/Plans

Recommended worker scope:

- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/billing/page.tsx`
- `components/dashboard/*`
- `tests/e2e/dashboard-auth-entitlements.spec.ts`

Goal:

- dashboard routes show verified entitlement state only
- nine tiers displayed from `config/stripe-tiers.ts`
- fake query params do not grant access
- pricing is exact
- browser screenshots captured

### Slice C: Jobs/Files Dashboard

Recommended worker scope:

- `app/(dashboard)/jobs/page.tsx`
- `app/(dashboard)/jobs/[id]/page.tsx`
- `components/jobs/*`
- `components/files/*`
- `tests/e2e/dashboard-jobs-files.spec.ts`

Goal:

- intake uses `POST /api/v1/jobs`
- job status/events are visible
- cancel/revision actions call implemented routes
- files use presign contract
- retention language matches backend behavior

### Slice D: API Customer Tools + CRM Handoff

Recommended worker scope:

- `app/(dashboard)/api-keys/page.tsx`
- `app/(dashboard)/usage/page.tsx`
- `app/(dashboard)/webhooks/page.tsx`
- `lib/checkout/discounts.ts`
- `lib/crm/handoff.ts`
- `tests/e2e/checkout-api-crm.spec.ts`

Goal:

- API keys, usage, webhook config, and jobs are dashboard-visible
- customer-bound repeat-agent discount eligibility exists without public coupon codes
- CRM/intake handoff is durable and truthfully described
- fake success/session/query params cannot grant entitlement

### Slice E: Real Stripe Readback

Only after `STRIPE_SECRET_KEY` is loaded.

Commands:

```bash
cd /Users/webot/Projects/webot-platform
npm run stripe:create-tiers -- --mode test --idempotent
npm run stripe:validate-tiers -- --mode test
npm run stripe:create-tiers -- --mode live --idempotent
npm run stripe:validate-tiers -- --mode live --open-only
```

Then:

- update `docs/stripe/subscription-tier-catalog.md`
- create protected legacy link audit
- add/live-run checkout open tests up to payment submission only

### Slice F: Public Site + Studio + Visuals

Only after dashboard/checkout targets are true.

Scope:

- `webot-site` static files
- relevant `webot-studio` public surfaces
- service-family character assets
- sitemap/llms/pricing copy

Validation:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh
scripts/publish-live.sh --dry-run
```

No publish until final browser/payment-safe verification is green.

### Slice G: Release Verification

Final evidence package must include:

- backend full tests
- backend E2E tests
- lint/typecheck/build
- API docs screenshots
- dashboard screenshots
- public Agency/Studio screenshots
- checkout open-without-payment screenshots
- Stripe exact amount/readback audit
- protected legacy link diff
- fake entitlement tests
- safe reject/internal leak scans
- model placeholder/eval readiness note

Create:

- `.planning/verification/release-test-results.md`
- `.planning/verification/browser-checkout-dashboard.md`
- `.planning/verification/stripe-release-audit.md`
- `.planning/verification/GO-NO-GO.md`

## Do Not Claim Done Until

All of these are true with evidence:

- real Stripe tiers exist or are idempotently found in test and live modes
- hosted checkout opens to all nine expected products/amounts without payment submission
- webhook-backed entitlements work from signed Stripe events
- fake success/session/query parameters cannot grant access
- real dashboard pages exist for billing, jobs, files, API keys, usage, and webhooks
- API-key bearer auth is wired and tested
- account isolation/RLS is validated against real or local Supabase, not only in-memory tests
- API docs and dashboard are browser-tested with screenshots
- public Agency/Studio pages are updated and browser-tested
- protected legacy Stripe links are unchanged unless intentionally migrated
- no public copy leaks internal runtime details
- final model decisions are the only intended remaining product choice

