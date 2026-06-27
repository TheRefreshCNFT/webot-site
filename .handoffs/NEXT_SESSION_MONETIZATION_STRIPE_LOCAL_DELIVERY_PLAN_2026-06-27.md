# Next Session Plan: Monetization, Stripe, And Local-Agent Delivery

Date: 2026-06-27
Status: Plan for next session
Excludes: Live publish of the approved Agency + Studio pages, which is handled separately in the current session.

## Goal

Move the approved "We Bot You!" Agency + Studio launch from polished public concept into a working revenue system:

- researched pricing,
- real Stripe implementation,
- CRM-safe customer flow,
- local-agent delivery pipeline,
- full checkpointed definition of done.

The commercial goal is volume first: get people using WeBot products quickly, with attractive early pricing that can step up as the first paid customer cohorts grow.

## Operating Rules

- Use the full `webot-flow` before state-changing work.
- Use subagents for research, security review, Stripe/CRM mapping, Studio implementation, UI QA, and release verification.
- Keep backups before every production-touching or payment-touching edit.
- Commit in checkpointed slices so progress is not lost.
- Ask questions when the answer affects money, credentials, security, retention, remote access, or live production behavior.
- Do not expose model/vendor names in customer UI.
- Customer-facing agent names should be human-friendly roles, not model names.
- Every customer delivery gets lead review and customer review before final delivery.

## Phase 0: Safety And Repo Baseline

Definition of done:
- `webot-site`, `webot-studio`, `.pi`, and related credential locations are mapped.
- Current branches, remotes, dirty files, and deploy sources are verified.
- Secrets are located only by path and capability, never printed into logs or docs.
- Backups exist for every file that will be edited.

Actions:
- Run `webot-flow` in each repo touched.
- Confirm GitHub Pages branch/source for `webot.agency` and `webot.studio`.
- Confirm `.webot/credentials`, `.webot/warehouse`, `.pi`, and skills locations relevant to Stripe/CRM/agent routing.
- Confirm current CRM + Stripe integration boundaries without changing payment URLs.
- Decide which dirty files are release work, docs-only work, or local noise.

Human gates:
- Any credential use.
- Any payment URL replacement.
- Any DNS, deploy, retention, OAuth, remote access, or customer-data handling change.

## Phase 1: Pricing Research And Launch Offer Strategy

Definition of done:
- Pricing recommendations are based on real current market research, not guesses.
- Each WeBot offer has an initial launch price, target future price, included capacity, and upgrade path.
- Early-customer discounts are simple enough to explain on the site and implement in Stripe.

Research required:
- Scraping/OCR/PDF extraction services.
- AI content/social post generation services.
- Greeting card/custom card design services.
- Logo and business card design services.
- Code review and code-writing assistant services.
- Spreadsheet formula/report automation services.
- Research brief/decision memo services.
- AI agent setup/automation agencies.
- Subscription agent-dashboard tools.

Proposed pricing model to evaluate:
- Founding 100 paid customers: ultra-low annual or monthly launch pricing.
- Customer 101-200: modest increase.
- Customer 201-500: closer to sustainable low-market pricing.
- Customer 501-1000: standard public price for now.
- Per-job credits for occasional users.
- Subscription tiers for repeat users and businesses.

Evaluation criteria:
- Attractive enough for volume.
- Still protects lead review time.
- Local-agent cost advantage reflected in pricing.
- Higher tiers buy capacity, priority, complexity, and convenience, not lower quality for lower tiers.

## Phase 2: Stripe Implementation

Definition of done:
- Stripe products/prices/checkout paths are mapped and implemented safely.
- Studio has real plan and/or credit checkout paths where approved.
- Existing live skill-pack sales remain intact.
- Payment success returns users into the correct Studio state.
- CRM receives or can retrieve the right payment/customer context.

Actions:
- Inventory existing Stripe links on `webot.agency`.
- Confirm active Stripe account and credential path.
- Create or map products for:
  - Starter subscription,
  - Plus subscription,
  - Studio/Business subscription,
  - per-job credits,
  - launch cohort pricing,
  - custom quote/contact path.
- Decide coupon/promotion mechanism for first 100/next cohorts.
- Implement URL placeholders only after live Stripe URLs are verified.
- Add success/cancel flows.
- Verify no existing bundle links changed unless explicitly approved.

Human gates:
- Final price table.
- Product names.
- Live Stripe URLs.
- Coupon/discount rules.
- Any CRM mutation.

## Phase 3: Studio Account, Intake, And Dashboard Flow

Definition of done:
- A customer can understand the flow from signup through agent selection, plan/payment, intake, dashboard status, review, and delivery.
- Implementation is honest about what works now versus what is queued for onboarding.
- No customer data is stored by default beyond active-job needs.

Actions:
- Map Studio front-end states to backend or placeholder states.
- Add account flow only where real auth/session behavior exists or is explicitly scoped.
- Add payment-confirmed state from Stripe return parameters.
- Add project intake fields by agent family.
- Add read-only kanban/status checkpoint model.
- Ensure all status copy is human-friendly.
- Keep lead review and customer review visible in every path.

Dashboard states:
- Received.
- Preparing.
- Working.
- Lead Review.
- Ready For Your Review.
- Delivered.
- Expired/deleted, where applicable.

## Phase 4: Local-Agent Delivery Pipeline In `.pi`

Definition of done:
- `.pi` is the local orchestration space for customer work.
- Local workers can handle tasks by family.
- The lead engineer/orchestrator verifies output before customer delivery.
- Customer-facing updates do not reveal chain-of-thought or model/vendor names.

Actions:
- Map current `.pi` agent hierarchy and skills.
- Identify which local models are already installed and useful.
- Evaluate whether new distilled/local models are needed.
- Define agent families and internal roles:
  - Gather & Extract,
  - Create & Polish,
  - Build & Automate,
  - Review & Decide.
- Ensure missing skills are installed globally and for `.pi`, preferably free/open-source and no MCP unless necessary.
- Implement checkpoint updates to Studio/dashboard.
- Add review gates before customer-visible delivery.

Quality rule:
- Premier quality at every tier. Lower tiers may have less capacity or slower turnaround, not less care.

## Phase 5: SEO, Offer Pages, And Helpful Supply Links

Definition of done:
- Main high-intent offers have SEO-ready pages or sections.
- Helpful supply links are tasteful, relevant, and compliant.
- Paid/affiliate links are disclosed in friendly language and use proper link attributes.

Offer pages/sections:
- AI greeting card maker.
- Printable greeting cards and wishes.
- Business card design.
- Logo concept generation.
- Website scraping.
- OCR and PDF extraction.
- Spreadsheet formulas.
- Code review.
- Code writing.
- Social posts.
- Research briefs.

Supply link candidates:
- Greeting card paper.
- Business card sheets.
- Higher-quality printable card stock.
- Envelopes or matching printable sets if relevant.

Implementation rules:
- No intrusive ads.
- Match supply suggestions to offer type.
- Use `rel="sponsored"` or appropriate outbound qualification for paid links.
- Do not add affiliate IDs without human approval.

## Phase 6: Testing And Release Checkpoints

Definition of done:
- Desktop and mobile visual checks pass.
- Functional paths pass.
- Payment paths pass in Stripe-approved mode.
- Data-retention language matches actual behavior.
- Publish scripts/backups are verified before live changes.

Required tests:
- Static HTML validation.
- `git diff --check`.
- Link/hash target validation.
- Mobile and desktop screenshots.
- Studio interaction tests at mobile and desktop widths.
- Stripe success/cancel path tests.
- Existing bundle Stripe URL preservation test.
- CRM readback test, if CRM mutation is in scope.
- Live post-publish screenshot and HTTP checks.

Checkpoint strategy:
- Commit after pricing/Stripe mapping docs.
- Commit after Stripe products/URLs are implemented.
- Commit after Studio flow implementation.
- Commit after local-agent `.pi` integration.
- Commit after SEO/supply-link pass.
- Final release commit only after human approval.

## Open Questions For Next Session

- Which exact Stripe account/products should be used for new Studio plans?
- Should launch cohort pricing be per month, per year, per job-credit pack, or mixed?
- What customer count source should control the first-100/next-100 pricing step?
- What CRM fields currently exist for paid customer/account/project state?
- Which `.pi` agents should be allowed to touch customer work first?
- What retention window should be used for active-job files in the first production version?
- Should Studio offer account creation immediately, or use payment/contact-assisted onboarding first?
- Which supply-link partners are approved for paid links?
