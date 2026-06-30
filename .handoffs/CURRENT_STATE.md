---
project: webot-site
last_updated: 2026-06-30
status: public site stable; WeBot platform live on owned cwatchtower infrastructure
authoritative_branch: master
live_url: https://webot.agency
deployment: GitHub Pages from TheRefreshCNFT/webot-site on master
archive_replaces:
  - .handoffs/archive/CURRENT_STATE-20260630T0012Z-pre-live-owned-runtime.md
---

# webot.agency Current State

Read this first, then `AGENTS.md`, then `ACTIVE_STATE.md`.

## Ground Truth

- `webot-site` is the static public `webot.agency` repo. Do not add a build
  step, framework, package manager, or `package.json`.
- Live public site deploys only through `scripts/publish-live.sh`.
- Existing Agency Office and Studio payment links are real-money paths. Do not
  change prices, products, Payment Links, or checkout URLs without Ian's
  explicit approval.
- `webot-flow` requires Phase 1 resource inventory before planning or
  state-changing work. Search project docs, warehouse, `~/.webot/wiki`, scripts,
  servers, active services, and credential-source paths before choosing a
  release path.
- Legacy hosted-provider deployment is not the WeBot platform target.

## Owned Platform Status

- `../webot-platform` production is live on cwatchtower owned infrastructure:
  - App: `https://app.webot.studio`
  - API: `https://api.webot.agency`
  - Supabase-compatible runtime: `https://supabase.webot.agency`
- Isolated staging is also live on cwatchtower:
  - App: `https://staging.app.webot.studio`
  - API: `https://staging.api.webot.agency`
  - Supabase-compatible runtime: `https://supabase-staging.webot.agency`
- Adobe Cloud remains an unverified future option only. Current verified owned
  target is cwatchtower/Oracle with Docker, Caddy, and Supabase-compatible
  runtime. Do not relabel this as Adobe Cloud without a named Adobe service,
  environment, deploy command, health check, and rollback boundary.
- Live Stripe catalog exists and open-only readback validates all nine tiers.
  No live Stripe creation is currently needed.

## Latest Verification

- `webot-site`: `git diff --check` and `scripts/test-itinerary-flow.sh --live`
  passed. Latest live evidence:
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260630T003449Z`.
- `../webot-platform`: `release:readiness` is `GO`.
- `../webot-platform`: `release:inputs` is `READY`.
- `../webot-platform`: `release:completion-audit` is `GO`; only remaining
  allowed work is final model/runtime selection.
- The next-session runbook for that work is
  `../webot-platform/docs/operations/model-runtime-selection.md`.
- `../webot-platform`: production cwatchtower wrapper passed:
  `test-results/final-release/production/production-cwatchtower-release.json`.
- `../webot-platform`: staging cwatchtower wrapper passed:
  `test-results/final-release/staging/staging-cwatchtower-release.json`.
- `../webot-platform`: strict production proof passed with deploy-check,
  production remote smoke, production Supabase runtime proof, and live Stripe
  readback:
  `test-results/final-release/production/production-proof.json`.
- `../webot-platform`: staging proof passed with domain proof, isolation proof,
  remote smoke, Supabase runtime proof, and test Stripe readback:
  `test-results/final-release/staging/staging-proof.json`.
- `../webot-platform`: final public browser evidence is copied to
  `test-results/final-release/public-live-browser`.

## Safety Notes

- cwatchtower hosts other live products. Use only guarded scripts/runbooks for
  platform deploys and preserve unrelated Docker/Caddy/PM2 services.
- Production and staging smoke accounts were bootstrapped additively for live
  browser proof. Synthetic smoke jobs titled `Release smoke SEO flow ...` were
  canceled after proof so future smoke tests start with open slots.
- Stripe readback artifacts are packaged under ignored config files:
  `config/stripe-live-catalog-readback.production.json` and
  `config/stripe-test-catalog-readback.staging.json`.
