# Phase 03-02 Plan: Auth, RLS, and Entitlements

## Objective

Implement account authentication, RLS-backed account ownership, and entitlement reads on the bootstrapped platform.

Requirements: API-01, DATA-01, SEC-02.

## Dependencies

- `03-01-bootstrap-platform-PLAN.md` complete.

## Read First

- `../webot-platform/docs/architecture/data-model.md`
- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Create Account/Auth Data Model and RLS Policies

Files:
- `../webot-platform/supabase/migrations/0002_accounts_auth_entitlements.sql`
- `../webot-platform/lib/db/server.ts`
- `../webot-platform/lib/auth/account.ts`
- `../webot-platform/tests/db/rls-auth.test.ts`

Action:
- Create accounts, users/account memberships, plans, and entitlements tables from DATA-01.
- Enable RLS on account-owned tables and add policies requiring Supabase Auth user membership.
- Implement server-side account resolution that never trusts account IDs from unauthenticated querystrings.
- Tests must prove unauthenticated requests fail and cross-account reads/writes fail under RLS and server checks.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/db/rls-auth.test.ts`
- Automated: `grep -E "enable row level security|create policy|account_id|auth\\.uid" ../webot-platform/supabase/migrations/0002_accounts_auth_entitlements.sql`

Done:
- Account ownership is enforced in database policy and server code for all entitlement-bearing resources.

### Task 2: Implement Account and Entitlement API Reads

Files:
- `../webot-platform/app/api/v1/me/route.ts`
- `../webot-platform/app/api/v1/entitlements/route.ts`
- `../webot-platform/lib/entitlements/index.ts`
- `../webot-platform/tests/api/auth-entitlements.test.ts`

Action:
- Implement `GET /v1/me` and `GET /v1/entitlements` from API-01 using the authenticated account context.
- Entitlements must come from server-side tables only. Querystring flags such as `?payment=confirmed`, `?plan=top`, or `?entitled=true` must not grant access.
- Responses must expose customer-safe account and entitlement state without internal Stripe, model, tool, prompt, queue, or reviewer details.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/auth-entitlements.test.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "payment=confirmed|entitled=true|plan=.*query" app lib tests && exit 1 || true`

Done:
- Authenticated users can read only their account and real entitlements; fake entitlement querystrings do not work.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/db/rls-auth.test.ts tests/api/auth-entitlements.test.ts`

## Source Coverage Audit

- API-01 covered for `/v1/me` and `/v1/entitlements`.
- DATA-01 covered for accounts, users, plans, and entitlements.
- SEC-02 covered by RLS plus server-side account checks.
