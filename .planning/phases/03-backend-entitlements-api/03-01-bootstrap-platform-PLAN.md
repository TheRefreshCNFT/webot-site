# Phase 03-01 Plan: Bootstrap Backend Platform

## Objective

Create the separate backend/app service and deployment baseline before any auth, API, Stripe, or dashboard feature work assumes infrastructure exists.

Requirements: ARCH-01, ARCH-03, ARCH-04.

## Read First

- `.planning/PROJECT.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `../webot-platform/docs/architecture/bootstrap-deployment-contract.md`
- `../webot-platform/docs/architecture/platform-architecture.md`

## Tasks

### Task 1: Create the Next.js Service Skeleton

Files:
- `../webot-platform/package.json`
- `../webot-platform/next.config.ts`
- `../webot-platform/tsconfig.json`
- `../webot-platform/app/layout.tsx`
- `../webot-platform/app/page.tsx`
- `../webot-platform/app/api/health/route.ts`
- `../webot-platform/.env.example`

Action:
- Create `../webot-platform` as the separate service repo per ARCH-01. If `../webot-api` is chosen instead, update every path in this plan set consistently before implementation starts.
- Scaffold a Next.js App Router TypeScript app with scripts for `dev`, `build`, `start`, `lint`, `typecheck`, `test`, and `test:e2e`.
- Add `.env.example` with the full env contract: Supabase URL/anon/service keys, Stripe secret/webhook keys, Redis/rate-limit vars, app URL, API URL, success URL, cancel URL, and docs/dashboard domains.
- Add a `/api/health` route that reports service health without exposing secrets.

Verify:
- Automated: `test -f ../webot-platform/package.json && test -f ../webot-platform/.env.example && grep -E "\"dev\"|\"build\"|\"test\"|\"test:e2e\"|\"lint\"|\"typecheck\"" ../webot-platform/package.json`
- Automated: `cd ../webot-platform && npm run typecheck && npm run build`

Done:
- The separate service exists, runs as a Next.js App Router app, has required scripts/env contract, and builds before feature work begins.

### Task 2: Add Supabase, Tests, Local Dev, Owned Runtime, and CI Baseline

Files:
- `../webot-platform/supabase/config.toml`
- `../webot-platform/supabase/migrations/0001_platform_baseline.sql`
- `../webot-platform/tests/health.test.ts`
- `../webot-platform/tests/e2e/health.spec.ts`
- `../webot-platform/playwright.config.ts`
- `../webot-platform/vitest.config.ts`
- `../webot-platform/config/deployment-headers.json`
- `../webot-platform/.github/workflows/ci.yml`
- `../webot-platform/docs/deployment/readiness.md`

Action:
- Add Supabase config plus an initial migration that creates extension/schema baseline and enables RLS-ready tables to be added in later subphases.
- Configure unit/integration tests and Playwright browser tests, including a local dev server command for E2E.
- Add owned-runtime deployment header/config coverage and CI workflow that runs install, lint, typecheck, tests, E2E, and build.
- Document domain/env readiness for `api.webot.agency` and `app.webot.studio`, including which DNS, HTTPS, runtime process, server credential source paths, and env values must exist before production traffic.
- Inventory tools, skills, scripts, warehouse/project docs, credential source names/paths, existing hosted services, and owned/server infrastructure before any deploy plan assumes a provider. Adobe/server infrastructure is live-owned infrastructure and must remain untouched until explicitly approved with rollback notes.

Verify:
- Automated: `cd ../webot-platform && npm test && npm run test:e2e && npm run lint && npm run typecheck && npm run build`
- Automated: `grep -E "api\\.webot\\.agency|app\\.webot\\.studio|owned|server|inventory|Supabase|CI|build|test|deploy" ../webot-platform/docs/deployment/readiness.md`

Done:
- Bootstrap is complete only when local dev, automated tests, Supabase baseline, owned-runtime config, resource inventory, and CI/build/test/deploy checks are executable.

## Acceptance Tests

- `cd ../webot-platform && npm test && npm run test:e2e && npm run lint && npm run typecheck && npm run build`

## Source Coverage Audit

- ARCH-01 covered by creating the separate service outside `webot-site`.
- ARCH-03 and ARCH-04 covered by service bootstrap, env contract, Supabase, local dev, test setup, owned-runtime readiness, resource inventory, domain/env readiness, and CI checks.
