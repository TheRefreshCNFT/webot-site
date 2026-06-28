# WeBot Monetization/API Expansion

## Program Goal

Make WeBot ready to earn from a broader service catalog, authenticated customer dashboard, Stripe-backed tiers, and a production API platform while preserving the current static `webot.agency` site rules.

Done means product-ready, not mock-ready: public offerings are clear, payment paths are safe, customers can enter the dashboard through verified entitlement paths, backend/API behavior is functional, and only final model selection remains after the platform, queues, and evaluation gates exist.

## Operating Boundaries

- `webot-site` stays static HTML/CSS/JS. Do not add a framework, build step, package manager, or `package.json` to this repo.
- Backend work belongs in a separate service repo, named `webot-platform` or `webot-api`, not inside `webot-site`.
- Recommended domain map:
  - `webot.agency`: marketing and buyer-facing Agency surface.
  - `webot.studio`: public Studio surface now, possible dashboard app later.
  - `api.webot.agency`: API service.
  - `app.webot.studio`: dashboard, docs, account/admin flows.
- Existing Agency Office bundle Stripe links and existing Studio Stripe links are real-money paths. Do not change live products or checkout URLs without Ian's explicit approval.
- Public copy may say "We Bot You", trained workflows, job-ready agents, reviewed delivery, and lower-cost purpose-built agents versus high-priced general models.
- Public copy must not mention local models, local inventory, frontier supervision, internal prompts, internal tools, queue internals, or implementation details.
- Newsletter/contact/CRM copy must match proven behavior. Do not claim fully wired CRM flows until code and live behavior prove it.
- No paid ads, affiliate links, tracking pixels, outbound paid campaigns, paid API top-ups, DNS changes, or publish actions without human approval.

## Security Posture

Security architecture comes before backend implementation. The platform must protect API keys, accounts, files, entitlements, Stripe events, job data, and model/runtime internals before customer traffic is accepted.

Required security properties:
- API keys are never stored or logged in plaintext.
- Account authorization is enforced on every account-owned resource.
- Stripe webhooks require signature verification and idempotent event handling.
- Entitlements, quotas, concurrency, and rate limits are enforced server-side.
- Reject responses are safe and do not disclose internal model, tool, prompt, queue, or reviewer details.
- File URLs are short-lived and retention is explicit.
- OWASP API Top 10 review is completed before release.

## Source Audit

| Source | Coverage |
| --- | --- |
| Service taxonomy lane | Covered by Phase 01 and Phase 05. |
| Backend/API lane | Covered by Phase 02 and Phase 03. |
| Pricing/checkout lane | Covered by Phase 01 and Phase 04. |
| Visual lane | Covered by Phase 05. |
| Models lane | Covered by Phase 06, with final model choices deferred until Phases 01-05 pass. |
| Definition of done | Covered by Phase 07 release verification. |

## Required Verification Style

- Product/browser work requires human-style desktop and mobile screenshots.
- Payment checks must click through up to hosted payment submission only. Do not submit payment details or trigger real charges.
- Backend checks must include automated tests for authorization, entitlements, idempotency, quotas/rate limits, usage ledger, and safe rejects.
- Release checks must prove protected Stripe links stayed unchanged unless Ian explicitly approved a change.
