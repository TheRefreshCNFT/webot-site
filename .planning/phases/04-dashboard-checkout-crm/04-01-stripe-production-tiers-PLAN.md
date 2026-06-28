# Phase 04-01 Plan: Production Stripe Subscription Tiers

## Objective

Create and wire the nine new production Stripe subscription tiers while preserving existing legacy real-money links until intentionally migrated.

Requirements: PRICE-01, PRICE-02, STRIPE-01, STRIPE-02, STRIPE-03, SEC-02.

## Dependencies

- Phase 01 pricing/checkout contract complete.
- Phase 03 webhook entitlement mapping complete.

## Read First

- `docs/monetization/pricing-checkout-contract.md`
- `docs/monetization/protected-stripe-links-snapshot.md`
- `../webot-platform/lib/stripe/entitlement-map.ts`

## Tasks

### Task 1: Create Products, Prices, Metadata, and Checkout Wiring

Files:
- `../webot-platform/config/stripe-tiers.ts`
- `../webot-platform/package.json`
- `../webot-platform/scripts/stripe/create-subscription-tiers.ts`
- `../webot-platform/scripts/stripe/validate-subscription-tiers.ts`
- `../webot-platform/lib/checkout/tier-checkout.ts`
- `../webot-platform/docs/stripe/subscription-tier-catalog.md`
- `../webot-platform/tests/stripe/subscription-tier-catalog.test.ts`

Action:
- Create the exact nine STRIPE-03 production subscription tiers as additive new Stripe products: Human Basic $10, Human Mid $20, Human Top $30, API-only Agent Basic $7, API-only Agent Mid $14, API-only Agent Top $21, Both Basic $15, Both Mid $30, and Both Top $45.
- For each tier, create or reuse-by-metadata a recurring monthly Stripe Price and either a Payment Link or Checkout Session path. Capture Stripe product IDs, price IDs, payment link IDs or checkout session lookup keys, livemode flag, and metadata in `docs/stripe/subscription-tier-catalog.md`.
- Include metadata required by Phase 01: `webot_tier_family`, `webot_tier_level`, `webot_entitlement_code`, `webot_monthly_quota`, `webot_api_access`, and `webot_dashboard_access`.
- Configure success and cancel URLs for dashboard/account return paths. Success-page query parameters may display receipt context but must not grant entitlements; entitlement changes come from signed Stripe webhooks only.
- Wire checkout helpers to the Phase 03 entitlement mapping so each new price maps to the correct server-side entitlement.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/stripe/subscription-tier-catalog.test.ts`
- Automated: `cd ../webot-platform && npm run stripe:create-tiers -- --mode test`
- Automated: `cd ../webot-platform && npm run stripe:validate-tiers -- --mode test`
- Automated: `cd ../webot-platform && npm run stripe:create-tiers -- --mode live --idempotent`
- Automated: `cd ../webot-platform && npm run stripe:validate-tiers -- --mode live --open-only`
- Automated: `grep -E "Human Basic|Human Mid|Human Top|API-only Agent Basic|API-only Agent Mid|API-only Agent Top|Both Basic|Both Mid|Both Top" ../webot-platform/docs/stripe/subscription-tier-catalog.md`
- Automated: `grep -E "\\$10|\\$20|\\$30|\\$7|\\$14|\\$21|\\$15|\\$30|\\$45|product_.*|price_.*|success|cancel|metadata" ../webot-platform/docs/stripe/subscription-tier-catalog.md`

Done:
- All nine production subscription tiers exist or are idempotently found by metadata, amounts are asserted, checkout wiring exists, IDs are captured, and entitlements are mapped.

### Task 2: Validate Live Checkout Open and Protected Legacy Links

Files:
- `../webot-platform/docs/stripe/protected-legacy-link-audit.md`
- `../webot-platform/tests/e2e/stripe-live-open.spec.ts`
- `.planning/verification/stripe-tier-open-check.md`

Action:
- Validate all nine tiers in Stripe test mode, then validate live hosted checkout opens to each expected product and amount without entering payment details or creating charges.
- Audit existing Agency Office bundle and Studio Stripe links against the protected snapshot. Existing old links remain protected until intentionally migrated; their existence is not a blocker for the new nine-tier setup, and the new tier setup is required for done.
- Record open-without-payment browser evidence, product/amount readback, and protected legacy link diff in `.planning/verification/stripe-tier-open-check.md`.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- stripe-live-open.spec.ts`
- Automated: `grep -E "protected|Office bundle|Studio|unchanged|snapshot" ../webot-platform/docs/stripe/protected-legacy-link-audit.md`
- Automated: `grep -E "Human Basic|Human Mid|Human Top|API-only Agent Basic|API-only Agent Mid|API-only Agent Top|Both Basic|Both Mid|Both Top|open-without-payment|PASS|NO-GO" .planning/verification/stripe-tier-open-check.md`

Done:
- Live checkout opens safely for each new tier without payment submission, and protected legacy links are unchanged unless intentionally migrated.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/stripe/subscription-tier-catalog.test.ts`
- `cd ../webot-platform && npm run stripe:validate-tiers -- --mode test`
- `cd ../webot-platform && npm run stripe:create-tiers -- --mode live --idempotent`
- `cd ../webot-platform && npm run stripe:validate-tiers -- --mode live --open-only`
- `cd ../webot-platform && npm run test:e2e -- stripe-live-open.spec.ts`

## Source Coverage Audit

- PRICE-01 and STRIPE-03 covered by creating and validating the nine exact tiers.
- PRICE-02 covered by checkout helpers retaining customer-bound discount handling.
- STRIPE-01 covered by protected legacy link audit.
- STRIPE-02 and SEC-02 covered by webhook-backed entitlement mapping and refusal to trust success query parameters.
