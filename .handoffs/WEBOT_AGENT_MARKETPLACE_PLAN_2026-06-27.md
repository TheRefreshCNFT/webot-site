# WeBot Agent Marketplace + Studio Plan

Date: 2026-06-27
Status: First-pass alignment plan, not implementation
Scope: `webot.agency` public sales revamp + `webot.studio` signup, payment, dashboard concept

## Definition Of Done For This Pass

- Review current local and live site state.
- Review `webot-studio` without touching its dirty working tree.
- Preserve existing skills/bundle sales and Stripe payment flows.
- Define the new "We Bot You!" offer, user journey, layout vibe, technical architecture, privacy stance, and agent chain.
- Identify human gates before credentials, payment URL edits, DNS, production deploy, or destructive cleanup.

## Verified Snapshot

- `webot.agency` is live and returns `HTTP/2 200` for `/`, `/consultation.html`, and `/success.html`.
- DNS for `webot.agency` points to GitHub Pages IPs and `therefreshcnft.github.io`.
- Local `webot-site` is pure static HTML/CSS/JS with no build step.
- GitHub Pages source for `webot-site` is `master` at `/`; `master`, `main`, and the live homepage currently match for `index.html`.
- Local `webot-site` has pre-existing untracked items: `.DS_Store`, `seo-audit/`, `templates/`.
- `webot.studio` is live and returns `HTTP/2 200`.
- GitHub Pages source for `webot-studio` is `master` at `/`; live homepage matches `master:index.html`.
- Local `webot-studio` has pre-existing modifications in `index.html` and `favicon.svg`, currently verified as line-ending-only changes when ignoring CR-at-EOL, plus a UTF-16 `CNAME`.
- SocratiCode is indexed for both repos. Axon is unavailable for useful symbol analysis because these are static sites with no graphable code edges.
- Headless Chrome screenshots show both sites have horizontal overflow/cropping on mobile. This must be fixed before any launch claim.

Screenshot artifacts from review:
- `/tmp/webot-review/webot-agency-home.png`
- `/tmp/webot-review/webot-agency-mobile.png`
- `/tmp/webot-review/webot-studio-home.png`
- `/tmp/webot-review/webot-studio-mobile.png`

## Product Positioning

Core slogan: **We Bot You!**

Plain-English promise:

> You bring the context. We give you the right agent, the right workflow, and a clear place to watch it work. Your data stays yours. Our agent gets the job done.

The public site should stop feeling like a broad AI-services menu and become a guided agent catalog:

- Pick what kind of work you need done.
- Create an account on WeBot Studio.
- Choose access level.
- Pay through Stripe.
- Land in a dashboard.
- Start a project with the selected agent family.
- Watch status updates in a read-only project board.
- Receive reviewed final deliverables.

## Offer Architecture

Keep existing skills and bundles, but organize the new site around four high-value agent families instead of a long mixed list.

### 1. Gather & Extract

Best for scraping, research capture, OCR, PDFs, document conversion, table extraction, lead lists, and messy source cleanup.

Personas under one family:
- Web Scout: scraping and site extraction
- Doc Miner: PDF, OCR, table extraction, document cleanup
- Data Fixer: CSV, spreadsheet, CRM, and format cleanup

### 2. Create & Polish

Best for social posts, greeting cards, story writing, tone rewrites, images/cards, business cards, logos, email-ready content, and personal/business messaging.

Personas under one family:
- Voice Maker: social, email, landing copy, tone matching
- Cardsmith: greeting cards, wishes, downloadable cards, email-able cards as attachment or embedded content, optional generated image content
- Brandsmith: logo concepts, business cards, print-ready layout files, and simple brand starter kits
- Storysmith: story drafting, editing, and creative structure

Decision: greeting cards and image/card generation stay under **Create & Polish** as a delightful use case, not a standalone top-level offer.

### 3. Build & Automate

Best for code writing, code review, spreadsheet formulas, spreadsheet automation, skill writing, `AGENTS.md`, and reusable workflow agents.

Personas under one family:
- Code Partner: code writing, refactor planning, tests
- Review Lead: code review and quality gates
- Sheet Builder: formulas, reports, spreadsheet automations
- Skillwright: Codex/Pi skills, agent files, task runbooks

### 4. Review & Decide

Best for research, comparisons, business summaries, decision memos, and second-opinion reviews.

Personas under one family:
- Research Desk: current-source research and summary packs
- Brief Builder: executive summaries, options, recommendations
- Quality Desk: cross-checks, fact verification, final review before customer delivery

## Main Page Vibe

Target: modern, cool, useful, friendly, accessible, not overdone.

Use the first viewport to sell the exact journey:

- Headline: "We Bot You!"
- Subhead: "Pick an agent. Give it context. Watch the work move."
- Primary CTA: "Choose Your Agent"
- Secondary CTA: "See How Studio Works"
- Trust strip should say concrete things customers care about: "No default data storage", "Reviewed before delivery", "Business + personal tasks", "Stripe checkout ready".

Recommended sections:

1. Hero with the slogan and simple workflow.
2. Agent family selector with four strong cards.
3. "How it works": create login, pick access, pay, run, review.
4. "Your data, our agent": privacy/no-storage explanation.
5. Studio dashboard preview: read-only kanban with checkpoint updates.
6. Existing skill packs and current paid products, preserved and cleaned up.
7. Plans/access levels with Stripe URL placeholders.
8. FAQ focused on nontechnical customers, privacy, payment, turnaround, and what happens after purchase.
9. SEO-focused support pages for high-intent searches: greeting cards, business cards, logo generation, scraping, OCR/PDF, spreadsheet formulas, social posts, code review, code writing, and research agents.

Avoid:

- Long service sprawl.
- Naming model vendors in public-facing agent work.
- Claiming CRM/form wiring unless verified.
- Removing live Stripe products without explicit approval.

SEO requirement:

- Every public offer page should have a search-intent target, clean title/meta description, canonical URL, internal links to Studio, and structured data where appropriate.
- Build for real customer searches, not keyword stuffing. Copy should answer "what can I make, what do I provide, what do I get back, how long does it take, and how do I review it?"
- Add product/service schema only after implementation verifies the page content, price/offer visibility, and payment route.
- Affiliate/supply links must use proper outbound-link qualification such as `rel="sponsored"` where applicable and include a clear, friendly disclosure.

## Studio Direction

`webot.studio` should become the action surface, not just hosting copy.

User flow:

1. User clicks "Choose Your Agent" from `webot.agency`.
2. User lands on Studio signup/login.
3. User chooses an agent family/persona.
4. User chooses plan/access.
5. User pays through Stripe checkout.
6. Stripe confirms payment and returns to Studio.
7. Studio opens a new project intake.
8. Customer sees a read-only kanban with agent checkpoints.
9. Work is reviewed by the lead agent before it is shown as ready.
10. Customer gets a review step for every delivery type, no matter which agent produced it.
11. Final files/content are delivered after customer review.

Dashboard MVP:

- Project cards: title, selected agent family, plan, state, next checkpoint, estimated next update.
- Read-only kanban columns: Intake, Setup, Working, Lead Review, Customer Review, Delivered.
- Activity log: short human-friendly updates only; no hidden chain-of-thought or model names.
- Deliverables area: download links, email/send state, and "request adjustment" button.
- Account plan area: access level, runs remaining, active projects, billing link.
- Customer review step: every job ends with a friendly approval/revision checkpoint before final delivery is considered complete.
- Matched supply links: offer-specific, tasteful product cards may appear on the build/review screen when useful, such as printable greeting card stock for Cardsmith or business card sheets for Brandsmith. These should be styled as helpful supplies, not ads.

Turnaround stance:

- Do not promise instant turnaround.
- Default launch copy can say most small jobs are reviewed within 24-48 hours, with timing shown per job based on complexity, queue, and review needs.
- Every tier must receive premier-quality output. Higher tiers buy access, capacity, complexity, priority, and convenience, not "better care."

Runtime posture:

- Studio should communicate like the Cardano.gov govbot pattern: a lightweight listener is always ready for messages, then the right worker wakes quickly and gets to work.
- Agents should not wake from totally cold for normal customer intake. Keep a small listener/status process warm, queue the job, and route to the right local model/agent family.
- The dashboard should show "received", "preparing", "working", "lead review", "ready for your review", and "delivered" states instead of exposing model/runtime internals.

## Privacy And Data Model

Default stance: do not store customer content long-term on WeBot unless a later human-approved phase adds explicit retention.

Preferred first architecture:

- Browser upload or connector sends files only for the active job.
- Job workspace is temporary and isolated.
- Uploaded job data is encrypted during a short active-work window, inaccessible outside the job system, then deleted after expiry. Once deleted, it is gone and the customer would need to upload it again for future work.
- Outputs are returned to the user, then job data is deleted after confirmation or the configured expiry window.
- Audit logs store metadata only: timestamps, job id, agent family, status, error class, not raw document text.
- Customer dashboard shows state/checkpoints, not raw private data by default.

Customer-facing tone:

> Your files are encrypted while your job is active. We keep them only long enough to complete and review your request, then they expire automatically. After that, they are gone, so you stay in control of what you share and when.

Contact-us/storage path:

- Keep a clear "Contact us" option for customers who need longer storage, repeat access to files, or hosted workspaces.
- Do not offer storage tiers in the first launch copy unless customers ask for it.
- If users repeatedly ask for storage, evaluate hosting/storage tiers as a later Studio upsell with explicit retention, encryption, billing, and deletion rules.

For "work in the user's space":

- First MVP: user uploads files or pastes context per job, with explicit zero-retention copy.
- Near-term: browser-mediated file access where possible.
- Advanced: gated remote workspace bridge using open-source remote desktop/web clients, reviewed before implementation.

Candidate tools to evaluate:

- Apache Guacamole for browser-based remote desktop over VNC/RDP/SSH.
- noVNC for browser VNC.
- Local-first worker pattern for sensitive credentials or user-owned file systems.
- Adobe account integrations only after a specific Adobe workflow is approved.

Human approval is required before any remote access, OAuth, desktop bridge, persistent file connector, or customer-data retention.

## Plans And Access

Use placeholders until Stripe links are confirmed.

Plan concept:

- Starter: 1 active project, 1 agent family at a time, limited monthly runs.
- Plus: multiple agent families, more runs, larger files, priority review.
- Studio: multiple concurrent projects, dashboard history, custom workflows, business onboarding.
- Custom: dedicated setup, connectors, remote workspace bridge, custom agent family.
- Billing model: support both subscriptions and per-job/credit packs. Subscription covers access and included runs; credits handle one-off work, overages, and personal tasks.

Each plan needs:

- Stripe checkout URL placeholder.
- Stripe success URL mapped to the right Studio onboarding state.
- Stripe cancel URL back to plan selection.
- CRM/contact update path preserved from existing Stripe/CRM setup.

Do not change existing live Stripe buy buttons for MS Office, Google Workspace, Complete Office, or current service links without explicit approval.

## Monetization And Supply Links

Goal: monetize without making the product feel cluttered or cheap.

Supply-link concept:

- Add optional paid/affiliate links for physical materials that match the job type.
- For Cardsmith: nicer printable greeting card stock, card/envelope kits, heavyweight matte/gloss paper.
- For Brandsmith: business card sheets in common layouts, premium card stock, glossy/matte options, label/card templates.
- For other offers: only add links where they genuinely help the customer finish the job.

Placement:

- Build screen: small "Helpful supplies" module after the customer chooses delivery type.
- Review screen: show exact recommended paper/layout only if the generated deliverable was formatted for that product.
- Confirmation email/dashboard: include supply link only when relevant to the project.

Rules:

- Keep paid links tasteful, labeled, and visually subordinate to the work.
- Never interrupt checkout or customer review with unrelated offers.
- Do not recommend a paper/layout unless the generated file is sized/tested for it.
- Store supply-link metadata by offer type: product name, retailer, affiliate URL, non-affiliate fallback URL, dimensions/layout, supported export presets, disclosure text.
- Add affiliate disclosures in plain language, for example: "Some supply links may earn WeBot a small commission at no extra cost to you."
- Human approval required before adding affiliate IDs, paid ads, tracking pixels, or outbound paid-link campaigns.

Candidate references to evaluate during implementation:

- Avery printable cards/business-card products and templates: `https://www.avery.com/products/cards`
- Avery business-card products/templates: `https://www.avery.com/products/cards/business-cards`
- Amazon Associates or other approved affiliate programs: `https://affiliate-program.amazon.com/help/operating/policies`
- Google outbound link qualification for sponsored/affiliate links: `https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links`
- Google SEO starter guide: `https://developers.google.com/search/docs/fundamentals/seo-starter-guide`
- Google product structured data: `https://developers.google.com/search/docs/appearance/structured-data/product`

## Runtime And Model Strategy

Goal: use local-first models efficiently while delivering premier-quality output no matter the tier.

Current local model evidence from 2026-06-27:

- Ollama has large local worker/reviewer candidates such as `gemma4-31b-max.Modelfile:latest`, `qwen3.6-35b-a3b-max:latest`, and `qwen3-coder:tuned`.
- Pi model routing currently maps scout/light tasks to `gemma-4-e4b-it:latest` and heavier builder/reviewer/planner roles to 31B/35B-class models.
- Hugging Face cache contains smaller/distilled candidates including Qwen 0.6B/0.8B, Gemma 1B/2B/E2B/E4B, Qwen3.5 9B, audio/Whisper models, and image/audio-related assets.

Architecture:

- Warm listener: lightweight, always-on process that receives customer messages, validates account/project state, writes durable job records, and posts dashboard updates.
- Job router: selects agent family, skill pack, model class, priority, and estimated turnaround.
- Worker pool: wakes only the needed agent/model; concurrency is capped to avoid Ollama thundering-herd failures.
- Lead review: senior/reviewer route checks every deliverable before customer review.
- Customer review: customer can approve, request adjustment, or ask a question.

Model evaluation plan:

- Build a task matrix by offer family: cards, business cards/logos, social posts, scraping, OCR/PDF, spreadsheet formulas, code review, code writing, research.
- For each task, benchmark at least one small/distilled model, one mid model, and one strong reviewer model.
- Measure quality, latency, memory/model-load cost, formatting accuracy, tool-use reliability, and revision rate.
- Prefer models that can fill multiple categories well without overloading the system.
- Keep model/vendor names out of customer-facing UI; use human-friendly agent roles instead.

Operational constraints:

- No paid API top-ups by default.
- Stagger job starts and cap concurrent local model runs.
- Use 24-48 hour default expectation for reviewed deliverables at launch unless a job-specific estimate says otherwise.
- Do not degrade quality by tier. If capacity is constrained, slow the queue or require a higher-access plan for more active jobs.

## Skills Inventory

Already present or available:

- Scraping: `scrapling-official`, `firecrawl`, existing scraping references.
- PDF/document work: bundled `pdf`, `documents`, local `ocr-and-documents`, `nano-pdf`.
- Spreadsheets/formulas: bundled `spreadsheets`, existing `spreadsheet-automation-agent`.
- Social content: `social-media/social-agent`, `tweet-writer`.
- Research: `research/*`, GSD research agents.
- Code review/code writing: Codex base capability plus code-review skills.
- Skill writing: `skill-creator`, existing `webot-skills` agent patterns.
- Business skills already packaged: `data-entry-agent`, `invoicing-agent`, `spreadsheet-automation-agent`.

Gaps to fill before implementation:

- Greeting/card wish + downloadable card skill.
- Image enhancement/upscaling skill.
- Formula-focused skill separate from spreadsheet automation.
- Public agent catalog metadata for personas, deliverables, required inputs, plan access, and privacy notes.
- Pi/global install verification for every customer-facing skill.

Research snapshot for open-source candidates:

- Crawl4AI: open-source LLM-friendly crawler/scraper.
- Docling: local-capable document processing with PDF, OCR, tables, Markdown/JSON export.
- PaddleOCR: OCR/document toolkit with broad language support.
- Marker: PDF to Markdown/JSON with OCR options.
- Real-ESRGAN: practical image/video restoration and super-resolution.
- Apache Guacamole/noVNC: possible browser remote workspace bridge candidates.

## Implementation Phases

### Phase 0: Safety And Ground Truth

Goal: resolve repo, branch, deploy, and dirty-tree ambiguity before content work.

Tasks:
- Treat `master` as authoritative for GitHub Pages unless the repo settings are intentionally changed later.
- Preserve existing `webot-studio` uncommitted changes or normalize them intentionally.
- Confirm existing Stripe product URLs and CRM behavior from credentials without exposing secrets in chat.
- Confirm whether `webot.agency` and `webot.studio` remain separate static repos or Studio becomes an app-backed surface.

Verification:
- `git status --short --branch` for both repos.
- Live 200 checks for both domains.
- Screenshot home/mobile before edits.
- Written approval for any Stripe URL replacement.

### Phase 1: Public Site Revamp

Goal: turn `webot.agency` into the clean agent marketplace intro while preserving existing live products.

Tasks:
- Fix mobile horizontal overflow first.
- Replace broad service framing with four agent families.
- Add agent selector cards and Studio CTA.
- Add Create & Polish examples for cards, logos, and business cards without making them top-level clutter.
- Add SEO-intent page plan for each major offer and include structured-data requirements.
- Keep skill pack sales available, but move them into a cleaner "Skill Packs" area.
- Update FAQ and privacy copy to match zero-retention stance.
- Keep static HTML only.

Verification:
- Browser screenshots desktop/mobile.
- Link audit for all Stripe, Studio, Buzz, mailto, consultation, and success flows.
- SEO audit: title/meta/canonical/internal-link map for each new page or section.
- No change to protected Stripe URLs unless approved.

### Phase 2: Studio Signup + Payment Flow

Goal: make `webot.studio` the account, agent selection, plan, payment, and onboarding surface.

Tasks:
- Design login/signup route.
- Add plan selection with Stripe placeholders.
- Add payment-confirmed landing state.
- Add first project intake form per agent family.
- Add account/dashboard shell.
- Add build-screen slots for relevant helpful supplies, with disclosure and non-intrusive styling.

Verification:
- Simulated signup-to-dashboard path.
- Stripe placeholder audit.
- Accessibility/mobile screenshots.
- Verify paid/sponsored links are labeled, relevant, and not required for the core workflow.
- Human approval before live payment links.

### Phase 3: Dashboard + Agent Operations MVP

Goal: give customers confidence that work is moving without exposing internal model details or chain-of-thought.

Tasks:
- Implement project/job states.
- Implement read-only kanban view.
- Define checkpoint update cadence per project type.
- Define lead-agent review gate before customer delivery.
- Define customer review/approval gate for every delivery type.
- Define deliverable storage/expiry behavior.
- Implement warm-listener/job-router flow modeled on the Cardano.gov govbot pattern: always ready to receive, fast to wake, not fully cold.
- Define default 24-48 hour reviewed-delivery expectation with job-specific estimates.

Verification:
- Create test project in local/staging data.
- Confirm no raw content is persisted by default.
- Confirm public labels use human role names, not model/vendor names.
- Confirm listener can receive and queue a job while workers are offline or busy.

### Phase 4: Skill Catalog And Pi Install

Goal: make the offered agent families real behind the scenes.

Tasks:
- Audit all customer-facing skills.
- Upgrade existing skill packs to be complete and useful.
- Add missing skills: cards, business cards/logos, image enhancement, formula expert, Studio job reporter.
- Install/verify skills for `.pi` and globally.
- Create `AGENTS.md` templates for agent families.
- Evaluate local/distilled model choices for each offer family and document routing.

Verification:
- Skill lint where available.
- Example task per agent family.
- Pi/global path readback.
- Model benchmark readback for representative tasks.
- No paid APIs required.

### Phase 5: Launch And Revenue Ops

Goal: ship a narrow, real paid pilot path.

Tasks:
- Connect confirmed Stripe URLs.
- Confirm CRM receives purchase/signup/contact signals.
- Add onboarding email templates.
- Create pilot proof report format.
- Add affiliate/supply-link registry only after disclosure, relevance, and approval gates pass.
- Add SEO tracking plan for offer pages and high-intent searches.
- Decide first outreach/audience only after tracking and fulfillment path are verified.

Verification:
- Stripe test payment or live penny-safe approved flow.
- CRM readback.
- End-to-end browser flow.
- Affiliate disclosure/link qualification audit.
- Search indexing readiness check: sitemap, robots, titles, descriptions, schema, internal links.
- Human approval before any outbound or paid spend.

## Sub-Agent Chains

### Chain A: Site Information Architecture

Project Phase: WeBot Marketplace IA

Starting point:
- `webot.agency` is static, live, and currently broad-service oriented.
- Existing Stripe products must remain intact.
- Mobile screenshots show overflow/cropping.

Goal:
- Produce exact section-by-section copy and layout map for the new homepage.

Hard rules:
- Do not edit live/prod directly.
- Do not remove current paid skill/bundle sales.
- Do not change Stripe URLs.
- Do not introduce a framework.

Tasks:
- A01. Map current homepage sections and links.
- A02. Draft replacement IA around four agent families.
- A03. Mark content to keep, move, rewrite, or remove.
- A04. Define mobile-first layout behavior.
- A05. Add SEO-intent map for offer pages and customer searches.
- A06. Define tasteful supply-link modules for card/business-card/logo flows.

Human stop points:
- Removing an offer.
- Changing pricing.
- Replacing payment links.
- Adding affiliate IDs, paid links, tracking pixels, or ad placements.

Verification:
- Link inventory.
- Desktop/mobile screenshot review plan.
- SEO title/meta/internal-link map.
- Affiliate disclosure placement review.

Success:
- Build-ready IA with no protected flows broken.

### Chain B: Studio Product Flow

Project Phase: Studio Signup And Dashboard

Starting point:
- `webot.studio` is static and has dirty local files.
- Current CTAs are mailto-only.

Goal:
- Define the signup, plan, payment, confirmed, intake, and dashboard MVP.

Hard rules:
- Do not touch dirty Studio files until Ian confirms ownership.
- Do not wire credentials in chat.
- Human approval required before auth/payment/CRM production changes.

Tasks:
- B01. Map current Studio page.
- B02. Define account states and routes.
- B03. Define plan/access data model.
- B04. Define read-only kanban states and customer update language.
- B05. Define build-screen helpful supply modules by offer type.
- B06. Define warm-listener and job-router states.

Verification:
- Route map.
- Sample user journey.
- Data retention review.
- Listener/queued-job flow diagram.
- Supply-link UX review.

Success:
- Studio app plan ready for implementation without disturbing existing unrelated server content, and every delivery path includes lead review plus customer review before final completion.

### Chain C: Skills And Agent Fulfillment

Project Phase: Agent Catalog Fulfillment

Starting point:
- Several skills already exist, but not all customer-facing offers have complete skill coverage.

Goal:
- Produce a verified catalog of agent families, personas, required skills, missing skills, and install targets.

Hard rules:
- Prefer open-source/free tools.
- No paid API top-ups.
- Do not require MCP unless there is no practical alternative.
- Install only after human approval in this pass.

Tasks:
- C01. Audit current global, `.pi`, and `webot-skills` inventories.
- C02. Map each offer to existing skills.
- C03. Research missing open-source tools.
- C04. Define install/test commands.
- C05. Evaluate local/distilled models by task family and system load.

Verification:
- Skill path readbacks.
- One sample task per family.
- Local model/tool availability check.
- Model/task benchmark table with recommended routing.

Success:
- Agent offerings are backed by real skills, not marketing promises.

### Chain D: Privacy, Payments, CRM, Ops

Project Phase: Revenue And Safety Rails

Starting point:
- Stripe credentials exist under `.webot/credentials`.
- Current public forms include placeholders/mailto fallbacks.
- Customer data should not be stored by default.

Goal:
- Define safe, narrow payment/signup/CRM/fulfillment path.

Hard rules:
- Do not expose secrets.
- Do not change DNS/Caddy/firewall/service deployment without approval.
- Do not store customer documents by default.
- Do not send outbound/customer messages automatically.

Tasks:
- D01. Confirm existing Stripe and CRM flows by readback, not chat disclosure.
- D02. Define Stripe URL placeholders and success/cancel map.
- D03. Define zero-retention job lifecycle.
- D04. Define support/onboarding templates.
- D05. Define affiliate/sponsored-link policy, disclosure, and approval gates.
- D06. Define quality-first turnaround and tier language.

Verification:
- Credential gate checklist.
- CRM event readback plan.
- Privacy acceptance checklist.
- Disclosure/link qualification checklist.
- Premier-quality/no-tier-degradation copy review.

Success:
- Revenue path is actionable, gated, and privacy-aligned.

## Open Questions For Ian

1. Should `master` or `main` be treated as the real deploy branch for `webot-site` and `webot-studio`?
   - Answered by evidence: GitHub Pages source is `master` for both repos.
2. Are the current local `webot-studio` edits yours and should they be preserved as-is?
   - Current evidence: changes are line-ending-only when ignoring CR-at-EOL.
3. Do you want the first paid Studio plans to be subscription-first, per-job credit packs, or both?
   - Answered by Ian: both.
4. For zero-retention, is a short automatic expiry window acceptable, or should first launch delete job files immediately after delivery?
   - Answered by Ian: short window, encrypted with no access through expiry, deleted permanently after expiry.
5. Should greeting cards/image generation be sold as a personal-use agent family, a small add-on, or hidden inside Create & Polish?
   - Answered by Ian: definitely under Create & Polish. Support downloadable cards and email-able cards as attachment or embedded content.

## Next Recommended Unlock

Resolve Phase 0 gates, then implement only Phase 1 mobile-safe IA/copy revamp locally with screenshots. Do not build Studio auth/payment until branch state, dirty Studio files, and Stripe plan structure are confirmed.
