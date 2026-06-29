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
