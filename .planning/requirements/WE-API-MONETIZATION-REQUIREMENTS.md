# WeBot API Monetization Requirements

## Service Taxonomy

- TAX-01: The final family lineup and order is: Create & Polish; Gather & Extract; Media & Convert; Build & Automate; Growth & Market; Review & Decide; Career & Prep; Plan & Itinerary.
- TAX-02: Add service coverage for text-to-MP3 audio, video transcription, photo enhancement, presentations and graphs, resume review, interview preparation, transcription, web development, SEO, business planning, and marketing strategies.
- TAX-03: Office Skill Packs and Custom Builds remain distinct from the service-family lineup. Studio retains monthly access plus one-time reviewed jobs until a later approved migration changes that.

## Public Copy

- COPY-01: Public copy may use "We Bot You", trained workflows, job-ready agents, reviewed delivery, and lower-cost purpose-built agents versus high-priced general models.
- COPY-02: Public copy must not mention local models, local inventory, frontier supervision, internal prompts, internal tools, queue internals, or implementation details.

## Pricing and Checkout

- PRICE-01: New intended price ladder is Human Account Basic/Mid/Top at $10/$20/$30, API-only Agent Basic/Mid/Top at $7/$14/$21, and Both Basic/Mid/Top at $15/$30/$45.
- PRICE-02: Agent/repeat-agent discounts use customer-bound Stripe promotion codes or customer-specific checkout sessions, not public coupon codes. Repeat eligibility is backend verified.
- STRIPE-01: Existing Agency Office bundle links and existing Studio Stripe links are protected real-money paths and must not change without Ian's explicit approval.
- STRIPE-02: Stripe webhooks verify signatures, handle events idempotently, and update entitlements server-side.
- STRIPE-03: The new production subscription catalog must create and wire exactly nine tiers: Human Basic/Mid/Top at $10/$20/$30, API-only Agent Basic/Mid/Top at $7/$14/$21, and Both Basic/Mid/Top at $15/$30/$45. Done requires product, recurring price, and Payment Link or Checkout Session creation; Stripe product IDs, price IDs, metadata, success/cancel URLs, test-mode validation, live hosted-checkout open-without-payment validation, entitlement mapping, amount assertions, and a protected legacy link audit.

## Platform Architecture

- ARCH-01: Create a separate backend/app service named `webot-platform` or `webot-api`; do not add backend code to `webot-site`.
- ARCH-02: Recommended deployment stack is Next.js App Router on Vercel, Postgres/Supabase with RLS, Supabase Auth, Stripe webhooks/entitlements, Redis/rate limit, and async queue/worker.
- ARCH-03: Before backend feature implementation assumes platform infrastructure exists, bootstrap the separate service repo with a Next.js app, package scripts, environment contract, Supabase config and migrations, local dev server, test setup, Vercel deployment config, domain/env readiness notes, and CI/build/test/deploy checks.
- API-01: API surface includes `GET /v1/openapi.json`, `GET /v1/catalog`, `GET /v1/me`, `GET /v1/entitlements`, `GET /v1/usage`, `POST /v1/jobs`, `GET /v1/jobs/:id`, job events, cancel/revision, file presign, and Stripe webhook endpoints.
- API-02: API responses expose customer-safe job state and rejects without exposing internal model, tool, prompt, queue, or reviewer details.
- API-03: OpenAPI documentation must reflect implemented routes and schemas.
- API-04: Agent-friendly API documentation must include authenticated and public docs pages, quickstart, auth guide, examples, OpenAPI schema browser, endpoint examples, error/reject codes, usage/quota docs, webhook docs, SDK and cURL examples, and browser/screenshot verification.
- DATA-01: Core data components include accounts, users, hashed API keys, plans/entitlements, usage ledger, jobs, job events, rejects, rate limit events, webhook events, and files with short retention.

## Security

- SEC-01: API keys are hashed and never stored, logged, or returned in plaintext after creation.
- SEC-02: Account authorization is enforced for every account-owned resource through Supabase Auth, RLS, and server-side checks.
- SEC-03: Quotas, concurrency, per-key/account rate limits, and idempotency are enforced server-side.
- SEC-04: Files use short-lived presigned access and explicit retention windows.
- SEC-05: OWASP API Top 10 review and safe-reject review pass before release.

## Dashboard and CRM

- DASH-01: Dashboard requires verified auth/session and Stripe entitlement verification.
- DASH-02: Dashboard supports durable intake, job status board, review actions, file handling, and billing portal access.
- DASH-03: Dashboard supports API keys, usage, jobs, and webhooks for agent/API customers.
- DASH-04: Dashboard tiers/options reflect Human, API-only Agent, and Both plans.
- CRM-01: CRM or intake handoff must be durable and accurately described; do not claim fully wired behavior until implementation and live checks prove it.

## Visual System

- VIS-01: Brand remains dark, premium, and operational.
- VIS-02: Character system uses real-human-looking service leads, not mascots.
- VIS-03: Character assets are transparent PNG/WebP, manually QA/retouched, and screenshot-tested on desktop and mobile. Existing concepts: Mara Vale, Celeste Rowan, Theo Park, Nadia Cross, Ellis Way. Add matching concepts for Media & Convert, Growth & Market, and Career & Prep.

## Model Runtime

- MODEL-01: Capture local inventory in a manifest: M3 Ultra 96GB, Ollama 0.20.5, llama.cpp, MLX, whisper.cpp, ffmpeg, ImageMagick, ComfyUI assets, warm models, GGUF workspace, and staged FLUX/Qwen/LTX assets.
- MODEL-02: Define a router contract by service category before final model selection.
- MODEL-03: Build an evaluation corpus by service category.
- MODEL-04: Extend the approval-flow harness to cover expanded service categories.
- MODEL-05: Define queue/resource policy and run quant bakeoffs only after platform surfaces, API/backend, queues, and eval gates are ready.

## Release Verification

- VERIFY-01: Human browser-style testing captures desktop/mobile screenshots for public and dashboard flows.
- VERIFY-02: Functionality tests click all buyer buttons up to hosted payment submission without submitting payment details or creating charges.
- VERIFY-03: Backend/API tests cover auth, entitlements, usage, jobs, files, webhooks, quotas, rate limits, idempotency, and safe rejects.
- VERIFY-04: Protected Stripe links are audited against a snapshot before release.
- VERIFY-05: Release is blocked until public surfaces, dashboard, backend/API, security review, and verification evidence pass.
- VERIFY-06: Release verification must be executable: browser tests/assertions, screenshot artifact existence and visual inspection, payment-click traversal up to submission, Stripe product amount assertions, dashboard/auth/API docs screenshots, backend API/security tests, no fake entitlement via querystring, and protected link snapshot diff. Evidence files alone cannot satisfy this gate.
