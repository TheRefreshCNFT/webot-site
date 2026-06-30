# Phase 02 Plan: Platform Architecture and Security

## Objective

Define the separate backend platform architecture, data model, security controls, and threat model before backend implementation begins.

Requirements: ARCH-01, ARCH-02, ARCH-03, ARCH-04, API-01, DATA-01, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, STRIPE-02.

## Read First

- `.planning/PROJECT.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `.planning/phases/01-offer-taxonomy-and-pricing/PLAN.md`
- `docs/monetization/offer-taxonomy.md`
- `docs/monetization/pricing-checkout-contract.md`

## Tasks

### Task 1: Create the Platform Architecture Contract

Files:
- `../webot-platform/docs/architecture/platform-architecture.md`
- `../webot-platform/docs/architecture/domain-map.md`
- `../webot-platform/docs/architecture/bootstrap-deployment-contract.md`

Action:
- Define `webot-platform` or `webot-api` as the separate backend/app service per ARCH-01.
- Specify the stack from ARCH-02: Next.js App Router on owned/server-controlled infrastructure, Postgres/Supabase with RLS, Supabase Auth, Stripe webhooks/entitlements, rate-limit state, and async queue/worker capability. Legacy hosted platforms are not the deployment target.
- Define the ARCH-03/ARCH-04 bootstrap contract that Phase 03 must execute before backend feature work: Next.js app scaffold, `package.json` scripts, `.env.example`, Supabase config/migrations, local dev server command, test setup, resource inventory gate, owned-runtime header/config contract, `api.webot.agency` and `app.webot.studio` readiness notes, required env vars, CI workflow, and build/test/deploy checks.
- Record the domain map from `.planning/PROJECT.md`.
- Identify which responsibilities stay in static `webot-site`, public `webot-studio`, API service, and dashboard app.

Verify:
- Automated: `grep -E "Next\\.js App Router|Supabase|RLS|Supabase Auth|Stripe|Redis|queue|api\\.webot\\.agency|app\\.webot\\.studio" ../webot-platform/docs/architecture/platform-architecture.md ../webot-platform/docs/architecture/domain-map.md`
- Automated: `grep -E "package\\.json|\\.env\\.example|supabase|migrations|local dev|owned|server|inventory|CI|build|test|deploy" ../webot-platform/docs/architecture/bootstrap-deployment-contract.md`

Done:
- The architecture contract cleanly separates static marketing, public Studio, backend API, and dashboard responsibilities.

### Task 2: Create Data Model and API Contract

Files:
- `../webot-platform/docs/architecture/data-model.md`
- `../webot-platform/docs/api/v1-contract.md`

Action:
- Define the DATA-01 entities: accounts, users, hashed API keys, plans/entitlements, usage ledger, jobs, job events, rejects, rate limit events, webhook events, and files with short retention.
- Define the API-01 route list with request/response ownership and account authorization requirements.
- State API-02 response hygiene: no internal model, tool, prompt, queue, or reviewer details in customer-facing responses.

Verify:
- Automated: `grep -E "accounts|users|hashed API keys|entitlements|usage ledger|jobs|job events|rejects|rate limit events|webhook events|files" ../webot-platform/docs/architecture/data-model.md`
- Automated: `grep -E "/v1/openapi\\.json|/v1/catalog|/v1/me|/v1/entitlements|/v1/usage|/v1/jobs|cancel|revision|presign|webhook" ../webot-platform/docs/api/v1-contract.md`

Done:
- Data entities and API routes are explicit enough for implementation without rediscovering scope.

### Task 3: Create Threat Model and Security Gates

Files:
- `../webot-platform/docs/security/threat-model.md`
- `../webot-platform/docs/security/owasp-api-top-10-review.md`

Action:
- Produce a STRIDE threat register for auth/session, API keys, account-owned resources, Stripe webhooks, files, job creation/events, usage ledger, rate limiting, and safe rejects.
- Define mitigations for SEC-01 through SEC-05 and STRIPE-02.
- Include a release gate requiring OWASP API Top 10 review before Phase 07 passes.

Verify:
- Automated: `grep -E "STRIDE|Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege" ../webot-platform/docs/security/threat-model.md`
- Automated: `grep -E "hashed|RLS|authorization|idempotency|signature|quota|rate limit|presigned|retention|safe reject|OWASP API Top 10" ../webot-platform/docs/security/threat-model.md ../webot-platform/docs/security/owasp-api-top-10-review.md`

Done:
- Security implementation gates are documented before backend code begins.

## Acceptance Tests

- `git diff --check`
- `test -f ../webot-platform/docs/security/threat-model.md`
- `test -f ../webot-platform/docs/api/v1-contract.md`

## Source Coverage Audit

- ARCH-01, ARCH-02, ARCH-03, and ARCH-04 covered by Task 1.
- DATA-01, API-01, API-02 covered by Task 2.
- SEC-01 through SEC-05 and STRIPE-02 covered by Task 3.
