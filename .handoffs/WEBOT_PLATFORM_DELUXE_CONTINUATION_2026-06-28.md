---
project: webot-platform monetization/API expansion
created: 2026-06-28
status: active implementation; not production-ready yet
primary_repo: /Users/webot/Projects/webot-platform
public_site_repo: /Users/webot/Projects/webot-site
orchestrator_rule: use subagents for bounded implementation; manager verifies before accepting
---

# WeBot Platform Deluxe Continuation

This handoff exists because the previous long session started to hit repeated
agent wait/context failure points. Use this file as the restart map. Do not infer
completion from planning docs or subagent summaries alone.

## Definition Of Done

Ian's requested finish line is a product-ready, money-capable WeBot platform:

- public WeBot Agency/Studio pages present the expanded service families,
  lowered pricing, API-only/human/both account options, and premium visual
  treatment;
- backend supports authenticated accounts, API keys, endpoint processing,
  usage tracking, rejects, limits, files, jobs, Stripe entitlement sync, and
  dashboard views;
- API customers and agent customers can understand the docs, pricing, limits,
  key handling, and webhook/payment behavior without hidden manual steps;
- server-first security is real: no query-param entitlement grants, no secret
  rendering, no public coupon leakage, webhook signatures fail closed, and API
  keys are one-time plaintext only;
- local and browser tests pass, including human-style browser paths with
  screenshots;
- publish/deploy scripts are used only after the state is verified;
- the only intended remaining change after this work is final model selection
  and swapping working placeholders for chosen model/runtime mappings.

Do **not** claim production readiness until live credentials, live Stripe
readback, deployment, payment-safe browser checks, and final publish gates have
actually passed.

## Repo Boundaries

- `/Users/webot/Projects/webot-platform` is the Next.js backend/dashboard/API
  implementation repo.
- `/Users/webot/Projects/webot-site` is the static public site repo for
  `webot.agency`; keep it static.
- `webot-site` can hold planning and handoff docs for the whole WeBot delivery,
  but product code for dashboard/API belongs in `webot-platform`.
- Do not move secrets into either repo. Live credentials are environment/runtime
  concerns.

## Subagent Operating Model

The manager/orchestrator does:

- read `.handoffs/CURRENT_STATE.md`, `AGENTS.md`, and `ACTIVE_STATE.md` before
  state-changing work;
- define the current slice and its acceptance checks;
- spawn subagents only for bounded, disjoint implementation or verification
  tasks;
- give each subagent explicit file ownership and a no-revert warning;
- inspect the returned diff and rerun the critical checks independently;
- commit verified checkpoints;
- update handoffs and active state.

Subagents do:

- implement the assigned slice only;
- avoid touching unrelated files;
- never revert other agents' or user changes;
- report changed files, commands run, test results, screenshots, and caveats;
- stop and report blockers instead of broadening scope.

Subagent assignment template:

```text
Repo: /Users/webot/Projects/webot-platform
You are not alone in the codebase. Do not revert unrelated edits.

Slice:
<one bounded product outcome>

Owned files/modules:
<exact paths or directories>

Do not touch:
<explicit exclusions>

Acceptance checks:
<commands and browser/screenshot artifacts>

Required final report:
- changed files
- behavior shipped
- tests/screenshots run
- caveats/blockers
```

If a subagent stalls on `wait_agent`, check the worktree directly. If no files
were produced, close the agent and continue from verified repo state instead of
waiting indefinitely.

## Platform Commits Completed

The platform repo is currently on `main`. Completed checkpoints:

- `1bb7a5e feat: add account scoped api keys`
- `74361e1 feat: add usage ledger and quotas`
- `9efc805 feat: add job lifecycle and safe rejects`
- `476c053 feat: add stripe webhook entitlement sync`
- `2350cdc feat: add rate limits and openapi`
- `0042003 feat: add api docs surface`
- `3d148c4 feat: add stripe subscription tier catalog`
- `0f1a15c feat: resolve bearer api keys for account auth`
- `de7a268 feat: add dashboard entitlement and billing views`
- `585bc72 feat: add dashboard jobs and files views`
- `51d65fb feat: add api customer dashboard tools`
- `39e9dfc feat: add deployment environment readiness gate`

## Latest Verified Checkpoint: Slice E

Slice E was implemented with subagent work plus manager cleanup/verification
before commit `39e9dfc`.

Files added/changed:

- `.github/workflows/ci.yml`
- `README.md`
- `docs/deployment/readiness.md`
- `docs/stripe/subscription-tier-catalog.md`
- `package.json`
- `scripts/stripe/create-subscription-tiers.ts`
- `scripts/verify-deploy-env.ts`
- `tests/api/stripe-webhook-signature.test.ts`
- `tests/deploy-env.test.ts`
- `tests/stripe/subscription-tier-catalog.test.ts`

Shipped behavior:

- Added `npm run env:check`, `npm run env:check:staging`, and
  `npm run env:check:production`.
- Added a deploy env verifier that passes local mode with `.env.example`
  placeholders but fails closed for staging/production when required values are
  missing, placeholders, non-HTTPS deploy URLs, localhost deploy URLs, or the
  wrong Stripe key mode.
- Promoted `test:webhooks` and `test:rate-limit` from placeholder echo commands
  to real Vitest suites.
- Promoted CI from health-only `test:api` to the full Vitest suite.
- Fixed the secret scanner false positive by constructing the webhook test
  fixture without a committed webhook-shaped literal.
- Aligned default Stripe checkout return origin and docs to
  `https://app.webot.studio`.
- Updated README and deployment readiness docs with local/staging/production env
  check commands and safe no-charge validation notes.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm run env:check -- --target local
npm run env:check:staging -- --env-file .env.example # expected failure; placeholder gate proved closed
npm test -- --run tests/deploy-env.test.ts
npm run secrets:check
npm run test:webhooks
npm run test:rate-limit
npm run deploy:check
git diff --cached --check
```

Observed results:

- Local env check passed.
- Staging env check failed as intended against `.env.example` placeholders.
- Deploy-env unit test passed: 1 file, 6 tests.
- Secret scan passed after new files were staged.
- Webhook named suite passed: 1 file, 4 tests.
- Rate-limit named suite passed: 1 file, 4 tests.
- Full `deploy:check` passed: secret scan, env local check, db check, lint,
  typecheck, 16 Vitest files / 76 tests, 18 Playwright E2E tests, and Next
  production build.

## Previous Verified Checkpoint: Slice D

Slice D was implemented by subagent Hooke and independently verified by the
manager before commit `51d65fb`.

Files added/changed:

- `app/(dashboard)/api-keys/page.tsx`
- `app/(dashboard)/usage/page.tsx`
- `app/(dashboard)/webhooks/page.tsx`
- `components/api-tools/ApiToolShell.tsx`
- `lib/checkout/discounts.ts`
- `lib/crm/handoff.ts`
- `tests/e2e/checkout-api-crm.spec.ts`
- shared dashboard nav usage in:
  - `app/(dashboard)/dashboard/page.tsx`
  - `app/(dashboard)/billing/page.tsx`

Shipped behavior:

- API key dashboard with metadata-only inventory, one-time plaintext guidance,
  owner/admin session requirement, and no plaintext/hash rendering.
- Usage dashboard with quota totals, entitlement buckets, service-family
  buckets, API-key attribution, billing-period totals, and recent event table.
- Webhooks dashboard with endpoint, signature verification, retry/idempotency
  states, customer-safe statuses, and no rendered secrets.
- Repeat-agent discount eligibility helper that is customer-bound and exposes no
  public coupon/code.
- Durable CRM handoff packet helper that honestly marks itself as packet-only,
  not proof of downstream sync.
- E2E coverage for `/api-keys`, `/usage`, `/webhooks`, fake checkout query
  params, and API key create/list safety.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm run test:e2e -- checkout-api-crm.spec.ts
npm run lint
npm run typecheck
npm run build
npm test -- --run
git diff --check
```

Observed results:

- Playwright Slice D E2E: 4 passed.
- Unit suite: 15 test files, 70 tests passed.
- Lint passed.
- Typecheck passed.
- Next build passed.
- `git diff --check` passed.
- Screenshot files existed and were visually inspected:
  - `test-results/dashboard-api-keys.png`
  - `test-results/dashboard-usage.png`
  - `test-results/dashboard-webhooks.png`

Safety grep run after Slice D:

```bash
rg -n -i "public coupon|fully CRM-wired|guaranteed CRM|payment=confirmed.*entitlement|session_id.*grant|query.*plan.*entitlement|local model|Ollama|llama|frontier supervision|internal prompt" \
  'app/(dashboard)' components/api-tools lib/checkout lib/crm tests/e2e/checkout-api-crm.spec.ts || true
```

It returned no forbidden public/internal claims.

## Current Blockers And Non-Blockers

Blocking production readiness:

- Live Stripe credentials and webhook secrets must be available in the runtime
  before live tier creation/readback/webhook validation can be completed.
- Supabase/Vercel production environment variables and deployment credentials
  must be loaded before production deploy verification.
- Google/Search Console or account-level external verification still requires a
  human account action where applicable.
- Final model/runtime mapping is intentionally deferred until platform gates are
  otherwise ready.

Not blocking local progress:

- Missing live credentials do not block local unit/E2E/build work.
- Missing final model choices do not block dashboard/API/customer-flow scaffolds
  if model choices remain configurable placeholders.
- Public site copy/visual planning can continue as long as it does not claim
  unverified runtime internals or live account integrations.

## Immediate Next Steps

1. Confirm clean platform checkpoint:

```bash
cd /Users/webot/Projects/webot-platform
git status --short --branch
git log --oneline -5
```

Expected latest commit: `39e9dfc feat: add deployment environment readiness gate`.

2. Run a full platform gate before starting the next slice:

```bash
npm test -- --run
npm run test:e2e -- dashboard-auth-entitlements.spec.ts dashboard-jobs-files.spec.ts checkout-api-crm.spec.ts
npm run lint
npm run typecheck
npm run build
npm run deploy:check
git diff --check
```

3. Live Stripe tier work when credentials are present:

```bash
# Exact script names may already exist in webot-platform; inspect package.json first.
npm run stripe:create-tiers -- --mode live --idempotent
npm run stripe:validate-tiers -- --mode live --open-only
```

Required acceptance:

- all nine tiers exist for Human `$10/$20/$30`, API-only `$7/$14/$21`, Both
  `$15/$30/$45`;
- live product/price IDs match the internal catalog;
- no retired/test-only products are shown as active;
- no live payment path is changed without explicit approval.

4. Public Agency/Studio service expansion:

- final family order:
  - Create & Polish
  - Gather & Extract
  - Media & Convert
  - Build & Automate
  - Growth & Market
  - Review & Decide
  - Career & Prep
  - Plan & Itinerary
- include the requested services where they fit:
  - text to MP3 audio
  - video transcription
  - photo enhancement
  - presentations and graphs
  - resume review
  - interview preparation
  - transcription
  - web development
  - SEO
  - business planning and marketing strategies
- use the lowered pricing consistently:
  - Human access: `$10`, `$20`, `$30`
  - API-only: `$7`, `$14`, `$21`
  - Both: `$15`, `$30`, `$45`
- public copy should emphasize trained, ready-to-deliver service systems and
  lower-cost focused outcomes, not internal model mechanics.

5. Premium character/visual work:

- each family needs a real-human-looking character aligned with the service
  category;
- art may be stylized/cartoon-colored but should not look AI-generated;
- characters should support category comprehension, not become silly mascots;
- use local ComfyUI/models or another approved graphics flow if needed;
- browser-test desktop and mobile layouts with screenshots before claiming done.

6. API documentation/customer docs polish:

- ensure docs cover auth, key rotation, endpoints, limits, rejects, usage,
  webhooks, files, jobs, and pricing/account choices;
- include curl examples that do not expose real secrets;
- verify OpenAPI JSON route and docs pages in browser;
- keep no-secret/no-internal-runtime wording guard active.

7. Release verification and publish:

- run full platform unit/E2E/build gates;
- run browser checks through dashboard, billing, jobs, files, API keys, usage,
  webhooks, API docs, and checkout-safe flows without submitting charges;
- capture desktop and mobile screenshots;
- only then wire/publish static public site changes through the guarded
  `webot-site` publish script;
- update `ACTIVE_STATE.md` and `.handoffs/CURRENT_STATE.md` after verified
  status changes.

## Suggested Next Subagent Slices

Use one subagent per slice unless the file ownership is provably disjoint.

### Slice F: Public Offer Taxonomy And Pricing

Owned scope:

- static public site copy and service data only;
- no backend changes.

Acceptance:

- all requested services placed into sensible families;
- prices consistent across pages;
- no internal model/runtime claims;
- local browser screenshots pass.

### Slice G: Premium Family Visuals

Owned scope:

- generated/edited image assets and CSS placement;
- no pricing/backend changes.

Acceptance:

- every family has an appropriate professional character;
- no broken assets, overlap, text occlusion, or AI-looking artifacts;
- desktop/mobile screenshots reviewed.

### Slice H: API Docs And Customer Onboarding Polish

Owned scope:

- dashboard docs pages, examples, support copy, onboarding flow.

Acceptance:

- API customer can find keys, usage, limits, rejects, webhooks, jobs, files, and
  pricing path;
- docs examples work against local routes with fixture auth;
- no secret/internal-runtime leaks.

### Slice I: Release Verification

Owned scope:

- read-only verification and report writing.

Acceptance:

- all gates run;
- screenshots attached or paths listed;
- open blockers separated from completed work;
- no claim of production readiness unless live checks passed.

## Restart Command Pack

At the start of the next session:

```bash
cd /Users/webot/Projects/webot-site
sed -n '1,260p' .handoffs/CURRENT_STATE.md
sed -n '1,220p' AGENTS.md
sed -n '1,220p' ACTIVE_STATE.md
sed -n '1,260p' .handoffs/WEBOT_PLATFORM_DELUXE_CONTINUATION_2026-06-28.md

cd /Users/webot/Projects/webot-platform
git status --short --branch
git log --oneline -12
npm test -- --run
npm run test:e2e -- dashboard-auth-entitlements.spec.ts dashboard-jobs-files.spec.ts checkout-api-crm.spec.ts
npm run lint
npm run typecheck
npm run build
npm run deploy:check
```

If these pass, continue from Slice F or live Stripe readback when credentials are
available. If they fail, fix the failing checkpoint
before opening new surface area.
