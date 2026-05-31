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
  - `favicon.*`, `apple-touch-icon.png` : Brand assets.

## Deployment & Runtime
- **Provider:** GitHub Pages
- **Repository:** TheRefreshCNFT/webot-site
- **Branch:** `main` (auto-deploys)
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
