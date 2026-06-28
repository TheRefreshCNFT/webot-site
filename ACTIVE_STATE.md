# Active State: webot-site

## Current Focus
Keep the live Agency + Studio funnel discoverable, clear, script-validated, and ready for paid-intake delivery work.

## What's Now
- [x] Reviewed `webot.agency` local state, live 200s, DNS, current homepage sales surface, Stripe-link locations, and mobile screenshots.
- [x] Reviewed `webot.studio` local state, live 200, current page structure, pricing CTAs, and mobile screenshots without touching its dirty working tree.
- [x] Created first-pass plan: `.handoffs/WEBOT_AGENT_MARKETPLACE_PLAN_2026-06-27.md`.
- [x] Logged state corrections: `.handoffs/CORRECTIONS_2026-06-27.md`.
- [x] Local Agency + Studio validation passed: routes returned 200 on Agency `4173` and Studio `4174`; final desktop/mobile screenshots passed at `/tmp/webot-validator/screenshots/`.
- [x] Static link tests passed: Agency `65` hrefs, Studio `19` hrefs, no missing hash targets.
- [x] Protected Agency Stripe URLs verified unchanged: baseline `8`, current `8`, exact URLs unchanged.
- [x] DevTools interaction tests passed: Agency mobile nav opens; Studio agent selection, Plus plan selection, payment-confirmed state, and nav toggle work at `390` and `1440`.
- [x] `scripts/publish-live.sh --dry-run` passed and created live backup `/Users/webot/Backups/webot-site/live-pre-publish-20260627T205952Z`.
- [x] Ian approved screenshots and Studio wordmark.
- [x] Published Agency live: commit `5b45a5f`, backup `/Users/webot/Backups/webot-site/live-pre-publish-20260627T215219Z`, post-publish screenshots `/Users/webot/Backups/webot-site/live-post-publish-20260627T215219Z/screenshots/`.
- [x] Published Studio live: commit `63324bc`, backup `/Users/webot/Backups/webot-studio/live-pre-publish-20260627T215420Z`, post-publish screenshots `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-desktop.png` and `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-mobile.png`.
- [x] Added next-session monetization/Stripe/local-delivery plan: `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_LOCAL_DELIVERY_PLAN_2026-06-27.md`.
- [x] Completed Phase 0 repo/live/integration baseline without credential use or live-flow changes: `.handoffs/PHASE0_REVENUE_BASELINE_2026-06-27.md`.
- [x] Removed the unused source-routing checkout from the active plan after usefulness review; continue with existing tools and add specific free gaps only when needed.
- [x] Completed revenue-flow checkpoint: Stripe readback, CRM subscription test, CRM Stripe poll/import sync, checkout screenshots, and safe Social monthly checkout patch. See `.handoffs/REVENUE_FLOW_CHECKPOINT_2026-06-27.md`.
- [x] Implemented the Studio launch catalog after competitor/value review: Starter `$49/mo`, Plus `$149/mo`, Business `$399/mo`, Small one-time reviewed job `$49`, Standard one-time reviewed job `$129`, Deep one-time reviewed job `$299`.
- [x] Demoted stale Agency service buy-now clutter to Studio/custom quote paths while preserving the three Office skill-pack Stripe links and leaving F5 Trading alone.
- [x] Verified all six new Stripe checkout pages open to the correct product/amount without submitting payment.
- [x] Updated CRM Stripe importer and live CRM dashboard product mapping for Studio products; authenticated CRM screenshot shows the new Studio filter.
- [x] Published Agency commit `df4aece` and Studio commit `df05caa`; both live domains matched committed `index.html`.
- [x] Captured final live screenshots in `/Users/webot/Backups/webot-site/live-post-publish-20260627T235005Z/screenshots/`.
- [x] Resolved the stale `webot-studio/favicon.svg` CR-only dirty issue by restoring the file to HEAD.
- [x] Added Plan & Itinerary for vacations, date nights, business get-togethers, and road trips across Agency and Studio.
- [x] Added repeatable validation script: `scripts/test-itinerary-flow.sh`; live mode is `scripts/test-itinerary-flow.sh --live`.
- [x] Published Agency content commit `e6f2d62` and Studio commit `cad25fb`.
- [x] Live scripted validation passed for both domains: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T023445Z/screenshots`.
- [x] Clarified Studio buyer-facing pricing from credits/packs to monthly access plus one-time jobs; published Agency commit `e3ee26b` and Studio commit `4c82e35`.
- [x] Expanded the test desk with a short paid-flow demo through intake, routing, draft, lead review, fresh-context review, and customer-ready state.
- [x] Live scripted validation passed with wording guards and short-demo checks: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T024927Z/screenshots`.
- [x] Added full Agency + Studio SEO metadata, schema, sitemap/robots cleanup, and `llms.txt`; published Agency commits `a540407` and `80b69b0`, Studio commit `e06e5e4`.
- [x] Strengthened dashboards around Payment + Intake, Agent Route, Agent Draft, Lead Review, Fresh Review, Approval, and Complete.
- [x] Live scripted validation passed after SEO/dashboard publish: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T032140Z/screenshots`.
- [x] Real local model agent approval-flow test passed with `gemma4-31b-max.Modelfile:latest`: `/Users/webot/Backups/webot-site/local-agent-approval-flow-20260628T032153Z/local-agent-approval-flow.json`.

## What's Next
- [x] GitHub Pages source confirmed as `master` for both `webot-site` and `webot-studio`.
- [x] Ian chose subscriptions plus one-time reviewed jobs for the initial plan model.
- [x] Ian chose to keep greeting cards/image card work under Create & Polish, with downloadable and email-able delivery.
- [x] Ian confirmed every delivery type needs a customer review step.
- [x] Ian approved the friendly short-window encrypted storage tone and contact-us path for future storage/hosting demand.
- [x] Ian added monetization requirements: tasteful paid/affiliate supply links by offer type, business card/logo generation, SEO-first offer pages, warm-listener agent flow, model evaluation, 24-48 hour quality-first delivery language, and premier quality at every tier.
- [x] Human approval before live publish received in-session; live publish completed.
- [x] Next session starts from `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_LOCAL_DELIVERY_PLAN_2026-06-27.md`.
- [x] Phase 0 repo/live/integration baseline confirms branches, live hashes, protected Stripe snapshot, CRM surfaces, credential paths, and Pi roots without exposing secrets.
- [x] Credential-backed Stripe/CRM readback completed without printing secrets.
- [x] Pricing research produced proposed launch/cohort pricing; final public prices remain human-gated.
- [x] Stripe implementation for Studio subscriptions/one-time jobs completed with live Payment Links and browser/API readback.
- [ ] Multi-Agent checkout is blocked until Stripe art/text and actual price are reconciled.
- [ ] Studio intake-to-CRM write automation is still manual/gated after checkout return; the Stripe order import path is ready for completed payment sessions and the local model approval packet is script-validated.

## Blockers
- Human approval required before DNS, production service recreation, broader data-retention promises, affiliate IDs, paid/sponsored links, tracking pixels, outbound paid-link campaigns, or resolving the Multi-Agent pricing/art mismatch.
