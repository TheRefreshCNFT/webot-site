# Pricing And Checkout Contract

Status: Phase 01 source-of-truth contract.
Scope: intended pricing ladder, Stripe tier metadata, checkout safety, discount handling, and Phase 04 implementation requirements.

## Price Ladder

The new subscription ladder has three tier families, each with Basic, Mid, and Top levels:

| Tier family | Basic | Mid | Top |
| --- | ---: | ---: | ---: |
| Human Account | $10/mo | $20/mo | $30/mo |
| API-only Agent | $7/mo | $14/mo | $21/mo |
| Both | $15/mo | $30/mo | $45/mo |

This ladder is the intended production catalog for the new monetization/API expansion. Existing Agency Office bundle links and existing Studio links remain protected legacy money paths until intentionally migrated.

## Exact Stripe Catalog

Phase 04 must create and wire exactly these nine production Stripe subscription tiers:

| Display name | Amount | Recurrence | webot_tier_family | webot_tier_level | webot_entitlement_code | webot_monthly_quota | webot_api_access | webot_dashboard_access |
| --- | ---: | --- | --- | --- | --- | ---: | --- | --- |
| Human Basic | $10 | monthly | human | basic | human_basic | 10 | false | true |
| Human Mid | $20 | monthly | human | mid | human_mid | 25 | false | true |
| Human Top | $30 | monthly | human | top | human_top | 50 | false | true |
| API-only Agent Basic | $7 | monthly | api_only_agent | basic | api_agent_basic | 100 | true | false |
| API-only Agent Mid | $14 | monthly | api_only_agent | mid | api_agent_mid | 250 | true | false |
| API-only Agent Top | $21 | monthly | api_only_agent | top | api_agent_top | 500 | true | false |
| Both Basic | $15 | monthly | both | basic | both_basic | 100 | true | true |
| Both Mid | $30 | monthly | both | mid | both_mid | 250 | true | true |
| Both Top | $45 | monthly | both | top | both_top | 500 | true | true |

Required Stripe metadata keys for every product and recurring price:

- `webot_tier_family`
- `webot_tier_level`
- `webot_entitlement_code`
- `webot_monthly_quota`
- `webot_api_access`
- `webot_dashboard_access`

Metadata values must match the table above. Stripe metadata values are strings at the API boundary, but backend code may parse booleans and quotas into typed entitlement records.

## Phase 04 Implementation Requirements

Phase 04 must create or idempotently find the product, recurring price, and Payment Link or Checkout Session wiring for each tier.

Phase 04 must capture:
- product IDs
- price IDs
- Payment Link IDs or Checkout Session lookup keys
- livemode/testmode status
- amount assertions
- required metadata readback
- success/cancel URLs
- entitlement mapping evidence

Phase 04 must map entitlements server-side. The dashboard, API, and customer access checks must not grant access from query parameters alone.

Phase 04 must validate the catalog in Stripe test mode, then open live hosted checkout for each tier without payment submission. Button and hosted checkout testing may open checkout pages up to payment submission only; no payment details may be entered and no real charge may be created during verification.

## Entitlement Mapping Rules

Backend entitlement records must be derived from verified Stripe state and webhook-backed records, not public copy or client-side selected plans.

Required mapping behavior:
- `human_*` tiers grant dashboard access and human-reviewed job/account surfaces, with no API key access by default.
- `api_agent_*` tiers grant API access for agent/API customers, with no dashboard access by default beyond any minimal account/billing surface needed for security and support.
- `both_*` tiers grant both API access and dashboard access.
- `webot_monthly_quota` is an entitlement quota key, not a public promise of unlimited work.
- Unknown products, missing metadata, mismatched amounts, or duplicated entitlement codes must fail closed.

## Repeat-Agent Discount Rules

Repeat-agent and returning-agent discounts must use customer-bound Stripe promotion codes or customer-specific checkout sessions.

Rules:
- No public coupon codes.
- No static discount code in HTML, public docs, screenshots, or unauthenticated API responses.
- Backend eligibility verification is required before a discounted checkout is created or shown.
- Eligibility must bind to a Stripe Customer, authenticated account, verified email, or other approved customer identity.
- Discount creation and redemption must be auditable by customer, tier, discount amount, eligibility reason, and expiration.
- If eligibility cannot be verified, checkout falls back to the standard tier price.

## Protected Legacy Link Rules

Current Agency Office bundle links and current Studio links are protected real-money paths under STRIPE-01. They must remain unchanged while the new nine-tier catalog is added unless Ian explicitly approves a migration.

Existing old links are not blockers for the new tier setup. Phase 04 must add the new nine-tier catalog beside the protected legacy links, then later phases can migrate public buttons only after approval and verification.

Before any release that touches checkout surfaces, compare protected legacy links against `docs/monetization/protected-stripe-links-snapshot.md`. A protected link diff is a release blocker unless the diff is the approved migration being verified.
