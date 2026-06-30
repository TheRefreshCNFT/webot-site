# WeBot Monetization/API Expansion Roadmap

## Program Requirements

Primary requirements live in `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`.

## Phases

### Phase 01: Offer Taxonomy and Pricing

**Goal:** Finalize the public service families, service catalog, price ladder, checkout constraints, and copy guardrails that downstream site, dashboard, and API work must implement.

**Requirements:** TAX-01, TAX-02, TAX-03, PRICE-01, PRICE-02, COPY-01, COPY-02, COPY-03, STRIPE-01

**Plans:** 1 plan

Plans:
- [ ] `.planning/phases/01-offer-taxonomy-and-pricing/PLAN.md` - Create the offer, price, checkout, and public-copy contract.

### Phase 02: Platform Architecture and Security

**Goal:** Define the separate backend platform architecture, security controls, data model, domain map, and threat model before implementation begins.

**Requirements:** ARCH-01, ARCH-02, ARCH-03, ARCH-04, API-01, DATA-01, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, STRIPE-02

**Plans:** 1 plan

Plans:
- [ ] `.planning/phases/02-platform-architecture-security/PLAN.md` - Produce security-first platform architecture and implementation contracts.

### Phase 03: Backend Entitlements and API

**Goal:** Build the production backend/API with auth, entitlements, API keys, usage ledger, jobs, files, events, webhooks, quotas, and OpenAPI coverage.

**Requirements:** ARCH-01, ARCH-03, ARCH-04, API-01, API-02, API-03, API-04, DATA-01, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, STRIPE-02, STRIPE-03

**Plans:** 9 plan files (1 sequencing index plus 8 executable subplans)

Plans:
- [ ] `.planning/phases/03-backend-entitlements-api/PLAN.md` - Sequence the Phase 03 backend subplans and enforce bootstrap-before-feature-work ordering.
- [ ] `.planning/phases/03-backend-entitlements-api/03-01-bootstrap-platform-PLAN.md` - Bootstrap the separate backend platform, deployment, Supabase, tests, and CI checks before feature work.
- [ ] `.planning/phases/03-backend-entitlements-api/03-02-auth-rls-entitlements-PLAN.md` - Implement auth, RLS-backed account access, and entitlement reads.
- [ ] `.planning/phases/03-backend-entitlements-api/03-03-api-keys-PLAN.md` - Implement hashed API key creation, verification, display-once behavior, and account scoping.
- [ ] `.planning/phases/03-backend-entitlements-api/03-04-usage-ledger-PLAN.md` - Implement append-only usage ledger, quotas, and entitlement usage reads.
- [ ] `.planning/phases/03-backend-entitlements-api/03-05-jobs-files-rejects-PLAN.md` - Implement catalog, jobs, events, revisions, file presign, retention, and safe rejects.
- [ ] `.planning/phases/03-backend-entitlements-api/03-06-stripe-webhooks-PLAN.md` - Implement Stripe webhook signature verification, idempotent event handling, and entitlement mapping.
- [ ] `.planning/phases/03-backend-entitlements-api/03-07-rate-limits-openapi-PLAN.md` - Implement rate limits, concurrency gates, and route-backed OpenAPI output.
- [ ] `.planning/phases/03-backend-entitlements-api/03-08-api-docs-surface-PLAN.md` - Build public/authenticated API docs with schema browser, examples, and screenshot verification.

### Phase 04: Dashboard, Checkout, and CRM

**Goal:** Deliver authenticated customer dashboard flows for payment tiers/options, durable intake, job status/review, files, billing portal, API keys, usage, jobs, webhooks, and CRM-safe handoff.

**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, PRICE-01, PRICE-02, STRIPE-01, STRIPE-02, STRIPE-03, CRM-01, SEC-02

**Plans:** 2 plans

Plans:
- [ ] `.planning/phases/04-dashboard-checkout-crm/04-01-stripe-production-tiers-PLAN.md` - Create and validate the nine production Stripe subscription tiers while protecting legacy links.
- [ ] `.planning/phases/04-dashboard-checkout-crm/PLAN.md` - Wire dashboard, checkout safety, billing, API customer tools, and CRM handoff behavior.

### Phase 05: Public Site, Studio, and Visuals

**Goal:** Update the public Agency/Studio surfaces with the expanded service taxonomy, premium operational visuals, character leads, and screenshot-tested buyer flows.

**Requirements:** TAX-01, TAX-02, TAX-03, VIS-01, VIS-02, VIS-03, COPY-01, COPY-02, STRIPE-01, VERIFY-01

**Plans:** 1 plan

Plans:
- [ ] `.planning/phases/05-public-site-studio-visuals/PLAN.md` - Implement public catalog, Studio positioning, and real-human-looking character assets.

### Phase 06: Model Runtime and Evaluation

**Goal:** Prepare model/runtime inventory, routing contracts, service-category evals, approval-flow harness extensions, and queue/resource policy while deferring final model choices until Phases 01-05 pass.

**Requirements:** MODEL-01, MODEL-02, MODEL-03, MODEL-04, MODEL-05, COPY-02, SEC-05

**Plans:** 1 plan

Plans:
- [ ] `.planning/phases/06-model-runtime-evaluation/PLAN.md` - Build runtime readiness and evaluation gates without locking final models early.

### Phase 07: Release Verification

**Goal:** Prove the full program is money-ready with automated tests, browser screenshots, safe checkout traversal, API/security checks, dashboard verification, and protected-link audits before any launch/publish request.

**Requirements:** VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04, VERIFY-05, VERIFY-06, SEC-05, STRIPE-01, STRIPE-03

**Plans:** 1 plan

Plans:
- [ ] `.planning/phases/07-release-verification/PLAN.md` - Run release readiness verification and create the go/no-go evidence packet.

## Dependency Graph

Phase 01 -> Phase 02 -> Phase 03 subphases 03-01 through 03-08 -> Phase 04 -> Phase 05 -> Phase 06 -> Phase 07

Security-first rule: Phase 03 cannot begin until Phase 02 threat model, data model, and auth/entitlement contracts pass review. Phase 03 feature implementation cannot begin until 03-01 bootstraps the separate service repo, resource inventory gate, test harness, Supabase/owned-runtime config, local dev server, and CI/build/test/deploy checks. Phase 06 final model choices remain blocked until Phases 01-05 are accepted.
