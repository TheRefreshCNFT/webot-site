# Phase 03-03 Plan: API Keys

## Objective

Implement account-scoped API key creation and verification with display-once plaintext and hash-only storage.

Requirements: API-01, DATA-01, SEC-01, SEC-02.

## Dependencies

- `03-02-auth-rls-entitlements-PLAN.md` complete.

## Read First

- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Add API Key Storage and Library

Files:
- `../webot-platform/supabase/migrations/0003_api_keys.sql`
- `../webot-platform/lib/api-keys/index.ts`
- `../webot-platform/tests/api/api-keys.test.ts`

Action:
- Add hashed API key storage with prefix, name, created timestamp, last-used timestamp, revoked timestamp, and account ownership.
- Implement create, list metadata, revoke, and verify functions. Plaintext is returned only at creation and never stored or logged.
- API key verification must resolve the owning account and reject revoked, missing, malformed, or cross-account keys.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/api-keys.test.ts`
- Automated: `cd ../webot-platform && grep -R "console\\.log.*key\\|plaintext.*insert\\|secret.*insert" lib app tests && exit 1 || true`

Done:
- API keys are usable for API auth while plaintext never persists after creation.

### Task 2: Expose API Key Routes

Files:
- `../webot-platform/app/api/v1/api-keys/route.ts`
- `../webot-platform/app/api/v1/api-keys/[id]/route.ts`
- `../webot-platform/tests/api/api-key-routes.test.ts`

Action:
- Implement authenticated API key metadata listing, key creation, and revocation routes.
- Responses may show prefix and metadata, but never the stored hash or any plaintext except the one-time creation response.
- Route tests must prove account isolation, revocation, and no plaintext on list/revoke.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/api/api-key-routes.test.ts`

Done:
- Dashboard and API customers can manage account-scoped API keys safely.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/api/api-keys.test.ts tests/api/api-key-routes.test.ts`

## Source Coverage Audit

- API-01 covered for API key management needed by authenticated API customers.
- DATA-01 covered for hashed API keys.
- SEC-01 and SEC-02 covered by hash-only storage and account isolation.
