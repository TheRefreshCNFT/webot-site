---
date: 2026-06-28
project: webot-site + webot-studio
status: live_published_script_verified
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

Latest passing live run:

- `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T023445Z/screenshots`

Published commits:

- Agency content: `e6f2d62` (`feat: add itinerary agent offer flow`)
- Studio: `cad25fb` (`feat: add itinerary agent studio flow`)
- Pricing/demo clarity:
  - Agency: `e3ee26b` (`fix: clarify studio one-time job copy`)
  - Studio: `4c82e35` (`fix: clarify one-time job pricing demo`)

## Safety notes

- No Stripe payment IDs were changed.
- No checkout was submitted.
- No paid ads, affiliate IDs, ad pixels, tracking pixels, or paid placements were activated.
- The test desk is deterministic launch validation for the static public page; real customer work still depends on paid intake, CRM import, production work, and review.
- The test desk now has a short demo that simulates paid intake, route selection, agent draft, lead review, fresh-context review, and customer-ready state.
- Public pricing language now says monthly access or one-time jobs; avoid reintroducing "credits" or "packs" in buyer-facing copy unless the offer model is intentionally changed.

## Reflection

- What worked: Turning the itinerary flow validation into `scripts/test-itinerary-flow.sh` made local and live checks repeatable, including screenshots, mobile centering, scenario routing, and payment-return state.
- What broke: The first browser-validation attempt depended on an implicit Playwright install and got stuck when that module was not on the repo Node path.
- Root cause: The test harness was not a committed project artifact, so each session was recreating the validation route from memory and environment guesses.
- Surprised: Removing a temporary Studio nav link correctly exposed that the test assertion was checking a label instead of the actual test desk section content.
- Concrete change: For this flow, use only `scripts/test-itinerary-flow.sh` for local validation and `scripts/test-itinerary-flow.sh --live` for live validation; update the script itself when validation needs change.
