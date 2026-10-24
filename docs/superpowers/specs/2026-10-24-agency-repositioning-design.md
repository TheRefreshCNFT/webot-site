# WeBot Agency repositioning and website overhaul design

Date: 2026-10-24

Status: Approved design; implementation not started

Project root: `/Users/webot/Projects/webot-site`

## 1. Current authority and delivery boundary

`webot-site` is the canonical static source for `https://webot.agency/`. The current public source remains the older Studio-led, eight-service-lane website until the approved implementation replaces it. GitHub Pages on `master` remains the declared release route.

This design covers local implementation and verification. Publication is a separate guarded release after owner review. Do not alter live Stripe products, prices, checkout links, advertising, external campaigns, or paid provider accounts. No paid API top-up is authorized.

The approved design preserves unrelated dirty files and the existing no-build HTML/CSS/JavaScript architecture.

## 2. Business direction

WeBot Agency becomes a done-for-you AI automation consultancy for small and medium businesses. The brand should feel capable, direct, approachable, and sharply practical: a trusted service partner for companies that need useful automation without enterprise-consulting cost, complexity, or intimidation.

The central message is:

> Need to streamline your flow? We Bot You.

The primary conversion is a free 30-minute consultation. Custom work is scoped and priced by quote. The site sells business outcomes and dependable implementation rather than agent personas, technical jargon, or a large catalog of disconnected services.

### Goals

- Explain the offer clearly within the first screen.
- Make non-technical SMB owners feel that WeBot understands their problems and can implement the solution.
- Show credible evidence from real operating systems.
- Convert visitors through consultation booking, phone, email, quote requests, and a real first-line chat agent.
- Retain skill packs as a secondary self-serve offer.
- Remove obsolete service positioning and low-value distractions.

### Non-goals for this implementation

- Rebuilding or repricing the actual skill-pack products.
- Adding a public Studio product or Studio sales journey.
- Inventing testimonials, performance metrics, client results, or capability claims.
- Adding a fake chat experience, automated ROI calculator, newsletter fallback, or instant quote generator.
- Introducing a framework, package manager, or application build step.

## 3. Approved service and Studio decisions

Custom AI automation consulting, implementation, review, deployment, handoff, and optional hosting/support are the core offer. Examples on the site are common starting points, not rigid service packages.

WeBot Studio remains an internal and client-facing review/testing environment. It is not linked as a separate public product for now. Approved public language may explain that clients can review an automation in WeBot Studio or ask WeBot to host it. Client-specific URLs may follow the `client123.webot.studio` pattern when that structure is implemented; the website must not claim that arbitrary client subdomains already exist.

The separate skill-pack follow-up will audit implementation quality, scripts and references, catalog composition, pricing, and checkout structure. It may retain, improve, remove, or add products. This website implementation preserves current checkout paths and improves only their presentation and buyer guidance.

## 4. Information architecture and page flow

Primary navigation: **What We Automate · Our Work · Process · Skill Packs · FAQ · Book a Call**.

### 4.1 Hero

- Headline: **Need to streamline your flow? We Bot You.**
- One concise supporting statement explaining that WeBot designs, builds, and supports practical AI automations for small and medium businesses.
- Primary CTA: **Book a free 30-minute consultation**.
- Secondary phone and email actions.
- No competing Studio CTA or dense product navigation.

### 4.2 Problem recognition

Use three concise, recognizable situations:

- Too much repetitive computer work.
- Disconnected tools, files, and information.
- Needing more capacity without another full-time hire.

### 4.3 Common automation examples

Present a concise set of useful examples with plain-language descriptions:

- Document processing and OCR.
- Web research, scraping, and structured information.
- Lead capture and follow-up.
- File, directory, and back-office operations.
- Image enhancement and bulk processing.
- Custom repeatable computer workflows.

Every example leads to the same consultation path. Do not turn these into six separate pricing tiers or product funnels.

### 4.4 Real proof

Show evidence-backed examples of systems WeBot builds and operates:

- Discord community-agent activity using approved screen captures and accurate explanations.
- The live MLS lead-generation platform, approved captures, and a factual explanation of its behind-the-scenes agents.
- WeBot's own products where they add useful, verifiable credibility.

Use real screenshots with plain captions. Do not publish confidential information or unverified outcomes. Captures and final public wording must be reviewed during implementation.

### 4.5 Engagement process

Use four clear stages:

1. **Talk:** free 30-minute consultation.
2. **Scope:** recommended workflow, deliverables, timeline, and quote.
3. **Build and review:** implement and review with the client in WeBot Studio.
4. **Launch:** hand off, deploy, or optionally host and support the automation.

### 4.6 Skill packs

Use a compact secondary section that clearly distinguishes installable self-serve skills from custom automation. Improve bundle names, audience guidance, included contents, requirements, and buyer expectations without changing the current products or payment paths in this phase.

### 4.7 FAQ and final CTA

Cover quote-based pricing, what can be automated, data handling, Studio review, optional hosting/support, skill packs, and what happens on the first call. Close with one consultation action and the **We Bot You.** brand statement.

## 5. Consultation and quote flow

Keep `consultation.html` and the existing live booking route. Update the actual booking duration and all public copy from 15 to 30 minutes through the owning service; front-end copy alone is not acceptance.

Retain the simple name, email, automation summary, and slot-selection flow. Add an unchecked **I'd also like a project quote** option. Selecting it reveals concise instructions asking for:

- The repetitive steps performed today.
- The apps, websites, files, or systems involved.
- Frequency and approximate volume.
- The desired output or finished result.
- Any desired deadline or budget range.

The booking handoff must include the quote request and collected summary without changing the backend schema unnecessarily. The immediate outcome remains a genuinely booked consultation, not an instant estimate.

Phone and email remain visible alternatives. Loading, no-availability, validation, booking failure, and success states must be explicit. A failed request never displays success.

## 6. Real Ask WeBot chat

### 6.1 Purpose

The chat is a real first-line capability and fit assistant. It demonstrates WeBot's service while helping a visitor decide whether a workflow is worth discussing.

It answers questions such as:

- Can you automate this workflow?
- Can your bots use audio?
- Do you work with this tool or file type?
- Can this process be completed by an agent?
- What happens to my files?
- Can you host or maintain the result?

### 6.2 Behavior and limits

- Use an approved, versioned capability knowledge base covering services, common inputs and outputs, integrations, review, Studio, hosting, skill packs, privacy, and engagement process.
- Distinguish **common fit**, **possible after technical review**, and **not a fit**. Do not promise that every workflow is automatable.
- Answer basic capability questions directly and help visitors describe their use case in plain language.
- Decline pricing discussions and explain that quotes follow scoping.
- Offer a booking or quote-request handoff. Carry an approved use-case summary into the booking form and select the quote option when requested.
- Admit unknowns and route them to a human rather than improvising.
- Identify the experience as an automated assistant.

### 6.3 Architecture and data boundaries

- Use a real server-side agent endpoint. Credentials, provider secrets, system instructions, and internal operating details never ship to the browser.
- The static site calls a narrowly scoped endpoint with input limits, rate limiting, abuse handling, timeouts, and a safe fallback.
- Chat failure never blocks phone, email, or calendar booking.
- Keep chat context transient by default. Do not persist transcripts or lead details unless the visitor knowingly requests a handoff and the actual privacy copy permits it.
- Verify provider and operational logging behavior before making retention claims. Public privacy language must match the implemented system, not the desired marketing claim.
- Use an existing approved runtime/provider when it satisfies these requirements. Do not create new paid accounts or purchase provider credit without explicit approval.

### 6.4 Required chat evidence

Test real responses for supported capabilities, audio questions, ambiguous workflows, unsupported requests, unknowns, pricing refusal, prompt-injection attempts, quote handoff, backend timeout/failure, and rate limiting. Verify that handoff content matches the visitor's approved summary.

## 7. Visual system

- **Genre:** modern-minimal.
- **Macrostructure:** Split Studio, using concise text paired with proof rather than repetitive generic marketing cards.
- **Theme:** custom Signal.
- **Vibe:** capable, direct, approachable, sharply practical.
- **Palette:** carbon surfaces, warm-white text, sharp lime accent, with accessible tinted supporting neutrals.
- **Display face:** Bricolage Grotesque.
- **Body face:** Geist.
- **Navigation:** compact floating navigation with a persistent consultation action and a usable mobile disclosure.
- **Footer:** restrained statement footer led by **We Bot You.**
- **Proof media:** real screenshots in plain figures with at most hairline borders.

Use a token-based OKLCH palette and a 4-point spacing system. Keep lime as a signal rather than flooding sections with accent color. Avoid gradient text, stock robots, fake browser or IDE chrome, fabricated dashboards, decorative metrics, glassmorphism, and unnecessary animation.

Motion must be minimal, use transform/opacity only, respect reduced-motion preferences, and never obstruct reading or interaction.

## 8. Implementation shape

- Preserve static HTML, CSS, and JavaScript with no framework or package-manager dependency.
- Add a shared Hallmark token file and consolidated styles/scripts so pages do not duplicate the current large inline design system.
- Preserve unrelated operations pages, evidence, legal assets, and existing success/payment return routes unless their own content requires alignment.
- Preserve existing Stripe checkout URLs byte-for-byte in this phase.
- Reconcile the booking frontend with the owning booking service and its real 30-minute event contract.
- Build the chat endpoint in the appropriate owning runtime after inspecting existing source-to-runtime mapping. The static site is only its client.
- Update metadata, Open Graph content, structured data, `llms.txt`, `robots.txt` if needed, and `sitemap.xml` to match the implemented offer.
- Update privacy and terms only to describe verified behavior.
- Remove the newsletter and unrelated legacy offers rather than preserving fallback-only distractions.

### Obsolete public service pages

The approved restructuring retires the old service-lane pages and removes their internal and sitemap references:

- `create-polish.html`
- `document-extraction.html`
- `code-automation.html`
- `research-decisions.html`
- `plan-itinerary.html`

Their outdated service copy must not remain publicly presented as the current Agency offer. The implementation plan must list these exact deletions for owner review before mutation. Do not delete unrelated files or historical evidence.

## 9. Accessibility, responsiveness, and SEO

- Semantic landmarks, logical heading order, useful link text, labels, alt text, and keyboard-operable controls.
- Visible focus indicators, accessible contrast, 44-pixel mobile hit targets, and reduced-motion support.
- Human-style responsive verification at 320, 375, 414, and 768 pixels plus desktop.
- No horizontal scrolling, clipped copy, inaccessible mobile navigation, or two-line button labels.
- Chat and forms expose loading, errors, and success states accessibly.
- Replace obsolete service catalogs in search metadata and structured data. Keep only truthful, indexable public content.

## 10. Acceptance result

The design is implemented successfully when all of the following are demonstrated:

1. The first screen clearly communicates SMB AI automation and the free 30-minute consultation.
2. The page follows the approved guided-conversion structure and contains no retired service-lane or Studio sales journey.
3. Real proof is presented without confidential, fabricated, or unsupported claims.
4. Skill packs remain purchasable through unchanged checkout URLs and have clearer buyer-facing presentation.
5. The real booking contract produces 30-minute consultations and transmits quote-request intent accurately.
6. The real chat passes the capability, refusal, handoff, security, and failure behavior in section 6.4.
7. Phone, email, and booking remain usable when chat is unavailable.
8. Responsive, keyboard, contrast, reduced-motion, and form/chat accessibility checks pass with desktop/mobile browser evidence.
9. Internal links, metadata, structured data, `llms.txt`, and sitemap contain no obsolete offers or broken routes.
10. Existing payment-link hashes and unrelated protected files remain unchanged.
11. The final diff, documentation, OKF disposition, and scoped local Git checkpoint are verified.

Local acceptance does not claim live deployment. Live acceptance requires the separately authorized guarded publish and post-publish checks.

## 11. Deferred follow-up

After the website overhaul, run a separate skill-pack quality and catalog project covering implementation depth, scripts, references, real task testing, possible new packs, pricing, and checkout changes. That project needs its own acceptance evidence and explicit approval for any protected payment changes.
