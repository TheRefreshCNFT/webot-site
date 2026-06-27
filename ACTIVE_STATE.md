# Active State: webot-site

## Current Focus
Plan the WeBot agent marketplace revamp around "We Bot You!" and the coordinated `webot.studio` signup/payment/dashboard flow.

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
- [x] Added next-session monetization/Stripe/Agent-Reach plan: `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_AGENT_REACH_PLAN_2026-06-27.md`.

## What's Next
- [x] GitHub Pages source confirmed as `master` for both `webot-site` and `webot-studio`.
- [x] Ian chose both subscriptions and per-job credits for the initial plan model.
- [x] Ian chose to keep greeting cards/image card work under Create & Polish, with downloadable and email-able delivery.
- [x] Ian confirmed every delivery type needs a customer review step.
- [x] Ian approved the friendly short-window encrypted storage tone and contact-us path for future storage/hosting demand.
- [x] Ian added monetization requirements: tasteful paid/affiliate supply links by offer type, business card/logo generation, SEO-first offer pages, warm-listener agent flow, model evaluation, 24-48 hour quality-first delivery language, and premier quality at every tier.
- [x] Human approval before live publish received in-session; live publish completed.
- [ ] Next session starts from `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_AGENT_REACH_PLAN_2026-06-27.md`.
- [ ] Phase 0 safety pass confirms Stripe/CRM flow from local credentials without exposing secrets.
- [ ] Agent-Reach is synced, installed, and security-reviewed before use.
- [ ] Pricing research produces launch/cohort pricing and Stripe product plan.
- [ ] Stripe implementation is completed only after human approval of products, prices, and URLs.
- [ ] `webot-studio` still has `favicon.svg` as a pre-existing CR-only dirty file with `git diff --ignore-cr-at-eol -- favicon.svg` empty.

## Blockers
- Human approval required before changing Stripe URLs, auth/payment flows, DNS, production services, data-retention behavior, affiliate IDs, paid/sponsored links, tracking pixels, or outbound paid-link campaigns.
- Human approval required before installing or enabling Agent-Reach capabilities that can contact users, mutate CRM records, or access credentials.
