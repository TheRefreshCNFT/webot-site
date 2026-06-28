---
date: 2026-06-28
project: webot-site + webot-studio
status: local_verified_pending_publish
---

# Itinerary Agent Flow

## What changed

- Added Plan & Itinerary as a first-class WeBot agent family for vacations, date nights, business get-togethers, and road trips.
- Added Agency SEO metadata, JSON-LD service/FAQ schema, updated sitemap lastmod, homepage offer copy, FAQ copy, and relevant helpful-supply placement copy.
- Added Studio Plan & Itinerary selection, after-Stripe next-step timeline, stronger double-review language, fresh-context review state, and a customer-facing test desk.
- Added Studio deterministic test scenarios for:
  - vacation planner
  - date night
  - business get-together
  - road trip
  - PDF cleanup
  - automation/code review
  - card/logo creative work
  - decision memo
- Added Studio `robots.txt` and `sitemap.xml`.

## Test discipline

Use this script for this flow. Do not manually recreate the browser-test path:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
```

The script:

- runs `git diff --check` for Agency and Studio
- parses Agency and Studio JSON-LD
- compiles inline page scripts
- starts isolated static servers in-process
- verifies desktop/mobile centering and no horizontal overflow
- verifies all Studio test scenarios route to the expected agent
- verifies test chat can reroute a technical message to Build & Automate
- verifies `?payment=confirmed&product=studio-business` selects Business and shows the post-Stripe review steps
- captures screenshots under `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-*/screenshots`

Latest passing local run:

- `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T023026Z/screenshots`

## Safety notes

- No Stripe payment IDs were changed.
- No checkout was submitted.
- No paid ads, affiliate IDs, ad pixels, tracking pixels, or paid placements were activated.
- The test desk is deterministic launch validation for the static public page; real customer work still depends on paid intake, CRM import, production work, and review.
