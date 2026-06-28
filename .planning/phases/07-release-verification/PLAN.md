# Phase 07 Plan: Release Verification

## Objective

Prove the full monetization/API expansion is money-ready with executable tests, browser screenshots, checkout-safe traversal, Stripe amount assertions, protected-link audits, backend/API security checks, API docs verification, dashboard verification, and a go/no-go packet.

Requirements: VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04, VERIFY-05, VERIFY-06, SEC-05, STRIPE-01, STRIPE-03.

## Dependencies

- Phases 01-06 must have passing acceptance tests.
- No publish or payment submission occurs in this phase unless Ian separately authorizes that action.
- Evidence markdown is not sufficient by itself. Each release claim must be backed by an executable command, screenshot artifact, Stripe readback, browser assertion, or explicit NO-GO entry.

## Read First

- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `docs/monetization/protected-stripe-links-snapshot.md`
- `../webot-platform/docs/stripe/subscription-tier-catalog.md`
- `../webot-platform/docs/stripe/protected-legacy-link-audit.md`
- `.handoffs/CURRENT_STATE.md`
- `AGENTS.md`
- `ACTIVE_STATE.md`

## Tasks

### Task 1: Run Backend, Security, API, and Docs Test Matrix

Files:
- `scripts/test-itinerary-flow.sh`
- `scripts/test-local-agent-approval-flow.sh`
- `../webot-platform/package.json`
- `../webot-platform/tests/**/*`
- `../webot-platform/docs/security/owasp-api-top-10-review.md`
- `.planning/verification/release-test-results.md`

Action:
- Run static-site validation, local approval-flow validation, backend unit/integration tests, backend E2E tests, lint, typecheck, build, OpenAPI schema tests, API docs E2E tests, and OWASP API Top 10 review checks.
- Backend/API tests must cover auth, RLS/account isolation, entitlements, hashed API keys, usage ledger, jobs, files, webhooks, quotas, rate limits, idempotency, and safe rejects.
- Record exact commands, pass/fail status, and artifact paths in `.planning/verification/release-test-results.md`.
- Do not hide failures. Any failing command marks release readiness NO-GO until remediated and re-run.

Verify:
- Automated: `git diff --check`
- Automated: `scripts/test-itinerary-flow.sh`
- Automated: `scripts/test-local-agent-approval-flow.sh`
- Automated: `cd ../webot-platform && npm test && npm run test:e2e && npm run lint && npm run typecheck && npm run build`
- Automated: `cd ../webot-platform && npm test -- --run tests/api/openapi-schema.test.ts tests/api/stripe-entitlements.test.ts tests/api/files-rejects.test.ts`
- Automated: `cd ../webot-platform && npm run test:e2e -- api-docs-public.spec.ts api-docs-authenticated.spec.ts`

Done:
- Release evidence includes passing executable checks or an explicit NO-GO with failing command output summarized.

### Task 2: Verify Browser, Screenshot, Dashboard, API Docs, and Checkout Flows

Files:
- `.planning/verification/browser-checkout-dashboard.md`
- `../webot-platform/tests/e2e/release-browser-checkout.spec.ts`
- `../webot-platform/tests/e2e/no-fake-entitlement.spec.ts`
- screenshot output directory under `/Users/webot/Backups/webot-site/`
- screenshot output directory under `../webot-platform/test-results/`

Action:
- Run browser tests that capture desktop/mobile screenshots for Agency, Studio, authenticated dashboard, service taxonomy, pricing, job intake/status/review/files, billing/API usage, public API docs, authenticated API docs, OpenAPI schema browser, usage/quota docs, and webhook docs.
- Browser tests must assert key text, route status, authenticated/unauthenticated boundaries, no horizontal overflow, visible pricing, visible docs examples, and no local model/internal implementation copy.
- Click every buyer/payment button up to hosted payment submission only. Do not enter payment details, submit payment forms, or create charges.
- Verify screenshot artifact existence with nonzero file size, then inspect screenshots visually for overlap, unreadable text, cropped controls, wrong pricing, missing docs, and dashboard/auth failures. Record visual inspection results and screenshot paths.
- Verify dashboard return URLs and success query parameters do not grant entitlement. Tests must cover `?payment=confirmed`, `?session_id=`, `?plan=`, and `?entitled=true`.

Verify:
- Automated: `scripts/test-itinerary-flow.sh`
- Automated: `cd ../webot-platform && npm run test:e2e -- release-browser-checkout.spec.ts no-fake-entitlement.spec.ts`
- Automated: `cd ../webot-platform && test -s test-results/dashboard-auth.png && test -s test-results/api-docs-public.png && test -s test-results/api-docs-authenticated.png && test -s test-results/openapi-browser.png && test -s test-results/checkout-live-open.png`
- Automated: `grep -E "visual inspection: PASS|visual inspection: NO-GO" .planning/verification/browser-checkout-dashboard.md`
- Automated: `grep -R -Ei "local model|Ollama|llama|whisper\\.cpp|ComfyUI|frontier supervision|internal prompt|internal tool|queue internal" index.html consultation.html success.html llms.txt *.html && exit 1 || true`

Done:
- Browser evidence proves customers can navigate public surfaces, dashboard, API docs, and checkout-safe flows without charges, fake entitlements, visual defects, or protected-link drift.

### Task 3: Verify Stripe Catalog, Protected Links, and Go/No-Go Packet

Files:
- `.planning/verification/GO-NO-GO.md`
- `.planning/verification/stripe-release-audit.md`
- `.planning/verification/release-test-results.md`
- `.planning/verification/browser-checkout-dashboard.md`
- `../webot-platform/scripts/stripe/validate-subscription-tiers.ts`
- `../webot-platform/tests/stripe/subscription-tier-catalog.test.ts`

Action:
- Assert the nine STRIPE-03 tiers exist with exact amounts: Human Basic/Mid/Top $10/$20/$30, API-only Agent Basic/Mid/Top $7/$14/$21, and Both Basic/Mid/Top $15/$30/$45.
- Read back product IDs, price IDs, metadata, success/cancel URLs, livemode status, and payment link or checkout session wiring. Record results in `.planning/verification/stripe-release-audit.md`.
- Diff protected Agency Office bundle and Studio Stripe links against the protected snapshot. Existing old links remain protected until intentionally migrated; any unapproved drift is NO-GO.
- Confirm entitlement mapping is server-side from signed Stripe webhook state and that dashboard/querystring return values cannot grant access.
- Create a concise go/no-go packet summarizing automated tests, screenshot paths, visual inspection status, payment traversal status, Stripe amount assertions, protected-link diff, backend/API security status, API docs status, dashboard readiness, CRM/intake truthfulness, and remaining blockers.
- Mark final model choices as the only intended remaining product decision if and only if Phases 01-06 pass, release verification passes, and the bakeoff gate is ready.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/stripe/subscription-tier-catalog.test.ts tests/api/stripe-entitlements.test.ts`
- Automated: `cd ../webot-platform && npm run stripe:validate-tiers -- --mode test`
- Automated: `grep -E "Human Basic.*\\$10|Human Mid.*\\$20|Human Top.*\\$30|API-only Agent Basic.*\\$7|API-only Agent Mid.*\\$14|API-only Agent Top.*\\$21|Both Basic.*\\$15|Both Mid.*\\$30|Both Top.*\\$45" .planning/verification/stripe-release-audit.md`
- Automated: `grep -E "protected link snapshot diff: PASS|protected link snapshot diff: NO-GO" .planning/verification/stripe-release-audit.md`
- Automated: `grep -E "GO|NO-GO|Stripe|screenshots|visual inspection|OWASP|dashboard|API docs|fake entitlement|protected link" .planning/verification/GO-NO-GO.md`

Done:
- The user has a go/no-go packet grounded in executable evidence, screenshot review, Stripe readback, and protected-link diff rather than documentation presence alone.

## Acceptance Tests

- `git diff --check`
- `scripts/test-itinerary-flow.sh`
- `scripts/test-local-agent-approval-flow.sh`
- `cd ../webot-platform && npm test && npm run test:e2e && npm run lint && npm run typecheck && npm run build`
- `cd ../webot-platform && npm run stripe:validate-tiers -- --mode test`
- `test -f .planning/verification/GO-NO-GO.md`

## Source Coverage Audit

- VERIFY-01 and VERIFY-02 covered by Task 2.
- VERIFY-03 covered by Task 1.
- VERIFY-04 and STRIPE-01 covered by Task 3.
- VERIFY-05 covered by all tasks and the go/no-go packet.
- VERIFY-06 covered by executable browser assertions, screenshots, payment traversal, Stripe amount assertions, API docs screenshots, security tests, fake-entitlement tests, and protected-link diff.
- SEC-05 covered by safe-reject tests, docs checks, and public/internal leak guards.
- STRIPE-03 covered by Stripe catalog amount/readback assertions.
