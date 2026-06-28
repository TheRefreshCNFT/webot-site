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
- Added full SEO coverage across Agency + Studio: page-specific metadata, canonical tags, robots directives, Open Graph, Twitter cards, JSON-LD checks, cleaned sitemap indexing, and `llms.txt` summaries.
- Strengthened the Agency + Studio dashboard path around paid intake, agent route, draft, lead review, fresh-context review, customer approval, and completion.
- Added a real local-model approval-flow script that calls Ollama for route, draft, lead review, and fresh-context review, then writes a customer-review-ready packet.

## Test discipline

Use this script for this flow. Do not manually recreate the browser-test path:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
scripts/test-itinerary-flow.sh --live
scripts/test-local-agent-approval-flow.sh
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
- performs static SEO regression checks for metadata, schema parsing, sitemap inclusion, `llms.txt`, dashboard labels, and confusing pricing wording

Latest passing live run:

- `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T032140Z/screenshots`

Latest local model approval-flow run:

- `/Users/webot/Backups/webot-site/local-agent-approval-flow-20260628T032153Z/local-agent-approval-flow.json`
- Model: `gemma4-31b-max.Modelfile:latest`
- Route: `Plan & Itinerary`
- CRM-style status: `ready_for_customer_review`

Published commits:

- Agency content: `e6f2d62` (`feat: add itinerary agent offer flow`)
- Studio: `cad25fb` (`feat: add itinerary agent studio flow`)
- Pricing/demo clarity:
  - Agency: `e3ee26b` (`fix: clarify studio one-time job copy`)
  - Studio: `4c82e35` (`fix: clarify one-time job pricing demo`)
- Full SEO/dashboard/local model validation:
  - Agency: `a540407` (`feat: add full seo and local agent flow tests`)
  - Agency cleanup: `80b69b0` (`fix: clarify privacy job payment language`)
  - Studio: `e06e5e4` (`feat: improve studio seo dashboard path`)

## Safety notes

- No Stripe payment IDs were changed.
- No checkout was submitted.
- No paid ads, affiliate IDs, ad pixels, tracking pixels, or paid placements were activated.
- The test desk is deterministic launch validation for the static public page; real customer work still depends on paid intake, CRM import, production work, and review.
- The test desk now has a short demo that simulates paid intake, route selection, agent draft, lead review, fresh-context review, and customer-ready state.
- The local model approval-flow test performs real Ollama calls and writes a CRM-style approval packet, but it does not submit payment, externally send deliverables, or write into a live CRM.
- Public pricing language now says monthly access or one-time jobs; avoid reintroducing "credits" or "packs" in buyer-facing copy unless the offer model is intentionally changed.

## Reflection

- What worked: Turning the itinerary flow validation into `scripts/test-itinerary-flow.sh` made local and live checks repeatable, including screenshots, mobile centering, scenario routing, and payment-return state.
- What broke: The first browser-validation attempt depended on an implicit Playwright install and got stuck when that module was not on the repo Node path.
- Root cause: The test harness was not a committed project artifact, so each session was recreating the validation route from memory and environment guesses.
- Surprised: Removing a temporary Studio nav link correctly exposed that the test assertion was checking a label instead of the actual test desk section content.
- Concrete change: For this flow, use only `scripts/test-itinerary-flow.sh` for local validation and `scripts/test-itinerary-flow.sh --live` for live validation; update the script itself when validation needs change.
- What worked this pass: Adding SEO and approval-flow checks into the existing scripts kept the work from drifting into one-off browser poking, and it made the final publish auditable by screenshot path plus JSON report.
- Concrete change from this pass: Keep local-model delivery validation in `scripts/test-local-agent-approval-flow.sh` until the live CRM write path is deliberately implemented and separately gated.
