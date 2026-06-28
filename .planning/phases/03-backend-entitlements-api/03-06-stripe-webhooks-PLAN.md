# Phase 03-06 Plan: Stripe Webhooks and Entitlement Updates

## Objective

Implement Stripe webhook handling that verifies signatures, records events idempotently, and updates entitlements server-side.

Requirements: DATA-01, SEC-02, STRIPE-02, STRIPE-03.

## Dependencies

- `03-02-auth-rls-entitlements-PLAN.md` complete.
- Phase 01 pricing/checkout contract defines the final nine-tier metadata contract from STRIPE-03.

## Read First

- `docs/monetization/pricing-checkout-contract.md`
- `../webot-platform/docs/security/threat-model.md`
- `../webot-platform/docs/api/v1-contract.md`

## Tasks

### Task 1: Implement Signed, Idempotent Webhook Intake

Files:
- `../webot-platform/app/api/stripe/webhook/route.ts`
- `../webot-platform/lib/stripe/webhooks.ts`
- `../webot-platform/supabase/migrations/0006_stripe_webhook_events.sql`
- `../webot-platform/tests/api/stripe-webhook-signature.test.ts`

Action:
- Verify Stripe webhook signatures before parsing trusted event content.
- Record webhook event ID, type, livemode, received timestamp, processed timestamp, and processing result.
- Idempotency must prevent duplicate entitlement changes when the same event arrives more than once.
- Tests must include invalid signature rejection, duplicate event replay, and allowed event type processing.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/stripe-webhook-signature.test.ts`
- Automated: `grep -E "constructEvent|signature|webhook_events|idempot" ../webot-platform/app/api/stripe/webhook/route.ts ../webot-platform/lib/stripe/webhooks.ts ../webot-platform/supabase/migrations/0006_stripe_webhook_events.sql`

Done:
- Unsigned or duplicate Stripe events cannot mutate customer entitlements.

### Task 2: Map Stripe Products/Prices to Server-Side Entitlements

Files:
- `../webot-platform/lib/stripe/entitlement-map.ts`
- `../webot-platform/lib/entitlements/stripe-sync.ts`
- `../webot-platform/tests/api/stripe-entitlements.test.ts`

Action:
- Map the nine STRIPE-03 tier metadata values to server-side entitlement codes: Human Basic/Mid/Top, API-only Agent Basic/Mid/Top, and Both Basic/Mid/Top.
- Update entitlements from Stripe customer/subscription state only. Do not trust querystrings, success-page parameters, client-side plan names, or dashboard local state.
- Tests must assert every required tier has a mapping, exact expected monthly amount, dashboard/API access flags, quota values, and no entitlement grant for fake return URLs.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/stripe-entitlements.test.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "payment=confirmed|session_id.*grant|query.*entitlement" app lib tests && exit 1 || true`

Done:
- Stripe subscription state is the only payment source that can grant or change entitlements.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/api/stripe-webhook-signature.test.ts tests/api/stripe-entitlements.test.ts`

## Source Coverage Audit

- DATA-01 covered for webhook events and entitlement updates.
- SEC-02 covered by server-side entitlement sync.
- STRIPE-02 covered by signatures and idempotency.
- STRIPE-03 covered by nine-tier entitlement mapping and amount assertions.
