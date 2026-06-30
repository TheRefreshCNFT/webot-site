# WeBot Platform Owned Infrastructure Continuation - 2026-06-29

## Goal

Preserve the production-ready monetizable WeBot platform on owned/open
infrastructure, not the legacy hosted provider. Keep live cwatchtower products
unchanged unless explicitly approved, and keep final model/runtime choices as
the only allowed deferred item.

## Current State

- The legacy hosted provider is removed as the required release target.
- Current owned target is cwatchtower Oracle Linux owned-server infrastructure.
- Adobe Cloud remains unverified; future Adobe work must identify a concrete
  service family and deployment boundary first.
- Active process surfaces have been swept for the legacy provider: no active
  `webot-platform` package script, source/doc file, provider metadata
  directory, or provider-named file remains outside ignored/generated/archive
  history.
- `webot-flow` now guards subagent searches against shell expansion and forbids
  subagent vendor-CLI calls without exact explicit approval.
- Resource inventory, owned-runtime plan, env checks, production DNS proof,
  staging DNS/HTTPS proof, local Supabase runtime proof, production Supabase
  runtime proof, staging Supabase runtime proof, local
  agent/fulfillment/payment webhook proofs, staging Stripe readback, live Stripe
  open-only readback, staging isolation proof, production proof, staging proof,
  and public browser evidence exist.
- Release readiness is `GO`; release inputs are `READY`; completion audit is
  `GO`.
- Release inputs now content-validate the separate staging and production
  `remote-smoke-report.json` artifacts, including API health, browser
  screenshot evidence, and customer-flow readiness screenshots.

## Remaining Work

- Human live testing.
- Final private model/runtime selection using
  `../webot-platform/docs/operations/model-runtime-selection.md`.
- Do not reopen owned-infrastructure, DNS, Stripe, or public-site readiness
  gates unless the selected runtime requires a verified guarded env/deploy
  change.

## Guarded Future Commands

Production app/API deploy, only if a future approved runtime/platform change
requires it:

```bash
cd /Users/webot/Projects/webot-platform
npm run release:production-cwatchtower -- --execute --confirm-live --approval-phrase 'I approve running the production WeBot platform app/API cwatchtower deploy on owned infrastructure with rollback through releases/previous.' --report-file test-results/final-release/production/production-cwatchtower-release.json
```

The production orchestrator is the preferred approved path because it runs
production env check, owned-resource auth, app/API deploy dry-run, production
domain preflight, live app/API deploy, post-deploy domain proof, remote smoke,
and production proof without Stripe creation. The underlying live mutation
command remains `scripts/deploy-cwatchtower-owned-runtime.sh --confirm-live
--approval-phrase '<exact production approval phrase>'`.

Live Stripe catalog repair/rerun, only if explicitly approved through the
idempotent path:

```bash
npm run stripe:create-tiers -- --mode live --env-file .env.production.local --idempotent --confirm-live-stripe --report-file test-results/final-release/production/stripe-create-report.json
npm run stripe:validate-tiers -- --mode live --env-file .env.production.local --open-only --report-file test-results/final-release/production/stripe-validate-report.json
```

Staging app/API and Supabase deploys, only if a future approved change requires
them after confirming current DNS proof remains green:

```bash
npm run release:staging-cwatchtower -- --execute --confirm-staging --approval-phrase 'I approve running the isolated staging WeBot platform app/API and Supabase runtime deploy on cwatchtower with before/after production-invariant snapshots.' --report-file test-results/final-release/staging/staging-cwatchtower-release.json
```

The orchestrator is the preferred approved path because it runs staging DNS
preflight, before snapshot, isolated app/API deploy, isolated Supabase deploy,
after snapshot, isolation proof, staging domain proof, staging remote smoke, and
staging proof in order. The underlying mutation commands are:

```bash
scripts/deploy-cwatchtower-owned-runtime.sh --target staging --confirm-staging --approval-phrase 'I approve running the isolated staging WeBot platform app/API and Supabase runtime deploy on cwatchtower with before/after production-invariant snapshots.'
scripts/deploy-cwatchtower-supabase-runtime.sh --target staging --confirm-staging --approval-phrase 'I approve running the isolated staging WeBot platform app/API and Supabase runtime deploy on cwatchtower with before/after production-invariant snapshots.'
```

## Safe Verification Commands

```bash
cd /Users/webot/Projects/webot-platform
npm run release:domains -- --output-file test-results/final-release/domain-proof.json
npm run release:domains -- --target staging --output-file test-results/final-release/staging/domain-proof.json
npm run release:remote-smoke -- --env-file .env.production.local --output-dir test-results/final-release/production/remote-smoke --report-file test-results/final-release/production/remote-smoke-report.json
npm run release:readiness -- --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --staging-stripe-readback-file test-results/final-release/staging/stripe-validate-report.json --production-stripe-readback-file test-results/final-release/production/stripe-validate-report.json --report-file test-results/final-release/release-readiness-report.json
npm run release:inputs -- --artifact-dir test-results/final-release --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --report-file test-results/final-release/release-inputs-report.json
npm run release:cwatchtower-snapshot -- --output-file test-results/final-release/staging/cwatchtower-before.json --dry-run
```

## Latest Local Fix

- The app/API deploy script records the previous release symlink at
  `releases/previous` before promotion. The runbook rollback command checks
  that pointer and restarts `webot-platform-app` through the owned-runtime
  compose file.
- Staging app/API and Supabase deploy dry-runs now validate local env files,
  credential-source files, and deploy assets before reporting PASS without
  requiring `--confirm-staging`; real staging deploys still require
  `--confirm-staging` plus the exact approval phrase.
- `npm run release:staging-cwatchtower` now guards the full staging lane. It is
  dry-run by default, writes a locked report, accepts DNS PASS/HTTPS FAIL only
  for the pre-deploy domain check, and requires `--execute --confirm-staging`
  plus the exact approval phrase before any live server mutation. The report
  suppresses child command output, the DNS-only preflight requires the exact
  three staging hosts, child commands have timeouts, and
  after-snapshot/isolation evidence still runs after a failed post-mutation step
  where possible.
- `npm run release:production-cwatchtower` now guards the production app/API
  lane. It is dry-run by default, writes a locked report, runs local env,
  owned-resource, and app/API dry-run preflights before any live mutation, and
  requires `--execute --confirm-live` plus the exact approval phrase for the
  cwatchtower app/API deploy. It does not create live Stripe products, prices,
  or Payment Links.
- `npm run release:cwatchtower-snapshot` is the read-only before/after snapshot
  command for staging isolation proof.
- Remote smoke now requires `/api/health.releaseMarker` to exactly match
  `WEBOT_RELEASE_MARKER`.
- `release:inputs` content-validates staging and production proof artifacts,
  including remote smoke, Supabase runtime proof, Stripe readback, and browser
  evidence.
- `release:readiness` is `GO`, `release:inputs` is `READY`, and
  `release:completion-audit` is `GO`.
- The cwatchtower snapshot script now uses `datetime.timezone.utc` so it works
  on the Python runtime available on cwatchtower.
- Remote-smoke early-failure reports now preserve the requested `--env-file`
  and `--output-dir` values, with focused regression coverage in
  `tests/release-proof.test.ts`.
- Staging domain proof, remote smoke, Supabase runtime proof, and release-input
  operator actions now align with the live isolated staging runtime, with
  focused coverage in `tests/release-domains.test.ts` and
  `tests/release-inputs.test.ts`.
- Raw live Stripe tier creation now requires `--confirm-live-stripe`; without
  it, the script fails before any API call. The live catalog has been created
  and validated; future Stripe work should preserve the locked readback
  artifact path and use idempotent repair commands only when intentionally
  needed.
