# Active State: webot-site

## Current Focus

Public site is stable. Platform is live and ready for Ian's live testing on
owned cwatchtower infrastructure.

## Working Items To Test

- Production app: `https://app.webot.studio`
- Production API health: `https://api.webot.agency/api/health`
- Production Supabase auth health:
  `https://supabase.webot.agency/auth/v1/health`
- Staging app: `https://staging.app.webot.studio`
- Staging API health: `https://staging.api.webot.agency/api/health`
- Staging Supabase auth health:
  `https://supabase-staging.webot.agency/auth/v1/health`
- Public Agency site: `https://webot.agency`
- Public Studio site: `https://webot.studio`

## Verified Proofs

- Platform completion audit: `GO`.
- Release inputs: `READY`.
- Release readiness: `GO`.
- Production remote smoke: API health, public pages, login, dashboard, billing,
  display-only checkout return, job readiness/create, and build stations all
  passed.
- Staging remote smoke passed the same customer flow.
- Local Supabase, remote production Supabase, and remote staging Supabase
  runtime proofs passed.
- Live Stripe open-only readback validates all nine subscription tiers.
- Public live browser evidence passed for Agency and Studio desktop/mobile,
  routing, payment-confirmed screen, and test desk routes.

## Remaining Work

- Only final model/runtime selection remains as allowed post-GO platform work.
  Start in `../webot-platform/docs/operations/model-runtime-selection.md`.
- Do not run live Stripe creation again unless Ian gives the exact guarded
  approval phrase.
- Do not touch unrelated cwatchtower products outside guarded scripts.
