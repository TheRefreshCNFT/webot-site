---
project: webot-platform monetization/API expansion
created: 2026-06-29
status: active; owned-runtime deployed; live Stripe readback pending
primary_repo: /Users/webot/Projects/webot-platform
public_site_repo: /Users/webot/Projects/webot-site
archive_source: .handoffs/archive/WEBOT_PLATFORM_DELUXE_CONTINUATION_2026-06-28-pre-slim.md
---

# WeBot Platform Owned Infrastructure Continuation

## Definition Of Done

Finish the production-ready, monetizable WeBot platform with final model choices
allowed to remain deferred only after every non-model gate passes.

Done requires:

- public Agency/Studio surfaces aligned with the expanded offer and protected
  payment paths;
- authenticated dashboard, API keys, usage, jobs, files, limits, rejects,
  Stripe entitlement sync, API docs, and customer-safe post-payment flows;
- expert family skill/backbone coverage and worker-packet handoff for every
  service family;
- real staging and production envs, DNS/HTTPS, Supabase remote proof, Stripe
  test/live readback proof, and full deployed browser/customer-flow evidence;
- deployment on owned/server-controlled infrastructure, not Vercel.

## Deployment Pivot

- Vercel is not the deployment target or required release path.
- `../webot-platform` now uses host-neutral deployment headers in
  `config/deployment-headers.json`.
- Remote runtime intent is represented by `WEBOT_RUNTIME_ENV=staging` or
  `WEBOT_RUNTIME_ENV=production`.
- Release/provider gates now check owned/server inventory plus Supabase and
  Stripe proof.
- A new `release:resource-inventory` gate verifies a redacted,
  Ian-approved `config/resource-inventory.json` before readiness, final release,
  release inputs, safe evidence, or completion audit can pass.
- The inventory gate now requires existing live systems to include touch policy,
  blast radius, state-preservation rule, and `preChangeApprovalRequired: true`
  before Adobe/server infrastructure can be considered approved.
- The inventory gate now requires `targetServiceFamily` and rejects generic
  cloud/provider labels such as "Adobe Cloud"; approved inventory must name the
  exact service family before deployment planning can pass.
- The inventory gate now also requires `wikiEvidence.path` under `~/.webot/wiki`
  with `containsSecretValue: false`, so verified Adobe/owned facts must be
  captured in the durable wiki before inventory approval can pass.
- A new `release:resource-discovery` command captures scripts, docs, known
  domains, wiki/warehouse/project knowledge-source paths, and credential-source
  paths/modes without printing secret values. It warns if the required
  Adobe/owned infrastructure intake page is missing from `~/.webot/wiki`.
- A new `release:owned-runtime-plan` command converts a passing approved
  inventory into locked redacted JSON/Markdown operator-plan artifacts. It fails
  closed when inventory is missing or invalid and never executes deploy,
  restart, DNS, or rollback commands. It now supports `--target staging` and
  writes the isolated staging approval artifact at
  `../webot-platform/test-results/final-release/staging/owned-runtime-plan.md`.
- The cwatchtower deploy scripts now support `--target production|staging`.
  Production still requires `--confirm-live`; staging requires
  `--confirm-staging` and uses isolated staging paths, service names,
  env files, Caddy snippets, and Supabase project naming.
- A new `release:staging-isolation` verifier dry-runs the required
  before/after cwatchtower snapshots and can fail an approved staging deploy if
  production containers or production Caddy blocks changed.
- `/api/health` now exposes `runtimeEnvironment` and `releaseMarker`, and
  remote smoke checks the deployed API runtime identity before proof can pass.
- Verified Adobe Cloud or owned/server facts must be stored, without secrets, in
  `~/.webot/wiki/queries/adobe-cloud-owned-infrastructure-intake.md` as well as
  the platform owned-infrastructure intake.
- The current wiki inventory found no Adobe-specific credential filename or
  deployment source in the scoped local search. Non-secret owned-infra
  credential-source names were recorded, but Adobe Cloud itself remains
  unverified.
- The Adobe intake wiki now includes official public service-family notes for
  Adobe App Builder, Adobe I/O Runtime, AEM Cloud Manager, and Adobe Commerce
  Cloud. These notes do not prove access or approval for any target.
- `../webot-platform/project-map.md` now captures the host-neutral runtime map,
  release scripts, credential-source rules, and cross-repo dependencies for
  future agent pickup.
- `docs/operations/owned-infrastructure-intake.md` is the required intake
  checklist before creating `config/resource-inventory.json`; it captures
  target, host/service, credential source, deploy/start/rollback commands, DNS,
  live systems, blast radius, state-preservation rule, and approval evidence.
- Final release and release-input orchestration now include
  `resource-discovery-report.json` as the first durable release artifact before
  owned inventory, env, domain, runtime, browser, readiness, and completion
  gates.
- `release:safe-evidence` now reuses existing public browser evidence by
  default and requires explicit `--capture-public-browser` before it runs a
  live browser check.
- Adobe/server infrastructure must be treated as live until Ian explicitly
  confirms the exact target and rollback path.

## Current Deployed State

- `app.webot.studio` and `api.webot.agency` are live on `cwatchtower` through
  the isolated `webot-platform-app` Docker container.
- `supabase.webot.agency` is live on the owned Supabase-compatible runtime
  through `supabase_kong_webot-platform`.
- Guarded deploy scripts now exist in `../webot-platform`:
  `scripts/deploy-cwatchtower-owned-runtime.sh` and
  `scripts/deploy-cwatchtower-supabase-runtime.sh`.
- Staging owned-runtime artifacts now exist for approval only:
  `deploy/owned-runtime/Caddyfile.platform.staging.caddy`,
  `deploy/owned-runtime/Caddyfile.supabase.staging.caddy`, and
  `deploy/owned-runtime/docker-compose.cwatchtower.staging.yml`.
- Production remote Supabase REST/RPC proof passes against
  `https://supabase.webot.agency`.
- Release DNS/TLS proof passes for all three production domains.
- Public live browser evidence passed at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T164332Z`
  and was copied into
  `../webot-platform/test-results/final-release/public-live-browser`.

## Required Resource Inventory

Before deployment planning or state-changing work, capture:

- project scripts and release commands;
- available tools, skills, MCP/app servers, local agent helpers;
- owned servers/hosting, DNS domains, currently deployed services;
- credential/env source paths or names only, never values;
- relevant `~/.webot/wiki`, warehouse, and project docs;
- live products, paid paths, retention promises, and human gates.

Known local evidence so far:

- Some credential filenames exist under `~/.webot/credentials`, including
  Oracle/Godaddy/F5-related names, but their contents were not read.
- No Adobe-specific credential filename was found under `~/.webot/credentials`
  during the scoped local inventory.
- After Ian said both entries were saved, a follow-up credential-source scan
  still found no Adobe-specific filename or Adobe/App Builder/AIO/IMS label in
  `~/.webot/credentials`; `supabase.rtf` is present and owner-only (`0600`).
- No Adobe-specific deployment source was found in the scoped search across
  `~/.webot/wiki`, `~/warehouse`, `~/Projects/webot-site`, and
  `~/Projects/webot-platform`.
- Supabase credential source exists at `~/.webot/credentials/supabase.rtf`; its
  contents were not read, and the file was locked to owner-only mode `0600` on
  2026-06-29.
- `~/.webot/credentials/github.md` was also locked to owner-only mode `0600`
  after the redacted discovery report identified it as too open.
- Stripe CLI config exists locally and is owner-only.
- Adobe-specific deployment evidence was not found in the scoped local scan.
- Platform now includes `config/resource-inventory.example.json`; the actual
  ignored `config/resource-inventory.json` exists locally for the approved
  cwatchtower owned-server deployment and points to durable wiki evidence.
- `release:resource-inventory` passes against the approved ignored inventory.
- `release:provider-auth` now depends on the same resource inventory gate, so
  owned-infrastructure status remains WARN until the approved ignored inventory
  exists and passes.
- Resource discovery distinguishes shell variable self-references from pasted
  secret values; current discovery reports no secret-like knowledge-source
  content.
- Resource discovery now scans `~/.webot/wiki` so the Adobe Cloud intake wiki
  page is part of the redacted release evidence.
- Approved cwatchtower owned-server deployment has been performed for
  app/API/Supabase only. Existing live products on the host were left in place.

## Verification Baseline

Latest verified local platform baseline from the pivot:

- `npm run deploy:check` passed in `../webot-platform` after the staging
  deploy/isolation and runtime-marker work. Coverage included secrets check,
  local env check, DB contract, lint, typecheck, 50 Vitest files / 306 tests,
  25 Playwright E2E tests, cleanup dry-run, build, and local
  agent/fulfillment/payment-webhook proofs.
- Focused staging/runtime tests passed with 10 files / 81 tests across owned
  deploy scripts, staging isolation, health, release proof, release env prep,
  owned-runtime plan, release inputs, completion audit, final release, and safe
  evidence. `npm run typecheck`, `npm run lint`, and `git diff --check` passed.
- `npm run release:resource-discovery -- --report-file test-results/final-release/resource-discovery-report.json`
  passed with `secretValuesPrinted=false`, 7 expected docs, 22
  credential-source paths, 69 redacted knowledge-source paths across platform
  docs, `~/.webot/wiki`, warehouse notes, and the project directory, and no
  issues.
- `npm run release:safe-evidence -- --dry-run --report-file test-results/final-release/safe-evidence-refresh-report.json`
  passed and planned reuse of existing browser evidence, not live capture.
- `npm run release:safe-evidence -- --artifact-dir test-results/final-release --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --report-file test-results/final-release/safe-evidence-refresh-report.json`
  refreshed the full redacted artifact set with `0600` reports and no-secret
  report flags (`secretValuesPrinted=false` or `stripeSecretKeyPrinted=false`
  depending on report type); it reports NO-GO as intended.
- `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/final-release/local-supabase-runtime-proof.json --timeout-ms 240000`
  passed, started/stopped local Supabase, applied migrations, completed
  production repository REST/RPC round trips, wrote a redacted `0600` artifact,
  and printed no secrets.
- `npm run release:domains -- --output-file test-results/final-release/domain-proof.json`
  passes for `app.webot.studio`, `api.webot.agency`, and
  `supabase.webot.agency`.
- `npm run release:provider-auth -- --inventory-file config/resource-inventory.json --report-file test-results/final-release/provider-auth-report.json`
  passes with owned-infrastructure, Supabase, and Stripe credential-source
  proof.
- `npm run runtime:remote-supabase-proof -- --target production --env-file .env.production.local --output-file test-results/final-release/production/supabase-runtime-report.json`
  passes against the owned production Supabase-compatible runtime.
- `npm run release:readiness` currently reports NO-GO only at
  `stripe-readback.live`; read-only live validation reports
  `Missing Stripe product for human_basic`.
- `npm run release:inputs` currently blocks on
  `release.readiness-report`, `proof.staging-report`,
  `proof.staging-domain-preflight`, `proof.staging-supabase-runtime-report`,
  `proof.production-report`, and `proof.production-stripe-readback-report`.
- `npm run release:safe-evidence -- --artifact-dir test-results/final-release --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --capture-public-browser --report-file test-results/final-release/safe-evidence-refresh-report.json`
  refreshed the final-release artifact bundle with all artifact checks passing
  and `secretValuesPrinted=false`; it remains NO-GO at release-readiness,
  release-inputs, and completion-audit.
- Staging proof now confirms env passes, then stops at `domain-preflight`
  before deploy/runtime checks. The generated DNS artifact is
  `test-results/final-release/staging/domain-proof.json`; it shows
  `staging.app.webot.studio` and `staging.api.webot.agency` DNS resolve to
  `141.148.79.11` but HTTPS is not ready, while
  `supabase-staging.webot.agency` still has no A record. Staging Stripe test
  readback separately validates all nine test tiers with
  `stripeSecretKeyPrinted=false`.
- After the live Stripe operator-safety cleanup, generated readiness/proof
  reports no longer surface raw live `stripe:create-tiers` or
  `stripe:validate-tiers` child commands as operator steps; they point at
  `docs/stripe/live-catalog-runbook.md` and the guarded production
  `release:proof --include-stripe-create --confirm-live-stripe` path.
- Staging deploy dry-runs passed for both
  `scripts/deploy-cwatchtower-owned-runtime.sh --target staging --confirm-staging --dry-run`
  and
  `scripts/deploy-cwatchtower-supabase-runtime.sh --target staging --confirm-staging --dry-run`.
  `npm run release:staging-isolation -- --dry-run` writes the required
  before/after production invariant plan without touching cwatchtower.
- `webot-site` `scripts/test-itinerary-flow.sh` passed at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T170940Z`.
- `npm run typecheck` and the focused release-gate Vitest suite passed after
  adding the owned-runtime plan artifact.

## Current Blockers

- Live Stripe catalog/readback is the remaining release-readiness hard blocker.
  Creating live
  Stripe products, prices, or payment links is a money-surface action and
  requires Ian's explicit approval before running the idempotent live catalog
  script.
- Full completion audit also needs staging proof. `release:proof -- --target
  staging` now fails first at `domain-preflight` and writes
  `test-results/final-release/staging/domain-proof.json` with current
  staging DNS/HTTPS state. Completion audit now requires that staging domain
  artifact before final GO; `supabase-staging` DNS plus isolated cwatchtower
  staging routes/runtime still need explicit approval and rollback planning.
  The local-only staging owned-runtime plan is generated and ready for review.
- Production proof is blocked at remote smoke until the approved owned-runtime
  deploy carries the local runtime-marker/proxy-origin work live. Current
  remote smoke fails `api-health` because deployed health has not proved
  `runtimeEnvironment=production`, and fails the customer-flow browser step
  after navigation to `chrome-error://chromewebdata/`.
- After Ian reported all three staging DNS entries saved,
  `supabase-staging.webot.agency` still has no A record at the active
  authoritative `ns-cloud-e*.googledomains.com` nameservers. Re-check the
  active `webot.agency` DNS provider/name before server-side staging approval.
- Use `../webot-platform/docs/stripe/live-catalog-runbook.md` for the exact
  approval phrase, dry-run, guarded live `release:proof` command, readback
  artifact path, and final gates.
- `../webot-platform` `release:readiness` and `release:inputs` now point the
  missing production Stripe readback action at that runbook and the guarded
  `--include-stripe-create --confirm-live-stripe` proof command.
- Final completion audit remains blocked until live Stripe readback exists.

## Hard Stops

- Do not touch Adobe Cloud, Oracle/server, GoDaddy/DNS, live Stripe, payment
  submissions, or live publishes without explicit approval for that exact
  action.
- Do not print secret values.
- Do not mark the platform production-ready from local gates alone.
