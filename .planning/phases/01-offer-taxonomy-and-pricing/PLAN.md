# Phase 01 Plan: Offer Taxonomy and Pricing

## Objective

Create the source-of-truth offer, pricing, checkout, and copy contract that all later implementation phases must follow.

Requirements: TAX-01, TAX-02, TAX-03, PRICE-01, PRICE-02, COPY-01, COPY-02, STRIPE-01, STRIPE-03.

## Read First

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `.handoffs/CURRENT_STATE.md`
- `AGENTS.md`
- `ACTIVE_STATE.md`

## Tasks

### Task 1: Write the Offer Taxonomy Contract

Files:
- `docs/monetization/offer-taxonomy.md`

Action:
- Create a contract document for the eight service families in the required order from TAX-01.
- Place every new service from TAX-02 under exactly one family.
- Keep Office Skill Packs and Custom Builds separate per TAX-03.
- Include public-safe copy patterns from COPY-01 and the no-public-local-model-copy rule from COPY-02.

Verify:
- Automated: `grep -E "Create & Polish|Gather & Extract|Media & Convert|Build & Automate|Growth & Market|Review & Decide|Career & Prep|Plan & Itinerary" docs/monetization/offer-taxonomy.md`
- Automated: `grep -E "implementation-private|public-safe|reviewed delivery|We Bot You" docs/monetization/offer-taxonomy.md`

Done:
- The taxonomy document names all eight families, assigns all requested services, separates Office Skill Packs/Custom Builds, and contains no public local-model/internal implementation copy.

### Task 2: Write the Pricing and Checkout Contract

Files:
- `docs/monetization/pricing-checkout-contract.md`
- `docs/monetization/protected-stripe-links-snapshot.md`

Action:
- Document the Human, API-only Agent, and Both Basic/Mid/Top price ladder from PRICE-01.
- Define the exact production Stripe catalog required by STRIPE-03: Human Basic/Mid/Top at $10/$20/$30, API-only Agent Basic/Mid/Top at $7/$14/$21, and Both Basic/Mid/Top at $15/$30/$45.
- For each of the nine tiers, specify required Stripe metadata keys: `webot_tier_family`, `webot_tier_level`, `webot_entitlement_code`, `webot_monthly_quota`, `webot_api_access`, and `webot_dashboard_access`.
- State that Phase 04 must create product, recurring price, and Payment Link or Checkout Session wiring for each tier, capture product IDs and price IDs, map entitlements server-side, configure success/cancel URLs, validate in test mode, and open live hosted checkout without payment submission.
- Document repeat-agent discount handling from PRICE-02 as customer-bound Stripe promotion codes or customer-specific checkout sessions with backend eligibility verification.
- Create a protected Stripe link snapshot procedure and record that current Agency Office bundle links and current Studio links are protected per STRIPE-01 until intentionally migrated. Existing old links are not blockers for the new tier setup; they must remain unchanged while the new nine-tier catalog is added.
- State that button testing may open hosted checkout up to payment submission only.

Verify:
- Automated: `grep -E "\\$10|\\$20|\\$30|\\$7|\\$14|\\$21|\\$15|\\$30|\\$45" docs/monetization/pricing-checkout-contract.md`
- Automated: `grep -E "webot_tier_family|webot_tier_level|webot_entitlement_code|product IDs|price IDs|success/cancel|live hosted checkout" docs/monetization/pricing-checkout-contract.md`
- Automated: `grep -E "customer-bound|customer-specific|backend eligibility" docs/monetization/pricing-checkout-contract.md`
- Automated: `grep -Ei "protected|Office bundle|Studio" docs/monetization/protected-stripe-links-snapshot.md`

Done:
- Pricing, discount, and protected-link rules are unambiguous and usable by dashboard, backend, and public-site phases.

## Acceptance Tests

- `git diff --check`
- `test -f docs/monetization/offer-taxonomy.md`
- `test -f docs/monetization/pricing-checkout-contract.md`
- `test -f docs/monetization/protected-stripe-links-snapshot.md`

## Source Coverage Audit

- TAX-01, TAX-02, TAX-03 covered by Task 1.
- PRICE-01, PRICE-02, STRIPE-01, and STRIPE-03 covered by Task 2.
- COPY-01, COPY-02 covered by Task 1 and verified by grep guard.
