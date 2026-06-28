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
- `dfb45cb feat: add release readiness gate`
- `5b37e08 feat: add internal service routing placeholders`
- `6add59c feat: fail closed on fixture persistence`
- `7f050c5 feat: add supabase server db adapter`
- `29e1760 feat: add supabase runtime repositories`
- `1fbaf2a feat: add supabase storage upload presign`
- `4d09153 feat: add guarded release proof runner`
- `d719035 feat: add remote release smoke proof`
- Agency static site `8f748ce feat: expand agency service taxonomy`
- Studio static site `acfa672 feat: expand studio service taxonomy`

## Latest Verified Checkpoint: Slice F

Slice F public taxonomy/pricing visibility was implemented with subagent work
plus manager cleanup/verification before Agency commit `8f748ce` and Studio
commit `acfa672`.

Files changed:

- Agency: `index.html`, `llms.txt`
- Studio: `index.html`, `agent-jobs.html`, `pricing.html`, `llms.txt`

Shipped behavior:

- Public Agency homepage and assistant summary now show eight service families
  in the planned order: Create & Polish, Gather & Extract, Media & Convert,
  Build & Automate, Growth & Market, Review & Decide, Career & Prep, and Plan &
  Itinerary.
- Studio homepage, agent-jobs page, pricing page, and assistant summary now
  describe the same eight-family taxonomy.
- Requested services are represented in public copy: text to MP3 audio, video
  transcription, photo enhancement, presentations and graphs, resume review,
  interview preparation, transcription, web development, SEO, business planning,
  and marketing strategies.
- Existing live Stripe checkout URLs were preserved unchanged.
- Prepared platform account tiers are visible but explicitly gated from active
  checkout: Human `$10/$20/$30`, API-only `$7/$14/$21`, and Both `$15/$30/$45`
  require platform Stripe readback/activation before they can be sold through
  checkout.
- Public copy avoids local-model/runtime/internal implementation claims.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh

cd /Users/webot/Projects/webot-studio
git diff --check
```

Additional manager verification:

- Forbidden-term scans returned no matches for local model/runtime/internal
  claims.
- Required family/service coverage scans passed across changed Agency and Studio
  files.
- Protected Stripe URL set diff was empty for Agency and Studio.
- Direct Chrome browser validation passed for 8 page/viewport combinations:
  Agency home, Studio home, Studio agent jobs, and Studio pricing on desktop and
  mobile.
- Screenshot/report directory:
  `/Users/webot/Backups/webot-site/taxonomy-pricing-browser-validation-20260628T162141Z`
- Existing Agency/Studio local flow harness passed with screenshots:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T162548Z`

## Latest Verified Checkpoint: Slice G

Slice G premium family visuals were implemented with bounded subagent layout
work, manager-generated assets, manager correction of the Build & Automate
laptop artifact, and independent browser verification before Agency commit
`b418c8e` and Studio commit `7bd1cd5`.

Files added/changed:

- Agency:
  - `index.html`
  - `assets/families/create-polish-mara-vale.webp`
  - `assets/families/gather-extract-nolan-reed.webp`
  - `assets/families/media-convert-imani-cross.webp`
  - `assets/families/build-automate-theo-stack.webp`
  - `assets/families/growth-market-sienna-park.webp`
  - `assets/families/review-decide-victor-lane.webp`
  - `assets/families/career-prep-lena-brooks.webp`
  - `assets/families/plan-itinerary-mateo-atlas.webp`
- Studio:
  - `index.html`
  - matching `assets/families/*.webp` files

Shipped behavior:

- Every public service family now has a named professional character:
  Mara Vale, Nolan Reed, Imani Cross, Theo Stack, Sienna Park, Victor Lane, Lena
  Brooks, and Mateo Atlas.
- Agency family cards use larger 3:4 editorial portraits with visible persona
  lines under the family headings.
- Studio family cards use compact 4:3 card-media crops, widened desktop grid
  columns, visible persona lines, and preserved selectable-card behavior.
- The Build & Automate/Theo Stack asset was regenerated after review because
  the first version showed an impossible active screen on the viewer-facing
  laptop lid. The accepted version shows the outside of the laptop lid with only
  a subtle non-readable design.
- No protected Stripe URLs, payment copy, publish scripts, backend files, or API
  dashboard files were changed.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh

cd /Users/webot/Projects/webot-studio
git diff --check
```

Additional manager verification:

- Built-in image generation outputs were copied into both repos as WebP assets;
  originals remain under Codex generated image storage.
- All eight WebP assets in Agency read back as `1086x1448` and between roughly
  `40KB` and `106KB`.
- Visual contact sheet inspected:
  `/Users/webot/Backups/webot-site/slice-g-family-visuals-review-20260628T125815/family-portraits-contact-sheet.jpg`
- Targeted browser visual audit passed for Agency and Studio desktop/mobile:
  eight family images loaded, persona lines present, no horizontal overflow, and
  Studio data-persona values present.
- Browser screenshot evidence:
  `/Users/webot/Backups/webot-site/slice-g-family-visuals-browser-20260628T125815/screenshots`
- Latest itinerary/Studio flow harness passed after the visual changes:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T170659Z`
- Protected Stripe URL set diff was empty for Agency and Studio.
- Forbidden public/internal runtime scan returned no matches for local model,
  Ollama, llama, frontier supervision, internal prompt, query-entitlement, or
  public coupon language.
- Pre-asset backup:
  `/Users/webot/Backups/webot-site/slice-g-family-visuals-pre-assets-20260628T125815`

Slice G was not published live. Public publish remains Slice L after the
relevant verification gates.

## Latest Verified Checkpoint: Slice H

Slice H API docs and customer onboarding polish was implemented with bounded
subagent work, manager review, visual screenshot inspection, and a full platform
deploy gate before platform commit `cfb1f0d`.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `app/docs/api/pricing/page.tsx`
- `app/docs/api/page.tsx`
- `app/docs/api/quickstart/page.tsx`
- `app/docs/api/auth/page.tsx`
- `app/(dashboard)/docs/api/usage/page.tsx`
- `app/(dashboard)/docs/api/webhooks/page.tsx`
- `components/docs/ApiDocsLayout.tsx`
- `components/docs/api-docs.module.css`
- `tests/e2e/api-docs-public.spec.ts`
- `tests/e2e/api-docs-authenticated.spec.ts`

Shipped behavior:

- Public API docs now present a practical customer path: choose access, create a
  key, create work, attach files, and track limits.
- Added a public `/docs/api/pricing` page for the nine intended account options:
  Human `$10/$20/$30`, API-only Agent `$7/$14/$21`, and Both `$15/$30/$45`.
- Pricing docs truthfully state that live checkout is pending Stripe live
  readback while product, price, and Payment Link IDs remain
  `pending_live_readback`.
- Quickstart now covers file presign/upload contracts, job status/event polling,
  cancel/revision calls, and TypeScript client helpers for presign and job read.
- Auth and authenticated usage docs now emphasize one-time plaintext API keys,
  no real-key logging/screenshots, signed Stripe webhook entitlement source, and
  display-only checkout query parameters.
- Webhook docs now explicitly state that checkout success/cancel/session/plan
  query parameters never grant API access, dashboard access, or quota.
- Docs nav includes the new Plans page.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm run test:e2e -- api-docs-public.spec.ts api-docs-authenticated.spec.ts
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused API docs E2E passed: 7 Playwright tests.
- Full `deploy:check` passed after the docs changes: secret scan, local env
  check, db check, lint, typecheck, 16 Vitest files / 76 tests, 19 Playwright E2E
  tests, and Next production build.
- Browser screenshots were generated and visually inspected:
  - `/Users/webot/Projects/webot-platform/test-results/api-docs-public.png`
  - `/Users/webot/Projects/webot-platform/test-results/api-docs-pricing.png`
  - `/Users/webot/Projects/webot-platform/test-results/api-docs-authenticated.png`
  - `/Users/webot/Projects/webot-platform/test-results/api-docs-openapi.png`
  - `/Users/webot/Projects/webot-platform/test-results/api-docs-webhooks.png`
- Pricing screenshot initially revealed wrapped price text (`$10/m` plus `o`);
  manager fixed it with a docs `nowrap` helper and re-ran E2E and full
  `deploy:check`.
- No live publish, deploy, Stripe creation, or payment submission was run.

## Latest Verified Checkpoint: Slice I/J Release Readiness Gate

Slice I live Stripe readback is still credential-gated and not complete, but the
platform now has a machine-readable release readiness gate before platform commit
`dfb45cb`.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `.env.example`
- `docs/deployment/readiness.md`
- `docs/stripe/subscription-tier-catalog.md`
- `lib/checkout/tier-checkout.ts`
- `package.json`
- `scripts/verify-release-readiness.ts`
- `tests/deploy-env.test.ts`
- `tests/release-readiness.test.ts`
- `tests/stripe/subscription-tier-catalog.test.ts`

Shipped behavior:

- Added `npm run release:readiness`, which emits redacted JSON with `GO` or
  `NO-GO` across local env, staging env, production env, Stripe test, and Stripe
  live gates.
- The release readiness command does not call Stripe, create Stripe objects,
  deploy, or print secret values.
- The command fails closed when staging/production env files are absent,
  placeholders are present, or the Stripe key mode does not match the requested
  test/live gate.
- The report lists the exact proof commands still required for real readiness:
  staging env check, production env check, test Stripe create/readback, and live
  Stripe create/readback.
- Fixed checkout return-origin drift: `resolveTierCheckout` now defaults to
  `https://app.webot.studio`, matching the Stripe tier catalog and creation
  scripts.
- Added `WEBOT_CHECKOUT_RETURN_ORIGIN=https://app.webot.studio` to
  `.env.example` so remote env requirements are visible in the example file.
- Normalized the Stripe catalog docs so test validation uses `--open-only`,
  matching the release gate's open-check requirement.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/release-readiness.test.ts tests/stripe/subscription-tier-catalog.test.ts
npm run release:readiness # expected NO-GO without staging/production/Stripe env
npm run env:check:staging -- --env-file .env.example # expected placeholder failure
npm run deploy:check
git diff --check
```

Observed results:

- Focused release/Stripe catalog tests passed: 2 files, 8 tests.
- `npm run release:readiness` returned expected `NO-GO` with only missing
  variable names/reasons; no secret values were printed.
- Staging env check against `.env.example` failed closed on placeholders as
  expected.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 17 Vitest files / 79 tests, 19 Playwright E2E tests, and Next
  production build.

Current next work after this checkpoint:

- Slice I test/live Stripe tier readback when credentials are loaded and scripts
  have been inspected:
  - `npm run env:check:staging -- --env-file .env.staging.local`
  - `npm run env:check:production -- --env-file .env.production.local`
  - `npm run stripe:create-tiers -- --mode test --idempotent`
  - `npm run stripe:validate-tiers -- --mode test --open-only`
  - `npm run stripe:create-tiers -- --mode live --idempotent`
  - `npm run stripe:validate-tiers -- --mode live --open-only`
- Slice J/K deployment and release verification.
- Slice L guarded static publish only after relevant release gates.

## Latest Verified Checkpoint: Internal Model Placeholder Contract

Final model/provider/runtime selection is still deferred, but every public
service family and service option now has an explicit internal placeholder
contract before platform commit `5b37e08`.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `lib/runtime/service-routing.ts`
- `tests/runtime/service-routing.test.ts`
- `lib/jobs/index.ts`
- `docs/architecture/data-model.md`
- `docs/architecture/platform-architecture.md`
- `scripts/verify-release-readiness.ts`

Shipped behavior:

- Added an internal execution-routing module that maps every public catalog
  service family and service option to an execution profile placeholder.
- Each placeholder includes stable profile id, family id, covered service
  options, capability group, review requirement, `pending_model_selection`
  status, and safe handoff requirements.
- Unknown family/option pairs fail closed with `null`; there is no catch-all
  fallback.
- The mapping is intentionally code-only for now: jobs continue to persist
  public `service_family` and `service_type`, and a worker can resolve the
  profile at claim time. A durable private field should be added only if the
  selected processing layer needs immutable routing assignment or replay proof.
- `toSafeJobEvent` now sanitizes event metadata before customer-facing output.
  It preserves harmless scalar metadata such as `service_family`,
  `service_type`, and `instruction_length`, while stripping internal profile,
  capability, model-slot, runtime, vendor, prompt, queue, handoff,
  implementation, worker, and review-requirement details.
- Public catalog, OpenAPI, job, and event shapes remain free of internal
  routing/profile details.
- `scripts/verify-release-readiness.ts` was adjusted to avoid a tracked
  secret-scan false positive while preserving Stripe test/live key-mode checks.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/runtime/service-routing.test.ts tests/api/jobs-lifecycle.test.ts tests/api/openapi-schema.test.ts tests/api/rate-limit-concurrency.test.ts
npm test -- --run tests/release-readiness.test.ts tests/runtime/service-routing.test.ts
npm run secrets:check
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused runtime/API tests passed: 4 files, 19 tests.
- Release-readiness/runtime tests passed: 2 files, 6 tests.
- Secret scan passed after the release-readiness prefix construction change.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 18 Vitest files / 83 tests, 19 Playwright E2E tests, and Next
  production build.

## Latest Verified Checkpoint: Persistence Fail-Closed Safety

The platform now refuses to use fixture account/entitlement data as the default
production runtime store before platform commit `6add59c`.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `lib/db/server.ts`
- `scripts/verify-release-readiness.ts`
- `tests/db/production-db-safety.test.ts`
- `tests/release-readiness.test.ts`
- `docs/deployment/readiness.md`

Shipped behavior:

- `FixtureServerDb` remains local/test-only.
- `getServerDb()` throws in `NODE_ENV=production` unless a concrete ServerDb
  adapter has already been explicitly injected/configured.
- `npm run release:readiness` now includes `persistence.staging` and
  `persistence.production` gates. They currently fail with
  `ServerDb: production adapter not configured`.
- Deployment readiness docs now state that staging/production customer traffic
  remains blocked until runtime ServerDb/repositories are wired to
  Supabase/Postgres.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/db/production-db-safety.test.ts tests/release-readiness.test.ts tests/db/rls-auth.test.ts tests/api/auth-entitlements.test.ts
npm run release:readiness # expected NO-GO with persistence gates visible
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused persistence/auth readiness tests passed: 4 files, 17 tests.
- `npm run release:readiness` returned expected `NO-GO` with env, Stripe, and
  persistence gates visible and no secret values printed.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 19 Vitest files / 86 tests, 19 Playwright E2E tests, and Next
  production build.

## Latest Verified Checkpoint: Supabase ServerDb Adapter

The platform now has a concrete Supabase-backed `ServerDb` adapter before
platform commit `7f050c5`. This advances account/session/entitlement persistence
but does not make the whole API runtime production-ready yet.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `lib/db/server.ts`
- `lib/db/supabase.ts`
- `scripts/verify-release-readiness.ts`
- `tests/db/supabase-server-db.test.ts`
- `tests/release-readiness.test.ts`

Shipped behavior:

- `getServerDb()` now chooses `SupabaseServerDb` in production when
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
  `SUPABASE_SERVICE_ROLE_KEY` are configured.
- `SupabaseServerDb` verifies dashboard sessions through Supabase Auth
  `/auth/v1/user`, then reads `users`, `account_users`, `accounts`, and
  `entitlements` through Supabase REST with the service-role key.
- Dashboard sessions are read from Supabase cookie formats, including simple
  `sb-access-token` and common `sb-<project-ref>-auth-token` shapes. WeBot API
  `Authorization: Bearer` remains reserved for agent/API-key auth at the account
  resolver boundary.
- Release readiness now splits `serverdb.staging` / `serverdb.production` from
  `repositories.staging` / `repositories.production`. The ServerDb gates can
  pass with real Supabase env. The broader repositories still intentionally fail
  closed because API key, job, usage, file, webhook, and rate-limit production
  adapters are not wired yet.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/db/supabase-server-db.test.ts tests/db/production-db-safety.test.ts tests/release-readiness.test.ts tests/db/rls-auth.test.ts tests/api/auth-entitlements.test.ts
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused Supabase/persistence/auth readiness tests passed: 5 files, 22 tests.
- Lint passed.
- Typecheck passed.
- `git diff --check` passed.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 20 Vitest files / 91 tests, 19 Playwright E2E tests, and Next
  production build.

## Latest Verified Checkpoint: Supabase Runtime Repositories

The platform now has Supabase-backed runtime repositories, distributed
rate-limit counter state, and production Supabase Storage signed upload presign
before platform commits `29e1760` and `1fbaf2a`. This removes the previous
in-memory repository and placeholder file-upload blockers.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `lib/db/supabase-rest.ts`
- `lib/api-keys/index.ts`
- `lib/usage/ledger.ts`
- `lib/jobs/index.ts`
- `lib/files/index.ts`
- `lib/rejects/index.ts`
- `lib/rate-limit/index.ts`
- `lib/stripe/webhook-events.ts`
- `lib/entitlements/stripe-sync.ts`
- `scripts/verify-release-readiness.ts`
- `tests/db/supabase-runtime-repositories.test.ts`
- `tests/release-readiness.test.ts`
- `supabase/migrations/0008_rate_limit_counters.sql`
- `tests/api/files-rejects.test.ts`

Shipped behavior:

- Added a shared dependency-free `SupabaseRestClient` for service-role REST/RPC
  access with explicit `app_public` / `app_private` schema profile headers.
- API key storage, verification, revocation, and last-used updates now have a
  Supabase `app_private.api_keys` adapter.
- Usage ledger, jobs/events, file metadata, rejects, rate-limit audit events,
  Stripe webhook events, and Stripe entitlement sync now have Supabase adapters.
- Job persistence handles API-key-created jobs without attempting to store the
  synthetic `api_key:<id>` service user in the UUID `created_by_user_id` column.
- Added private `app_private.rate_limit_counters` plus atomic
  `app_private.consume_rate_limit_counter(...)` RPC for distributed rate-limit
  decisions.
- `checkRateLimit` now uses a pluggable counter store: local/tests use memory;
  configured Supabase runtimes use the private RPC.
- `npm run release:readiness` now lets `repositories.*` and `runtime-limits.*`
  pass when Supabase env is present. In the current shell it remains NO-GO
  because staging/production env and Stripe values are absent.
- Supabase Storage signed upload URLs are returned when `FILE_STORAGE_BUCKET`
  plus Supabase runtime env are configured.
- Placeholder upload URLs remain local/test-only, and production fails closed
  if file upload storage is not configured.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/db/supabase-runtime-repositories.test.ts tests/release-readiness.test.ts tests/api/rate-limit-concurrency.test.ts
npm test -- --run tests/api/files-rejects.test.ts
npm run test:e2e -- dashboard-jobs-files.spec.ts
npm run lint
npm run typecheck
npm run release:readiness # expected NO-GO without env/Stripe values
npm run deploy:check
git diff --check
```

Observed results:

- Focused runtime repository/readiness tests passed: 3 files, 11 tests.
- Focused file/Supabase Storage tests passed: 1 file, 5 tests.
- Dashboard jobs/files Playwright spec passed: 3 tests.
- Lint passed.
- Typecheck passed.
- `git diff --check` passed.
- `npm run release:readiness` returned expected redacted NO-GO for missing
  staging/production env and Stripe keys.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 21 Vitest files / 96 tests, 19 Playwright E2E tests, and Next
  production build.

## Latest Verified Checkpoint: Guarded Release Proof Runner

The platform now has a single guarded proof runner before platform commit
`4d09153`. This does not replace live credentials or deployment proof; it makes
the proof path repeatable once env files and Stripe keys are available.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `scripts/verify-release-proof.ts`
- `tests/release-proof.test.ts`
- `package.json`
- `docs/deployment/readiness.md`

Shipped behavior:

- Added `npm run release:proof`.
- `npm run release:proof -- --dry-run` prints the target proof sequence without
  running env, deploy, or Stripe commands.
- Staging proof defaults to test-mode Stripe validation:
  `npm run release:proof -- --target staging --env-file .env.staging.local`.
- Production proof validates live Stripe objects with `--open-only` unless
  `--include-stripe-create` is supplied.
- Production live Stripe creation refuses to run unless
  `--confirm-live-stripe` is also supplied.
- The runner loads the target env file for Stripe commands and scrubs loaded env
  values from captured stdout/stderr previews.
- Deployment readiness docs now describe the current Supabase repository,
  runtime-limit, and Storage presign state instead of stale fixture-storage
  blockers.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/release-proof.test.ts tests/release-readiness.test.ts
npm run release:proof -- --dry-run
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused release proof/readiness tests passed: 2 files, 6 tests.
- Dry-run proof passed and printed redacted JSON.
- Lint passed.
- Typecheck passed.
- `git diff --check` passed.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 22 Vitest files / 99 tests, 19 Playwright E2E tests, and Next
  production build.

## Latest Verified Checkpoint: Remote Release Smoke Proof

The guarded proof runner now includes a remote no-charge API/browser smoke
before platform commit `d719035`. This does not run against live URLs until
real env files are present.

Files added/changed in `/Users/webot/Projects/webot-platform`:

- `scripts/verify-remote-release-smoke.ts`
- `scripts/verify-release-proof.ts`
- `tests/release-proof.test.ts`
- `package.json`
- `docs/deployment/readiness.md`

Shipped behavior:

- Added `npm run release:remote-smoke`.
- Remote smoke loads an env file, verifies `NEXT_PUBLIC_API_URL/api/health`,
  opens public `NEXT_PUBLIC_APP_URL` pages in Chromium, checks horizontal
  overflow and obvious secret text, and captures screenshots.
- `release:proof` now runs remote smoke after local `deploy:check` and before
  Stripe validation.
- Dry-run mode works without env files and prints planned URLs without secrets.

Manager verification run:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run tests/release-proof.test.ts
npm run release:remote-smoke -- --dry-run
npm run release:proof -- --dry-run
npm run lint
npm run typecheck
npm run deploy:check
git diff --check
```

Observed results:

- Focused release proof test passed: 1 file, 4 tests.
- Remote smoke dry-run passed.
- Release proof dry-run passed and included remote smoke.
- Lint passed.
- Typecheck passed.
- `git diff --check` passed.
- Full `deploy:check` passed: secret scan, local env check, db check, lint,
  typecheck, 22 Vitest files / 100 tests, 19 Playwright E2E tests, and Next
  production build.

## Previous Verified Checkpoint: Slice E

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

Expected latest platform commit: `d719035 feat: add remote release smoke proof`.
Expected Agency commit: `b418c8e feat: add family character visuals`.
Expected Studio commit: `7bd1cd5 feat: add family character visuals`.

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

3. Continue with live env/Stripe/deploy proof when credentials are present:

```bash
# After staging/production env is loaded:
npm run release:readiness
npm run release:proof -- --target staging --env-file .env.staging.local
npm run stripe:create-tiers -- --mode live --idempotent
npm run stripe:validate-tiers -- --mode live --open-only
```

Required acceptance:

- all nine tiers exist for Human `$10/$20/$30`, API-only `$7/$14/$21`, Both
  `$15/$30/$45`;
- live product/price IDs match the internal catalog;
- no retired/test-only products are shown as active;
- no live payment path is changed without explicit approval.

4. Premium character/visual work:

- completed locally in Slice G for Agency commit `b418c8e` and Studio commit
  `7bd1cd5`;
- do not redo this slice unless new visual defects are discovered or Ian asks
  for a new art direction;
- live publish is still gated by Slice L.

5. API documentation/customer docs polish:

- completed locally in Slice H for platform commit `cfb1f0d`;
- do not redo unless new endpoint behavior changes the docs;
- keep no-secret/no-internal-runtime wording guard active during future edits.

6. Release verification and publish:

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

### Slice G: Premium Family Visuals

Owned scope:

- generated/edited image assets and CSS placement;
- no pricing/backend changes.

Acceptance:

- every family has an appropriate professional character;
- no broken assets, overlap, text occlusion, or AI-looking artifacts;
- desktop/mobile screenshots reviewed.

Status: completed locally and committed as Agency `b418c8e` plus Studio
`7bd1cd5`. Not yet published live.

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

If these pass, continue from live Stripe readback and deployment verification.
If they fail, fix the failing checkpoint before opening new surface area.

## Detailed No-Stop Execution Plan

This section is the handoff for continuing without getting trapped in another
long-session wait loop. The manager should treat this as the current execution
contract unless Ian changes priorities.

### Current Ground Truth

- `webot-platform` is the functional backend/dashboard/API repo. It is the only
  place where authenticated accounts, API keys, usage, jobs, files, webhooks,
  entitlements, deployment gates, and dashboard features should be implemented.
- `webot-site` remains a static public Agency site. It can present the offer,
  keep docs/handoffs, and run the guarded publish script, but it must not become
  the backend.
- `webot-studio` remains the public Studio surface. Public copy should stay
  truthful and must not imply live dashboard/payment behavior that has not been
  verified.
- Existing real-money Stripe checkout links are protected. New nine-tier
  platform pricing can be displayed as prepared/gated until the live Stripe
  tier readback and entitlement mapping are verified.
- Public copy must not mention local models, internal prompts, runtime details,
  queue internals, or frontier/local supervision concepts.

### Remaining Work Slices

#### Slice G: Premium Family Characters And Visual Placement

Status: completed locally on 2026-06-28. Helmholtz completed the visual spec,
Anscombe implemented the bounded markup/CSS integration, and the manager
generated/accepted the assets after correcting the Build & Automate laptop lid.

Completed manager responsibilities:

- created and imported the final eight assets;
- placed assets in Agency and Studio service-family cards;
- preserved card functionality, pricing copy, CTA behavior, protected Stripe
  URLs, and Studio selectable-card behavior;
- independently inspected screenshots before committing.

Subagent responsibilities used:

- visual direction and QA can be delegated;
- implementation may be delegated only if file ownership is constrained to
  public visual files and no pricing/backend files are touched;
- no subagent may publish.

Character system from Helmholtz:

| Family | Character | Role | Asset |
| --- | --- | --- | --- |
| Create & Polish | Mara Vale | Editorial Finisher | `assets/families/create-polish-mara-vale.webp` |
| Gather & Extract | Nolan Reed | Research Operations Analyst | `assets/families/gather-extract-nolan-reed.webp` |
| Media & Convert | Imani Cross | Media Production Lead | `assets/families/media-convert-imani-cross.webp` |
| Build & Automate | Theo Stack | Systems Builder | `assets/families/build-automate-theo-stack.webp` |
| Growth & Market | Sienna Park | Growth Strategist | `assets/families/growth-market-sienna-park.webp` |
| Review & Decide | Victor Lane | Decision Editor | `assets/families/review-decide-victor-lane.webp` |
| Career & Prep | Lena Brooks | Career Coach | `assets/families/career-prep-lena-brooks.webp` |
| Plan & Itinerary | Mateo Atlas | Itinerary Planner | `assets/families/plan-itinerary-mateo-atlas.webp` |

Visual acceptance:

- one premium, real-human-looking 3:4 portrait per family;
- no logos, watermarks, readable fake text, mascot treatment, warped hands,
  distorted faces, or obvious AI artifacts;
- assets look coherent as one WeBot editorial system but distinct by role;
- mobile layout at 390px has no horizontal overflow or text/image overlap;
- desktop cards retain a premium operational feel and do not become tall,
  cluttered, or hard to scan.

Verification before committing:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh

cd /Users/webot/Projects/webot-studio
git diff --check
```

Browser verification before accepting:

- Agency homepage desktop and mobile screenshots;
- Studio homepage desktop and mobile screenshots;
- Studio `agent-jobs.html` and `pricing.html` screenshots if those pages receive
  visual placement changes;
- asset load assertions for all eight family images;
- protected Stripe URL diff is empty for both repos.

#### Slice H: API Docs And Customer Onboarding Polish

Status: local platform implementation exists, but this still needs a final
product-readiness pass.

Manager responsibilities:

- inspect current API docs, dashboard docs, pricing/onboarding, usage, limits,
  rejects, webhooks, files, jobs, and API key flows;
- assign bounded docs/UI fixes to a subagent in `webot-platform`;
- rerun tests and browser screenshots independently.

Subagent owned scope:

- `webot-platform` docs pages and customer-facing dashboard onboarding copy;
- tests for docs/onboarding where useful;
- no public static-site changes unless assigned separately.

Acceptance:

- an API-only agent customer can understand how to buy, create a key, call the
  API, track usage, interpret rejects, handle limits, receive webhooks, and view
  jobs/files;
- examples use placeholder secrets only;
- OpenAPI route and docs pages agree;
- no internal runtime details leak.

Verification:

```bash
cd /Users/webot/Projects/webot-platform
npm test -- --run
npm run test:e2e -- checkout-api-crm.spec.ts
npm run lint
npm run typecheck
npm run build
```

Browser screenshots required:

- public API docs;
- authenticated API docs;
- API key page;
- usage page;
- webhook docs/page;
- dashboard billing/plan page.

#### Slice I: Live Stripe Tier Readback And Entitlement Gate

Status: blocked only by availability of live/test credentials in the runtime;
not blocked by code structure.

Manager responsibilities:

- inspect existing Stripe scripts before running them;
- run test-mode creation/readback first if credentials are loaded;
- run live creation/readback only when explicitly safe and credentials are
  available;
- never submit a payment or replace protected existing links without explicit
  approval.

Required catalog:

- Human Basic/Mid/Top: `$10`, `$20`, `$30`;
- API-only Agent Basic/Mid/Top: `$7`, `$14`, `$21`;
- Both Basic/Mid/Top: `$15`, `$30`, `$45`.

Expected commands after inspecting `package.json`:

```bash
cd /Users/webot/Projects/webot-platform
npm run stripe:create-tiers -- --mode test --idempotent
npm run stripe:validate-tiers -- --mode test --open-only
npm run stripe:create-tiers -- --mode live --idempotent
npm run stripe:validate-tiers -- --mode live --open-only
```

Acceptance:

- all nine product/price/payment paths exist and read back with exact amounts;
- metadata maps cleanly to backend entitlements;
- success/cancel URLs point to the platform account flow;
- entitlement changes come only from signed Stripe webhook state;
- query parameters such as `payment=confirmed`, `session_id`, `plan`, or
  `entitled=true` cannot grant access.

#### Slice J: Deployment/Environment And Platform Release Gate

Status: local deploy gate exists and passed as of commit `39e9dfc`; production
deployment still needs runtime environment verification.

Manager responsibilities:

- run the existing deploy gate;
- validate environment targets with real environment files or platform runtime;
- deploy only after all local gates pass;
- capture evidence before claiming readiness.

Verification:

```bash
cd /Users/webot/Projects/webot-platform
npm run env:check -- --target local
npm run env:check:staging
npm run env:check:production
npm run secrets:check
npm run deploy:check
```

Acceptance:

- no placeholder production/staging secrets;
- no localhost production URLs;
- no test Stripe keys in production mode;
- CI/build/test gates pass;
- dashboard/API app can be opened and browser-tested.

#### Slice K: Full Browser/Payment-Safe Release Verification

Status: final release slice. Use a read-only verification subagent if useful,
but the manager must personally inspect the evidence.

Required evidence:

- Agency desktop/mobile screenshots;
- Studio desktop/mobile screenshots;
- platform dashboard screenshots for dashboard, billing, jobs, files, API keys,
  usage, webhooks, and API docs;
- checkout-safe screenshots proving hosted checkout opens to expected products
  and amounts without entering payment details;
- protected Stripe link snapshots before/after;
- security test results for webhook signature failure, rate limits, API key
  secrecy, fake entitlement querystrings, account scoping, and safe rejects.

Acceptance:

- public pages, dashboard, API docs, checkout-safe flow, and backend tests pass;
- screenshots have been visually inspected for overlap, broken images, cropped
  controls, unreadable text, and wrong pricing;
- no unapproved protected payment link drift;
- no claim of live production readiness if credentials/deploy/readback are not
  actually verified.

#### Slice L: Publish Static Public Surfaces

Status: last step after Slice G visuals and all relevant release gates pass.

Manager responsibilities:

- run the guarded Agency publish script only from `webot-site`;
- publish Studio through its established flow only after its local verification
  passes;
- update handoffs after live state changes.

Agency publish commands:

```bash
cd /Users/webot/Projects/webot-site
scripts/publish-live.sh --dry-run
scripts/publish-live.sh --confirm-live
```

Acceptance:

- publish script backs up live pages;
- live `index.html` matches local `HEAD`;
- desktop/mobile post-publish screenshots exist;
- `ACTIVE_STATE.md` and `.handoffs/CURRENT_STATE.md` are updated with the
  verified live state.

### Subagent Management Rules For The Next Session

- Use one subagent per bounded slice or audit lane.
- Assign exact repo and file ownership.
- Tell every subagent not to revert unrelated edits.
- Do not let a subagent publish, touch secrets, change protected Stripe links,
  or broaden scope without manager approval.
- If `wait_agent` stalls, inspect the repo directly and continue from verified
  files. Do not wait indefinitely.
- A subagent summary is never acceptance by itself; the manager must rerun the
  critical checks and inspect screenshots.

Suggested next subagent prompt:

```text
Repo: /Users/webot/Projects/webot-site and /Users/webot/Projects/webot-studio
You are not alone in the codebase. Do not revert unrelated edits.

Slice: Slice G visual implementation review, not publish.

Owned scope:
- public visual family placement in index/service cards;
- asset QA notes for assets/families/*.webp;
- CSS suggestions that preserve mobile and desktop layout.

Do not touch:
- Stripe URLs or checkout copy;
- backend/API/dashboard files;
- publish scripts;
- unrelated pages.

Acceptance checks:
- all eight family assets load;
- family headings and CTAs remain visible;
- no horizontal overflow at 390px;
- desktop and mobile screenshots are visually clean;
- protected Stripe URL diff stays empty.

Required final report:
- changed files or reviewed files;
- screenshots/artifacts checked;
- layout or asset concerns;
- exact commands run.
```

### Practical Resume Order

1. Re-run `git status --short --branch` in all three repos.
2. If any repo is dirty, inspect whether the changes are from the current work;
   do not revert user or subagent edits blindly.
3. Move to Slice I only when Stripe credentials are loaded and the manager has
   inspected the scripts.
4. Run Slice J/K release verification.
5. Publish only after the relevant gates pass and Ian has not introduced a new
   approval requirement.

## 2026-06-28 Continuation Checkpoint: Supabase Runtime Copy Alignment

Status: complete locally, not deployed live.

- Platform commit: `3992b04` (`docs: align release copy with supabase runtime`)
- Purpose: remove stale release/dashboard/docs language after Supabase
  `ServerDb`, runtime repositories, private atomic rate-limit counters, and
  Supabase Storage upload presign landed.
- Updated files:
  - `app/(dashboard)/dashboard/page.tsx`
  - `components/files/FileList.tsx`
  - `tests/e2e/dashboard-jobs-files.spec.ts`
  - `docs/api/v1-contract.md`
  - `docs/architecture/bootstrap-deployment-contract.md`
  - `docs/architecture/data-model.md`
  - `docs/architecture/domain-map.md`
  - `docs/architecture/platform-architecture.md`
  - `docs/security/owasp-api-top-10-review.md`
  - `docs/security/threat-model.md`
  - `scripts/verify-remote-release-smoke.ts`
- Preserved truth:
  - `pending_live_readback` remains in Stripe catalog/docs/tests until live
    Stripe create/validate readback supplies real IDs.
  - No live deploy, live Stripe creation, payment submission, DNS change, or
    credential-backed release proof was run.
- Verification:
  - `npm run test:e2e -- dashboard-auth-entitlements.spec.ts dashboard-jobs-files.spec.ts` passed: 7 Playwright tests.
  - `npm run secrets:check` passed.
  - `npm test -- --run tests/release-proof.test.ts` passed: 4 tests.
  - `npm run release:remote-smoke -- --dry-run` passed and printed no secret values.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 22 Vitest files / 100 tests, 19 Playwright E2E tests, and Next
    build.

## 2026-06-28 Continuation Checkpoint: File Cleanup And API Key UI

Status: complete locally, not deployed live.

- Platform commit: `a8ef932` (`feat: add file retention cleanup and key creation UI`)
- Closed local production gaps:
  - file retention now has a server-side cleanup library and maintenance runner;
  - `deploy:check` includes `npm run files:cleanup -- --dry-run`;
  - dashboard owners/admins can create API keys from `/api-keys`;
  - plaintext API key values are shown once after browser creation and are not
    rendered in metadata inventory.
- Updated files include:
  - `lib/files/index.ts`
  - `scripts/cleanup-expired-files.mjs`
  - `components/api-tools/ApiKeyCreateForm.tsx`
  - `app/(dashboard)/api-keys/page.tsx`
  - `components/dashboard/dashboard.module.css`
  - `tests/api/files-rejects.test.ts`
  - `tests/files-cleanup-script.test.ts`
  - `tests/e2e/checkout-api-crm.spec.ts`
  - `README.md`
  - `docs/deployment/readiness.md`
- Preserved truth:
  - no live deploy, payment submission, DNS change, live Stripe creation, or
    credential-backed release proof was run;
  - `pending_live_readback` remains until Stripe live/test catalog readback is
    performed with credentials.
- Verification:
  - `npm test -- --run tests/api/files-rejects.test.ts tests/api/openapi-schema.test.ts tests/files-cleanup-script.test.ts` passed: 14 tests.
  - `npm run test:e2e -- checkout-api-crm.spec.ts` passed: 4 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 23 Vitest files / 105 tests, 19 Playwright E2E tests, cleanup
    dry-run, and Next build.

## 2026-06-28 Continuation Checkpoint: Account-Scoped Job Listing

Status: complete locally, not deployed live.

- Platform commit: `5b3a352` (`feat: add account scoped job listing`)
- Closed a practical agent/API customer gap:
  - `GET /api/v1/jobs` now lists current-account jobs;
  - agents can filter by `status`, `service_family`, `created_after`,
    `created_before`, `cursor`, and `limit`;
  - responses use existing safe job DTOs only and include opaque
    `pagination.next_cursor`;
  - invalid filters return the existing customer-safe `invalid_request` shape.
- Runtime coverage:
  - `InMemoryJobRepository.listJobsForAccount` supports local/test listing;
  - `SupabaseJobRepository.listJobsForAccount` uses account-scoped service-role
    REST queries, stable newest-first ordering, limit+1 pagination, and app-side
    cursor filtering;
  - route responses are `Cache-Control: no-store`.
- Docs/customer surface:
  - public `/docs/api` endpoint table now includes `GET /api/v1/jobs`;
  - `/docs/api/quickstart` includes list-job cURL and TypeScript client shape;
  - `docs/api/examples.md` includes list-job examples;
  - OpenAPI generation includes `JobListResponse` and list query parameters.
- Preserved truth:
  - no live deploy, payment submission, DNS change, live Stripe creation, or
    credential-backed release proof was run;
  - release readiness remains `NO-GO` until staging/production env, Supabase
    runtime env, Vercel env, and Stripe test/live credentials are loaded and the
    required proof commands run.
- Verification:
  - `npm test -- --run tests/api/jobs-lifecycle.test.ts tests/api/openapi-schema.test.ts tests/db/supabase-runtime-repositories.test.ts` passed: 3 files / 17 tests.
  - `npm run test:e2e -- api-docs-public.spec.ts` passed: 5 Playwright tests and refreshed API-doc screenshots.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 23 Vitest files / 107 tests, 19 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected `NO-GO` and printed no secret
    values.

## 2026-06-28 Continuation Checkpoint: Account-Bound Stripe Checkout Sessions

Status: complete locally, not deployed live.

- Platform commit: `cfbf016` (`feat: add account-bound stripe checkout sessions`)
- Closed a real monetization gap:
  - `POST /api/checkout/tier` now creates Stripe Checkout Sessions from the
    dashboard instead of relying on static Payment Link readback alone;
  - checkout requires a Supabase dashboard session plus owner/admin membership;
  - API key callers are rejected from checkout starts;
  - Stripe readback must be loaded before checkout can start, so placeholder
    price IDs cannot create customer sessions;
  - checkout metadata includes account ID, catalog version, lookup key, and
    entitlement code;
  - `checkout.session.completed` binds the Stripe customer ID to the WeBot
    account before signed subscription events apply entitlements.
- Customer/dashboard/docs surface:
  - billing lists all nine tiers and shows checkout buttons disabled until
    readback is loaded;
  - `/docs/api`, OpenAPI, webhook docs, deployment readiness docs, and Stripe
    catalog docs include the checkout/readback/account-binding path;
  - `.env.example` exposes blank `WEBOT_STRIPE_TIER_READBACK_JSON` and
    `WEBOT_STRIPE_TIER_READBACK_FILE` variables.
- Release readiness:
  - `npm run release:readiness` now includes `stripe-readback.test` and
    `stripe-readback.live` gates;
  - the current shell correctly reports `NO-GO` because staging/production env,
    Stripe credentials, and verified Stripe readback artifacts are missing.
- Preserved truth:
  - no live deploy, payment submission, DNS change, live Stripe creation, or
    credential-backed release proof was run;
  - real checkout stays unavailable until test/live Stripe tier readback artifacts
    are created/validated and loaded into the deployment environment.
- Verification:
  - `npm test -- --run tests/release-readiness.test.ts tests/api/checkout-tier.test.ts tests/api/stripe-webhook-signature.test.ts tests/api/openapi-schema.test.ts tests/stripe/subscription-tier-catalog.test.ts` passed: 5 files / 22 tests.
  - `npm run test:e2e -- api-docs-public.spec.ts dashboard-auth-entitlements.spec.ts` passed: 9 Playwright tests.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 24 Vitest files / 112 tests, 19 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` and printed
    no secret values.

## 2026-06-28 Continuation Checkpoint: Dashboard Auth Entry Flow

Status: complete locally, not deployed live.

- Platform commit: `659a54a` (`feat: add dashboard auth entry flow`)
- Closed the customer account access gap:
  - `/login` now gives customers a real account sign-in/sign-up entry page;
  - `POST /auth/session` uses Supabase Auth password sign-in/sign-up;
  - sign-up bootstraps the WeBot `app_public.users`, `accounts`, and
    `account_users` owner membership rows through the service-role REST client;
  - Supabase access/refresh tokens are stored only in HTTP-only, same-site
    cookies;
  - `/auth/signout` clears the dashboard session cookies;
  - dashboard and billing unauthenticated boundaries now link to `/login`;
  - authenticated dashboard nav exposes a server POST sign-out button.
- Security/truth preserved:
  - missing Supabase auth configuration maps to the explicit
    `auth_not_configured` customer error;
  - API bearer keys remain separate from dashboard sessions;
  - query parameters still never create paid access or entitlement state;
  - no live deploy, payment submission, DNS change, live Stripe creation, or
    credential-backed release proof was run.
- Browser/UI proof:
  - Playwright captured `/login` desktop screenshot at
    `/Users/webot/Projects/webot-platform/test-results/login-page.png`;
  - manager captured `/login` mobile screenshot at
    `/Users/webot/Projects/webot-platform/test-results/login-page-mobile.png`;
  - mobile overflow proof returned `clientWidth=390`, `scrollWidth=390`.
- Verification:
  - `npm test -- --run tests/auth-session.test.ts tests/api/auth-entitlements.test.ts` passed: 2 files / 9 tests.
  - `npm run test:e2e -- dashboard-auth-entitlements.spec.ts` passed: 5 Playwright tests.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 25 Vitest files / 116 tests, 20 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because
    staging/production env, Supabase runtime env, Stripe credentials, and
    Stripe readback JSON are not loaded in this shell; it printed no secret
    values.

## 2026-06-28 Continuation Checkpoint: Billing Checkout Return Pages

Status: complete locally, not deployed live.

- Platform commit: `63279ba` (`feat: add billing checkout return pages`)
- Closed the Stripe return-route gap:
  - `/billing/success` now renders after Stripe browser return;
  - `/billing/cancel` now renders when checkout is abandoned;
  - both pages explain that return query parameters are display-only and never
    grant account access;
  - success hides the raw `session_id` while still indicating a session marker
    was present;
  - both pages link customers back to billing, dashboard, and plan details.
- Browser/UI proof:
  - Playwright captured success return screenshot at
    `/Users/webot/Projects/webot-platform/test-results/billing-success-return.png`;
  - Playwright captured cancel return screenshot at
    `/Users/webot/Projects/webot-platform/test-results/billing-cancel-return.png`;
  - return-page E2E asserts no horizontal overflow and no internal runtime terms.
- Verification:
  - `npm run test:e2e -- dashboard-auth-entitlements.spec.ts` passed: 6 Playwright tests.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 25 Vitest files / 116 tests, 21 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - Build route list now includes `/billing/success` and `/billing/cancel`.
  - `npm run release:readiness` returned expected redacted `NO-GO` with no
    secret values printed.
