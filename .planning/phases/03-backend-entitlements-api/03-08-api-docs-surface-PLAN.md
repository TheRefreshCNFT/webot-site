# Phase 03-08 Plan: Agent-Friendly API Docs Surface

## Objective

Build real public and authenticated API documentation pages for humans and agents, backed by implemented routes and browser verification.

Requirements: API-03, API-04, SEC-05, VERIFY-01.

## Dependencies

- `03-07-rate-limits-openapi-PLAN.md` complete.

## Read First

- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/app/api/v1/openapi.json/route.ts`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Build Public Docs, Quickstart, Auth, Examples, and Schema Browser

Files:
- `../webot-platform/app/docs/api/page.tsx`
- `../webot-platform/app/docs/api/quickstart/page.tsx`
- `../webot-platform/app/docs/api/auth/page.tsx`
- `../webot-platform/app/docs/api/openapi/page.tsx`
- `../webot-platform/components/docs/OpenApiBrowser.tsx`
- `../webot-platform/docs/api/examples.md`
- `../webot-platform/tests/e2e/api-docs-public.spec.ts`

Action:
- Create public API docs pages with quickstart, authentication guide, cURL examples, SDK-shaped TypeScript examples, endpoint examples, and OpenAPI schema browser sourced from `GET /v1/openapi.json`.
- Include concrete examples for catalog, me, entitlements, usage, job creation, job read, cancel, revision, file presign, API keys, and webhook verification.
- Public docs must not expose internal model/runtime details, prompts, tools, queues, reviewer workflows, or secrets.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- api-docs-public.spec.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "Ollama|llama|whisper\\.cpp|ComfyUI|internal prompt|internal tool|queue worker|secret key" app/docs components/docs docs/api && exit 1 || true`

Done:
- API docs are browsable without auth and give agent/API users enough information to make their first safe request.

### Task 2: Build Authenticated Usage, Error, Reject, Quota, and Webhook Docs

Files:
- `../webot-platform/app/(dashboard)/docs/api/page.tsx`
- `../webot-platform/app/(dashboard)/docs/api/webhooks/page.tsx`
- `../webot-platform/app/(dashboard)/docs/api/usage/page.tsx`
- `../webot-platform/docs/api/errors-and-rejects.md`
- `../webot-platform/docs/api/webhooks.md`
- `../webot-platform/tests/e2e/api-docs-authenticated.spec.ts`

Action:
- Add authenticated docs for account-specific API key setup, usage/quota interpretation, reject/error codes, webhook event payloads, retry behavior, signature verification, and dashboard/API links.
- Include SDK/cURL examples that use environment variables or obvious redacted values, never real secrets.
- Browser tests must capture screenshots of public docs, authenticated docs, schema browser, usage/quota docs, and webhook docs.

Verify:
- Automated: `cd ../webot-platform && npm run test:e2e -- api-docs-authenticated.spec.ts`
- Automated: `cd ../webot-platform && test -s test-results/api-docs-public.png && test -s test-results/api-docs-authenticated.png && test -s test-results/api-docs-openapi.png && test -s test-results/api-docs-webhooks.png`

Done:
- API documentation is screenshot-verified, includes public and authenticated surfaces, and covers auth, examples, schemas, errors/rejects, usage/quotas, and webhooks.

## Acceptance Tests

- `cd ../webot-platform && npm run test:e2e -- api-docs-public.spec.ts api-docs-authenticated.spec.ts`
- Manual review: inspect generated API docs screenshots for readability, no overlap, and no exposed internal runtime details.

## Source Coverage Audit

- API-03 covered by docs consuming route-backed OpenAPI.
- API-04 covered by public/authenticated docs, quickstart, auth guide, examples, schema browser, error/reject docs, usage/quota docs, webhook docs, SDK/cURL examples, and screenshots.
- SEC-05 covered by safe reject/error documentation and leak guards.
- VERIFY-01 covered by screenshot/browser verification.
