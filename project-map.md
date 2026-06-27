# Project Map: webot-site

## Core Purpose
Main agency landing page for WeBot Agency. Focuses on high-conversion sales of AI products and professional services.

## Directory Structure
- `/` : Root directory containing all static assets.
  - `index.html` : Main landing page.
  - `consultation.html` : Discovery call booking page.
  - `success.html` : Post-conversion thank you / onboarding page.
  - `projects.html` : Internal Ops Dashboard (noindex).
  - `privacy.html` : Legal privacy policy.
  - `ops-data.json` : Data source for projects.html.
  - `CNAME` : Domain mapping for webot.agency.
  - `templates/` : Email/Status digest templates.
  - `scripts/publish-live.sh` : Safe GitHub Pages publish helper with dry-run default, live backups, sanity checks, guarded push, poll, and screenshots.
  - `docs/PUBLISH-LIVE.md` : Operator runbook for human-approved live publishes.
  - `favicon.*`, `apple-touch-icon.png` : Brand assets.
  - `.handoffs/` : Current state, corrections, and durable planning docs for agent pickup.

## Deployment & Runtime
- **Provider:** GitHub Pages
- **Repository:** TheRefreshCNFT/webot-site
- **Branch:** `master` (GitHub Pages source, auto-deploys from `/`)
- **Domain:** `webot.agency` (CNAME mapped)
- **Infrastructure:** Pure Static (HTML/CSS/JS). No build step.

## Cross-Site Dependencies
This site is part of a triad. Changes to navigation or brand identity should be mirrored across:
1. `webot.agency` (This site)
2. `webot.buzz` (Content/News hub)
3. `webot.studio` (Hosting landing page)

## Key Integration Points
- **Payments:** Stripe (Buy Now buttons linked to specific Product IDs).
- **Booking:** `book.webot.agency` (External API for discovery calls).
- **Contact:** Formspree (Placeholder) / mailto:hello@webot.agency.
- **Analytics:** GA4 (`G-D3XESX21VE`).

## Current Planning Artifacts
- `.handoffs/WEBOT_AGENT_MARKETPLACE_PLAN_2026-06-27.md` : First-pass plan for the "We Bot You!" agent marketplace, Studio signup/payment/dashboard flow, privacy model, agent families, and sub-agent chains.
- `.handoffs/CORRECTIONS_2026-06-27.md` : Evidence log for branch/deploy mismatch, dirty-tree state, live checks, screenshots, and code-intelligence limitations.

## Operations Runbooks
- `scripts/publish-live.sh` : Reusable publish script for GitHub Pages. Default mode is dry-run; live publish requires `--confirm-live`.
- `docs/PUBLISH-LIVE.md` : Human approval gate, backup paths, screenshot paths, and rollback notes for live publishes.
- `~/.webot/warehouse/webot-site/publish-live-runbook.md` : Warehouse copy of the publish rules for future agent pickup.
