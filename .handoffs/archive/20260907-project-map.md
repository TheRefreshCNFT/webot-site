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
  - `scripts/verify-owned-runtime-process-clean.mjs` : Owned-runtime process guard used by `scripts/test-itinerary-flow.sh`; scans active process/test/doc/shell surfaces and current `PATH` for legacy hosted-provider command paths.
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
- `.handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md` : Active continuation for the WeBot platform pivot to owned/server-controlled infrastructure, including Adobe/owned-server hard stops, release gates, and verification baseline.
- `.handoffs/CURRENT_STATE.md` : Authoritative current state, hard stops, latest verification, and definition of done.
- `ACTIVE_STATE.md` : Current focus, blockers, verified status, and next actions.
- `.handoffs/WEBOT_AGENT_MARKETPLACE_PLAN_2026-06-27.md` : First-pass plan for the "We Bot You!" agent marketplace, Studio signup/payment/dashboard flow, privacy model, agent families, and sub-agent chains.
- `.handoffs/CORRECTIONS_2026-06-27.md` : Evidence log for branch/deploy mismatch, dirty-tree state, live checks, screenshots, and code-intelligence limitations.

## Operations Runbooks
- `scripts/publish-live.sh` : Reusable publish script for GitHub Pages. Default mode is dry-run; live publish requires `--confirm-live`.
- `docs/PUBLISH-LIVE.md` : Human approval gate, backup paths, screenshot paths, and rollback notes for live publishes.
- `~/.webot/warehouse/webot-site/publish-live-runbook.md` : Warehouse copy of the publish rules for future agent pickup.

## Phase 1 Resource Inventory
- Before planning or state-changing work, follow `webot-flow`: read `.handoffs/CURRENT_STATE.md`, `AGENTS.md`, this `project-map.md`, and `ACTIVE_STATE.md`; then run the verification commands from the state docs.
- Search resource-decision knowledge in `~/.webot/wiki`, `~/.webot/warehouse`, this repo's handoffs/planning docs, and sibling WeBot repos before assuming a deployment target or new vendor.
- Credential and env sources may be listed by path/name only. Do not print secret values.
- Treat Adobe Cloud, Oracle/server infrastructure, GoDaddy/DNS, Stripe, and payment paths as live systems. Do not modify, deploy, restart, route, or repoint them without explicit approval for the exact target, blast radius, and rollback path.
