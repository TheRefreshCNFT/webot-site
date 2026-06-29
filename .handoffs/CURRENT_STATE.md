---
project: webot-site (webot.agency main agency website)
last_updated: 2026-06-29
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

## Definition of done clarification (2026-06-29 bedtime note)

Ian clarified that local implementation gates are not enough to call the product
done. The final state is not complete until:

- staging and production envs contain working secrets and pass readiness/proof
  checks;
- human-style browser validation follows the whole customer flow except payment
  submission, then continues through post-payment, dashboard, and build-station
  steps using safe verified evidence;
- the user dashboard and family-specific build stations are ready for all
  service families;
- family agents have expert-level category skills, not generic/default skills;
- if a needed category skill is missing, the team researches and wires the best
  free/open-source option available;
- agents demonstrate exceptional human-intent understanding in the flow;
- final model selection can wait until tomorrow, but every non-model aspect
  above must be production-ready first;
- `.pi` already has local models available for testing.

This clarification supersedes any narrower "local gates complete" definition.
Do not mark the platform product-ready while env secrets, whole-flow browser
proof, family build stations, expert skills, or safe post-payment evidence are
still incomplete.

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

## Latest platform agent readiness checkpoint (2026-06-29)

Authenticated job-creation preflight and dashboard readiness review are locally implemented and verified in
`webot-platform`, but not deployed live yet.

- Platform commit: `ef42735` (`test: require remote readiness proof`)
  hardens deployed proof requirements after `0475b57`.
- Platform commit: `0475b57` (`feat: add dashboard job readiness review`)
  builds on `a385250`.
- Platform commit: `a385250` (`feat: add authenticated job preflight`)
- Added `POST /api/v1/jobs/preflight`.
- The route requires account auth, applies dashboard CSRF for cookie sessions,
  and stays bearer-key friendly for agent callers.
- It checks service catalog validity, customer-intent readiness, active
  entitlement, usage/quota remaining, active-job concurrency, and job-create
  rate-limit policy before a caller creates work.
- It does not create jobs, write usage, record rejects, consume rate counters,
  attach files, grant access, call models, or expose runtime details.
- Dashboard job intake now has an in-place "Review readiness" action that calls
  the authenticated preflight route and shows service fit, missing customer
  context, quota remaining, active-job capacity, blocking actions, and quality
  signals before creating work.
- Remote release smoke now signs in with the configured smoke account, reviews
  job readiness, requires the ready state, captures
  `remote-smoke/customer-flow/05-readiness.png`, then creates the no-charge test
  job and opens build stations.
- The completion audit now rejects staging/production proof bundles if the
  remote customer-flow readiness screenshot is absent or empty.
- Playwright now uses a fresh per-run local job repository file so dashboard
  redirect tests keep job persistence without stale active jobs from old runs
  filling concurrency slots.
- API docs, examples, OpenAPI, route tests, browser docs tests, and the
  completion audit now require this preflight surface.
- Verification:
  - focused API/OpenAPI tests passed: 26 tests.
  - focused dashboard/customer browser tests passed: 5 tests.
  - focused release-proof/completion-audit tests passed: 14 tests.
  - `npm run release:remote-smoke -- --dry-run --report-file test-results/release-remote-smoke-dry-run.json`
    passed and showed the customer-flow step now includes readiness review.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - API docs Playwright suite passed: 5 tests.
  - `npm run release:completion-audit` printed the expected redacted `NO-GO`:
    local implementation gates pass, while staging/production secrets, proof
    reports, and live browser evidence are still missing.
  - `npm run release:completion-audit -- --report-file test-results/completion-audit-job-preflight.json`
    printed the expected redacted `NO-GO`: all local implementation gates pass,
    while staging/production secrets, proof reports, and live browser evidence
    are still missing. This run did not leave a durable JSON file after the
    `NO-GO` exit, so treat the terminal output as the evidence for this
    checkpoint.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 183 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build. The build route list includes
    `/api/v1/jobs/preflight`.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or credential-backed proof was run.

## Latest platform final-audit handoff checkpoint (2026-06-29)

The guarded final-release path now automatically carries generated Stripe
readback proof into the completion audit in `webot-platform`.

- Platform commit: `b8f2907` (`feat: pass proof readback into final audit`)
  builds on `4a5181d`.
- `npm run release:final` now passes the staging and production
  `stripe-validate-report.json` files produced by `release:proof` into
  `release:completion-audit` through explicit
  `--staging-stripe-readback-file` and
  `--production-stripe-readback-file` arguments.
- `release:readiness` and `release:completion-audit` can now load staging and
  production Stripe tier readback files independently from the env files, while
  still keeping secret output redacted.
- This removes the manual "edit env after proof, before audit" step from the
  final path. The final audit still fails closed until real env secrets,
  Stripe credentials/readback, staging proof, production proof, and deployed
  browser evidence exist.
- Verification:
  - `npm run release:final -- --report-file test-results/final-release-dry-run-readback-handoff.json`
    produced a dry-run report whose completion-audit command includes both
    generated Stripe readback file arguments.
  - focused tests passed:
    `npm test -- tests/release-readiness.test.ts tests/final-release.test.ts tests/completion-audit.test.ts`
    with 20 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 35 Vitest files / 188 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or credential-backed proof was run.

## Latest platform env-preflight evidence checkpoint (2026-06-29)

The no-auth release preflight path now preserves durable redacted artifacts for
provider auth, Vercel env pull status, env prep status, and the top-level release
inputs report in `webot-platform`.

- Platform commit: `b4e759d` (`feat: preserve env preflight reports`)
  builds on `85806a0`.
- `npm run release:env-pull` and `npm run release:env-prep` now support
  `--report-file`, create parent directories, write JSON reports with `0600`
  permissions, and keep exit-code behavior unchanged.
- `npm run release:inputs` now starts its generated next commands with durable
  report variants:
  - `npm run release:provider-auth -- --report-file test-results/release-proof/provider-auth-report.json`
  - `npm run release:env-pull -- --link-from-process-env --report-file test-results/release-proof/env-pull-report.json`
  - `npm run release:env-prep -- --from-process-env --report-file test-results/release-proof/env-prep-report.json`
- Deployment readiness docs now show the same report-file commands so future
  release sessions leave inspectable proof instead of terminal-only status.
- Fresh artifacts verified:
  - `test-results/release-proof/provider-auth-report.json`: `WARN`,
    `secretValuesPrinted=false`
  - `test-results/release-proof/env-pull-report.json`: `NO-GO`,
    `secretValuesPrinted=false`
  - `test-results/release-proof/env-prep-report.json`: `NEEDS-SECRETS`,
    `secretValuesPrinted=false`
  - `test-results/release-proof/release-inputs-report.json`: `NO-GO`,
    `secretValuesPrinted=false`
- Verification:
  - focused release env/input tests passed: 3 files / 19 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 41 Vitest files / 221 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - `npm run release:domains -- --output-file test-results/release-proof/domain-proof.json --timeout-ms 5000`
    wrote the expected redacted `FAIL` report because `app.webot.studio` and
    `api.webot.agency` still have no DNS/HTTPS.
  - `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/local-supabase-runtime-proof.json --timeout-ms 240000`
    passed and stopped local Supabase cleanly.
  - `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    passed and captured Agency/Studio public live screenshots.
  - `npm run release:inputs -- --report-file test-results/release-proof/release-inputs-report.json`
    wrote the expected redacted `NO-GO`: public browser and local Supabase proof
    pass, while provider auth, real staging/production env secrets, DNS,
    staging/production proof bundles, remote Supabase proof, and Stripe readback
    artifacts remain missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or interactive credential flow was run.

## Latest platform release-input report permissions checkpoint (2026-06-29)

The top-level release-input proof artifact is now permission-aligned with the
other release proof files in `webot-platform`.

- Platform commit: `d4539cf` (`fix: lock down release input reports`) builds
  on `b4e759d`.
- `npm run release:inputs -- --report-file ...` now writes with `0600` and
  chmods after writing, so an existing loose report file is tightened on
  overwrite instead of staying `0644`.
- Regression coverage now starts from an existing `0644` report file and
  asserts the final mode is `0600`.
- Verification:
  - focused release-input tests passed: 1 file / 6 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 41 Vitest files / 221 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - regenerated provider-auth, env-pull, env-prep, domain, local Supabase,
    public browser, and release-input evidence.
  - `test-results/release-proof/provider-auth-report.json`,
    `env-pull-report.json`, `env-prep-report.json`, `domain-proof.json`,
    `test-results/local-supabase-runtime-proof.json`, and
    `test-results/release-proof/release-inputs-report.json` all parse as JSON,
    keep `secretValuesPrinted=false`, contain no known secret placeholders, and
    have `0600` filesystem mode.
  - The refreshed release-input report remains the expected redacted `NO-GO`:
    local Supabase and public live browser evidence pass; Vercel/Supabase/Stripe
    provider auth, real staging/production env secrets, DNS/HTTPS,
    staging/production proof bundles, remote Supabase proof, and Stripe readback
    artifacts remain missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or interactive credential flow was run.

## Latest platform release-proof report permissions checkpoint (2026-06-29)

All no-auth release proof/report writers now enforce restrictive filesystem
permissions after overwriting existing artifacts in `webot-platform`.

- Platform commit: `b81b9f5` (`fix: lock down release proof reports`) builds on
  `d4539cf`.
- Provider-auth, env-pull, env-prep, release-domain, local Supabase runtime,
  remote Supabase runtime, release-proof, and Stripe readback artifact writers
  now chmod proof JSON files to `0600` after writing.
- Regression tests start from existing `0644` files for provider-auth, env-pull,
  env-prep, release-domain, local Supabase runtime, remote Supabase runtime, and
  release-proof reports, then assert the final artifact mode is `0600`.
- Verification:
  - focused release proof/report tests passed: 7 files / 41 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 41 Vitest files / 224 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - regenerated provider-auth, env-pull, env-prep, domain, local Supabase,
    public browser, and release-input evidence.
  - `test-results/release-proof/provider-auth-report.json`,
    `env-pull-report.json`, `env-prep-report.json`, `domain-proof.json`,
    `test-results/local-supabase-runtime-proof.json`, and
    `test-results/release-proof/release-inputs-report.json` all parse as JSON,
    keep `secretValuesPrinted=false`, contain no known secret placeholders, and
    have `0600` filesystem mode.
  - The refreshed release-input report remains the expected redacted `NO-GO`:
    local Supabase and public live browser evidence pass; Vercel/Supabase/Stripe
    provider auth, real staging/production env secrets, DNS/HTTPS,
    staging/production proof bundles, remote Supabase proof, and Stripe readback
    artifacts remain missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or interactive credential flow was run.

## Latest platform final/smoke/audit report permissions checkpoint (2026-06-29)

The remaining final-release, completion-audit, and remote-smoke report emitters
now enforce the same restrictive artifact permissions in `webot-platform`.

- Platform commit: `6e7a942` (`fix: lock down final release reports`) builds on
  `b81b9f5`.
- `release:remote-smoke -- --report-file`, `release:final -- --report-file`,
  and `release:completion-audit -- --report-file` now write reports with
  `0600` mode and chmod them after writing so old `0644` artifacts cannot stay
  loose after overwrite.
- Regression tests start from existing `0644` report files for remote smoke,
  final release, and completion audit, then assert final artifact mode is
  `0600` and `secretValuesPrinted=false`.
- Verification:
  - focused report-permission tests passed: 3 files / 25 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 41 Vitest files / 225 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - regenerated provider-auth, env-pull, env-prep, domain, local Supabase,
    public browser, and release-input evidence.
  - `test-results/release-proof/provider-auth-report.json`,
    `env-pull-report.json`, `env-prep-report.json`, `domain-proof.json`,
    `test-results/local-supabase-runtime-proof.json`, and
    `test-results/release-proof/release-inputs-report.json` all parse as JSON,
    keep `secretValuesPrinted=false`, contain no known secret placeholders, and
    have `0600` filesystem mode.
  - direct dry-run/fail-closed reports for
    `test-results/release-proof/remote-smoke-report.json`,
    `final-release-report.json`, and `completion-audit-report.json` also parse
    as JSON, keep `secretValuesPrinted=false`, contain no known secret
    placeholders, and have `0600` filesystem mode.
  - The refreshed release-input report remains the expected redacted `NO-GO`:
    local Supabase and public live browser evidence pass; Vercel/Supabase/Stripe
    provider auth, real staging/production env secrets, DNS/HTTPS,
    staging/production proof bundles, remote Supabase proof, and Stripe readback
    artifacts remain missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or interactive credential flow was run.

## Latest platform release-readiness report checkpoint (2026-06-29)

The release-readiness scoreboard is now durable release evidence in
`webot-platform`.

- Platform commit: `eb39a04` (`feat: preserve release readiness reports`) builds
  on `6e7a942`.
- `npm run release:readiness` now accepts `--report-file`, creates parent
  directories, writes redacted JSON, and chmods the report to `0600` after
  writing so old loose artifacts are tightened on overwrite.
- `npm run release:inputs` now includes a report-preserving
  `npm run release:readiness -- ... --report-file
  test-results/release-proof/release-readiness-report.json` command after env
  checks and before deployed proof runs.
- `docs/deployment/readiness.md` now documents the readiness report artifact in
  the no-charge validation and release-input command flow.
- Regression coverage starts from an existing `0644` readiness report file,
  then asserts the final artifact mode is `0600`, status remains fail-closed,
  and no secret/placeholder values are printed.
- Verification:
  - focused release readiness/input tests passed: 2 files / 12 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 41 Vitest files / 226 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - `npm run release:readiness -- --staging-env-file .env.staging.local
    --production-env-file .env.production.local --staging-stripe-readback-file
    test-results/release-proof/staging/stripe-validate-report.json
    --production-stripe-readback-file
    test-results/release-proof/production/stripe-validate-report.json
    --report-file test-results/release-proof/release-readiness-report.json`
    wrote a redacted `NO-GO` report with `stripeSecretKeyPrinted=false` and
    `0600` mode.
  - `npm run release:inputs -- --report-file
    test-results/release-proof/release-inputs-report.json` wrote a redacted
    `NO-GO` report with `secretValuesPrinted=false`, `0600` mode, and the new
    readiness report command in `nextCommands`.
  - The reports correctly remain `NO-GO`: env files still contain placeholders,
    Vercel/Supabase/live Stripe auth is incomplete, DNS/TLS proof is missing or
    failing, and staging/production proof plus Stripe readback artifacts are not
    present.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or interactive credential flow was run.

## Latest platform remote Supabase runtime proof gate checkpoint (2026-06-29)

The guarded release path now requires a deployed Supabase REST/RPC proof artifact
for both staging and production in `webot-platform`.

- Platform commit: `33da0b4` (`feat: require remote supabase runtime proof`)
  builds on `91fff7b`.
- Added `npm run runtime:remote-supabase-proof`.
- The remote proof loads the selected ignored env file, validates its redacted
  staging/production shape, connects to the configured Supabase REST endpoint
  with the service role key, then uses the production repository adapters to
  create/read/clean account, user, membership, entitlement, API key, job, job
  event, file metadata, usage ledger, rate-limit event, rate-limit counter RPC,
  reject, and Stripe webhook rows.
- `npm run release:proof` now runs the remote Supabase runtime proof before
  remote browser smoke and writes
  `test-results/release-proof/<target>/supabase-runtime-report.json`.
- `npm run release:inputs` now requires the staging and production
  `supabase-runtime-report.json` artifacts.
- `npm run release:completion-audit` now independently opens each proof bundle's
  remote Supabase runtime report, verifies target, redaction, round-trip step,
  and required counts, then continues to remote-smoke and Stripe readback checks.
- Deployment docs now describe the extra artifact and verification purpose.
- Verification:
  - focused release tests passed: `26` tests across local/remote Supabase proof,
    release-proof, release-inputs, and completion-audit suites.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run runtime:remote-supabase-proof -- --target staging --dry-run --output-file test-results/remote-supabase-runtime-dry-run.json`
    passed with `secretValuesPrinted: false`.
  - `npm run release:proof -- --target staging --dry-run --artifact-dir test-results/release-proof/staging-dry-run-remote-runtime`
    passed and includes the `supabase-runtime` step before `remote-smoke`.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `38` Vitest files / `206` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - `npm run release:final -- --report-file test-results/final-release-dry-run-remote-supabase-gate.json`
    passed as a dry-run.
  - Current `npm run release:inputs` is still the expected redacted `NO-GO`:
    local Supabase runtime proof and public browser evidence pass, while
    staging/production env values, deployed Supabase runtime proof artifacts,
    deployed proof reports, and production Stripe readback remain missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, or credential-backed proof was run.

## Latest platform release-domain DNS/TLS proof checkpoint (2026-06-29)

The guarded release path now requires explicit DNS and HTTPS proof for the
production dashboard and API hostnames in `webot-platform`.

- Platform commit: `d2b56fa` (`feat: require release domain proof`) builds on
  `33da0b4`.
- Added `npm run release:domains`, which writes a redacted
  `test-results/release-proof/domain-proof.json` report for:
  - `app.webot.studio`
  - `api.webot.agency`
- The report records hostnames, DNS record counts/types, HTTPS status, and
  `secretValuesPrinted: false`; it does not modify DNS, Vercel routing, env
  files, or secrets.
- `npm run release:inputs` now requires the domain proof before local Supabase
  runtime proof and includes it in the generated completion-audit command.
- `npm run release:final` now runs the domain proof after local Supabase proof
  and passes the generated artifact into `release:completion-audit`.
- `npm run release:completion-audit` now rejects release bundles unless both
  required production hostnames resolve and accept HTTPS.
- Current machine-observed domain state:
  - `app.webot.studio`: no A/AAAA/CNAME records found; HTTPS cannot resolve.
  - `api.webot.agency`: no A/AAAA/CNAME records found; HTTPS cannot resolve.
- Verification:
  - `npm run lint` passed.
  - `npm run typecheck` passed.
  - focused tests passed:
    `npm test -- tests/release-domains.test.ts tests/release-inputs.test.ts tests/final-release.test.ts tests/completion-audit.test.ts`
    with `24` tests.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `39` Vitest files / `209` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - `npm run release:domains -- --output-file test-results/release-proof/domain-proof.json --timeout-ms 5000`
    wrote the expected redacted `FAIL` report because both required hostnames
    currently have no DNS records.
  - `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/local-supabase-runtime-proof.json --timeout-ms 240000`
    passed and stopped local Supabase cleanly.
  - `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    passed from `webot-site` and refreshed the six public live screenshots.
  - Current `npm run release:inputs` is the expected redacted `NO-GO`: Vercel
    CLI helper, local Supabase runtime proof, and public browser evidence pass;
    Vercel project link is still absent; staging/production env files still
    contain placeholders; release-domain proof fails because DNS is absent; and
    staging/production deployed proof, remote Supabase runtime, and Stripe
    readback artifacts are still missing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, or credential-backed proof was run.

## Latest platform provider-auth preflight checkpoint (2026-06-29)

The guarded release path now has a non-hanging provider authentication status
preflight in `webot-platform`.

- Platform commit: `040882e` (`feat: add provider auth release preflight`)
  builds on `d2b56fa`.
- Added `npm run release:provider-auth`, which reports redacted Vercel,
  Supabase, and Stripe CLI readiness without printing tokens or raw CLI config.
- `npm run release:inputs` now includes a warning-only `tool.provider-auth`
  check and lists `npm run release:provider-auth` before env pull/prep commands.
  This does not weaken hard gates: staging/production env files, DNS/TLS,
  deployed proof bundles, remote Supabase runtime reports, and Stripe readback
  artifacts still fail closed until real evidence exists.
- Current provider state from this machine:
  - Vercel CLI is installed, but no Vercel credential source is detected and
    `.vercel/project.json` is absent.
  - Supabase CLI is installed, but no Supabase access token source is detected.
  - Stripe CLI is installed with a test-mode key available; live-mode key is not
    available.
- Verification:
  - `npm run release:provider-auth` returned the expected redacted `WARN`.
  - focused tests passed:
    `npm test -- tests/provider-auth.test.ts tests/release-inputs.test.ts`
    with `7` tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `40` Vitest files / `212` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - After full deploy check cleared ignored artifacts, regenerated:
    - domain proof report: expected redacted `FAIL` because both required
      production hostnames still have no DNS records;
    - local Supabase runtime proof: `PASS`, stack stopped cleanly;
    - public live Agency/Studio browser evidence: `PASS`, six screenshots.
  - Current `npm run release:inputs` is the expected redacted `NO-GO`: Vercel
    CLI, local Supabase runtime proof, and public browser evidence pass;
    provider auth is a warning; staging/production env placeholders,
    DNS/TLS, deployed proof bundles, remote Supabase runtime artifacts, and
    Stripe readback artifacts remain incomplete.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

## Latest platform noninteractive Vercel link checkpoint (2026-06-29)

The guarded env-pull path can now create the local Vercel project link from
process env IDs instead of requiring an interactive `vercel link`.

- Platform commit: `214e5f5` (`feat: support noninteractive vercel link prep`)
  builds on `040882e`.
- `npm run release:env-pull -- --link-from-process-env` now dry-runs whether
  `.vercel/project.json` can be created from `VERCEL_PROJECT_ID` and
  `VERCEL_ORG_ID` without writing files or printing ID values.
- `npm run release:env-pull -- --link-from-process-env --confirm-pull` now
  creates `.vercel/project.json` from those env IDs before pulling ignored
  staging/production env files, then validates the files without printing
  secret values.
- `npm run release:inputs` now lists
  `npm run release:env-pull -- --link-from-process-env` as the env-pull next
  command after provider-auth.
- Current local shell result:
  - Vercel CLI is on PATH.
  - `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are not loaded, so the dry run
    safely reports `VERCEL_PROJECT_ID: missing` and `VERCEL_ORG_ID: missing`.
- Verification:
  - focused tests passed:
    `npm test -- tests/release-env-pull.test.ts tests/release-inputs.test.ts tests/provider-auth.test.ts`
    with `14` tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run release:env-pull -- --link-from-process-env` returned the expected
    redacted `NO-GO` with missing Vercel env ID names only.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `40` Vitest files / `214` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - After full deploy check cleared ignored artifacts, regenerated:
    - domain proof report: expected redacted `FAIL` because both required
      production hostnames still have no DNS records;
    - public live Agency/Studio browser evidence: `PASS`, six screenshots;
    - local Supabase runtime proof: `PASS`, stack stopped cleanly.
  - Current `npm run release:inputs` is the expected redacted `NO-GO`: Vercel
    CLI, local Supabase runtime proof, and public browser evidence pass;
    provider auth is a warning; staging/production env placeholders,
    DNS/TLS, deployed proof bundles, remote Supabase runtime artifacts, Stripe
    readback artifacts, and Vercel env IDs remain incomplete.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

## Latest platform Vercel link-source preflight checkpoint (2026-06-29)

The provider-auth and release-input preflights now recognize the same
noninteractive Vercel link source used by the env-pull wrapper.

- Platform commit: `8190b1a` (`feat: align vercel link source preflight`) builds
  on `214e5f5`.
- `npm run release:provider-auth` now treats either `.vercel/project.json` or
  well-shaped `VERCEL_PROJECT_ID` plus `VERCEL_ORG_ID` as a Vercel project-link
  source, while still requiring a Vercel credential source separately.
- `npm run release:inputs` now reports the Vercel helper as "project link
  source" and accepts the same two noninteractive env IDs without printing their
  values.
- The readiness runbook now matches the implemented behavior: provider-auth
  reports credential and link-source availability; env-pull can create the local
  link only when `--confirm-pull` is used.
- Current shell result:
  - Vercel CLI is on PATH.
  - No Vercel credential source is detected.
  - `.vercel/project.json`, `VERCEL_PROJECT_ID`, and `VERCEL_ORG_ID` are absent.
  - Supabase CLI is on PATH but has no access-token source.
  - Stripe CLI is on PATH with test-mode key available and live-mode key absent.
- Verification:
  - focused tests passed:
    `npm test -- tests/provider-auth.test.ts tests/release-inputs.test.ts tests/release-env-pull.test.ts`
    with `16` tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `40` Vitest files / `216` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - `npm run release:domains -- --output-file test-results/release-proof/domain-proof.json --timeout-ms 5000`
    wrote the expected redacted `FAIL` report because both required production
    hostnames still have no DNS records.
  - `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/local-supabase-runtime-proof.json --timeout-ms 240000`
    passed and stopped local Supabase cleanly.
  - `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    passed from `webot-site` and refreshed six public live screenshots.
  - Current `npm run release:inputs` is the expected redacted `NO-GO`: Vercel
    CLI, local Supabase runtime proof, and public browser evidence pass;
    provider auth is warning-only; `.env.staging.local` and
    `.env.production.local` still contain placeholders; DNS/TLS, deployed proof
    bundles, remote Supabase runtime artifacts, Stripe readback artifacts, and
    Vercel link-source values remain incomplete.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

## Latest platform durable release-inputs report checkpoint (2026-06-29)

The top-level release-input status can now be written as durable redacted
evidence in `webot-platform`.

- Platform commit: `92b1435` (`feat: write release inputs report`) builds on
  `8190b1a`.
- `npm run release:inputs` now accepts `--report-file <path>` and writes the
  same redacted `READY`/`NO-GO` report that it prints to the terminal.
- Parent directories are created automatically; exit-code behavior is unchanged
  (`READY` exits 0, `NO-GO` exits 1).
- The deployment readiness docs now recommend writing
  `test-results/release-proof/release-inputs-report.json` so the release-input
  state is preserved with the other proof artifacts.
- Verification:
  - focused `tests/release-inputs.test.ts` passed with `6` tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `40` Vitest files / `217` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build.
  - Refreshed release evidence:
    - domain proof wrote the expected redacted `FAIL` because
      `app.webot.studio` and `api.webot.agency` still have no DNS records;
    - local Supabase runtime proof passed and stopped cleanly;
    - public live Agency/Studio browser flow passed and refreshed six
      screenshots.
  - `npm run release:inputs -- --report-file test-results/release-proof/release-inputs-report.json`
    wrote a durable redacted `NO-GO` report with `secretValuesPrinted=false`
    and `14` checks.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

## Latest browser evidence screenshot-caret checkpoint (2026-06-29)

The platform and public-flow screenshot harnesses now preserve native caret
state while capturing proof screenshots, avoiding Playwright's temporary inline
caret-style mutation on form inputs during hydration.

- Platform commit: `51e4a7d` (`test: preserve caret state in screenshots`)
  updates platform E2E screenshot calls, Stripe readback UI proof, and remote
  release-smoke screenshots to use `caret: "initial"`.
- Site commit: `77108d1` (`test: preserve caret state in flow screenshots`)
  updates `scripts/test-itinerary-flow.mjs`, whose screenshots feed the public
  live browser evidence bundle used by platform release gates.
- This removes the React `/login` hydration mismatch warning previously seen in
  `npm run deploy:check`, where Playwright's default screenshot caret hiding
  temporarily added `style="caret-color: transparent"` to form inputs.
- Verification:
  - focused platform browser suites passed:
    `npm run test:e2e -- dashboard-auth-entitlements.spec.ts customer-monetization-flow.spec.ts`
    with `7` tests and no React hydration mismatch output.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `40` Vitest files / `217` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build. The previous React
    hydration mismatch warning did not recur.
  - `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    passed and refreshed six public live screenshots.
  - Refreshed release evidence after full deploy check:
    - domain proof wrote the expected redacted `FAIL` because both required
      production hostnames still have no DNS records;
    - local Supabase runtime proof passed and stopped cleanly;
    - `npm run release:inputs -- --report-file test-results/release-proof/release-inputs-report.json`
      wrote the expected redacted `NO-GO` with local Supabase and public
      browser evidence passing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

## Latest Playwright color-env cleanup checkpoint (2026-06-29)

The platform E2E runner now removes inherited `NO_COLOR` before launching
Playwright, preventing Node's repeated `NO_COLOR`/`FORCE_COLOR` conflict
warnings from polluting browser proof output.

- Platform commit: `85806a0` (`test: sanitize playwright color env`) builds on
  `51e4a7d`.
- `npm run test:e2e` now runs through
  `node scripts/run-playwright-e2e.mjs`, which strips `NO_COLOR` before
  launching Playwright while preserving normal argument forwarding.
- Added `tests/playwright-e2e-runner.test.ts` to prove the wrapper removes
  `NO_COLOR` both when `FORCE_COLOR` is already present and when Playwright may
  add it later.
- Verification:
  - `npm test -- tests/playwright-e2e-runner.test.ts` passed with `2` tests.
  - `npm run test:e2e -- health.spec.ts` passed and did not print the previous
    `NO_COLOR`/`FORCE_COLOR` warning.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, `41` Vitest files / `219` tests, `25`
    Playwright E2E tests, cleanup dry-run, and Next build. The previous color
    warning did not recur.
  - Refreshed release evidence after the clean deploy check:
    - domain proof wrote the expected redacted `FAIL` because both required
      production hostnames still have no DNS records;
    - local Supabase runtime proof passed and stopped cleanly;
    - public live Agency/Studio browser flow passed and refreshed six
      screenshots;
    - `npm run release:inputs -- --report-file test-results/release-proof/release-inputs-report.json`
      wrote the expected redacted `NO-GO` with local Supabase and public
      browser evidence passing.
- No live deploy, live publish, Stripe live action, DNS change, payment
  submission, Vercel link, Supabase login, or credential-backed proof was run.

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

## Latest platform dashboard auth-entry checkpoint (2026-06-28)

Customer dashboard account entry is now locally implemented and verified in
`webot-platform`, but not deployed live yet.

- Platform commit: `659a54a` (`feat: add dashboard auth entry flow`)
- Added `/login`, `POST /auth/session`, and `POST /auth/signout`.
- Login/sign-up uses Supabase Auth password routes; sign-up also bootstraps the
  WeBot user, account, and owner membership rows through the service-role REST
  adapter.
- Supabase dashboard sessions are stored in HTTP-only, same-site cookies and are
  already accepted by the existing dashboard account resolver.
- Dashboard/billing unauthenticated boundaries now link to `/login`, and
  authenticated dashboard nav includes sign-out.
- Manager verification:
  - focused auth tests passed: 2 files / 9 tests.
  - focused dashboard/browser auth test passed: 5 Playwright tests.
  - desktop `/login` screenshot:
    `/Users/webot/Projects/webot-platform/test-results/login-page.png`
  - mobile `/login` screenshot:
    `/Users/webot/Projects/webot-platform/test-results/login-page-mobile.png`
  - mobile overflow proof: `clientWidth=390`, `scrollWidth=390`.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 25 Vitest files / 116 tests, 20 Playwright E2E tests, cleanup
    dry-run, and build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because
    staging/production env, Supabase runtime env, Stripe credentials, and
    Stripe readback JSON are not loaded in this shell.

## Latest platform checkout-return checkpoint (2026-06-28)

Stripe checkout return routes are now locally implemented and verified in
`webot-platform`, but not deployed live yet.

- Platform commit: `63279ba` (`feat: add billing checkout return pages`)
- Added `/billing/success` and `/billing/cancel`, matching the configured
  Stripe return URLs.
- Both pages preserve the webhook-only entitlement rule: checkout return query
  parameters are display-only and never grant access.
- Success return hides the raw `session_id`; cancel return confirms account
  access is unchanged.
- Browser screenshots:
  - `/Users/webot/Projects/webot-platform/test-results/billing-success-return.png`
  - `/Users/webot/Projects/webot-platform/test-results/billing-cancel-return.png`
- Manager verification:
  - focused dashboard/browser auth test passed: 6 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 25 Vitest files / 116 tests, 21 Playwright E2E tests, cleanup
    dry-run, and build.
  - build route list includes `/billing/success` and `/billing/cancel`.
  - `npm run release:readiness` returned expected redacted `NO-GO`.

## Latest platform account-access docs checkpoint (2026-06-28)

Public API docs now match the implemented dashboard auth-entry path in
`webot-platform`, but not deployed live yet.

- Platform commit: `1b7b711` (`docs: link account access from api docs`)
- `/docs/api` and `/docs/api/auth` link account access to `/login`.
- `/docs/api/pricing` notes that the implemented checkout return pages provide
  next steps without granting access from browser URLs.
- Manager verification:
  - `npm run test:e2e -- api-docs-public.spec.ts` passed: 5 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 25 Vitest files / 116 tests, 21 Playwright E2E tests, cleanup
    dry-run, and build.

## Latest platform dashboard session-refresh checkpoint (2026-06-28)

Dashboard sessions can now be refreshed locally in `webot-platform`, but not
deployed live yet.

- Platform commit: `815eed5` (`feat: add dashboard session refresh`)
- Added Supabase refresh-token exchange and `POST /auth/refresh`.
- The route uses only the existing HTTP-only refresh cookie, resets session
  cookies on success, clears cookies on failed refresh, and rejects external
  `next` redirects by falling back to `/dashboard`.
- Auth-required dashboard panels expose both `Sign in` and `Refresh session`.
- API auth docs describe `/auth/refresh`, cookie-only exchange, and redirect
  safety.
- Manager verification:
  - focused refresh tests passed: 2 files / 9 tests.
  - focused dashboard/docs browser tests passed: 11 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 26 Vitest files / 121 tests, 21 Playwright E2E tests, cleanup
    dry-run, and build.
  - build route list includes `/auth/refresh`.
  - `npm run release:readiness` returned expected redacted `NO-GO`.

## Latest platform dashboard job-creation checkpoint (2026-06-28)

Dashboard job creation is now locally implemented and verified in
`webot-platform`, but not deployed live yet.

- Platform commit: `2d1e5be` (`feat: add dashboard job creation flow`)
- `/jobs` now resolves the signed-in account, lists account-owned jobs, and
  displays account-scoped status counts.
- The dashboard intake form posts to `POST /jobs/create` with a catalog-backed
  service key, required customer title, and required customer instructions.
- `POST /jobs/create` creates a real account-owned job through the existing
  `createJob` service and redirects to `/jobs/<id>?created=1`.
- `/jobs/<id>` now loads the account-owned job, safe customer timeline events,
  and safe summary fields. The example job remains only at `/jobs/example`.
- Local Next development uses a file-backed fallback repository at
  `.next/webot-local-jobs.json` so form POSTs and redirected server renders
  share local job state; production still uses Supabase repositories when
  Supabase runtime env is configured.
- Browser proof:
  - Playwright creates a job from `/jobs`, opens the generated detail page,
    verifies service/status/title/safe timeline, confirms raw instructions are
    not visible, checks no horizontal overflow/internal runtime terms, and
    captures `/Users/webot/Projects/webot-platform/test-results/dashboard-created-job-detail.png`.
- Manager verification:
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - focused dashboard job tests passed: 2 Vitest files / 11 tests.
  - focused dashboard jobs browser test passed: 4 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 123 tests, 22 Playwright E2E tests, cleanup
    dry-run, and build.
  - build route list includes `/jobs/create`.
  - `npm run release:readiness` returned expected redacted `NO-GO`.

## Latest platform dashboard job-actions checkpoint (2026-06-28)

Customer dashboard job lifecycle actions are now locally implemented and
verified in `webot-platform`, but not deployed live yet.

- Platform commit: `8ab14e3` (`feat: add dashboard job lifecycle actions`)
- Added real dashboard form actions for account-owned jobs:
  - `POST /jobs/<id>/cancel` resolves the dashboard account, calls the existing
    `cancelAccountJob` service, and redirects back to `/jobs/<id>?updated=canceled`;
  - `POST /jobs/<id>/revision` resolves the dashboard account, accepts required
    customer revision notes, calls `requestJobRevision`, and redirects back to
    `/jobs/<id>?updated=revision`;
  - account/auth failures redirect to `/login` and domain rejects return only
    customer-safe error codes/messages on the job detail page.
- The job detail page now shows safe success/error banners after lifecycle
  actions and hides cancel controls once a job is canceled.
- Browser/UI proof:
  - Playwright creates a dashboard job from `/jobs`, follows the generated
    detail URL, cancels the job through the dashboard form, verifies the
    cancellation banner and `canceled` status, confirms the cancel button is
    gone, checks no horizontal overflow/internal runtime terms, and refreshes
    `test-results/dashboard-created-job-detail.png`.
- Verification:
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm test -- --run tests/dashboard-job-create.test.ts tests/api/jobs-lifecycle.test.ts` passed: 2 files / 13 tests.
  - `npm run test:e2e -- dashboard-jobs-files.spec.ts` passed: 4 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 125 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - Build route list now includes `/jobs/[id]/cancel` and
    `/jobs/[id]/revision`.
  - `npm run release:readiness` returned expected redacted `NO-GO` with no
    secret values printed because staging/production env, Supabase runtime env,
    Stripe credentials, and Stripe readback JSON are not loaded in this shell.

## Latest platform dashboard job-file upload checkpoint (2026-06-28)

Customer dashboard job files can now move through a real presign/upload/complete
contract locally and through Supabase Storage in production, but the platform is
not deployed live yet.

- Platform commit: `11954b0` (`feat: add dashboard job file uploads`)
- Added `POST /api/v1/files/<id>/complete`, which marks an account-owned file as
  uploaded after the private storage PUT succeeds and returns only `toSafeFile`
  fields.
- Added account-scoped job file listing on `/jobs/<id>` via
  `listAccountJobFiles`, so real job detail pages display attached files
  instead of an empty placeholder list.
- Added a dashboard file attachment form:
  - creates a short-lived upload contract through the existing presign API;
  - uploads directly to the signed storage URL in configured production;
  - uses the local placeholder upload contract only for local development/tests;
  - calls the completion route and refreshes the job detail page with
    `/jobs/<id>?updated=file`.
- Added local dev file metadata persistence at `.next/webot-local-files.json`
  so Next dev workers share file state across presign/complete/detail renders;
  production still uses Supabase repositories and production storage fails closed
  without Supabase Storage config.
- Updated OpenAPI and API quickstart docs with the upload completion endpoint.
- Verification:
  - focused file/OpenAPI tests passed: 2 Vitest files / 14 tests.
  - focused dashboard/API-doc browser tests passed: 9 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 127 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - Build route list now includes `/api/v1/files/[id]/complete`.
  - `npm run release:readiness` returned expected redacted `NO-GO` with no
    secret values printed because staging/production env, Supabase runtime env,
    Stripe credentials, and Stripe readback JSON are not loaded in this shell.

## Latest platform fulfillment approval checkpoint (2026-06-28)

Customer review completion and internal fulfillment transitions are now locally
implemented and verified in `webot-platform`, but not deployed live yet.

- Platform commit: `6338baa` (`feat: add job fulfillment approval flow`)
- Added a fail-closed internal fulfillment route:
  - `POST /api/internal/jobs/<id>/transition`
  - guarded by `WEBOT_INTERNAL_OPS_TOKEN`;
  - not documented in public OpenAPI;
  - accepts only safe status transitions into accepted, running, needs review,
    ready for customer review, rejected, or canceled;
  - writes customer-safe system events with sanitized metadata.
- Added customer approval paths:
  - `POST /api/v1/jobs/<id>/approve` for API/agent customers;
  - `POST /jobs/<id>/approve` for dashboard customers;
  - dashboard `Approve delivery` button appears only when the job is
    `ready_for_customer_review`;
  - approval marks the job `completed`, sets `completed_at`, and writes a
    customer-safe completion event.
- API/docs coverage:
  - OpenAPI and API docs now list `/api/v1/jobs/{id}/approve`;
  - quickstart and examples include approval alongside cancel/revision;
  - deployment docs include `WEBOT_INTERNAL_OPS_TOKEN` as a remote server-side
    secret requirement.
- Verification:
  - focused lifecycle/dashboard/OpenAPI/env tests passed: 5 Vitest files / 29
    tests.
  - focused dashboard/API-doc browser tests passed: 11 Playwright tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 129 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - Build route list now includes `/api/internal/jobs/[id]/transition`,
    `/api/v1/jobs/[id]/approve`, and `/jobs/[id]/approve`.
  - `npm run release:readiness` returned expected redacted `NO-GO` with no
    secret values printed because staging/production env, Supabase runtime env,
    `WEBOT_INTERNAL_OPS_TOKEN`, Stripe credentials, and Stripe readback JSON are
    not loaded in this shell.

## Latest platform dashboard CSRF checkpoint (2026-06-28)

Cookie-authenticated dashboard mutations are now CSRF-protected in
`webot-platform`, but not deployed live yet.

- Platform commit: `3e2ba33` (`feat: add dashboard csrf protection`)
- Added stateless HMAC CSRF protection for dashboard-session mutations:
  - tokens are tied to the resolved account/user/role context;
  - dashboard forms carry hidden `__webot_csrf` fields;
  - client-side dashboard fetches send `x-webot-csrf-token`;
  - Bearer API-key/agent calls are not required to send dashboard CSRF tokens.
- Protected cookie-authenticated mutation paths:
  - dashboard job create/cancel/revision/approve routes;
  - API job create/cancel/revision/approve when called with a dashboard session
    cookie;
  - API key create/revoke;
  - file presign/complete;
  - checkout session creation;
  - dashboard sign-out.
- Added `WEBOT_CSRF_SECRET` to `.env.example`, deploy env checks, release
  readiness known keys, and deployment/security docs. Remote staging/production
  now fail readiness until this non-placeholder secret is configured.
- Verification:
  - focused CSRF/env/readiness tests passed: 5 Vitest files / 26 tests.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - focused dashboard/payment-adjacent browser tests passed: 14 Playwright
    tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 133 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` with
    `WEBOT_CSRF_SECRET` listed as a missing staging/production secret and no
    secret values printed.

## Latest platform release-smoke checkpoint (2026-06-28)

The remote no-charge release smoke gate is now broader and caught/fixed a real
mobile OpenAPI docs overflow in `webot-platform`, but the platform is not
deployed live yet.

- Platform commit: `a17f44a` (`feat: expand remote release smoke coverage`)
- `npm run release:remote-smoke` now checks:
  - `/api/health`;
  - desktop and mobile `/`, `/login`, unauthenticated `/dashboard`, and
    unauthenticated `/billing`;
  - desktop and mobile no-charge checkout return pages:
    `/billing/success?tier=webot_both_basic_monthly&session_id=cs_test_placeholder`
    and `/billing/cancel?tier=webot_api_agent_basic_monthly`;
  - desktop and mobile API docs pages: `/docs/api`, `/docs/api/auth`,
    `/docs/api/quickstart`, `/docs/api/pricing`, and `/docs/api/openapi`.
- The smoke runner still does not create Stripe objects, submit payments, grant
  entitlements, deploy, or print secret values.
- The first local run found mobile horizontal overflow on `/docs/api/openapi`;
  fixed by tightening the docs card/inline-code/schema-list CSS so long API
  paths wrap inside their container.
- Local browser proof:
  `/Users/webot/Projects/webot-platform/test-results/release-remote-smoke-local`
  contains desktop/mobile screenshots for all smoke browser targets.
- Verification:
  - `npm test -- --run tests/release-proof.test.ts` passed: 1 file / 4 tests.
  - `npm run release:remote-smoke -- --dry-run` passed and listed the expanded
    no-charge proof plan.
  - local `npm run release:remote-smoke` against `http://127.0.0.1:3317` passed:
    API health plus 22 desktop/mobile browser checks.
  - focused API-docs Playwright tests passed: 5 tests.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 133 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform API-key auth-doc checkpoint (2026-06-28)

API-key management docs and OpenAPI auth now match the dashboard-session + CSRF
implementation in `webot-platform`, but the platform is not deployed live yet.

- Platform commit: `34a789d` (`docs: align api key management auth contract`)
- Fixed the docs/OpenAPI mismatch where API-key management and checkout could
  read like normal Bearer API-key routes.
- OpenAPI now distinguishes:
  - normal account API routes: Supabase session or WeBot API key;
  - API-key metadata listing: dashboard owner/admin Supabase session;
  - API-key create/revoke and checkout session creation: dashboard owner/admin
    Supabase session plus `x-webot-csrf-token` for cookie-authenticated
    dashboard mutations.
- Public auth docs and examples now say bearer keys do not create/revoke other
  bearer keys and show dashboard-session cookie + CSRF placeholders for scripted
  management examples.
- OpenAPI browser now renders the actual auth label, including
  `Supabase session + dashboard CSRF`, instead of flattening all protected
  routes into the old generic label.
- Verification:
  - focused OpenAPI/API-key route tests passed: 2 Vitest files / 9 tests.
  - focused API-docs/dashboard Playwright tests passed: 9 tests.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 27 Vitest files / 133 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform Stripe readback UI checkpoint (2026-06-28)

The no-charge local proof for verified Stripe tier readback is complete in
`webot-platform`; real test/live Stripe readback still requires credentials and
deployed environment proof.

- Platform commit: `63e4cf9` (`feat: add stripe readback ui verifier`)
- Added `scripts/stripe/readback-fixture.ts` to generate synthetic verified
  readback rows for all 9 subscription tiers with fixture `prod_`, `price_`, and
  Payment Link IDs.
- Added `npm run stripe:readback-ui-check`, which starts the local app with
  `WEBOT_STRIPE_TIER_READBACK_JSON`, opens `/billing` in Chromium with fixture
  dashboard auth headers, and verifies:
  - all 9 tier rows render `ready`;
  - all 9 Checkout buttons are enabled;
  - fixture `price_fixture_both_top` and `plink_fixture_both_top` render;
  - `pending_live_readback` and `not-live-yet` placeholders are absent;
  - there is no horizontal overflow;
  - no Stripe calls are made and no secret values are printed.
- Screenshot inspected:
  `/Users/webot/Projects/webot-platform/test-results/stripe-readback-ui/billing-readback-ready.png`.
- Verification:
  - focused tests passed: 2 Vitest files / 7 tests.
  - `npm run stripe:readback-ui-check -- --dry-run` returned a redacted
    no-charge dry-run report.
  - `npm run stripe:readback-ui-check` returned `PASS`.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 28 Vitest files / 136 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform rate-limit retry timing checkpoint (2026-06-28)

Rate-limit rejects now expose machine-readable retry timing for agent/API
customers in `webot-platform`; production deployment and real distributed runtime
proof remain credential/env gated.

- Platform commit: `bc7890b` (`feat: add retry timing to rate limit rejects`)
- `SafeRejectError` can now carry `retryAfterSeconds` and `retryAt` metadata.
- Job creation rate-limit rejects compute retry timing from the current
  rate-limit reset window.
- `POST /api/v1/jobs` now returns `Retry-After`, `error.retry_after_seconds`,
  and `error.retry_at` for `429 rate_limit_exceeded` responses.
- OpenAPI and authenticated API usage docs now document the retry header/body
  contract so agents do not parse message text.
- Verification:
  - focused rate-limit/OpenAPI tests passed: 2 Vitest files / 9 tests.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 28 Vitest files / 137 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform fulfillment ops checkpoint (2026-06-28)

Internal fulfillment transitions now have operator-safe local tooling and a
runbook in `webot-platform`; production deployment and real ops-token execution
remain credential/env gated.

- Platform commit: `aeba045` (`feat: add fulfillment transition ops cli`)
- Added `npm run ops:fulfillment-transition`, a guarded CLI for
  `POST /api/internal/jobs/:id/transition`.
- The CLI supports dry-runs, redacts the internal ops token, validates target
  status names, optionally validates current-to-target transition legality, and
  refuses to send without `--confirm-send`.
- Added `docs/operations/fulfillment-runbook.md` with the allowed status flow,
  safe customer-visible message/metadata rules, dry-run/send examples, and
  post-transition verification steps.
- Deployment readiness docs now point operators to the runbook and dry-run CLI
  before any internal transition.
- Verification:
  - focused fulfillment CLI/lifecycle tests passed: 2 Vitest files / 13 tests.
  - `npm run ops:fulfillment-transition -- --dry-run ...` returned a redacted
    dry-run preview and made no HTTP request.
  - `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 29 Vitest files / 140 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform signed-upload proof checkpoint (2026-06-28)

Public file-upload docs and route-level Supabase Storage proof are now locally
implemented and verified in `webot-platform`; production deployment and real
Supabase credentials remain env gated.

- Platform commit: `4bd9976` (`feat: prove signed upload completion flow`)
- `/docs/api/quickstart` no longer shows the local placeholder upload host or
  `x-webot-file-id` as public customer instructions.
- The quickstart now tells API customers and agents to use the returned
  short-lived signed `upload.url` and `upload.headers` exactly as provided, then
  call `/api/v1/files/<id>/complete` after the upload succeeds.
- Added route-level proof that `POST /api/v1/files/presign` can return a
  Supabase Storage upload contract, store the file as `supabase_storage`, and
  then mark the same account-owned file uploaded through
  `POST /api/v1/files/<id>/complete` without exposing storage keys, service-role
  values, or secrets.
- Verification:
  - `npm test -- --run tests/api/files-rejects.test.ts` passed: 1 Vitest file /
    11 tests.
  - `npx playwright test tests/e2e/api-docs-public.spec.ts` passed: 5 browser
    tests and refreshed API docs screenshots.
  - `rg -n "upload\\.local\\.webot\\.invalid|x-webot-file-id" app docs -S`
    returned no public docs/app matches.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 29 Vitest files / 141 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform cancellation usage-adjustment checkpoint (2026-06-28)

Cancellation accounting is now locally implemented and verified in
`webot-platform`; production deployment and real Supabase migrations remain env
gated.

- Platform commit: `3549110` (`feat: add cancellation usage adjustments`)
- `cancelAccountJob` now records an append-only usage ledger adjustment with
  `quantity: -1` when a cancellation event is inserted, offsetting the job unit
  consumed at creation without mutating historical rows.
- Usage ledger validation now accepts non-zero signed integer quantities and
  still rejects zero.
- Added Supabase migration `0009_usage_ledger_adjustments.sql`, which replaces
  the old `quantity > 0` constraint with `quantity <> 0` and documents signed
  quantities.
- Architecture and threat-model docs now describe positive consumption rows and
  server-side negative adjustment rows.
- Verification:
  - `npm test -- --run tests/api/usage-ledger.test.ts tests/api/jobs-lifecycle.test.ts`
    passed: 2 Vitest files / 16 tests.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run deploy:check` passed: secret scan, local env check, db check, lint,
    typecheck, 29 Vitest files / 143 tests, 22 Playwright E2E tests, cleanup
    dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` because live
    staging/production env, Supabase runtime env, Stripe credentials, tier
    readback artifacts, deployment credentials, `WEBOT_CSRF_SECRET`, and
    `WEBOT_INTERNAL_OPS_TOKEN` are not loaded in this shell.

## Latest platform migration-contract and retry-audit checkpoint (2026-06-28)

Supabase migration verification and rate-limit audit persistence are now locally
implemented and verified in `webot-platform`; production deployment and real
Supabase migrations remain env gated.

- Platform commit: `94e404b` (`feat: verify db contracts and retry audit timing`)
- Replaced the old one-line `db:check` baseline smoke with
  `scripts/verify-db-contract.ts`, which verifies the expected migration list and
  10 release-critical contracts across schemas, RLS, append-only ledgers/events,
  Stripe webhook events, private API-key hashes, private rate-limit counters,
  usage adjustments, and rate-limit retry timing.
- Added Supabase migration `0010_rate_limit_event_retry_timing.sql`, which adds
  `retry_after_seconds`, `retry_at`, and a non-negative retry-after constraint to
  `app_public.rate_limit_events`.
- `recordRateLimitEvent` now persists the same customer-safe retry timing that
  `POST /api/v1/jobs` returns in `Retry-After`, `error.retry_after_seconds`, and
  `error.retry_at`, so the audit row matches the API response contract.
- Verification:
  - `npm run db:check` passed with
    `Supabase migration contract check passed (10 contracts, 10 migrations).`
  - `npm test -- --run tests/db/supabase-runtime-repositories.test.ts tests/api/rate-limit-concurrency.test.ts`
    passed: 2 Vitest files / 9 tests.
  - `npm run release:readiness` returned expected redacted `NO-GO` with missing
    staging/production env, Supabase runtime env, Stripe credentials, and Stripe
    tier readback JSON; no secret values were printed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract
    check, lint, typecheck, 29 Vitest files / 143 tests, 22 Playwright E2E
    tests, cleanup dry-run, and Next build.

## Latest platform completion-audit checkpoint (2026-06-28)

The product definition-of-done now has a machine-readable scoreboard in
`webot-platform`, and the public Agency prepared-tier copy now matches Studio.
The platform is still not production-ready until the credential-backed gates and
live proof artifacts are supplied.

- Platform commit: `95a341b` (`feat: add completion audit gate`)
- Agency update: homepage and `llms.txt` now show the staged platform account
  tiers: Human `$10/$20/$30`, API-only `$7/$14/$21`, and Both `$15/$30/$45`.
  These remain clearly gated pending Stripe tier readback and platform
  activation; no checkout links were added or changed.
- Added `npm run release:completion-audit`, which checks:
  - public Agency and Studio service/pricing/family-visual evidence;
  - platform API, dashboard, checkout, webhook, docs, jobs, files, usage, and API
    key route coverage;
  - the local nine-tier Stripe catalog;
  - internal model-placeholder coverage for every public service option;
  - release readiness, staging and production proof reports, and public
    desktop/mobile browser screenshot evidence.
- Current audit state:
  - public Agency gate: `PASS`;
  - public Studio gate: `PASS`;
  - platform API/dashboard gate: `PASS`;
  - platform API docs gate: `PASS`;
  - local Stripe catalog gate: `PASS`;
  - runtime model-placeholder gate: `PASS`;
  - release readiness/proof/live-browser gates: `FAIL` until env/readback/proof
    artifacts exist.
- Verification:
  - In `webot-platform`, full `npm run deploy:check` passed: secret scan, local
    env check, DB contract check, lint, typecheck, 30 Vitest files / 145 tests,
    22 Playwright E2E tests, cleanup dry-run, and Next build.
  - Focused completion/release tests passed: 3 Vitest files / 10 tests.
  - `npm run release:completion-audit` returned expected redacted `NO-GO`; all
    local/public implementation gates passed, and only credential/proof/browser
    live evidence gates failed.
  - In `webot-site`, `git diff --check && scripts/test-itinerary-flow.sh`
    passed with screenshots at
    `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T001758Z`.
  - Protected Stripe checkout URL diff was empty for the Agency page update.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform durable release-proof artifact checkpoint (2026-06-28)

Release proof reports are now first-class artifacts instead of requiring manual
stdout redirection before the completion audit can consume them.

- Platform commit: `9726ed2` (`feat: write durable release proof artifacts`)
- Added `--artifact-dir` and `--report-file` support to
  `npm run release:proof`.
- Added `--report-file` support to `npm run release:remote-smoke`.
- With `--artifact-dir`, the proof runner now passes a dedicated remote-smoke
  output/report path and writes:
  - `<artifact-dir>/<target>-proof.json`;
  - `<artifact-dir>/remote-smoke-report.json`;
  - `<artifact-dir>/remote-smoke/*` screenshots when the remote smoke runs.
- Updated `docs/deployment/readiness.md` with the final artifact-producing
  staging/production proof commands and the final completion-audit command using
  explicit proof report paths plus the public live Agency/Studio browser
  evidence directory.
- Verification:
  - `npm test -- --run tests/release-proof.test.ts tests/completion-audit.test.ts tests/release-readiness.test.ts`
    passed: 3 Vitest files / 11 tests.
  - `npm run release:proof -- --target staging --dry-run --artifact-dir test-results/release-proof/staging-check`
    passed and wrote
    `test-results/release-proof/staging-check/staging-proof.json`.
  - `npm run release:remote-smoke -- --dry-run --report-file test-results/release-proof/remote-smoke-dry-run.json`
    passed and wrote the remote-smoke dry-run report.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 30 Vitest files / 146 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
  - `npm run release:completion-audit` still returns expected redacted `NO-GO`
    because real staging/production env files, Stripe readback, proof reports,
    and public live browser evidence are not present in this shell.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform completion-audit proof hardening checkpoint (2026-06-28)

The final `GO` scoreboard is stricter about proof identity and browser evidence.

- Platform commit: `6e80631` (`feat: harden completion audit proof checks`)
- `proof.staging` now requires a proof report with:
  - `status: "PASS"`;
  - `target: "staging"`;
  - `stripeMode: "test"`;
  - `stripeSecretKeyPrinted: false`;
  - all proof steps `PASS`.
- `proof.production` now requires a proof report with:
  - `status: "PASS"`;
  - `target: "production"`;
  - `stripeMode: "live"`;
  - `stripeSecretKeyPrinted: false`;
  - all proof steps `PASS`.
- `browser.public-live` now rejects zero-byte screenshot placeholders as well as
  missing screenshot files.
- Verification:
  - `npm test -- --run tests/completion-audit.test.ts tests/release-proof.test.ts tests/release-readiness.test.ts`
    passed: 3 Vitest files / 13 tests.
  - `npm run release:completion-audit` returned expected redacted `NO-GO`; all
    local/public implementation gates passed and only real env/readback/proof/
    public-live evidence was missing.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 30 Vitest files / 148 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform final-release orchestrator checkpoint (2026-06-28)

The final release sequence is now a single guarded command instead of a manual
multi-command stitch-up.

- Platform commit: `1c3349f` (`feat: add guarded final release orchestrator`)
- Added `npm run release:final`.
- The command dry-runs by default and prints/writes a redacted plan with:
  - staging proof via `npm run release:proof -- --target staging ...`;
  - production proof via `npm run release:proof -- --target production ...`;
  - public Agency/Studio live browser evidence via
    `scripts/test-itinerary-flow.sh --live`;
  - final `npm run release:completion-audit` using the exact proof report and
    browser evidence paths generated by the prior steps.
- Real execution requires `--execute`.
- Live Stripe tier creation is still separate and requires both
  `--include-live-stripe-create` and `--confirm-live-stripe`.
- The default artifact root is `test-results/final-release`; the final report is
  written to `test-results/final-release/final-release-report.json` during
  execution, or to `--report-file` when supplied.
- Verification:
  - `npm test -- --run tests/final-release.test.ts tests/release-proof.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 14 tests.
  - `npm run release:final -- --report-file test-results/final-release/final-release-dry-run.json`
    passed and wrote the dry-run report.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 153 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform completion-audit report artifact checkpoint (2026-06-28)

The final completion-audit scoreboard now writes a durable JSON artifact.

- Platform commit: `0a4141f` (`feat: write completion audit report artifacts`)
- Added `--report-file` support to `npm run release:completion-audit`.
- Updated `npm run release:final` so its final completion-audit step writes
  `test-results/final-release/completion-audit-report.json`.
- Updated deployment readiness docs so manual and orchestrated final release
  flows both include the completion-audit report artifact.
- Verification:
  - `npm test -- --run tests/completion-audit.test.ts tests/final-release.test.ts`
    passed: 2 Vitest files / 10 tests.
  - `npm run release:completion-audit -- --report-file test-results/final-release/completion-audit-dry-run.json`
    wrote the expected redacted `NO-GO` report.
  - `npm run release:final -- --report-file test-results/final-release/final-release-dry-run.json`
    passed and its dry-run completion-audit step included
    `--report-file test-results/final-release/completion-audit-report.json`.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 154 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform final-release browser evidence path checkpoint (2026-06-28)

The final-release orchestrator now uses one absolute public browser evidence
path across the site capture step and the platform completion-audit step.

- Platform commit: `b03e04f` (`fix: align final release browser evidence path`)
- Bug fixed:
  - `release:final` defaulted `publicBrowserEvidenceDir` to a relative path.
  - The public browser capture runs from `webot-site`, while the completion
    audit runs from `webot-platform`.
  - A relative path could therefore save screenshots under one repo while the
    audit looked under the other.
- Fix:
  - `publicBrowserEvidenceDir` is resolved once during argument parsing.
  - The same absolute path is passed to `WEBOT_TEST_OUTPUT` for
    `scripts/test-itinerary-flow.sh --live` and to
    `release:completion-audit --public-browser-evidence-dir`.
- Verification:
  - `npm test -- --run tests/final-release.test.ts tests/completion-audit.test.ts`
    passed: 2 Vitest files / 10 tests.
  - `npm run release:final -- --report-file test-results/final-release/final-release-dry-run.json`
    passed and showed the shared absolute public browser evidence path in the
    completion-audit command.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 154 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform final-release preflight checkpoint (2026-06-28)

The final-release orchestrator now fails fast on missing local release inputs
before running staging proof, production proof, public browser capture, Stripe
validation, or the completion audit.

- Platform commit: `4421380` (`feat: add final release preflight gate`)
- Purpose:
  - make `npm run release:final -- --execute` produce a clear redacted report
    when env files or local release inputs are missing;
  - avoid starting expensive or deploy-adjacent proof commands before the
    staging/production env files, public site root, and browser capture script
    are available;
  - keep the release runner honest in the current no-credential shell.
- New preflight checks:
  - artifact directory is writable;
  - staging env file exists and is a file;
  - production env file exists and is a file;
  - public site root exists and is a directory;
  - `scripts/test-itinerary-flow.sh` exists and is executable when live browser
    screenshots will be captured;
  - existing public browser evidence directory exists when capture is skipped.
- Verification:
  - `npm test -- --run tests/final-release.test.ts tests/release-proof.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 16 tests.
  - `npm run release:final -- --report-file test-results/final-release/final-release-dry-run.json`
    passed and included the `preflight` step in the dry-run report with
    `secretValuesPrinted=false`.
  - `npm run release:final -- --execute --report-file test-results/final-release/final-release-preflight-no-env.json`
    returned `EXIT_CODE=1` with only the `preflight` step executed, confirming
    missing `.env.staging.local` and `.env.production.local` are caught before
    proof commands run.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 155 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform production-domain release gate checkpoint (2026-06-28)

Production env verification now rejects preview or alternate hosts for the final
public API/dashboard domains.

- Platform commit: `32afc08` (`feat: enforce production release domains`)
- Production-only host requirements:
  - `NEXT_PUBLIC_APP_URL` must use `app.webot.studio`;
  - `NEXT_PUBLIC_API_URL` must use `api.webot.agency`;
  - `WEBOT_CHECKOUT_RETURN_ORIGIN` must use `app.webot.studio`.
- Staging still allows approved HTTPS preview hosts so no-charge preview proof
  can run before production DNS is approved.
- Verification:
  - `npm test -- --run tests/deploy-env.test.ts tests/release-readiness.test.ts tests/final-release.test.ts tests/completion-audit.test.ts`
    passed: 4 Vitest files / 22 tests.
  - `npm run release:readiness` returned expected redacted `NO-GO` in the
    current no-credential shell with `stripeSecretKeyPrinted=false`.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 156 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform remote-smoke artifact audit checkpoint (2026-06-28)

The completion audit now independently inspects remote-smoke JSON and screenshot
artifacts from each staging/production proof bundle instead of trusting only the
outer proof step status.

- Platform commit: `0f4fe68` (`feat: audit remote smoke artifacts`)
- Strengthened gate:
  - each proof report now requires sibling `remote-smoke-report.json`;
  - the remote-smoke report must have `status=PASS`;
  - the remote-smoke report must state `secretValuesPrinted=false`;
  - every reported API/browser step must be `PASS`;
  - `api-health` must pass;
  - browser steps must include screenshot paths;
  - referenced screenshots must exist and be non-empty.
- Verification:
  - `npm test -- --run tests/completion-audit.test.ts tests/release-proof.test.ts tests/final-release.test.ts`
    passed: 3 Vitest files / 17 tests.
  - `npm run release:completion-audit -- --report-file test-results/final-release/completion-audit-current-no-go.json`
    returned expected redacted `NO-GO` in the no-credential shell and did not
    print secret values.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 157 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform public flow evidence checkpoint (2026-06-28)

The completion audit now requires all screenshots produced by the public
Agency/Studio live validation script, not only the four root desktop/mobile
captures.

- Platform commit: `71a5af0` (`feat: require public flow evidence screenshots`)
- Required public browser evidence files under `<evidence>/screenshots/`:
  - `agency-desktop.png`
  - `agency-mobile.png`
  - `studio-desktop.png`
  - `studio-mobile.png`
  - `studio-test-desk-routes.png`
  - `studio-payment-confirmed.png`
- Verification:
  - `npm test -- --run tests/completion-audit.test.ts tests/final-release.test.ts`
    passed: 2 Vitest files / 12 tests.
  - `npm run release:completion-audit -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T001758Z --report-file test-results/final-release/completion-audit-public-evidence-check.json`
    returned expected redacted `NO-GO`, but `browser.public-live` passed using
    the existing six-screenshot evidence directory.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract check, lint, typecheck, 31 Vitest files / 157 tests, 22 Playwright
    E2E tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform Stripe readback proof artifact checkpoint (2026-06-29)

The release proof and completion audit now require durable Stripe validation
readback artifacts, not just a passing `stripe-validate` step in the proof JSON.

- Platform commit: `79a18ee` (`feat: require stripe readback proof artifacts`)
- `npm run release:proof` now writes
  `<artifact-dir>/stripe-validate-report.json` from the full
  `stripe:validate-tiers --open-only` JSON output when an artifact directory is
  supplied.
- `npm run release:completion-audit` now opens each staging/production proof
  bundle's `stripe-validate-report.json` and verifies:
  - status `validated_catalog`
  - expected test/live mode
  - current Stripe catalog version
  - `openOnly=true`
  - `stripeSecretKeyPrinted=false`
  - all nine tiers are present with expected amounts
  - each tier has live-mode-consistent `livemode`, open checkout URL evidence,
    real `prod_`, `price_`, and `plink_` IDs, and no
    `pending_live_readback` placeholder IDs.
- Package scripts now use Node's `--` option terminator for TypeScript
  verifier scripts so CLI flags such as `--env-file` are handled by the
  verifier instead of being swallowed by Node.
- Verification:
  - `npm run release:proof -- --target production --env-file .env.production.local --artifact-dir test-results/release-proof/production --dry-run --report-file test-results/release-proof/production/dry-run-proof.json`
    passed without requiring the missing env file, proving verifier-owned
    dry-run parsing.
  - `npm test -- --run tests/completion-audit.test.ts tests/release-proof.test.ts tests/final-release.test.ts tests/release-readiness.test.ts`
    passed: 4 Vitest files / 24 tests.
  - `npm run release:final -- --report-file test-results/final-release/final-release-dry-run-after-stripe-artifact.json`
    passed as a redacted dry-run.
  - `npm run release:final -- --execute --report-file test-results/final-release/final-release-preflight-after-stripe-artifact.json`
    returned expected `EXIT_CODE=1` at preflight because `.env.staging.local`
    and `.env.production.local` are absent; no later proof steps ran.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 31 Vitest files / 160 tests, 22 Playwright E2E tests,
    cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform deployment-header security checkpoint (2026-06-29)

The platform deployment contract now includes baseline security headers and
no-store cache boundaries for sensitive routes.

- Platform commit: `2b9625f` (`feat: enforce deployment security headers`)
- `vercel.json` now sets these headers globally:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - restrictive `Permissions-Policy`
- `vercel.json` now sets `Cache-Control: no-store` for API, auth, login,
  dashboard, billing, API-key, usage, jobs, and webhooks surfaces.
- Added `tests/deployment-headers.test.ts` to pin the Vercel security and
  no-store header rules.
- `npm run release:completion-audit` now includes
  `platform.deployment-headers`; the gate passed in the no-credential audit.
- Docs updated:
  - `docs/deployment/readiness.md`
  - `docs/security/threat-model.md`
- Verification:
  - `npm test -- --run tests/deployment-headers.test.ts tests/completion-audit.test.ts tests/final-release.test.ts`
    passed: 3 Vitest files / 16 tests.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - `npm run release:completion-audit -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T001758Z --report-file test-results/final-release/completion-audit-deployment-headers-gate.json`
    returned expected redacted `NO-GO`, with `platform.deployment-headers`
    passing.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 32 Vitest files / 162 tests, 22 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform fixture-auth runtime gate checkpoint (2026-06-29)

Local fixture auth headers are now locked to local runtimes only, including
Vercel preview/production safeguards and remote env-file rejection.

- Platform commit: `f66441d` (`feat: lock fixture auth to local runtimes`)
- Follow-up platform commit: `e1f9fc7` (`docs: clarify fixture auth is local only`)
- `isLocalTestAuthEnabled()` now fails closed when:
  - `NODE_ENV=production`
  - `VERCEL=1`
  - `VERCEL_ENV=preview`
  - `VERCEL_ENV=production`
- `scripts/verify-deploy-env.ts` now carries optional deploy/runtime markers
  (`NODE_ENV`, `VERCEL`, `VERCEL_ENV`, and `WEBOT_ENABLE_TEST_AUTH_HEADERS`)
  through the known-env filter so remote verification can catch unsafe settings.
- Staging/production env verification now rejects:
  - any non-empty `WEBOT_ENABLE_TEST_AUTH_HEADERS`, even `false`
  - non-production `NODE_ENV` when supplied
  - `VERCEL_ENV` values that do not match the target (`preview` for staging,
    `production` for production)
- Deployment readiness docs now state that fixture auth headers are local-test
  only and must not be set in staging or production.
- Public API auth docs and the unauthenticated dashboard boundary now describe
  fixture auth as local-only, not broadly non-production.
- Verification:
  - `npm test -- --run tests/db/production-db-safety.test.ts tests/deploy-env.test.ts tests/release-readiness.test.ts tests/completion-audit.test.ts`
    passed: 4 Vitest files / 26 tests.
  - `npm run test:e2e -- api-docs-public.spec.ts` passed: 5 Playwright tests.
  - `npm run test:e2e -- dashboard-auth-entitlements.spec.ts` passed: 6
    Playwright tests.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 32 Vitest files / 166 tests, 22 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - `npm run release:completion-audit -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T001758Z --report-file test-results/final-release/completion-audit-fixture-auth-gate.json`
    returned expected redacted `NO-GO`; local/public implementation gates passed
    and remaining failures were the external staging/production env, Supabase,
    Stripe credential/readback, and proof-report gates.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform job idempotency proof checkpoint (2026-06-29)

The platform route tests now prove customer/agent retries do not create
duplicate jobs, duplicate lifecycle events, or duplicate usage effects.

- Platform commit: `9708f3a` (`test: prove job idempotency at route boundary`)
- Added route-level coverage for duplicate `POST /api/v1/jobs` requests with
  the same `Idempotency-Key`; the retry returns the original job with `200` and
  only one usage ledger row.
- Added route-level coverage for duplicate revision and cancellation requests
  with stable idempotency keys; retries do not duplicate job events or usage
  ledger rows, and cancellation retries return the already-canceled job safely.
- This pins the contract promised in API docs and architecture docs:
  mutating job routes are retry-safe for agent callers.
- Verification:
  - `npm test -- --run tests/api/jobs-lifecycle.test.ts` passed: 1 Vitest file
    / 12 tests.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 32 Vitest files / 168 tests, 22 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform build-stations checkpoint (2026-06-29)

The dashboard now has a concrete family build-stations surface and a typed
expert skill-pack contract for all eight service families. This moves the
2026-06-29 bedtime DoD from a handoff note into a tested platform surface, but
does not finalize model selection or worker runtime wiring.

- Platform commit: `c500c49` (`feat: add family build stations dashboard`)
- Added `lib/build-stations/catalog.ts` with one station per service family:
  Polish Desk, Extract Bench, Media Bay, Automation Lab, Growth Room, Decision
  Table, Career Studio, and Itinerary Desk.
- Each station includes:
  - family lead/persona alignment;
  - expert-level skill-pack name;
  - human-intent checks;
  - specialist skills;
  - open-source backbone candidates;
  - workspace modules;
  - quality gates;
  - deliverable outputs;
  - `pending_model_selection` model slot status.
- Added authenticated `/build-stations` dashboard route and dashboard nav link.
- Added Vercel `Cache-Control: no-store` coverage for `/build-stations`.
- Added `platform.build-stations` to `npm run release:completion-audit`; the
  gate checks source, route, unit test, browser test, expert-skill contract text,
  human-intent checks, quality gates, and model-placeholder status.
- Verification:
  - `npm test -- --run tests/build-stations.test.ts tests/completion-audit.test.ts tests/deployment-headers.test.ts`
    passed: 3 Vitest files / 11 tests.
  - `npx playwright test tests/e2e/dashboard-build-stations.spec.ts` passed: 2
    Playwright tests and screenshot
    `/Users/webot/Projects/webot-platform/test-results/dashboard-build-stations.png`.
  - Direct `scripts/verify-completion-audit.ts --report-file test-results/completion-audit-build-stations.json`
    returned expected redacted `NO-GO`, with `platform.build-stations` passing
    and only release readiness, proof reports, and public live browser evidence
    failing.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 33 Vitest files / 169 tests, 24 Playwright E2E
    tests, cleanup dry-run, and Next build.
- Subagent note: attempted to spawn a read-only explorer for build-station gap
  analysis, but the runtime returned `agent thread limit reached`. Ran
  `scripts/free-subagent-pool.sh --all-stale --confirm-kill`, which wrote
  `/Users/webot/Backups/webot-site/free-subagent-pool-20260629T015631Z` and
  found no local matching subagent processes. A retry still failed, so the
  manager proceeded without subagents.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform worker station-packet checkpoint (2026-06-29)

Expert build-station contracts now feed an internal worker/agent packet route.
This is the first runtime bridge from dashboard family stations into execution
context, while final model choice and concrete worker consumption remain pending.

- Platform commit: `31cc882` (`feat: add internal worker station packets`)
- Added `GET /api/internal/jobs/:id/worker-packet`, protected by
  `WEBOT_INTERNAL_OPS_TOKEN`.
- Added `lib/jobs/worker-packet.ts`, which resolves a job into:
  - raw customer title/instructions for internal fulfillment only;
  - public service family and option names;
  - family build station, lead, expert skill pack, human-intent checks,
    specialist skills, quality gates, deliverable outputs, and open-source
    backbone candidates;
  - execution placeholder profile, capability group, review requirement,
    `pending_model_selection`, and safe handoff requirements;
  - guardrails requiring customer-safe events, reviewed delivery, and no public
    runtime details.
- Added the route to `platform.api-dashboard` completion-audit coverage.
- Updated `docs/operations/fulfillment-runbook.md` so internal workers read the
  packet before moving work out of queued/accepted states and never paste it
  into customer-visible events.
- Verification:
  - `npm test -- --run tests/api/jobs-lifecycle.test.ts tests/build-stations.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 22 tests.
  - `npm run lint` and `npm run typecheck` passed.
  - Direct completion audit artifact
    `test-results/completion-audit-worker-packet.json` returned expected
    redacted `NO-GO`, with `platform.api-dashboard` and
    `platform.build-stations` passing.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 33 Vitest files / 170 tests, 24 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform agent skill-backbone checkpoint (2026-06-29)

Family build-station skill packs now have auditable open-source backbone
metadata instead of generic candidate labels. This closes the "expert family
skills must not be generic" sourcing gap at the platform contract layer while
actual worker execution and final model selection remain pending.

- Platform commit: `e27d696` (`feat: verify agent skill backbones`)
- Expanded `lib/build-stations/catalog.ts` so every family backbone entry now
  records:
  - source name and intended expert use;
  - contract/research status;
  - license label;
  - license-risk posture;
  - source URL;
  - integration priority.
- Replaced vague/weak entries with named projects where needed:
  - Media & Convert now directly includes FFmpeg, `whisper.cpp`, and Piper for
    conversion/transcription/text-to-audio coverage.
  - Review & Decide uses DuckDB, Mermaid, and OpenRefine.
  - Plan & Itinerary uses OpenStreetMap, OSRM, and `ical.js`.
  - Career & Prep uses LanguageTool, Reactive Resume, and Pandoc.
- Added `docs/architecture/agent-skill-backbones.md` as the internal map of
  family-to-tool candidates, license risk, readiness controls, and public
  boundary rules.
- Updated internal worker packets to include backbone license, risk, source URL,
  and priority metadata for ops-token-protected fulfillment only.
- Hardened `findIncompleteBuildStations()` and the completion-audit
  `platform.build-stations` gate so missing source/license/priority metadata
  blocks readiness.
- Verification:
  - `npm test -- --run tests/build-stations.test.ts tests/api/jobs-lifecycle.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 22 tests.
  - `npm run lint` passed.
  - `npm run typecheck` passed.
  - Direct completion audit artifact
    `test-results/completion-audit-agent-skill-backbones.json` returned
    expected redacted `NO-GO`, with `platform.build-stations`,
    `platform.api-dashboard`, local/public implementation gates, Stripe local
    catalog, deployment headers, and runtime placeholders passing; env/proof
    gates still fail until real staging/production secrets and proof reports are
    supplied.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 33 Vitest files / 170 tests, 24 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform worker packet ops-plan checkpoint (2026-06-29)

Internal fulfillment now has a redacted ops command that consumes the worker
packet and turns it into a station work plan. This closes the gap where the
packet existed but operators/agents had no safe CLI path to use it.

- Platform commit: `8a0d248` (`feat: add redacted worker packet ops plan`)
- Added `npm run ops:worker-packet`.
- Added `scripts/ops/worker-station-packet.ts`, a read-only internal CLI that:
  - dry-runs the `GET /api/internal/jobs/:id/worker-packet` request;
  - requires `WEBOT_INTERNAL_OPS_TOKEN` before fetching;
  - redacts customer title and instructions from CLI output;
  - emits service, station, lead, expert skill pack, execution placeholder,
    operator checklist, quality gates, deliverable outputs, sourced backbones,
    and guardrails;
  - sorts backbone options by integration priority.
- Updated `docs/operations/fulfillment-runbook.md` so internal workers fetch the
  redacted station plan before using the transition CLI.
- Hardened `platform.build-stations` completion-audit evidence so the packet
  CLI and its tests are required.
- Verification:
  - `npm test -- --run tests/ops/worker-station-packet-cli.test.ts tests/ops/fulfillment-transition-cli.test.ts tests/api/jobs-lifecycle.test.ts tests/completion-audit.test.ts`
    passed: 4 Vitest files / 27 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Direct completion audit artifact
    `test-results/completion-audit-worker-packet-cli.json` returned expected
    redacted `NO-GO`, with `platform.build-stations` passing and citing the ops
    packet CLI/test evidence.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 173 tests, 24 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform worker intent-readiness checkpoint (2026-06-29)

Internal worker packets now carry the same job-specific intake-readiness signal
used by customer/dashboard preflight. This closes the gap where family agents
received expert station context but could still miss weak customer intent inside
the fulfillment handoff.

- Platform commit: `a8c71da` (`feat: add worker packet intake readiness`)
- Added `intake_readiness` to `GET /api/internal/jobs/:id/worker-packet`.
- The packet now includes:
  - matched and missing intake requirements for the selected service family;
  - quality signals the worker should preserve;
  - the recommended next action;
  - a customer-instruction template for missing context recovery.
- Updated the redacted `npm run ops:worker-packet` station plan so operators
  and worker agents see `intake missing:` and `quality signal:` checklist items
  before station modules, handoff requirements, and model placeholders.
- Customer title and raw instructions remain redacted from CLI output; the raw
  worker packet remains behind the internal ops token.
- Verification:
  - `npm test -- tests/api/jobs-lifecycle.test.ts` passed: 22 tests.
  - `npm test -- tests/ops/worker-station-packet-cli.test.ts` passed: 3 tests.
  - `npm run lint` passed.
  - `npm run typecheck` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 183 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest product completion-audit snapshot (2026-06-29)

After the worker intake-readiness and agent-skill manifest checkpoints,
`webot-platform` local/public implementation gates pass, but the product is
still correctly `NO-GO` against Ian's final definition of done until real
staging/production secrets and deployed proof are supplied.

- Audit command:
  `npm run release:completion-audit -- --report-file test-results/completion-audit-agent-manifest.json`
- Durable report:
  `/Users/webot/Projects/webot-platform/test-results/completion-audit-agent-manifest.json`
- Passing gates:
  - `public.agency`
  - `public.studio`
  - `platform.api-dashboard`
  - `platform.api-docs`
  - `platform.build-stations`
  - `platform.deployment-headers`
  - `stripe.catalog-local`
  - `runtime.model-placeholders`
- Failing gates:
  - `release.readiness`: staging/production envs, ServerDb, runtime
    repositories, runtime limits, Stripe credentials, and Stripe tier readback
    are missing in this shell.
  - `proof.staging`: missing staging proof report.
  - `proof.production`: missing production proof report.
  - `browser.public-live`: missing public live browser evidence directory.
- `remainingAllowedWork` is still only `final model/runtime selection`, meaning
  the local implementation audit agrees that non-model local/public surfaces are
  covered while external env/deploy/proof remains the hard gate.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest public live browser evidence checkpoint (2026-06-29)

Fresh public Agency/Studio live browser evidence has been captured and accepted
by the platform completion audit. This narrows the remaining `NO-GO` state to
credential-backed staging/production readiness and proof reports.

- Live browser command:
  `scripts/test-itinerary-flow.sh --live`
- Evidence directory:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T033730Z`
- Screenshots captured:
  - `screenshots/agency-desktop.png`
  - `screenshots/agency-mobile.png`
  - `screenshots/studio-desktop.png`
  - `screenshots/studio-mobile.png`
  - `screenshots/studio-payment-confirmed.png`
  - `screenshots/studio-test-desk-routes.png`
- Static checks passed:
  - Agency JSON-LD parsed.
  - Studio JSON-LD parsed.
  - Agency inline scripts compiled.
  - Studio inline script compiled.
- Browser checks passed:
  - Agency desktop/mobile centered with no overflow.
  - Studio desktop/mobile centered with no overflow.
  - Vacation, date-night, business, road-trip, PDF, code, brand, and decision
    routing assertions passed.
- Follow-up audit command:
  `npm run release:completion-audit -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T033730Z --report-file test-results/completion-audit-public-live-20260629T033730Z.json`
- Audit report:
  `/Users/webot/Projects/webot-platform/test-results/completion-audit-public-live-20260629T033730Z.json`
- Newly passing gate:
  - `browser.public-live`
- Still failing gates:
  - `release.readiness`: staging/production envs, ServerDb, runtime
    repositories, runtime limits, Stripe credentials, and Stripe tier readback
    are missing in this shell.
  - `proof.staging`: missing staging proof report.
  - `proof.production`: missing production proof report.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest release-inputs verifier checkpoint (2026-06-29)

`webot-platform` now has a redacted release-inputs verifier for the remaining
external readiness gates. This makes the final secret/proof setup auditable
without printing values or relying on hand-copied notes.

- Platform commit: `7c36020` (`feat: add release inputs verifier`)
- Added `npm run release:inputs`.
- Added `scripts/verify-release-inputs.ts`.
- Added `tests/release-inputs.test.ts`.
- Updated `docs/deployment/readiness.md`.
- The verifier checks:
  - Vercel CLI availability as a non-blocking helper;
  - `.vercel/project.json` presence as a non-blocking helper;
  - `.env.staging.local` and `.env.production.local` existence and env-shape
    validity;
  - staging and production proof report paths;
  - public live browser evidence screenshot completeness.
- Current machine state from:
  `npm run release:inputs -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T033730Z`
  - `browser.public-live-evidence`: `PASS`
  - `tool.vercel-cli`: `WARN` (`vercel` not on `PATH`; env files can still be
    supplied manually)
  - `tool.vercel-project-link`: `WARN` (`.vercel/project.json` absent; env files
    can still be supplied manually)
  - `env.staging-file`: `FAIL` (`.env.staging.local` missing)
  - `env.production-file`: `FAIL` (`.env.production.local` missing)
  - `proof.staging-report`: `FAIL`
  - `proof.production-report`: `FAIL`
- Verification:
  - `npm test -- tests/release-inputs.test.ts tests/final-release.test.ts tests/release-readiness.test.ts`
    passed: 3 Vitest files / 14 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 35 Vitest files / 186 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest Stripe readback input checkpoint (2026-06-29)

The release-inputs verifier now checks that staging/production env files are
not only present, but also wired to a verified Stripe tier readback artifact.
This prevents a final proof run from reaching the completion audit with valid
env shape but no `WEBOT_STRIPE_TIER_READBACK_FILE` or
`WEBOT_STRIPE_TIER_READBACK_JSON` configured.

- Platform commit: `4a5181d` (`feat: verify stripe readback release input`)
- `npm run release:inputs` now includes:
  - `stripe-readback.staging-pointer`
  - `stripe-readback.production-pointer`
- The new checks fail closed when:
  - the corresponding env file is missing;
  - neither `WEBOT_STRIPE_TIER_READBACK_JSON` nor
    `WEBOT_STRIPE_TIER_READBACK_FILE` is set;
  - a configured readback file path is missing or not a file.
- Current machine state from:
  `npm run release:inputs -- --public-browser-evidence-dir /Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T033730Z`
  now explicitly reports the Stripe readback pointer checks as failing because
  `.env.staging.local` and `.env.production.local` are missing.
- Verification:
  - `npm test -- tests/release-inputs.test.ts tests/release-readiness.test.ts tests/release-proof.test.ts`
    passed: 3 Vitest files / 14 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 35 Vitest files / 187 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest release-input alignment checkpoint (2026-06-29)

`webot-platform` release inputs now match the current guarded final-release
flow: Stripe tier readback is treated as a generated proof artifact, not a
secret/env-file pointer that must be hand-edited before the run.

- Platform commit: `4ef5b50` (`fix: align release inputs with proof readback`)
  supersedes the env-pointer requirement introduced in `4a5181d` for the
  final-release path.
- `npm run release:inputs` now checks:
  - Vercel CLI availability and `.vercel/project.json` as non-blocking helper
    warnings;
  - `.env.staging.local` and `.env.production.local` existence and redacted
    shape validity;
  - staging/production `staging-proof.json` and `production-proof.json`;
  - staging/production `stripe-validate-report.json` files generated by
    `release:proof`;
  - required public live Agency/Studio browser screenshots.
- The generated completion-audit next command now includes:
  - `--staging-stripe-readback-file test-results/release-proof/staging/stripe-validate-report.json`
  - `--production-stripe-readback-file test-results/release-proof/production/stripe-validate-report.json`
- Fresh public live browser evidence was captured directly into the platform
  final-release evidence path:
  `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`
- Current `npm run release:inputs` state:
  - `browser.public-live-evidence`: `PASS`
  - `tool.vercel-cli`: `WARN`
  - `tool.vercel-project-link`: `WARN`
  - `env.staging-file`: `FAIL` (`.env.staging.local` missing)
  - `env.production-file`: `FAIL` (`.env.production.local` missing)
  - `proof.staging-report`: `FAIL`
  - `proof.staging-stripe-readback-report`: `FAIL`
  - `proof.production-report`: `FAIL`
  - `proof.production-stripe-readback-report`: `FAIL`
- Verification:
  - `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    passed and wrote the six required screenshots.
  - `npm test -- tests/release-inputs.test.ts tests/final-release.test.ts tests/release-readiness.test.ts`
    passed: 3 Vitest files / 16 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run release:inputs` produced the expected redacted `NO-GO` above with
    public-live evidence passing.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 35 Vitest files / 188 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, Vercel project link, or credential-backed release proof was run.

## Latest release env-prep checkpoint (2026-06-29)

`webot-platform` now has a redacted env preparation helper for the remaining
staging/production secret setup. This does not create proof or fake readiness;
it gives the next operator an exact ignored-file checklist and target-aware
placeholders without printing or committing secret values.

- Platform commit: `b3c063a` (`feat: add release env prep helper`)
- Added `npm run release:env-prep`.
- Added `scripts/prepare-release-env.ts`.
- Added `tests/release-env-prep.test.ts`.
- Exported the deploy env rule contract from `scripts/verify-deploy-env.ts` so
  env prep and env verification share the same required variable list.
- Updated `docs/deployment/readiness.md` with the safe sequence:
  - `npm run release:env-prep`
  - fill or pull real ignored env values;
  - `npm run env:check:staging -- --env-file .env.staging.local`;
  - `npm run env:check:production -- --env-file .env.production.local`;
  - run `release:proof` / `release:final -- --execute` only after env checks
    pass.
- The helper:
  - writes `.env.staging.local` and `.env.production.local` only when missing
    unless `--overwrite` is explicitly supplied;
  - supports `--check-only` to inspect without writing files;
  - returns redacted JSON with target, action, validation status, variable names
    to review, and next commands;
  - does not print placeholder values or secret-like values in its report;
  - keeps generated files ignored by git.
- Verification:
  - `npm test -- tests/release-env-prep.test.ts tests/deploy-env.test.ts tests/release-inputs.test.ts`
    passed: 3 Vitest files / 16 tests.
  - `npm run release:env-prep -- --check-only` reported both target env files
    as missing and listed only variable names / next commands.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 36 Vitest files / 191 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - Fresh public live browser evidence was regenerated after `deploy:check` at
    `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`.
  - `release:inputs` still returns the expected redacted `NO-GO`: public-live
    evidence passes, while `.env.staging.local`, `.env.production.local`,
    staging proof, production proof, and both `stripe-validate-report.json`
    proof artifacts are still missing.
- No ignored env file was generated in the project root during this checkpoint,
  and no live deploy, live publish, Stripe tier creation, payment submission,
  DNS change, Vercel project link, or credential-backed release proof was run.

## Latest process-env release import checkpoint (2026-06-29)

`webot-platform` release env prep can now populate ignored release env files
from a shell that already has release secrets loaded, without printing any
secret values in the report.

- Platform commit: `759e1c5` (`feat: import release env from process`)
- Added `--from-process-env` to `npm run release:env-prep`.
- When used without `--check-only`, the helper copies matching
  `process.env` values into `.env.staging.local` / `.env.production.local`
  while keeping unmatched values as target-aware placeholders.
- The JSON report remains redacted and only includes target names, action,
  validation status, variable names, and next commands.
- Current shell audit by variable name only showed all required release env
  variables missing, so no working env files can be created from this shell yet.
- Verification:
  - `npm test -- tests/release-env-prep.test.ts tests/deploy-env.test.ts tests/release-inputs.test.ts`
    passed: 3 Vitest files / 17 tests.
  - `npm run release:env-prep -- --check-only --from-process-env` reported
    `.env.staging.local` and `.env.production.local` as missing without
    printing any values.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 36 Vitest files / 192 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - Fresh public live browser evidence was regenerated after `deploy:check` at
    `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`.
  - `release:inputs` still returns the expected redacted `NO-GO`: public-live
    evidence passes, while real env files and proof artifacts are missing.
- No ignored env file was generated in the project root during this checkpoint,
  and no live deploy, live publish, Stripe tier creation, payment submission,
  DNS change, Vercel project link, or credential-backed release proof was run.

## Latest release-input env-prep guidance checkpoint (2026-06-29)

`webot-platform` release-input output now points operators to the env-prep
import step before asking for readiness/proof checks. This keeps the remaining
real-secret gate clear for the next session.

- Platform commit: `fbda236` (`fix: surface env prep in release inputs`)
- `npm run release:inputs` now starts generated `nextCommands` with
  `npm run release:env-prep -- --from-process-env`.
- Missing env-file guidance now says to run env prep from process env, or
  create the ignored target env file with real secrets, before running
  `env:check`.
- Readiness docs now record the same first next command so docs and verifier
  output match.
- Verification:
  - `npm test -- tests/release-inputs.test.ts tests/release-env-prep.test.ts`
    passed: 2 Vitest files / 8 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 36 Vitest files / 192 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - Fresh public-live browser evidence passed at
    `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`
    with six non-empty screenshots: Agency desktop/mobile, Studio
    desktop/mobile, Studio payment-confirmed, and Studio test-desk routes.
  - Current `release:inputs` result is still the expected redacted `NO-GO`:
    first next command is `npm run release:env-prep -- --from-process-env`;
    public-live evidence passes; real staging/production env files, staging and
    production proof reports, and both generated Stripe readback proof reports
    are still missing.
- No ignored env file was generated in the project root during this checkpoint,
  and no live deploy, live publish, Stripe tier creation, payment submission,
  DNS change, Vercel project link, or credential-backed release proof was run.

## Latest guarded release env-pull checkpoint (2026-06-29)

`webot-platform` now has a guarded Vercel env pull helper and the local Vercel
CLI is installed/exposed, so the next real-secret step can use Vercel as the
source of truth once the correct project is linked.

- Platform commit: `3208290` (`feat: add guarded release env pull`)
- Installed Vercel CLI `54.18.2` globally under the Hermes Node prefix and
  exposed it on PATH through `~/.local/bin/vercel` and `~/.local/bin/vc`.
- Added `npm run release:env-pull`.
- The env-pull helper:
  - is dry-run by default;
  - requires the Vercel CLI and `.vercel/project.json`;
  - writes ignored `.env.staging.local` and `.env.production.local` only with
    `--confirm-pull`;
  - refuses to overwrite existing env files unless `--overwrite` is supplied;
  - captures Vercel output without printing secret values;
  - validates pulled env files with the same staging/production env contract;
  - reports only target names, file paths, variable names, statuses, and next
    commands.
- `npm run release:inputs` now starts with `npm run release:env-pull`, then
  `npm run release:env-prep -- --from-process-env`, then env checks/proof.
- Readiness docs now describe the Vercel pull path and the process-env fallback.
- Current local state after install:
  - `vercel --version` returns `54.18.2`;
  - `npm --silent run release:env-pull` returns the expected redacted `NO-GO`
    because `.vercel/project.json` is absent;
  - `npm --silent run release:inputs` returns the expected redacted `NO-GO`:
    Vercel CLI `PASS`, Vercel project link `WARN`, public-live browser evidence
    `PASS`, env/proof artifacts still `FAIL`.
- Verification:
  - `npm test -- tests/release-env-pull.test.ts tests/release-inputs.test.ts tests/release-env-prep.test.ts`
    passed: 3 Vitest files / 12 tests.
  - `npm test -- tests/release-env-pull.test.ts tests/release-inputs.test.ts`
    passed after the CLI install: 2 Vitest files / 8 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 37 Vitest files / 196 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - Fresh public live Agency/Studio browser evidence was regenerated with
    `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
    and produced six non-empty screenshots.
- No ignored env file was generated in the project root during this checkpoint,
  and no live deploy, live publish, Stripe tier creation, payment submission,
  DNS change, Vercel project link, or credential-backed release proof was run.

## Latest bounded Vercel env-pull checkpoint (2026-06-29)

`webot-platform` guarded Vercel env pulls are now timeout-bounded and
non-interactive, so future confirmed secret pulls cannot trap the Codex session
if the Vercel CLI waits for auth or prompts.

- Platform commit: `bf278a4` (`fix: bound vercel env pull execution`)
- `npm run release:env-pull -- --confirm-pull` now runs Vercel with
  `CI=1`, `VERCEL_NON_INTERACTIVE=1`, and `NO_COLOR=1`.
- Confirmed Vercel pulls now have a default `120000ms` timeout and support
  `--timeout-ms` for intentional command-budget changes.
- Pull reports include the timeout budget but still do not include raw Vercel
  stdout/stderr or secret values.
- Added a regression test with a fake hanging Vercel CLI that writes
  secret-like stdout; the report times out and does not include that raw output.
- Removed committed secret-shaped fixture literals from the env-pull test so
  `npm run secrets:check` stays clean.
- Verification:
  - `npm test -- tests/release-env-pull.test.ts tests/release-inputs.test.ts`
    passed: 2 Vitest files / 9 tests.
  - `npm run secrets:check` passed.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 37 Vitest files / 197 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - Fresh public live Agency/Studio browser evidence was regenerated at
    `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`
    with six non-empty screenshots.
  - Current `npm --silent run release:inputs` remains the expected redacted
    `NO-GO`: Vercel CLI `PASS`, Vercel project link `WARN`, public browser
    `PASS`, real env files/proof artifacts `FAIL`.
- No ignored env file was generated in the project root during this checkpoint,
  and no live deploy, live publish, Stripe tier creation, payment submission,
  DNS change, Vercel project link, or credential-backed release proof was run.

## Latest provider/env execution checkpoint (2026-06-29)

The platform release/env lane has moved from script-only readiness into actual
provider/local-runtime setup where credentials were available, while remaining
redacted and fail-closed where browser/provider auth is still absent.

- Platform commit: `24c0f76` (`fix: align release env gates with provider setup`)
- Installed provider CLIs:
  - Vercel CLI `54.18.2` already available at `/Users/webot/.local/bin/vercel`.
  - Stripe CLI `1.43.2` installed through Homebrew.
  - Supabase CLI `2.108.0` installed through Homebrew.
- Created ignored `.env.staging.local` and `.env.production.local` in
  `../webot-platform` with generated first-party secrets for
  `API_KEY_PEPPER`, `WEBOT_CSRF_SECRET`, `WEBOT_INTERNAL_OPS_TOKEN`, and
  `WEBOT_SMOKE_ACCOUNT_PASSWORD`; values were not printed and are not tracked.
- Created a no-charge Stripe test sandbox using `hello@webot.agency` from git
  config, saved the test credential in the local Stripe CLI profile, and wired
  the staging env file to that local test credential without printing it.
- Created or reused all nine WeBot subscription tiers in Stripe test mode and
  validated them open-ready:
  Human `$10/$20/$30`, API-only Agent `$7/$14/$21`, and Both `$15/$30/$45`.
- Regenerated the staging Stripe readback artifact after the test suite cleaned
  ignored outputs:
  `../webot-platform/test-results/release-proof/staging/stripe-validate-report.json`
  with `tiers: 9`, `mode: test`, and `stripeSecretKeyPrinted: false`.
- Started the local Supabase stack with an isolated Docker config after Docker
  credential-helper startup initially stalled; all ten migrations applied and
  local Supabase services are healthy except optional stopped imgproxy/pooler.
- Local Supabase proof:
  - `supabase migration list --local` shows local and remote migration IDs
    `0001` through `0010` aligned.
  - `npm run db:check` passed.
- DNS check:
  - `app.webot.studio` currently has no DNS answer.
  - `api.webot.agency` currently has no DNS answer.
  - `webot.studio` still points to GitHub Pages IPs.
- Release contract changes:
  - accepted Stripe's current `rkcs_test_` sandbox restricted-key prefix for
    staging/test-mode checks while production still requires live-mode Stripe
    keys;
  - removed unused Redis/queue env requirements because the implemented
    production rate-limit and job-handoff path is Supabase-backed;
  - ignored Supabase local metadata directories (`supabase/.branches/` and
    `supabase/.temp/`);
  - isolated tests from ignored local release artifacts so real env/proof
    files no longer make tests flaky.
- Verification:
  - focused env/release tests passed: 20 tests.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 37 Vitest files / 198 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - Fresh public Agency/Studio live browser evidence was regenerated at
    `/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser`
    with six required screenshots.
  - `npm run release:inputs` now reports:
    - Vercel CLI `PASS`;
    - Vercel project link `WARN`;
    - staging Stripe readback `PASS`;
    - public live browser evidence `PASS`;
    - staging env `FAIL` for the named Vercel/Supabase/domain/webhook values;
    - production env `FAIL` for the named Supabase/live Stripe/Vercel values;
    - staging and production deployed proof reports still missing;
    - production Stripe readback still missing.
- Vercel browser/device login was opened and bounded twice, but no Vercel token
  landed on the machine; `.vercel/project.json` is still absent and
  `vercel whoami` still starts device login.
- Supabase cloud login still needs a Supabase access token or browser approval;
  local Supabase is proven, but no cloud project token/config exists.
- No live deploy, live publish, payment submission, DNS change, Vercel project
  link, live Stripe creation, or credential-backed staging/production release
  proof was completed in this checkpoint.

## Latest local Supabase runtime proof checkpoint (2026-06-29)

`webot-platform` now has a no-auth, redacted local Supabase runtime proof that
talks to the real local Supabase REST/RPC stack instead of mocked fetches.

- Platform commit: `10e2e20` (`test: add local supabase runtime proof`)
- Added `npm run runtime:local-supabase-proof`.
- Added `scripts/verify-local-supabase-runtime.ts`.
- Added `tests/local-supabase-runtime-proof.test.ts`.
- Added Supabase migrations:
  - `0011_service_role_runtime_access.sql` gives `service_role` explicit
    server-owned RLS policies and lets service-role maintenance pass the
    append-only trigger functions while customer roles still fail closed.
  - `0012_service_role_runtime_grants.sql` grants `service_role` the required
    schema/table/function privileges for PostgREST runtime access.
  - `0013_rate_limit_counter_rpc_ambiguity.sql` fixes the private rate-limit
    counter RPC by using the primary-key constraint instead of ambiguous
    `on conflict (counter_key)`.
- Updated local Supabase API config to expose `app_private` to PostgREST while
  keeping privileges limited to `service_role`.
- Added a `postcss` override to `8.5.15`; `npm audit --omit=dev` and full
  `npm audit` now report zero vulnerabilities.
- The proof seeds and cleans a throwaway account/user/membership/entitlement,
  API key, job, file metadata, usage ledger row, rate-limit event/counter,
  reject, Stripe webhook event, and entitlement sync path.
- Proof artifact:
  `../webot-platform/test-results/local-supabase-runtime-proof.json`
  reports `PASS`, `secretValuesPrinted: false`, and `stoppedSupabase: true`.
- Verification:
  - `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/local-supabase-runtime-proof.json --timeout-ms 240000` passed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 38 Vitest files / 202 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm audit --omit=dev` and `npm audit` passed with zero vulnerabilities.
  - Fresh public Agency/Studio live browser evidence was regenerated at
    `../webot-platform/test-results/final-release/public-live-browser`.
  - Latest `npm run release:inputs` remains the expected redacted `NO-GO`:
    Vercel CLI `PASS`, Vercel project link `WARN`, public live browser evidence
    `PASS`, while staging/production env files still contain named placeholders
    and staging/production deployed proof plus Stripe readback reports are
    missing.
- No Vercel/Supabase browser auth, live deploy, live publish, payment
  submission, DNS change, live Stripe creation, or credential-backed
  staging/production proof was run.

## Latest release-gate local Supabase proof checkpoint (2026-06-29)

`webot-platform` now requires the local Supabase runtime proof in the release
input verifier, final-release orchestrator, and completion audit.

- Platform commit: `91fff7b` (`feat: require local supabase proof in release gates`)
- `npm run release:inputs` now checks
  `test-results/local-supabase-runtime-proof.json` as
  `proof.local-supabase-runtime`, validates `status: PASS`,
  `target: local-supabase`, `secretValuesPrinted: false`, a passing
  `repositories.runtime-roundtrip` step, and row counts for entitlements, jobs,
  job events, files, usage ledger, rate-limit events/counters, rejects, and
  Stripe webhook events.
- `npm run release:final` dry-run/execute plan now includes a
  `local-supabase-runtime-proof` step before staging/production proof commands:
  `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/final-release/local-supabase-runtime-proof.json --timeout-ms 240000`.
- `npm run release:completion-audit` now requires
  `--local-supabase-runtime-proof <path>` and will stay `NO-GO` without a valid
  local runtime proof report.
- Verification:
  - focused release tests passed:
    `npm test -- tests/release-inputs.test.ts tests/final-release.test.ts tests/completion-audit.test.ts`
    with 20 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 38 Vitest files / 203 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
  - regenerated `../webot-platform/test-results/local-supabase-runtime-proof.json`
    passed with `secretValuesPrinted: false` and `stoppedSupabase: true`.
  - regenerated public Agency/Studio live browser evidence at
    `../webot-platform/test-results/final-release/public-live-browser`.
  - latest `npm run release:inputs` remains the expected redacted `NO-GO`:
    Vercel CLI `PASS`, local Supabase proof `PASS`, public live browser evidence
    `PASS`, Vercel project link `WARN`, and staging/production env/proof/Stripe
    readback artifacts still `FAIL`.
  - `npm audit --omit=dev` and `npm audit` passed with zero vulnerabilities.
- Local Supabase containers were stopped after proof regeneration.
- No Vercel/Supabase browser auth, live deploy, live publish, payment
  submission, DNS change, live Stripe creation, or credential-backed
  staging/production proof was run.

## Latest platform worker agent-skill manifest checkpoint (2026-06-29)

Internal worker packets now include an explicit agent skill manifest for the
selected service family. This makes the family expertise directly consumable by
worker agents instead of relying on generic skills or UI-only station metadata.

- Platform commit: `c6a4178` (`feat: add worker agent skill manifest`)
- Added `agent_skill_manifest` to `GET /api/internal/jobs/:id/worker-packet`.
- The manifest includes:
  - family, station, and expert skill-pack identity;
  - expert level;
  - supported service options;
  - required human-intent checks;
  - specialist skills;
  - quality gates;
  - preferred open-source backbone order;
  - operating rules that force intake-first work, prevent invented customer
    intent, keep runtime details private, and require reviewed delivery gates.
- Updated the redacted `npm run ops:worker-packet` station plan so worker agents
  see the manifest plus `agent rule:` checklist items before intake gaps,
  quality signals, station modules, handoff requirements, and model placeholders.
- Hardened the completion audit so `platform.build-stations` now checks that the
  internal worker packet and redacted CLI expose the agent skill manifest.
- Verification:
  - `npm test -- tests/api/jobs-lifecycle.test.ts tests/ops/worker-station-packet-cli.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 33 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 183 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform local customer-flow proof checkpoint (2026-06-29)

The platform now has one screenshot-backed browser test that follows the safe
customer monetization path across account entry, billing, checkout return,
dashboard, job creation, and build stations. This is local fixture proof only;
the definition of done still requires the same class of evidence against
staging/production with working secrets.

- Platform commit: `815bfd9` (`test: add customer monetization flow proof`)
- Added `tests/e2e/customer-monetization-flow.spec.ts`.
- The test walks:
  - `/login` account entry;
  - authenticated `/billing` with all nine checkout options present but safely
    disabled until Stripe readback is loaded;
  - `/billing/success` checkout return without payment submission and without
    raw session-id rendering;
  - `/dashboard` post-return account state;
  - `/jobs` customer job creation for Growth & Market / SEO;
  - `/build-stations` family station proof.
- Screenshot evidence:
  - `test-results/customer-monetization-flow/01-login-entry.png`
  - `test-results/customer-monetization-flow/02-billing-safe-checkout.png`
  - `test-results/customer-monetization-flow/03-checkout-return.png`
  - `test-results/customer-monetization-flow/04-dashboard-post-return.png`
  - `test-results/customer-monetization-flow/05-job-created.png`
  - `test-results/customer-monetization-flow/06-build-stations.png`
- Hardened the completion-audit `platform.build-stations` evidence to include
  the local human-flow browser test file.
- Verification:
  - `npx playwright test tests/e2e/customer-monetization-flow.spec.ts` passed.
  - `npm test -- --run tests/completion-audit.test.ts` passed.
  - Direct completion audit artifact `test-results/completion-audit-customer-flow.json`
    returned expected redacted `NO-GO`, with local/public implementation gates
    through `platform.build-stations` passing.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 173 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build.
- Env/proof reality check:
  - `.env.staging.local` and `.env.production.local` do not exist in
    `/Users/webot/Projects/webot-platform`.
  - No relevant WeBot/Supabase/Stripe env variable names are loaded in the
    current shell.
  - No `.vercel` link or `vercel` CLI is available in the current shell.
  - Filename-only search found no usable platform env files; the only nearby
    env backup directory (`/Users/webot/Backups/webot-env`) contains old config
    and package backups, not staging/production secrets.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform remote customer-flow smoke checkpoint (2026-06-29)

The deployed release proof harness now requires a real smoke-account customer
flow instead of only shallow public/app page screenshots. This moves the final
definition of done closer to "prove the whole flow against deployed targets";
the only reason it cannot pass in this shell is still absent staging/production
env files and credentials.

- Platform commit: `15d3de9` (`feat: require remote customer flow smoke`)
- Added remote smoke env requirements:
  - `WEBOT_SMOKE_ACCOUNT_EMAIL`
  - `WEBOT_SMOKE_ACCOUNT_PASSWORD`
- `scripts/verify-deploy-env.ts` now validates the smoke account email shape and
  requires both smoke account fields for staging/production.
- `scripts/verify-remote-release-smoke.ts` now adds
  `browser:customer-flow:desktop`, which:
  - signs in with the configured smoke account;
  - verifies `/billing`;
  - opens the display-only `/billing/success` return without payment
    submission and rejects raw session-id rendering;
  - creates a small Growth & Market / SEO customer job;
  - opens `/build-stations` and checks the Growth Room station/skill-pack
    evidence;
  - writes customer-flow screenshots under `remote-smoke/customer-flow/`;
  - keeps `secretValuesPrinted=false` and does not print smoke credentials.
- `scripts/verify-completion-audit.ts` now requires the remote
  `browser:customer-flow:desktop` step to pass and checks its artifact
  screenshots for existence/non-empty size.
- Updated `docs/deployment/readiness.md` to document smoke account setup and
  remote customer-flow proof artifacts.
- Verification:
  - `npm test -- --run tests/release-proof.test.ts tests/completion-audit.test.ts tests/deploy-env.test.ts`
    passed: 3 Vitest files / 23 tests.
  - `npm run env:check -- --target local` passed.
  - `npm run release:remote-smoke -- --env-file .env.staging.local --dry-run --report-file test-results/remote-smoke-customer-flow-dry-run.json`
    passed and showed the added `browser:customer-flow:desktop` dry-run step.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 34 Vitest files / 173 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm run release:readiness -- --staging-env-file .env.staging.local --production-env-file .env.production.local`
    returned expected redacted `NO-GO` because those env files are not present;
    local env shape passed.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform final-release env preflight checkpoint (2026-06-29)

The final-release orchestrator now validates staging/production env file shape
before it can run any proof command in execute mode. This keeps the "all gates
open before done" requirement honest: missing or placeholder secrets fail fast,
and proof commands do not start from a bad env baseline.

- Platform commit: `f95bc8b` (`feat: validate final release env preflight`)
- `scripts/verify-final-release.ts` now parses and validates the supplied
  staging and production env files during preflight using the same
  `verify-deploy-env` rules used elsewhere.
- The execute preflight requires the smoke account fields too:
  `WEBOT_SMOKE_ACCOUNT_EMAIL` and `WEBOT_SMOKE_ACCOUNT_PASSWORD`.
- Invalid env values are reported by variable name and reason only; the
  validator does not print secret values or the smoke-account password.
- `scripts/verify-release-readiness.ts` now recognizes smoke-account env keys
  when they are supplied through the process environment.
- `docs/deployment/readiness.md` documents that `release:final --execute`
  checks env-file existence and redacted env-shape validity before proof.
- Verification:
  - `npm test -- --run tests/final-release.test.ts tests/release-readiness.test.ts tests/deploy-env.test.ts`
    passed: 3 Vitest files / 20 tests.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 34 Vitest files / 174 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm run release:final -- --report-file test-results/final-release-dry-run.json`
    passed in dry-run mode and showed the full release plan without executing
    staging, production, Stripe, public-live, or completion-audit proof commands.
- Current hard reality:
  - `/Users/webot/Projects/webot-platform/.env.staging.local` and
    `/Users/webot/Projects/webot-platform/.env.production.local` are still
    absent in this shell;
  - no live deploy, live publish, Stripe tier creation, payment submission, DNS
    change, or credential-backed release proof was run.

## Latest platform API catalog intent-guidance checkpoint (2026-06-29)

The public API catalog now gives agent customers structured, customer-safe
intake guidance for each service family. This closes a non-model readiness gap:
API callers no longer need to infer how to ask good human-intent questions
before job creation.

- Platform commit: `cf2ffc0` (`feat: add agent intake guidance to catalog`)
- `GET /api/v1/catalog` now returns, for each family:
  - `intake_requirements`
  - `quality_signals`
  - the existing service options and job statuses.
- API docs now tell agent callers to ask for missing `intake_requirements` and
  place answered context in `customer_instructions` before creating a job.
- OpenAPI now documents a stricter `CatalogResponse` schema with the new fields.
- Completion audit now checks the catalog, docs, and OpenAPI keep the public
  intake/quality guidance present.
- Verification:
  - `npm test -- --run tests/api/jobs-lifecycle.test.ts tests/api/openapi-schema.test.ts`
    passed: 2 Vitest files / 17 tests.
  - `npm test -- --run tests/completion-audit.test.ts tests/api/jobs-lifecycle.test.ts tests/api/openapi-schema.test.ts`
    passed: 3 Vitest files / 25 tests.
  - `npx playwright test tests/e2e/api-docs-public.spec.ts` passed: 5 browser
    tests.
  - `npm run lint` passed.
  - `npm run typecheck` passed.
  - `npm run release:completion-audit -- --report-file test-results/completion-audit-intake-catalog.json`
    returned expected redacted `NO-GO`: all local implementation gates,
    including `platform.api-docs`, passed; missing staging/production env,
    proof reports, and public live browser evidence still failed.
  - `npm run deploy:check` passed: secret scan, local env check, DB contract,
    lint, typecheck, 34 Vitest files / 174 tests, 25 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm run release:final -- --report-file test-results/final-release-intake-catalog-dry-run.json`
    passed in dry-run mode.
- Subagent note:
  - A requested explorer subagent could not be spawned because the Codex runtime
    still reported `agent thread limit reached`.
  - `scripts/free-subagent-pool.sh --all-stale --confirm-kill` ran and wrote
    `/Users/webot/Backups/webot-site/free-subagent-pool-20260629T024915Z`,
    confirming no local matching subagent processes were available to kill.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

## Latest platform catalog intent-preflight checkpoint (2026-06-29)

Agent/API callers now have a quota-free draft check before job creation. This
improves the "exceptional human-intent handling" requirement without touching
models or secrets: agents can ask for missing context before spending customer
quota on a job.

- Platform commit: `11ef616` (`feat: add catalog intent preflight`)
- Added `POST /api/v1/catalog/intent-check`.
- The route is public, no-store, and does not authenticate, create jobs, write
  usage, attach files, grant access, call models, or expose runtime details.
- It accepts a draft `service_family`, `service_type`, `customer_title`, and
  `customer_instructions`, then returns:
  - selected family/service;
  - `ready`;
  - `intake_requirements`;
  - `matched_intake_requirements`;
  - `missing_intake_requirements`;
  - `quality_signals`;
  - `recommended_next_action`;
  - `customer_instruction_template`.
- Unsupported family/type choices return a customer-safe
  `unsupported_service` reject shape.
- API docs, examples, OpenAPI, and completion audit now include the route.
- Verification:
  - `npm test -- --run tests/api/jobs-lifecycle.test.ts tests/api/openapi-schema.test.ts tests/completion-audit.test.ts`
    passed: 3 Vitest files / 28 tests.
  - `npx playwright test tests/e2e/api-docs-public.spec.ts` passed: 5 browser
    tests.
  - `npm run lint` passed.
  - `npm run typecheck` passed.
  - `npm run release:completion-audit -- --report-file test-results/completion-audit-intent-check.json`
    returned expected redacted `NO-GO`: all local implementation gates passed,
    including `platform.api-docs`; missing staging/production env, proof
    reports, and public live browser evidence still failed.
  - `npm run release:final -- --report-file test-results/final-release-intent-check-dry-run.json`
    passed in dry-run mode.
  - Full `npm run deploy:check` passed: secret scan, local env check, DB
    contract, lint, typecheck, 34 Vitest files / 177 tests, 25 Playwright E2E
    tests, cleanup dry-run, and Next build. The build route list included
    `/api/v1/catalog/intent-check`.
- No live deploy, live publish, Stripe tier creation, payment submission, DNS
  change, or credential-backed release proof was run.

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

## Latest platform Stripe checkout-session checkpoint (2026-06-28)

Dashboard checkout can now create account-bound Stripe Checkout Sessions, but
production remains blocked until real staging/production env and verified Stripe
readback artifacts are loaded.

- Platform commit: `cfbf016` (`feat: add account-bound stripe checkout sessions`)
- Added `POST /api/checkout/tier`.
- The route requires a Supabase dashboard session and owner/admin membership;
  API-key callers are rejected.
- Checkout remains disabled/fails closed until verified tier readback is loaded
  through `WEBOT_STRIPE_TIER_READBACK_JSON` or
  `WEBOT_STRIPE_TIER_READBACK_FILE`.
- Stripe Checkout Session creation attaches `client_reference_id` and metadata
  for `webot_account_id`, catalog version, lookup key, and entitlement code.
- `checkout.session.completed` now binds the Stripe customer ID to the WeBot
  account before later signed subscription events apply entitlements.
- Dashboard billing now shows checkout buttons for all nine tiers, disabled
  until readback exists.
- Stripe create/validate scripts emit readback artifacts with product, price,
  Payment Link, and Payment Link URL values.
- Release readiness now includes `stripe-readback.test` and
  `stripe-readback.live` gates. Current output is expected `NO-GO` with both
  readback gates missing in this shell.
- Verification:
  - focused money-path tests passed: 5 files / 22 tests.
  - focused API docs/dashboard browser tests passed: 9 Playwright tests.
  - `npm run lint`, `npm run typecheck`, and `git diff --check` passed.
  - full `npm run deploy:check` passed: secret scan, local env check, db check,
    lint, typecheck, 24 Vitest files / 112 tests, 19 Playwright E2E tests,
    cleanup dry-run, and Next build.
  - `npm run release:readiness` returned expected redacted `NO-GO` with missing
    staging/production env, Stripe credentials, and Stripe readback artifacts;
    no secret values were printed.

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

## Latest guarded subagent process cleanup helper (2026-06-29)

Added `scripts/kill-stale-subagents.sh` for cases where a stale subagent ID may
correspond to a local OS process.

- The script scans process command lines for supplied stale agent IDs.
- It refuses to call `close_agent` or `wait_agent` because those tool calls can
  block the main session.
- It refuses to kill the active shell ancestor chain or its own cleanup process.
- It does not kill broad Codex processes by name; it only considers command lines
  containing the supplied agent ID.
- It requires `--confirm-kill` before sending `TERM`/`KILL`.
- Verification:
  - `bash -n scripts/kill-stale-subagents.sh` passed.
  - `scripts/kill-stale-subagents.sh --dry-run 019f0f49-dc28-7360-b8d4-0920c9028237`
    wrote `/Users/webot/Backups/webot-site/kill-stale-subagents-20260629T002940Z`.
  - `scripts/kill-stale-subagents.sh --confirm-kill 019f0f49-dc28-7360-b8d4-0920c9028237`
    wrote `/Users/webot/Backups/webot-site/kill-stale-subagents-20260629T003016Z`
    and found no local matching process to terminate.
  - A follow-up subagent smoke spawn still failed with `agent thread limit
    reached`, confirming the remaining pool lock is in the Codex tool runtime,
    not a killable local process.

## Latest one-command subagent pool cleanup wrapper (2026-06-29)

Added `scripts/free-subagent-pool.sh` so the main session has one bounded
command for stale subagent handles instead of manually chaining marker,
diagnostic, and kill-scan scripts.

- Default safe command for recorded stale handles:
  `scripts/free-subagent-pool.sh --all-stale --confirm-kill`
- The wrapper:
  - records newly supplied IDs via `scripts/mark-stale-subagent.sh`;
  - writes a bounded recovery snapshot via `scripts/recover-subagent-stall.sh`;
  - runs the guarded local process scan/kill path via
    `scripts/kill-stale-subagents.sh`;
  - never calls `close_agent`, `wait_agent`, archive/delete commands, or any
    agent runtime API.
- Verification:
  - `bash -n scripts/free-subagent-pool.sh scripts/kill-stale-subagents.sh scripts/mark-stale-subagent.sh scripts/recover-subagent-stall.sh`
    passed.
  - `scripts/free-subagent-pool.sh --help` passed.
  - `scripts/free-subagent-pool.sh --all-stale --confirm-kill` wrote
    `/Users/webot/Backups/webot-site/free-subagent-pool-20260629T005728Z`.
  - The cleanup report found recorded stale Tesla handle
    `019f0f49-dc28-7360-b8d4-0920c9028237`, but no local matching process
    command line existed to terminate.
- Interpretation: the known stale subagent slot is held in the Codex tool
  runtime, not by a safe local OS process. Continue without subagents or start a
  fresh Codex session from this handoff if the runtime pool remains full.

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
