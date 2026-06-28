# Phase 03-05 Plan: Jobs, Files, Events, and Safe Rejects

## Objective

Implement the customer-facing job lifecycle, file access, event history, and safe reject behavior without leaking internals.

Requirements: API-01, API-02, DATA-01, SEC-02, SEC-03, SEC-04, SEC-05.

## Dependencies

- `03-02-auth-rls-entitlements-PLAN.md` complete.
- `03-04-usage-ledger-PLAN.md` complete.

## Read First

- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Implement Catalog and Job Lifecycle Routes

Files:
- `../webot-platform/app/api/v1/catalog/route.ts`
- `../webot-platform/app/api/v1/jobs/route.ts`
- `../webot-platform/app/api/v1/jobs/[id]/route.ts`
- `../webot-platform/app/api/v1/jobs/[id]/events/route.ts`
- `../webot-platform/app/api/v1/jobs/[id]/cancel/route.ts`
- `../webot-platform/app/api/v1/jobs/[id]/revision/route.ts`
- `../webot-platform/lib/jobs/index.ts`
- `../webot-platform/tests/api/jobs-lifecycle.test.ts`

Action:
- Implement catalog, job creation, job read, job events, cancel, and revision routes from API-01.
- Enforce account authorization, entitlement/category checks, idempotency on job creation, and usage ledger writes before accepting resource-consuming work.
- Customer-facing job state must be stable and safe; no internal model, prompt, worker, queue, tool, or reviewer details may appear in responses.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/jobs-lifecycle.test.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "Ollama|llama|whisper\\.cpp|ComfyUI|prompt|internal tool|queue worker|reviewer" app/api/v1/jobs lib/jobs && exit 1 || true`

Done:
- Customers can create and manage jobs only within their account and entitlement boundaries.

### Task 2: Implement Files, Retention, and Reject Codes

Files:
- `../webot-platform/app/api/v1/files/presign/route.ts`
- `../webot-platform/lib/files/presign.ts`
- `../webot-platform/lib/rejects/customer-safe.ts`
- `../webot-platform/supabase/migrations/0005_jobs_files_rejects.sql`
- `../webot-platform/tests/api/files-rejects.test.ts`

Action:
- Create jobs, job events, rejects, and files tables with RLS and explicit retention fields.
- Implement short-lived file presign behavior per SEC-04.
- Implement safe reject codes and messages for unsupported category, entitlement required, quota exceeded, validation rejected, rate limited, unsafe request, file unavailable, and internal review required.
- Rejects must be actionable for customers without exposing internal model, tool, prompt, queue, worker, or reviewer reasons.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/files-rejects.test.ts`
- Automated: `grep -E "retention|presign|reject_code|safe" ../webot-platform/supabase/migrations/0005_jobs_files_rejects.sql ../webot-platform/lib/rejects/customer-safe.ts`

Done:
- File access is short-lived and reject behavior is safe, specific, and customer-readable.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/api/jobs-lifecycle.test.ts tests/api/files-rejects.test.ts`

## Source Coverage Audit

- API-01 covered for catalog, jobs, events, cancel, revision, and file presign.
- API-02 and SEC-05 covered by safe reject behavior.
- DATA-01 covered for jobs, job events, rejects, and files.
- SEC-02, SEC-03, and SEC-04 covered by account checks, idempotency/ledger integration, and presigned file access.
