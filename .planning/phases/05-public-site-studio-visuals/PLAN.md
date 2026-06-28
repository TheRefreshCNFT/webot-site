# Phase 05 Plan: Public Site, Studio, and Visuals

## Objective

Update public Agency/Studio surfaces with the expanded service taxonomy, premium operational positioning, protected checkout paths, and real-human-looking service lead visuals.

Requirements: TAX-01, TAX-02, TAX-03, VIS-01, VIS-02, VIS-03, COPY-01, COPY-02, STRIPE-01, VERIFY-01.

## Dependencies

- Phase 01 offer and pricing contracts complete.
- Phase 04 dashboard/checkout behavior complete enough for public CTAs to target accurate flows.

## Read First

- `.handoffs/CURRENT_STATE.md`
- `AGENTS.md`
- `ACTIVE_STATE.md`
- `docs/monetization/offer-taxonomy.md`
- `docs/monetization/pricing-checkout-contract.md`
- `docs/monetization/protected-stripe-links-snapshot.md`

## Tasks

### Task 1: Update Public Taxonomy and Offer Copy

Files:
- `index.html`
- `llms.txt`
- `sitemap.xml`
- `robots.txt`
- `consultation.html`
- `success.html`
- relevant crawlable offer pages under `webot-site`
- matching public pages in `../webot-studio` when shared Studio positioning changes

Action:
- Implement the eight-family order and service coverage from TAX-01 and TAX-02.
- Preserve Office Skill Packs and Custom Builds as distinct paths per TAX-03.
- Use COPY-01 public-safe positioning and enforce COPY-02: no public local-model/internal implementation copy.
- Do not change protected Stripe URLs or live payment products without Ian's explicit approval.
- If nav, footer, shared ecosystem language, or cross-site product positioning changes on Agency, check whether `webot-studio` and `webot-buzz` need matching edits.

Verify:
- Automated: `git diff --check`
- Automated: `grep -R -Ei "local model|Ollama|llama|whisper\\.cpp|ComfyUI|frontier supervision|internal prompt|internal tool|queue internal" index.html consultation.html success.html llms.txt *.html && exit 1 || true`
- Automated: `scripts/test-itinerary-flow.sh`

Done:
- Public surfaces show the expanded offer clearly, with safe copy and protected payment paths preserved.

### Task 2: Create and QA Character Lead Assets

Files:
- `assets/characters/*.{png,webp}`
- `docs/visual/character-system.md`
- `index.html`
- relevant offer pages under `webot-site`
- matching public visual placements in `../webot-studio` where appropriate

Action:
- Define service leads for all eight families using the existing concepts: Mara Vale, Celeste Rowan, Theo Park, Nadia Cross, Ellis Way, plus matching concepts for Media & Convert, Growth & Market, and Career & Prep.
- Assets must be real-human-looking, premium, transparent PNG/WebP, manually QA/retouched, and not mascot-like.
- Desktop placements may sit beside categories/pages; mobile must hide or crop carefully without overlap or horizontal overflow.

Verify:
- Automated: `test -f docs/visual/character-system.md`
- Automated: `find assets/characters -type f \\( -name '*.png' -o -name '*.webp' \\) | wc -l | grep -E '^[8-9][0-9]*$|^8$'`
- Automated: `scripts/test-itinerary-flow.sh`

Done:
- All eight service families have QA-ready character concepts/assets and responsive placements.

### Task 3: Browser Screenshot Verification

Files:
- `scripts/test-itinerary-flow.sh`
- screenshot output directory under `/Users/webot/Backups/webot-site/`

Action:
- Extend the existing browser validation harness to cover expanded taxonomy pages, Studio-facing routes, CTA clicks up to payment submission, and desktop/mobile screenshots.
- Validate no horizontal overflow, no visual overlap, no raw AI-looking artifacts in character placements, and no accidental protected Stripe link changes.
- Do not publish. Use local validation only unless Ian separately authorizes live publish.

Verify:
- Automated: `scripts/test-itinerary-flow.sh`
- Automated: `git diff --check`

Done:
- Browser-style screenshots prove desktop/mobile public surfaces are ready for human review before any publish request.

## Acceptance Tests

- `git diff --check`
- `scripts/test-itinerary-flow.sh`
- Manual review: inspect generated desktop/mobile screenshots for character quality, crop, overlap, and premium operational feel.

## Source Coverage Audit

- TAX-01, TAX-02, TAX-03 covered by Task 1.
- VIS-01, VIS-02, VIS-03 covered by Tasks 2 and 3.
- COPY-01, COPY-02, STRIPE-01 covered by Task 1 and verified by grep/link guards.
- VERIFY-01 covered by Task 3.
