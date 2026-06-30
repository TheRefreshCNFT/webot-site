---
project: webot-site (webot.agency public site and WeBot delivery handoffs)
last_updated: 2026-06-29
status: live static sites unchanged; platform owned-runtime deployed; live Stripe readback pending
authoritative_branch: master
live_url: https://webot.agency
deployment: GitHub Pages from TheRefreshCNFT/webot-site on master
archive_replaces: .handoffs/archive/CURRENT_STATE-2026-06-29-pre-slim.md
---

# webot.agency Current State

Read this first, then `AGENTS.md`, then `ACTIVE_STATE.md`.

## Ground Truth

- `webot-site` is the static public `webot.agency` repo. No build step,
  framework, package manager, or `package.json`.
- Local repo is the editing surface. Live sites are read-only mirrors unless
  published through `scripts/publish-live.sh`.
- `webot-studio` and `webot-buzz` are sister sites; nav/footer/ecosystem copy
  changes here may need matching review there.
- Existing Agency Office bundle Stripe links and current Studio payment links
  are real-money paths. Do not change live payment products or checkout URLs
  without Ian's explicit approval.

## Current Worktree State

- Branch: `master`, ahead of `origin/master` by 148 at last check.
- Working tree intentionally dirty for the owned-infrastructure pivot and this
  state-doc slimming pass.
- Oversized docs were archived rather than deleted:
  - `.handoffs/archive/CURRENT_STATE-2026-06-29-pre-slim.md`
  - `.handoffs/archive/ACTIVE_STATE-2026-06-29-pre-slim.md`
  - `.handoffs/archive/WEBOT_PLATFORM_DELUXE_CONTINUATION_2026-06-28-pre-slim.md`
- The stale monetization handoff that still listed Vercel release blockers was
  archived to
  `.handoffs/archive/MONETIZATION_API_EXPANSION_HANDOFF_2026-06-28-pre-owned-infra-pivot.md`;
  the root file is now only a supersession pointer.

## Latest Verification

Latest superseding validation after the owned-infrastructure pivot:

- `../webot-platform`: `npm run deploy:check` passed on 2026-06-29 after
  adding target-aware staging deploy scripts, staging Caddy/compose artifacts,
  `/api/health` runtime identity, remote-smoke runtime-marker checks, and the
  `release:staging-isolation` dry-run/compare verifier. The full gate passed
  secrets check, local env check, DB contract, lint, typecheck, 50 Vitest files
  / 306 tests, 25 Playwright E2E tests, cleanup dry-run, build, and local
  agent/fulfillment/payment-webhook proofs.
- `../webot-platform`: focused staging/runtime tests passed for owned deploy
  scripts, staging isolation, health, release proof, release env prep,
  owned-runtime plan, release inputs, completion audit, final release, and safe
  evidence: 10 files / 81 tests. `npm run typecheck`, `npm run lint`, and
  `git diff --check` also passed.
- `../webot-platform`: staging deploy dry-runs passed for both
  `scripts/deploy-cwatchtower-owned-runtime.sh --target staging --confirm-staging --dry-run`
  and
  `scripts/deploy-cwatchtower-supabase-runtime.sh --target staging --confirm-staging --dry-run`.
  `npm run release:staging-isolation -- --dry-run` writes the required staging
  before/after invariant plan without touching cwatchtower.
- `../webot-platform`: refreshed final-release evidence now has passing
  resource discovery, approved resource inventory, owned-runtime plans
  (production and staging), staging isolation dry-run, staging/production env
  reports, production DNS/TLS proof, local Supabase runtime proof, local
  agent/fulfillment/payment-webhook proofs, staging Stripe test readback,
  production Supabase runtime proof, and public live browser screenshots under
  `test-results/final-release/public-live-browser`.
- `../webot-platform`: refreshed `release:readiness` is NO-GO only on
  `stripe-readback.live`; the live Stripe readback artifact is intentionally
  `invalid_catalog` until Ian approves the guarded live catalog creation.
- `../webot-platform`: refreshed `release:inputs` blocking checks are
  `release.readiness-report`, `proof.staging-report`,
  `proof.staging-domain-preflight`, `proof.staging-supabase-runtime-report`,
  `proof.production-report`, and `proof.production-stripe-readback-report`.
- `../webot-platform`: refreshed `release:completion-audit` is NO-GO with
  three blocking gates: `release.readiness`, `proof.staging`, and
  `proof.production`.
- Staging DNS/HTTPS current state from
  `test-results/final-release/staging/domain-proof.json`: `staging.app.webot.studio`
  and `staging.api.webot.agency` resolve to `141.148.79.11` but HTTPS is not
  ready because isolated staging cwatchtower routes/runtime are not deployed;
  `supabase-staging.webot.agency` still has no A record at the active
  authoritative `ns-cloud-e*.googledomains.com` nameservers.
- Production remote smoke currently fails `api-health` because the deployed
  `/api/health` response has not yet proved `runtimeEnvironment=production`,
  and fails `browser:customer-flow:desktop` after navigation to
  `chrome-error://chromewebdata/`. The local proxy-origin/runtime marker work
  is ready, but requires an approved owned-runtime deploy before claiming live
  proof.
- `webot-site`: `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
  passed and wrote the public live screenshot evidence into the platform
  final-release artifact directory.

Earlier validation history from the same pivot:

- `webot-site`: `git diff --check` passed.
- `webot-site`: `scripts/test-itinerary-flow.sh` passed.
- Latest screenshot/evidence directory:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T190245Z`.
- `../webot-platform`: `npm run deploy:check` passed on 2026-06-29 after the
  owned-infrastructure artifact wiring, scanner/project-map updates,
  provider-auth inventory dependency, `wikiEvidence` inventory gate, Stripe
  readback report support, and proxy-origin redirect regression coverage with
  48 Vitest files / 290 tests, 25 Playwright E2E tests, lint, typecheck, build,
  cleanup dry-run, and local agent/fulfillment/payment-webhook proofs.
- `../webot-platform`: `npm run release:resource-discovery -- --report-file test-results/final-release/resource-discovery-report.json`
  passed with `secretValuesPrinted=false`, 7 expected docs, 22
  credential-source paths, and 69 redacted knowledge-source paths across
  platform docs, `~/.webot/wiki`, warehouse notes, and the project directory;
  all discovered knowledge sources now report `secretLikeContent=false`.
- `../webot-platform`: `npm run release:safe-evidence -- --dry-run --report-file test-results/final-release/safe-evidence-refresh-report.json`
  passed and reuses existing public browser evidence by default.
- `../webot-platform`: `npm run release:safe-evidence -- --artifact-dir test-results/final-release --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --report-file test-results/final-release/safe-evidence-refresh-report.json`
  wrote the full redacted final-release artifact set with `0600` JSON files and
  no-secret report flags (`secretValuesPrinted=false` or
  `stripeSecretKeyPrinted=false` depending on report type); it reports NO-GO as
  intended because inventory, env, DNS, readiness, release inputs, completion
  audit, and platform public browser evidence are not complete.
- `../webot-platform`: `npm run lint`, `npm run typecheck`, and
  `npm test -- tests/deploy-env.test.ts tests/release-domains.test.ts tests/resource-inventory.test.ts tests/resource-discovery.test.ts tests/provider-auth.test.ts tests/release-readiness.test.ts tests/owned-runtime-plan.test.ts tests/release-inputs.test.ts tests/completion-audit.test.ts tests/final-release-safe-evidence.test.ts`
  passed after adding the `targetServiceFamily` inventory gate, owned-runtime
  plan artifact, owned Supabase-compatible env support, and
  `supabase.webot.agency` DNS/TLS proof.
- `../webot-platform`: staging and production env checks now pass against
  `.env.staging.local` and `.env.production.local`; both files are locked to
  `0600` and generated reports state `secretValuesPrinted=false`.
- `../webot-platform`: staging Stripe test catalog readback now passes directly
  for all nine tiers with `mode=test`, `openOnly=true`,
  `stripeSecretKeyPrinted=false`, and a locked `0600` artifact at
  `test-results/final-release/staging/stripe-validate-report.json`.
  Production live Stripe readback found the live tier catalog has not been
  created yet.
- `../webot-platform`: `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/final-release/local-supabase-runtime-proof.json --timeout-ms 240000`
  passed, started/stopped local Supabase, applied migrations, completed REST/RPC
  repository round trips, wrote a redacted `0600` proof artifact, and printed no
  secrets.
- `../webot-platform`: `app.webot.studio`, `api.webot.agency`, and
  `supabase.webot.agency` are routed through owned Caddy on `cwatchtower`; DNS
  and HTTPS proof pass for all three.
- `../webot-platform`: production remote Supabase proof passes against
  `https://supabase.webot.agency`, and public live browser evidence passed via
  `webot-site` at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T164332Z`.
- `../webot-platform`: `npm run release:readiness` and
  `npm run release:inputs` remain NO-GO because production live Stripe
  catalog/readback is incomplete. Read-only live validation now writes a locked
  `0600` invalid-catalog artifact at
  `test-results/final-release/production/stripe-validate-report.json` with
  `stripeSecretKeyPrinted=false`; it reports `Missing Stripe product for
  human_basic`. Staging Stripe test readback passes through the direct locked
  artifact.
- `../webot-platform`: after the live Stripe operator-safety cleanup and
  scanner-safe remote-smoke sensitive-text detector update,
  `npm run deploy:check` passed with secrets check, local env check, DB
  contract check, lint, typecheck, 48 Vitest files / 290 tests, 25 Playwright
  E2E tests, cleanup dry-run, build, and local
  agent/fulfillment/payment-webhook proofs.
- `../webot-platform`: focused release tests also passed for provider auth,
  release proof/readiness/inputs, final-release safe evidence, and Stripe
  catalog docs. Generated readiness/proof reports no longer surface raw live
  `stripe:create-tiers` or `stripe:validate-tiers` commands; they point at
  `docs/stripe/live-catalog-runbook.md` and the guarded production
  `release:proof --include-stripe-create --confirm-live-stripe` path.
- `../webot-platform`: `release:safe-evidence` refreshed the final-release
  artifact bundle with all artifact checks passing and
  `secretValuesPrinted=false`; it remains NO-GO because release readiness,
  release inputs, and completion audit still fail on proof gates below.
- `../webot-platform`: staging proof now confirms env passes, then stops at the
  `domain-preflight` step before deploy/runtime checks. Current
  `test-results/final-release/staging/domain-proof.json` shows
  `staging.app.webot.studio` and `staging.api.webot.agency` DNS resolve to
  `141.148.79.11` but HTTPS is not ready; after Ian reported all DNS entries
  saved, `supabase-staging.webot.agency` still has no A record at the active
  authoritative `ns-cloud-e*.googledomains.com` nameservers.
  Staging Stripe test readback now has a direct final-release artifact proving
  all nine test tiers, independent of the staging domain-preflight stop.
- `../webot-platform`: `release:inputs` now propagates failed staging
  `domain-proof.json` next actions, so `proof.staging-domain-preflight` points
  first at the exact missing active-authoritative DNS record for
  `supabase-staging.webot.agency` before staging route approval.
- `../webot-platform`: `release:inputs` now validates proof report contents
  instead of accepting report-file presence. Failed staging/production proof
  reports remain blocking until their `status` is `PASS`.
- `../webot-platform`: proxy-origin dashboard redirects were fixed locally so
  auth/session, auth/refresh, auth/signout, job create, and job action routes
  use configured `NEXT_PUBLIC_APP_URL` instead of an internal forwarded origin
  such as `https://0.0.0.0:3000`.
- `../webot-platform`: focused regression tests passed for that redirect fix
  and remote-smoke sensitive-text filtering:
  `npm test -- tests/auth-session.test.ts tests/auth-refresh-route.test.ts tests/auth-signout-route.test.ts tests/dashboard-job-create.test.ts tests/release-proof.test.ts`
  with 32 tests. `npm run typecheck`, `npm run lint`, and `git diff --check`
  also passed.
- `../webot-platform`: production proof without live Stripe creation is present
  and passed env, deploy check, and production Supabase runtime proof. It found
  a remote-smoke customer-flow redirect bug in the currently deployed app; the
  local proxy-origin redirect patch fixes that code path, but live remote smoke
  still needs an approved owned-runtime deploy before it can be claimed fixed.
  A fresh production remote-smoke run on 2026-06-29 passed API health and all
  public/browser pages, then failed only at `browser:customer-flow:desktop`
  after navigating to `chrome-error://chromewebdata/`.
- `../webot-platform`: public live browser evidence now exists at
  `test-results/final-release/public-live-browser`; `webot-site`
  `WEBOT_TEST_OUTPUT=/Users/webot/Projects/webot-platform/test-results/final-release/public-live-browser scripts/test-itinerary-flow.sh --live`
  passed.
- `../webot-platform`: refreshed `release:inputs` now has resource discovery,
  resource inventory, owned-runtime plan, env reports, production domain proof,
  local Supabase runtime proof, local agent/fulfillment/payment-webhook proofs,
  staging Stripe readback, production Supabase runtime proof, and public live
  browser evidence passing. Remaining blocking checks are
  `release.readiness-report`, `proof.staging-report`,
  `proof.staging-domain-preflight`, `proof.staging-supabase-runtime-report`,
  `proof.production-report`, and `proof.production-stripe-readback-report`.
- `../webot-platform`: refreshed `release:completion-audit` is NO-GO with three
  blocking gates: `release.readiness` for incomplete live Stripe readback,
  `proof.staging` for staging domain preflight, and `proof.production` for
  production remote-smoke customer-flow failure. Completion audit now stops
  cascading downstream production proof errors after the remote-smoke blocker.

## Owned Infrastructure Pivot

Vercel is no longer the desired deployment target for `webot-platform`.

- Target direction: owned/server-controlled infrastructure using free/open
  tooling where practical.
- `webot-flow` now requires a Phase 1 resource inventory before planning or
  state-changing work: scripts, tools, skills, servers/hosting, credential
  source paths, deployed services, `~/.webot/wiki`, warehouse/project docs, and local
  infrastructure.
- Adobe/server infrastructure is treated as live production-owned
  infrastructure. Do not modify, route, deploy, restart, or repoint anything
  there without Ian explicitly confirming the target, blast radius, and rollback
  path.
- `../webot-platform` has been pivoted away from Vercel assumptions:
  `vercel.json` and env-pull paths removed, deployment headers moved to
  `config/deployment-headers.json`, runtime marker is `WEBOT_RUNTIME_ENV`, and
  provider/release gates now focus on owned/server inventory plus Supabase and
  Stripe proof.
- `../webot-platform` now has `npm run release:resource-inventory`, a redacted
  `config/resource-inventory.example.json`, ignored
  `config/resource-inventory.json`, and release/final/completion gates that
  fail closed until approved owned/server inventory is supplied.
- Resource inventory now requires every existing live system to document touch
  policy, blast radius, state-preservation rule, and
  `preChangeApprovalRequired: true`.
- Resource inventory now also requires `targetServiceFamily` and rejects
  generic cloud/provider labels such as "Adobe Cloud"; approved inventory must
  name the exact service family before deployment planning.
- Resource inventory now also requires a redacted `wikiEvidence` pointer under
  `~/.webot/wiki` so verified Adobe/owned facts are captured outside transient
  chat before deployment can be approved.
- `../webot-platform` now has
  `docs/operations/owned-infrastructure-intake.md` as the required intake
  checklist before creating the ignored inventory file.
- `../webot-platform` now has `npm run release:owned-runtime-plan`, which fails
  closed until the inventory passes and then writes locked redacted JSON/Markdown
  operator-plan artifacts without executing deploy, restart, DNS, or rollback
  commands. It now supports `--target staging`; the latest staging plan artifact
  is `../webot-platform/test-results/final-release/staging/owned-runtime-plan.md`.
- `../webot-platform` now has `project-map.md` documenting the host-neutral
  Next.js runtime shape, scripts, credential-source rules, and cross-repo
  dependencies for future agents.
- `../webot-platform` now has guarded owned-runtime deploy scripts:
  `scripts/deploy-cwatchtower-owned-runtime.sh` for app/API and
  `scripts/deploy-cwatchtower-supabase-runtime.sh` for the
  Supabase-compatible runtime.
- `../webot-platform` also has `npm run release:resource-discovery`, which
  captures script/doc/domain/credential-source paths, wiki/warehouse/project
  knowledge-source paths, and credential modes without printing secret values.
  It now warns if the Adobe/owned infrastructure intake page is missing from
  `~/.webot/wiki`.
  Latest discovery passed with Supabase, Oracle, GoDaddy, F5 server, Stripe,
  GitHub, and tooling credential sources recorded; private credential files
  checked so far are locked to `0600`.
- Verified Adobe Cloud or owned/server facts must be stored, without secrets, in
  `~/.webot/wiki/queries/adobe-cloud-owned-infrastructure-intake.md` as well as
  the platform owned-infrastructure intake.
- Current wiki inventory found no Adobe-specific credential filename or
  deployment source in the scoped local search. It did record non-secret
  owned-infra credential-source names for Oracle, GoDaddy, F5, Supabase, and
  Stripe; Adobe Cloud itself remains unverified.
- After Ian said both entries were saved, a follow-up credential-source scan
  still found no Adobe-specific filename or Adobe/App Builder/AIO/IMS label in
  `~/.webot/credentials`; `supabase.rtf` is present and owner-only (`0600`).
- The Adobe intake wiki now includes official public Adobe service-family notes:
  App Builder, I/O Runtime, AEM Cloud Manager, and Adobe Commerce Cloud are
  distinct targets with different runtime implications. None is approved yet.
- The Adobe/owned intake wiki now also records the latest non-secret release
  findings: Supabase management token authenticates but exposes zero projects,
  envs are prepared for an owned/self-hostable Supabase-compatible runtime,
  staging Stripe test readback passes through the direct locked artifact, and
  production live Stripe catalog creation is the next money-surface step before
  live readback can pass.
- `release:safe-evidence` now reuses existing public browser evidence by
  default; live browser capture requires explicit `--capture-public-browser`.
- `config/resource-inventory.json` exists locally as an ignored approved
  cwatchtower owned-server inventory. It points at durable wiki evidence and
  keeps secret values out of git.
- `release:provider-auth` passes with owned-infrastructure, Supabase, and Stripe
  credential-source proof. Live Stripe catalog readback is waiting on approved
  idempotent live tier creation.
- Active brand direction includes privacy/control/data minimization:
  "We care about your outcome, not collecting your data."

## Current Product Definition Of Done

The platform is ready when all of this is true and verified:

- Public Agency/Studio surfaces present the expanded service families, pricing
  direction, API/human/both account options, and premium visual system.
- Backend/dashboard/API support auth, API keys, usage, jobs, files, limits,
  rejects, Stripe entitlement sync, customer dashboard, docs, and safe
  post-payment continuation.
- Staging and production envs contain locked release values and pass env checks.
- DNS/HTTPS for `app.webot.studio`, `api.webot.agency`, and
  `supabase.webot.agency` resolves to approved owned infrastructure.
- Staging DNS/runtime proof is not complete. Current staging env points at
  `staging.app.webot.studio`, `staging.api.webot.agency`, and
  `supabase-staging.webot.agency`; app/API DNS now resolve to the owned server,
  but HTTPS/server routes are not approved/deployed, and
  `supabase-staging.webot.agency` still does not resolve from the active
  authoritative nameservers.
- Human-style browser proof follows the full customer flow except payment
  submission, then continues through post-payment, dashboard, jobs, and build
  stations.
- Family agents have expert-level category skills, worker-packet handoff, and
  human-intent understanding proof.
- Final model choices may remain deferred only after every non-model product,
  dashboard, API, env, proof, and deployment surface is production-ready.

## Hard Stop Blockers

- Live Stripe catalog/readback is the remaining release-readiness hard stop.
  Read-only live validation writes a locked invalid-catalog artifact and reports
  `Missing Stripe product for human_basic`.
- Production proof is also a final-release hard stop until the local
  proxy-origin redirect fix is deployed through the approved owned-runtime
  path and remote smoke passes.
- Full completion audit also requires staging proof. Staging DNS/runtime is not
  online yet; `release:proof -- --target staging` now fails first at
  `domain-preflight` and writes the staging DNS/HTTPS state to
  `test-results/final-release/staging/domain-proof.json`. Completion audit now
  requires that staging domain artifact as first-class evidence. Remaining
  action: confirm `supabase-staging` exists in the active `webot.agency`
  authoritative DNS provider, then get explicit approval for the server-side
  staging route/runtime changes after it resolves.
- `../webot-platform/docs/stripe/live-catalog-runbook.md` documents the exact
  approval phrase, dry-run, guarded live `release:proof` command, live readback
  artifact path, and final gates for the live Stripe catalog step.
- `../webot-platform` `release:readiness` and `release:inputs` now point the
  incomplete production Stripe readback action at that runbook and the guarded
  `--include-stripe-create --confirm-live-stripe` proof command.
- Completion audit is still NO-GO until production proof passes, live Stripe
  readback passes, staging proof passes, and the final audit is rerun with the
  deployed evidence bundle. Current blocking gates are `release.readiness`,
  `proof.staging`, and `proof.production`.
- No new DNS changes, live deploys, live publishes, Stripe live mutations,
  payment submissions, paid ads, affiliate links, tracking pixels, or broader
  data-retention promises without explicit approval. The app/API/Supabase deploy
  has already been completed under the approved cwatchtower owned-server path;
  new live service changes still need their own approval.
- Do not claim newsletter/contact flows are CRM-wired beyond the localStorage
  and mailto fallback reality unless code and live checks prove it.

## Where To Continue

- Active state: `ACTIVE_STATE.md`
- Focused continuation: `.handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md`
- Historical detail: `.handoffs/archive/`
