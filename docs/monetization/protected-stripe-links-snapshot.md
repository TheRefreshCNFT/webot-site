# Protected Stripe Links Snapshot

Status: Phase 01 protected-link baseline.
Snapshot date: 2026-06-28.
Scope: current Agency Office bundle links and current Studio Stripe links.

This file records a non-secret snapshot of protected Stripe checkout URLs. Full checkout URLs are intentionally omitted; hashes, product labels, prices, and source locations are enough for drift detection while keeping this document shareable.

## Protection Rule

Existing Agency Office bundle links and existing Studio Stripe links are protected real-money paths under STRIPE-01. Do not change them without Ian's explicit approval.

Existing old links are not blockers for the new Human/API-only/Both nine-tier subscription catalog. They must remain unchanged while the new catalog is created and wired.

Button testing may open hosted Stripe checkout up to payment submission only. Do not submit payment details or create real charges during verification.

## Snapshot Procedure

Use this procedure before checkout work and before release verification:

1. Inspect active Stripe URLs in `webot-site`:
   `cd /Users/webot/Projects/webot-site && rg -n -o "https://buy[.]stripe[.]com/[^\"' <)]*" .`
2. Inspect active Stripe URLs in `webot-studio`:
   `cd /Users/webot/Projects/webot-studio && rg -n -o "https://buy[.]stripe[.]com/[^\"' <)]*" .`
3. For each active checkout URL, compute a SHA-256 hash:
   `printf '%s' "$url" | shasum -a 256`
4. Compare product label, amount, source location, and hash against this file.
5. Treat any protected hash or active source-location drift as a release blocker unless Ian explicitly approved that exact migration.
6. Open hosted checkout only up to payment submission when verifying product/amount behavior.

Historical audit artifacts may contain copies of old checkout URLs. The protected active source of truth for this snapshot is the live checkout-bearing HTML listed below.

## Agency Office Bundle Links

Source repo: `/Users/webot/Projects/webot-site`
Active source file: `index.html`

| Product | Amount | Source location | checkout_url_sha256 |
| --- | ---: | --- | --- |
| MS Office AI Bundle | $19 | `index.html:1940` | `80c466919edbeec488b71384d659de58b9b1ffb418103df2b7d8936c95eb6fd0` |
| Google Workspace AI Bundle | $19 | `index.html:1949` | `646fdf003c9f9f663bccc9b9b068ff9e7b7986b4320c5de670c40a9b6c83d452` |
| Complete Office AI Bundle | $29 | `index.html:1958` | `63e4d31e288a469a20d12a2def63fbfb1e4160e02266bb11d4d5ae39fcfaaf16` |

Notes:
- These are protected Office bundle links.
- The scan also found historical copies in `seo-audit/agent-runs/`; those are audit artifacts, not active checkout buttons.

## Studio Stripe Links

Source repo: `/Users/webot/Projects/webot-studio`
Active source file: `index.html`

| Product | Amount | Source location | checkout_url_sha256 |
| --- | ---: | --- | --- |
| WeBot Studio Starter monthly access | $49/mo | `index.html:1986` | `658d4409e84804cc659d059ba8e6df0a5da0dd661d268df5740f45fd5336fbba` |
| WeBot Studio Plus monthly access | $149/mo | `index.html:2000` | `d2ce9b16696cc02b4f8ff0ab6f1c10f9508952ac9c2b9bf33bafbd235446af84` |
| WeBot Studio Business monthly access | $399/mo | `index.html:2014` | `222c07a6989ff803b3c17420e49146f2dd2710290e5d3c944fa7fd1874d980c9` |
| WeBot Small one-time reviewed job | $49 | `index.html:2028` | `347f547870c7aa185edfc57ea9eb3ad395270cd1901a2aa0a79b387f84dcebf1` |
| WeBot Standard one-time reviewed job | $129 | `index.html:2042` | `9710f857c1810b60745cf42fad391b2b6d2e77565e314c83b193e84e7e5ae5bc` |
| WeBot Deep one-time reviewed job | $299 | `index.html:2056` | `7e5a03a9a1fb0e3bdaf5e991150b7e6f84046e7d3ef5bfffa86276150a112da7` |

Additional Studio references:
- `index.html:2115` repeats the Starter hash on the visible checkout button default state.
- `index.html:2456` repeats the Starter hash in the JavaScript fallback state.
- These repeats are expected and should match the Starter monthly access hash.

## Verification Expectation

Phase 04 and release verification must report the protected link comparison result as either:

- `protected link snapshot diff: PASS`
- `protected link snapshot diff: NO-GO`

Any NO-GO result blocks release until the drift is reverted or Ian approves the intentional migration.
