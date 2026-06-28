---
project: webot-site (webot.agency main agency website)
last_updated: 2026-06-28
status: LIVE on webot.agency and webot.studio; deluxe SEO, dashboard path, itinerary flow, local agent approval flow, paid-ads pack, and project agent guide published/script-validated
last_master_session_review: 2026-05-08 (Claude master orchestration session)
authoritative_branch: master
live_url: https://webot.agency
deployment: GitHub Pages from TheRefreshCNFT/webot-site (master branch)
---

# webot.agency — Current State (Master Orchestrator Navigator)

**Read this FIRST when picking up this project in any new session.**

## What this is

The main agency website for **WeBot Agency** (subsidiary of F5 Products LLC). Pure static HTML/CSS/JS — no build tools, no frameworks, no `package.json`. Single-page landing + a few sub-pages, deployed via **GitHub Pages**.

Tagline: *"We Bot You."* Brand voice: direct, confident, no-BS, anti-hype, "we ship not demo."

## Verified state (2026-06-28 live validation)

```
✅ Local repo:    ~/Projects/webot-site
✅ Branch:        master (confirmed by GitHub Pages API on 2026-06-27)
✅ Remote:        https://github.com/TheRefreshCNFT/webot-site.git
✅ Live URL:      https://webot.agency (CNAME-mapped)
✅ Deployment:    GitHub Pages from master /
✅ Working tree:  clean after latest deluxe SEO publish/verification
✅ Last user-facing site publish:  webot-site `5323f17`; webot-studio `62e68d2`
✅ Latest docs-only publish: paid ads launch pack + root `AGENTS.md` project guide
✅ Previous base: 62236e6 "feat: add robots.txt and sitemap.xml for SEO"
```

See `.handoffs/CORRECTIONS_2026-06-27.md` for branch/deploy evidence, live checks, screenshots, Studio dirty-tree notes, and code-intelligence limitations.

## Latest deluxe SEO publish (2026-06-28)

Deluxe SEO work is live on both `webot.agency` and `webot.studio`.

- Agency commits:
  - `83aba93` (`feat: add deluxe seo surfaces`)
  - `9cefae3` (`fix: remove unverified linkedin seo signal`)
  - `6a183e1` (`fix: tighten seo landing mobile layout`)
  - `5323f17` (`fix: polish agency mobile hero layout`)
- Studio commits:
  - `fb42f99` (`feat: add deluxe seo surfaces`)
  - `0ac4808` (`fix: remove unverified linkedin seo signal`)
  - `62e68d2` (`fix: tighten seo landing mobile layout`)
- Agency added crawlable offer pages:
  - `plan-itinerary.html`
  - `document-extraction.html`
  - `create-polish.html`
  - `code-automation.html`
  - `research-decisions.html`
  - `terms.html`
- Studio added crawlable offer pages:
  - `agent-jobs.html`
  - `pricing.html`
- SEO surfaces updated:
  - page-specific titles/descriptions/canonicals/OG/Twitter metadata
  - Organization/WebSite/WebPage/Service JSON-LD as appropriate
  - social preview images at `assets/og-webot-agency.png` and `assets/og-webot-studio.png`
  - `robots.txt`, `sitemap.xml`, `llms.txt`
  - Search Console runbook: `docs/GOOGLE-SEARCH-CONSOLE.md`
- Local SEO audit agent reports:
  - Before: Agency `68/100`, Studio `74/100`
  - After: Agency `81/100`, Studio `80/100`
  - Reports: `/Users/webot/Backups/webot-site/seo-agent-audit-20260628T103817Z/`
- Human-style browser validation:
  - Live itinerary/Studio flow passed: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T104633Z`
  - Desktop/mobile SEO screenshots and assertions passed: `/Users/webot/Backups/webot-site/deluxe-seo-browser-screenshots-20260628T104431Z`
  - Checked: canonical, meta description, JSON-LD, single H1, and zero horizontal overflow on the new Agency/Studio SEO pages.
- Latest Agency publish:
  - `scripts/publish-live.sh --dry-run` passed
  - `scripts/publish-live.sh --confirm-live` passed
  - backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T104431Z`
  - post-publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T104431Z/screenshots`
- Remaining audit caveats:
  - Security-header score requires CDN/proxy/hosting-header work; GitHub Pages cannot set these from repo files.
  - PageSpeed/Core Web Vitals score was incomplete because Google's PageSpeed API was rate-limited or lacked an API key.
  - No Wikipedia/Wikidata/LinkedIn sameAs was added because no verified entity profiles were available; do not fake these.
  - Google Search Console still needs account-level verification/submission by a human.

## Latest planning state (2026-06-28 monetization/API expansion)

Ian requested a product-ready expansion that sells WeBot services to humans and agents via API, adds more services/families, lowers pricing, introduces API-only/human/both tiers, prepares real dashboard/API/Stripe entitlement flows, adds premium service-family characters, and defers final model choices until the platform is otherwise ready.

GSD planning scaffold now lives under `.planning/`:

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `.planning/phases/01-offer-taxonomy-and-pricing/PLAN.md`
- `.planning/phases/02-platform-architecture-security/PLAN.md`
- `.planning/phases/03-backend-entitlements-api/PLAN.md` plus subplans `03-01` through `03-08`
- `.planning/phases/04-dashboard-checkout-crm/PLAN.md`
- `.planning/phases/04-dashboard-checkout-crm/04-01-stripe-production-tiers-PLAN.md`
- `.planning/phases/05-public-site-studio-visuals/PLAN.md`
- `.planning/phases/06-model-runtime-evaluation/PLAN.md`
- `.planning/phases/07-release-verification/PLAN.md`

Planning decisions:

- Keep `webot-site` static; backend/API work belongs in a new `../webot-platform` or `../webot-api` service.
- Add/plan final families in this order: Create & Polish, Gather & Extract, Media & Convert, Build & Automate, Growth & Market, Review & Decide, Career & Prep, Plan & Itinerary.
- New public pricing target: Human `$10/$20/$30`, API-only `$7/$14/$21`, Both `$15/$30/$45`.
- Real production readiness requires creating/wiring the nine Stripe subscription tiers, authenticated dashboard, API keys, usage ledger, limits, rejects, jobs, files, webhook-backed entitlements, and browser-tested API docs.
- Existing Agency Office bundle links and current Studio real-money links remain protected until intentionally migrated.
- Public copy must not mention local models, frontier supervision, internal prompts/tools, queue internals, or runtime implementation details.
- Phase 06 model/runtime selection is intentionally deferred until platform/API/queue/eval gates exist.

## Latest monetization/API implementation checkpoint (2026-06-28 Slice G)

Premium family visuals are locally implemented and verified, but not live
published yet.

- Agency commit: `b418c8e` (`feat: add family character visuals`)
- Studio commit: `7bd1cd5` (`feat: add family character visuals`)
- Added eight named professional character portraits under `assets/families/`
  in both repos: Mara Vale, Nolan Reed, Imani Cross, Theo Stack, Sienna Park,
  Victor Lane, Lena Brooks, and Mateo Atlas.
- The Build & Automate/Theo Stack image was regenerated after review so the
  viewer-facing laptop surface is a proper exterior lid, not an impossible
  active screen.
- Visual/browser evidence:
  `/Users/webot/Backups/webot-site/slice-g-family-visuals-browser-20260628T125815/screenshots`
- Contact sheet:
  `/Users/webot/Backups/webot-site/slice-g-family-visuals-review-20260628T125815/family-portraits-contact-sheet.jpg`
- Latest local Agency/Studio flow validation:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T170659Z`
- Protected Stripe URL diffs were empty for Agency and Studio.
- No publish was run for this checkpoint; use the guarded publish flow only
  after the remaining release gates.

## Latest platform API docs checkpoint (2026-06-28 Slice H)

API docs and customer onboarding polish are locally implemented and verified in
`webot-platform`, but not deployed live yet.

- Platform commit: `cfb1f0d` (`feat: polish api customer docs`)
- Added `/docs/api/pricing` for the nine intended account choices: Human
  `$10/$20/$30`, API-only Agent `$7/$14/$21`, and Both `$15/$30/$45`.
- Public docs now describe the practical path for agent customers: choose access,
  create a key, create a job, attach files through presign, track status/events,
  read usage, and interpret rejects/limits/webhooks.
- Docs remain truthful that live checkout is pending Stripe live readback while
  IDs are `pending_live_readback`; entitlement source remains signed Stripe
  webhook state only.
- Latest platform `deploy:check` passed after this slice: secret scan, env local,
  db check, lint, typecheck, 76 Vitest tests, 19 Playwright E2E tests, and build.
- API docs screenshots generated/inspected in:
  `/Users/webot/Projects/webot-platform/test-results/api-docs-public.png`
  `/Users/webot/Projects/webot-platform/test-results/api-docs-pricing.png`
  `/Users/webot/Projects/webot-platform/test-results/api-docs-authenticated.png`
  `/Users/webot/Projects/webot-platform/test-results/api-docs-openapi.png`
  `/Users/webot/Projects/webot-platform/test-results/api-docs-webhooks.png`
- No live deploy, Stripe tier creation, or payment submission was run.

## Latest platform release-readiness checkpoint (2026-06-28 Slice I/J gate)

Release readiness is now machine-checkable in `webot-platform`, but current
runtime state is still NO-GO for production because staging/production env values
and Stripe credentials are not loaded in this shell.

- Platform commit: `dfb45cb` (`feat: add release readiness gate`)
- Added `npm run release:readiness`, which emits redacted JSON and fails closed
  unless local, staging, production, Stripe test, and Stripe live gates pass.
- The readiness report never prints secret values; it reports only gate IDs,
  variable names, and reasons.
- Fixed the checkout-origin drift so the platform tier checkout helper defaults
  to `https://app.webot.studio`, matching Stripe catalog docs and tier scripts.
- Added `WEBOT_CHECKOUT_RETURN_ORIGIN=https://app.webot.studio` to
  `webot-platform/.env.example` so the env contract matches remote requirements.
- Normalized Stripe validation docs to include `--open-only` for test readback.
- Manager verification:
  - `npm run release:readiness` returned expected `NO-GO` with missing
    staging/production/Stripe gates and no secrets printed.
  - `npm run env:check:staging -- --env-file .env.example` failed closed on
    placeholders as expected.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 17 Vitest files / 79 tests, 19 Playwright E2E tests, and build.
- Required proof commands still pending when credentials are loaded:
  - `npm run env:check:staging -- --env-file .env.staging.local`
  - `npm run env:check:production -- --env-file .env.production.local`
  - `npm run stripe:create-tiers -- --mode test --idempotent`
  - `npm run stripe:validate-tiers -- --mode test --open-only`
  - `npm run stripe:create-tiers -- --mode live --idempotent`
  - `npm run stripe:validate-tiers -- --mode live --open-only`

## Latest platform model-placeholder checkpoint (2026-06-28)

Internal service execution placeholders are now explicit and test-covered in
`webot-platform`; final model/provider/runtime choices remain intentionally
deferred.

- Platform commit: `5b37e08` (`feat: add internal service routing placeholders`)
- Added `lib/runtime/service-routing.ts`, an internal-only mapping from every
  public service family and service option to a placeholder execution profile.
- Each placeholder has a stable profile id, family id, covered service options,
  capability group, review requirement, `pending_model_selection` status, and
  safe handoff requirements.
- The mapping is code-only for now. Jobs still persist public `service_family`
  and `service_type`; workers can resolve the internal profile when claiming a
  job. Durable private routing fields should be added only if immutable replay
  proof becomes required.
- `toSafeJobEvent` now sanitizes event metadata so future internal profile,
  model-slot, runtime, vendor, prompt, queue, handoff, implementation, or worker
  details are stripped before customer-facing event responses.
- Public catalog, OpenAPI, job, and event responses remain free of internal
  routing/profile details.
- Manager verification:
  - focused runtime/API tests passed: 4 files / 19 tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 18 Vitest files / 83 tests, 19 Playwright E2E tests, and build.
- `scripts/verify-release-readiness.ts` was also adjusted to avoid a tracked
  secret-scan false positive while preserving Stripe key-mode validation.

## Latest platform Supabase ServerDb checkpoint (2026-06-28)

Production account/session/entitlement reads now have a real Supabase-backed
`ServerDb` adapter, but the broader API runtime repositories still need
production adapters before customer traffic.

- Platform commit: `7f050c5` (`feat: add supabase server db adapter`)
- `getServerDb()` now chooses `SupabaseServerDb` when
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
  `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Dashboard Supabase sessions are read from Supabase cookie shapes; WeBot API
  `Authorization: Bearer` remains reserved for agent/API keys.
- `npm run release:readiness` now separates `serverdb.staging` /
  `serverdb.production` from `repositories.staging` /
  `repositories.production`. ServerDb can pass with real Supabase env; runtime
  repositories still fail closed with
  `RuntimeRepositories: production adapters not configured`.
- Manager verification:
  - focused Supabase/persistence/auth readiness tests passed: 5 files / 22
    tests.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 20 Vitest files / 91 tests, 19 Playwright E2E tests, and build.

## Latest platform runtime repository checkpoint (2026-06-28)

Production runtime repositories now have Supabase-backed adapters, including
distributed rate-limit counter state and Supabase Storage signed upload URLs.

- Platform commit: `29e1760` (`feat: add supabase runtime repositories`)
- Added shared `SupabaseRestClient` with service-role headers and schema
  profile support.
- Added Supabase repositories for API keys, usage ledger, jobs/events, file
  metadata, rejects, Stripe webhook events, Stripe entitlement sync, and
  rate-limit event audit rows.
- Added `supabase/migrations/0008_rate_limit_counters.sql` with a private
  `rate_limit_counters` table and atomic
  `app_private.consume_rate_limit_counter` RPC.
- `checkRateLimit` now uses a pluggable counter store: in-memory for local/tests,
  Supabase RPC when runtime env is configured.
- Platform commit: `1fbaf2a` (`feat: add supabase storage upload presign`)
  replaces production file upload placeholders with Supabase Storage signed
  upload URLs when `FILE_STORAGE_BUCKET` and Supabase env are configured.
- Placeholder upload URLs remain local/test-only; production file upload storage
  fails closed when not configured.
- `npm run release:readiness` now lets `repositories.staging` /
  `repositories.production` and `runtime-limits.staging` /
  `runtime-limits.production` pass when Supabase env is present. In this shell
  it remains expected `NO-GO` because staging/production env and Stripe keys are
  not loaded.
- Manager verification:
  - focused runtime repository/readiness tests passed: 3 files / 11 tests.
  - focused file/Supabase Storage tests passed and dashboard jobs/files
    Playwright spec passed.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run release:readiness` returned expected redacted `NO-GO` for missing
    env/Stripe values.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 21 Vitest files / 96 tests, 19 Playwright E2E tests, and build.

## Latest platform release-proof checkpoint (2026-06-28)

The final env/Stripe/deploy proof path is now a guarded script, but it still
requires real staging/production env files and Stripe credentials to run beyond
dry-run.

- Platform commit: `4d09153` (`feat: add guarded release proof runner`)
- Added `npm run release:proof`.
- Default dry-run command:
  `npm run release:proof -- --dry-run`
- Staging proof command when env is present:
  `npm run release:proof -- --target staging --env-file .env.staging.local`
- Production proof command with live Stripe creation:
  `npm run release:proof -- --target production --env-file .env.production.local --include-stripe-create --confirm-live-stripe`
- The runner loads the env file for Stripe commands, captures command output,
  redacts loaded env values, and refuses live Stripe creation unless
  `--confirm-live-stripe` is present.
- Deployment readiness docs were updated to remove stale fixture-storage
  blocker language and point to the guarded proof runner.
- Manager verification:
  - `npm test -- --run tests/release-proof.test.ts tests/release-readiness.test.ts`
    passed: 2 files / 6 tests.
  - `npm run release:proof -- --dry-run` passed and printed redacted dry-run
    JSON with no Stripe secret.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 22 Vitest files / 99 tests, 19 Playwright E2E tests, and build.

## Latest platform remote-smoke checkpoint (2026-06-28)

Remote no-charge API/browser proof is now part of the guarded release path, but
it still requires deployed staging/production URLs from env files before it can
run for real.

- Platform commit: `d719035` (`feat: add remote release smoke proof`)
- Added `npm run release:remote-smoke`.
- `release:remote-smoke` loads an env file, fetches
  `NEXT_PUBLIC_API_URL/api/health`, opens public `NEXT_PUBLIC_APP_URL` pages in
  Chromium, checks for horizontal overflow/obvious secret text, and captures
  screenshots.
- `release:proof` now includes `release:remote-smoke` between local
  `deploy:check` and Stripe validation.
- Dry-run command:
  `npm run release:remote-smoke -- --dry-run`
- Manager verification:
  - `npm test -- --run tests/release-proof.test.ts` passed: 1 file / 4 tests.
  - `npm run release:remote-smoke -- --dry-run` passed.
  - `npm run release:proof -- --dry-run` passed and included remote smoke.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 22 Vitest files / 100 tests, 19 Playwright E2E tests, and build.

## Latest platform copy/runtime alignment checkpoint (2026-06-28)

Platform release copy now matches the implemented Supabase runtime adapters and
no longer underclaims production auth, storage, or rate-limit behavior.

- Platform commit: `3992b04` (`docs: align release copy with supabase runtime`)
- Updated dashboard account-context copy from fixture-only wording to the real
  server-side auth paths: Supabase sessions and bearer API keys, with fixture
  headers explicitly test-only.
- Updated file-policy UI/E2E copy so production presigns are described as
  private Supabase Storage, while retention remains 7 days by default.
- Updated architecture, API contract, OWASP, and STRIDE docs from Redis-only
  rate-limit language to private/distributed atomic counter language.
- Fixed the remote-smoke script's committed secret-scan false positive by
  constructing sensitive token fragments without tracked key-shaped strings.
- Verification:
  - targeted dashboard E2E passed: 7 Playwright tests.
  - `npm run secrets:check`, `npm test -- --run tests/release-proof.test.ts`,
    and `npm run release:remote-smoke -- --dry-run` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, db check,
    lint, typecheck, 22 Vitest files / 100 tests, 19 Playwright E2E tests, and
    Next build.

## Latest platform retention/API-key dashboard checkpoint (2026-06-28)

Two more local production-readiness gaps are closed in `webot-platform`: customer
file retention now has a server-side cleanup path, and dashboard owners/admins
can create API keys without waiting for a future control.

- Platform commit: `a8ef932` (`feat: add file retention cleanup and key creation UI`)
- Added `cleanupExpiredFiles` in `lib/files/index.ts`, covering expired file
  scans, status transition to `expired`, private storage object removal, and
  final `removed` status without returning storage keys in cleanup reports.
- Added `SupabaseStorageObjectRemover` and a safe local placeholder remover.
- Added `npm run files:cleanup`, a JSON-output maintenance runner with
  `--dry-run` and `--limit`; `deploy:check` now includes a cleanup dry-run.
- Added owner/admin dashboard API-key creation UI that calls the existing secure
  POST route and shows the plaintext key once in browser state.
- Removed stale public/dashboard copy that described file storage or API key UI
  as future/placeholder-only.
- Verification:
  - focused file/OpenAPI/cleanup tests passed: 3 files / 14 tests.
  - focused dashboard API-key E2E passed: 4 Playwright tests, including browser
    key creation and one-time plaintext display.
  - full `npm run deploy:check` passed: secret scan, local env check, db check,
    lint, typecheck, 23 Vitest files / 105 tests, 19 Playwright E2E tests,
    cleanup dry-run, and Next build.

## Latest platform account-scoped job listing checkpoint (2026-06-28)

Agent/API customers can now list their own submitted jobs instead of only
polling known job IDs. The public docs and OpenAPI schema no longer underclaim
that job listing is unavailable.

- Platform commit: `5b3a352` (`feat: add account scoped job listing`)
- Added `GET /api/v1/jobs`, backed by `listAccountJobs`, with:
  - account-scoped repository queries for in-memory and Supabase runtimes;
  - safe filters for `status`, `service_family`, `created_after`,
    `created_before`, `cursor`, and `limit`;
  - cursor pagination and `Cache-Control: no-store`;
  - safe `toSafeJob()` output only, without customer instructions,
    entitlement snapshots, API key IDs, runtime/model/prompt details, or
    private routing metadata.
- Updated public docs, quickstart examples, `docs/api/examples.md`, and
  OpenAPI generation to include the implemented list route.
- Verification:
  - focused API/OpenAPI/Supabase repository tests passed: 3 files / 17 tests.
  - API docs browser test passed: 5 Playwright tests with screenshots.
  - full `npm run deploy:check` passed: secret scan, local env check, db check,
    lint, typecheck, 23 Vitest files / 107 tests, 19 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm run release:readiness` remains correctly `NO-GO` because staging and
    production env files, Supabase runtime env, and Stripe test/live credentials
    are not loaded in this shell; no secrets were printed.

## Latest subagent-stall recovery helper (2026-06-28)

Codex subagent close calls can block the main session after the agent pool is
already wedged. Treat stale subagent handles as non-critical unless their final
output is required for the next action.

- Added `scripts/recover-subagent-stall.sh`.
- The script is intentionally non-mutating: it does not call `close_agent`,
  `wait_agent`, `kill`, `codex archive`, or `codex delete`.
- It records stale agent IDs, Codex CLI diagnostics, git status, and targeted
  local session references into `~/Backups/webot-site/subagent-stall-*`.
- Added `scripts/mark-stale-subagent.sh` for the specific "close/wait appears
  stuck" moment. It writes a timestamped marker and optional bounded recovery
  snapshot, appends `~/.webot/stale-subagents/webot-site.tsv`, and does not call
  any agent runtime API.
- First verified snapshot:
  `/Users/webot/Backups/webot-site/subagent-stall-20260628T200127Z`
- First stale-marker verification:
  `/Users/webot/Backups/webot-site/stale-subagent-20260628T205317Z`
- Operational rule: if the subagent pool remains full, continue without waiting
  on stale handles or start a fresh Codex session from this handoff plus
  `ACTIVE_STATE.md` and
  `.handoffs/WEBOT_PLATFORM_DELUXE_CONTINUATION_2026-06-28.md`.

Subagent verification:

- Research lanes completed for service taxonomy, API/security architecture, pricing/checkout/dashboard, visuals, and local model/runtime strategy.
- First plan-checker pass returned BLOCK because the initial scaffold could still end in docs-only readiness.
- Revision added explicit Stripe tier creation/live readback, backend bootstrap/deployment, API docs UI, stricter browser/payment verification, and split Phase 03 into executable backend subplans.
- Second plan-checker pass returned PASS; final manual tightening added explicit live Stripe `create-tiers --mode live --idempotent` and `validate-tiers --mode live --open-only` commands.

## Latest live delivery validation (2026-06-28 SEO + approval flow)

Full SEO/dashboard/local-agent validation completed and published on 2026-06-28.

- Agency SEO/content commits:
  - `a540407` (`feat: add full seo and local agent flow tests`)
  - `80b69b0` (`fix: clarify privacy job payment language`)
- Studio SEO/dashboard commit:
  - `e06e5e4` (`feat: improve studio seo dashboard path`)
- SEO surface added/verified:
  - page-specific titles, descriptions, robots directives, canonicals, Open Graph, Twitter cards, theme color, and cleaned sitemap inclusion
  - Agency and Studio JSON-LD parse checks
  - `llms.txt` on both sites for AI assistant/crawler summaries
  - no buyer-facing credit/pack wording for Studio one-time jobs, except intentional Office skill-pack products
- Dashboard path strengthened on Agency and Studio:
  - Payment + Intake
  - Agent Route / Agent Draft
  - Lead Review
  - Fresh Review
  - Approval
  - Complete
- Latest live script validation:
  - `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T032140Z/screenshots`
- Latest live publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260628T032115Z/screenshots`
- Latest local model approval-flow report:
  - `/Users/webot/Backups/webot-site/local-agent-approval-flow-20260628T032153Z/local-agent-approval-flow.json`
  - Model: `gemma4-31b-max.Modelfile:latest`
  - Route: `Plan & Itinerary`
  - CRM-style status: `ready_for_customer_review`
- Important caveat: the approval-flow script performs real local Ollama agent calls and creates the approval packet, but it does not submit payment, externally send deliverables, or write into a live CRM. Those remain gated production integrations.

Use these scripts instead of ad-hoc validation:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
scripts/test-itinerary-flow.sh --live
scripts/test-local-agent-approval-flow.sh
```

## Latest docs-only publish (2026-06-28 paid ads + project agent guide)

The no-spend paid ads launch pack and root `AGENTS.md` project guide are published
from the Agency repo. This did not change the core customer-facing HTML pages.

- `AGENTS.md` now captures current project shape, ground-truth files, hard rules,
  validation commands, publish discipline, and the stale status of old `HANDOFF.md`.
- `.nojekyll` keeps GitHub Pages in raw static-file mode for this static site and
  allows the project guide to be fetched as `AGENTS.md`.
- `.gitignore` ignores generated `.axon/` local code-intelligence state so the
  guarded publish script can keep blocking accidental untracked publish payloads.
- `ACTIVE_STATE.md` records the agent-guide addition.
- Paid ads validator remains the gate for the launch pack:
  `scripts/validate-paid-ads.sh`.

## Previous live delivery validation (2026-06-27)

Studio revenue catalog publish completed on 2026-06-27.

- `webot.agency` live root matched `HEAD:index.html` after commit `df4aece`.
- `webot.studio` live root matched `HEAD:index.html` after commit `df05caa`.
- New Studio Stripe catalog live:
  - Starter `$49/mo`
  - Plus `$149/mo`
  - Business `$399/mo`
  - Small one-time reviewed job `$49`
  - Standard one-time reviewed job `$129`
  - Deep one-time reviewed job `$299`
- Live browser checks passed:
  - Agency Studio section shows subscriptions/one-time reviewed jobs and no login/signup claim.
  - Studio desktop and mobile selection updates checkout buttons to all six expected Stripe links.
  - Studio `?payment=confirmed&product=studio-business&session_id=...` selects Business and shows confirmed intake copy.
  - Hosted Stripe checkout pages opened to the expected products/amounts without submitting payment details.
  - Authenticated CRM dashboard filter includes Studio products after live dashboard md5 verification.
- Agency pre-publish backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T235005Z`
- Agency/Studio post-publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T235005Z/screenshots`
- Studio checkout validation screenshots:
  - `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/screenshots`
  - `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/stripe-screenshots`

Previous Agency + Studio launch validation:

Approved live publish completed on 2026-06-27 after Ian approved the screenshots and Studio wordmark.

- `webot.agency` live route returned 200 and matched committed `HEAD:index.html`.
- `webot.studio` live route returned 200 and matched committed `HEAD:index.html`.
- Agency published commit: `5b45a5f` (`feat: launch WeBot agent marketplace homepage`).
- Studio published commit: `63324bc` (`feat: launch WeBot Studio agent dashboard flow`).
- Agency pre-publish backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T215219Z`
- Agency post-publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T215219Z/screenshots/webot.agency-desktop.png`
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T215219Z/screenshots/webot.agency-mobile.png`
- Studio pre-publish backup:
  - `/Users/webot/Backups/webot-studio/live-pre-publish-20260627T215420Z`
- Studio post-publish screenshots:
  - `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-desktop.png`
  - `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-mobile.png`
- Agency local screenshots also passed desktop/mobile before publish:
  - `/tmp/webot-validator/screenshots/agency-desktop-final.png`
  - `/tmp/webot-validator/screenshots/agency-mobile-final.png`
- Studio local screenshots also passed desktop/mobile before publish:
  - `/tmp/webot-validator/screenshots/studio-desktop-final.png`
  - `/tmp/webot-validator/screenshots/studio-mobile-final.png`
- Static link test passed: Agency `65` hrefs, Studio `19` hrefs, no missing hash targets.
- Protected Agency Stripe URLs unchanged: baseline `8`, current `8`, exact URLs unchanged.
- Studio has no live Stripe/payment URL or backend behavior.
- DevTools interaction tests passed:
  - Agency mobile nav opens.
  - Studio agent selection, Plus plan selection, payment-confirmed state, and nav toggle work at `390` and `1440`.
- `scripts/publish-live.sh --dry-run` passed before live publish and created live backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T205952Z`
- `scripts/publish-live.sh --confirm-live` passed and pushed `webot-site` to GitHub Pages.
- `webot-studio` was backed up, pushed, polled until live matched local, and screenshot-verified.

## Current dirty-state notes (2026-06-28)

- `webot-site` SEO/dashboard/privacy cleanup has been published and live-script-verified.
- `webot-studio` SEO/dashboard path has been pushed and live-script-verified through the Agency validation harness.
- The stale `webot-studio/favicon.svg` CR-only dirty state was resolved by restoring the file to HEAD.
- CRM local files under `/Users/webot/.openclaw/workspace` were updated for Studio Stripe product mapping. The live CRM dashboard was also patched and md5-verified after a server-side backup.

## Latest live delivery validation (2026-06-28)

Plan & Itinerary has been added as a first-class Agency + Studio agent family for vacations, date nights, business get-togethers, and road trips.

- Agency content commit published: `e6f2d62` (`feat: add itinerary agent offer flow`).
- Studio commit published: `cad25fb` (`feat: add itinerary agent studio flow`).
- Pricing/demo clarity published:
  - Agency commit `e3ee26b` (`fix: clarify studio one-time job copy`)
  - Studio commit `4c82e35` (`fix: clarify one-time job pricing demo`)
- Agency publish backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T023208Z`.
- Agency publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T023208Z/screenshots`.
- Latest Agency publish backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T024721Z`.
- Latest Agency publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T024721Z/screenshots`.
- Live script validation passed after Studio propagation: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T024927Z/screenshots`.

Use this script for itinerary-flow validation instead of ad-hoc browser commands:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
scripts/test-itinerary-flow.sh --live
```

Latest passing live run:

- `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T024927Z/screenshots`

Covered by the script:

- Agency and Studio `git diff --check`
- JSON-LD parse checks
- inline script compile checks
- desktop/mobile centering and horizontal-overflow checks
- Agency + Studio screenshots
- Studio scenario routing for vacation, date night, business get-together, road trip, PDF cleanup, automation/code review, card/logo, and decision memo
- Studio test chat response and route update
- Studio short paid-flow demo through intake, route, draft, lead review, fresh-context review, and customer-ready state
- Public copy guard against confusing credit/pack wording
- Studio `?payment=confirmed&product=studio-business` return state

## Files (current)

```
index.html       — full landing page (~1743 lines): hero, products, services, FAQ, contact form
consultation.html — discovery call intake (mailto fallback)
success.html    — post-purchase thank-you (?p= URL param drives flow)
projects.html   — internal "WeBot Ops" task dashboard (noindex, reads ops-data.json)
privacy.html    — privacy policy (covers CrazyCade + agency)
ops-data.json   — task manifest for projects.html dashboard
CNAME           — webot.agency
favicon.svg, favicon.png, apple-touch-icon.png
```

## Site architecture (per WEBOT_REFERENCE.md)

This is one of THREE cross-linked sites:
- **webot.agency** — this site, sales/services/products/contact (~/Projects/webot-site)
- **webot.buzz** — news/content hub + newsletter signup (~/Projects/webot-buzz)
- **webot.studio** — managed hosting landing page (~/Projects/webot-studio)

All three cross-link in nav + footer. **If you change the nav on one, mirror the change to the other two** — that's a recurring pattern in the buzz commit history ("Match nav layout to agency").

## Products on the site (current sales surface)

**Live on Agency (Stripe Buy Now):**
- MS Office AI Bundle — $19
- Google Workspace AI Bundle — $19
- Complete Office AI Bundle — $29 (all 10 packs)

**Live on Studio (Stripe checkout):**
- WeBot Studio Starter — $49/mo
- WeBot Studio Plus — $149/mo
- WeBot Studio Business — $399/mo
- WeBot Small one-time reviewed job — $49
- WeBot Standard one-time reviewed job — $129
- WeBot Deep one-time reviewed job — $299

**Contact/scoped paths:**
- AI Agent Development, custom skills, scraping/research, social workflows, and larger automation work now route through Studio or custom quote language.
- F5 Trading references were left alone.

## ⚠️ Hard rules / project-specific constraints

- **Static HTML only.** Don't introduce a build tool, framework, or `package.json`. The "we ship not demo" voice means the site itself stays unfussy. (Per WEBOT_REFERENCE.md.)
- **Local is editing surface; GitHub Pages is the live mirror.** Push to master/main → GitHub Pages auto-rebuilds. No direct prod edits.
- **Cross-site nav consistency.** Change nav here → mirror to webot-buzz + webot-studio. There's commit history showing repeated nav reconciliation.
- **Don't break the three Stripe-live products.** MS Office Bundle, Google Workspace Bundle, Complete Office Bundle all currently take real payments. Don't change their Buy Now URLs without Ian explicitly approving the new Stripe IDs.
- **success.html `?p=` flow types:** existing Office bundles still use the bundle download flow. Old service success mappings may exist for historical links, but current public Agency service buy-now paths have been demoted to Studio/custom quote.
- **Newsletter signup is currently localStorage-only + mailto placeholder — NOT wired to a CRM yet.** Don't claim it's wired in copy until it actually is.
- **Formspree on contact form is placeholder — mailto fallback is what actually works.** Same caveat as above.
- **No paid API top-ups.** $200/mo Max ceiling.

## Open work (carried forward from current focus pivot)

**Current planning focus (2026-06-27):**
- First-pass plan for the "We Bot You!" agent marketplace and Studio signup/payment/dashboard flow is in `.handoffs/WEBOT_AGENT_MARKETPLACE_PLAN_2026-06-27.md`.
- Next-session monetization, Stripe, pricing research, and local-agent delivery plan is in `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_LOCAL_DELIVERY_PLAN_2026-06-27.md`.
- Revenue-flow checkpoint, pricing research, Stripe/CRM readbacks, Studio checkout implementation, CRM dashboard deployment, screenshots, and current blockers are in `.handoffs/REVENUE_FLOW_CHECKPOINT_2026-06-27.md`.
- Next implementation must resolve Studio intake-to-CRM write automation if manual intake after checkout is no longer enough. The local model approval packet is script-validated, but live CRM writes/external sends remain gated.
- Public Agency + Studio launch pages are live; Studio revenue plumbing is published and validated.

Per Ian's stated focus this week:
- Marketing/social agents to start promoting these existing services (which currently nobody knows about)
- WeBot Buzz revival (separate project, sister site)
- LinkedIn presence
- Daily content cadence

**Likely-soon technical work on this site itself:**
- Newsletter signup wired to a real CRM/list (currently just localStorage)
- Contact form wired to Formspree or similar (currently mailto only)
- Hero image refresh (separate task — generate via `anthropic-skills:image-gen` skill, save to `assets/`)
- New blog/content references when WeBot Buzz revives

## How to pick this up cleanly in a fresh session

1. **`cd ~/Projects/webot-site`**
2. **Read this file** — `cat .handoffs/CURRENT_STATE.md`
3. **Read top of `~/Projects/WEBOT_REFERENCE.md`** for the master agency context (the three sites, brand voice, products)
4. **`git fetch && git status`** — confirm `master` branch
5. **For nav/copy changes:** check webot-buzz + webot-studio + WEBOT_REFERENCE.md for cross-references
6. **For Stripe/payment changes:** stop and confirm with Ian — real money flows through these

## Verification commands (5 sec total)

```bash
# Local
cd ~/Projects/webot-site && pwd && git branch --show-current && git status --short

# Live site reachable + 200?
curl -sS -I https://webot.agency 2>/dev/null | head -1
curl -sS -I https://webot.agency/consultation.html 2>/dev/null | head -1
curl -sS -I https://webot.agency/success.html 2>/dev/null | head -1
```

## Master session contact

Written 2026-05-08. If facts here contradict reality, write `.handoffs/CORRECTIONS_<date>.md` with evidence + surface to Ian. Do NOT silently override.
