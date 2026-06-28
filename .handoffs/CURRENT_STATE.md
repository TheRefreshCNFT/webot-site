---
project: webot-site (webot.agency main agency website)
last_updated: 2026-06-28
status: LIVE on webot.agency and webot.studio; deluxe SEO, dashboard path, itinerary flow, local agent approval flow, paid-ads pack, and project agent guide published/script-validated
last_master_session_review: 2026-05-08 (Claude master orchestration session)
authoritative_branch: master
live_url: https://webot.agency
deployment: GitHub Pages from TheRefreshCNFT/webot-site (master branch)
---

# webot.agency — Current State (Master Orchestrator Navigator)

**Read this FIRST when picking up this project in any new session.**

## What this is

The main agency website for **WeBot Agency** (subsidiary of F5 Products LLC). Pure static HTML/CSS/JS — no build tools, no frameworks, no `package.json`. Single-page landing + a few sub-pages, deployed via **GitHub Pages**.

Tagline: *"We Bot You."* Brand voice: direct, confident, no-BS, anti-hype, "we ship not demo."

## Verified state (2026-06-28 live validation)

```
✅ Local repo:    ~/Projects/webot-site
✅ Branch:        master (confirmed by GitHub Pages API on 2026-06-27)
✅ Remote:        https://github.com/TheRefreshCNFT/webot-site.git
✅ Live URL:      https://webot.agency (CNAME-mapped)
✅ Deployment:    GitHub Pages from master /
✅ Working tree:  clean after latest deluxe SEO publish/verification
✅ Last user-facing site publish:  webot-site `5323f17`; webot-studio `62e68d2`
✅ Latest docs-only publish: paid ads launch pack + root `AGENTS.md` project guide
✅ Previous base: 62236e6 "feat: add robots.txt and sitemap.xml for SEO"
```

See `.handoffs/CORRECTIONS_2026-06-27.md` for branch/deploy evidence, live checks, screenshots, Studio dirty-tree notes, and code-intelligence limitations.

## Latest deluxe SEO publish (2026-06-28)

Deluxe SEO work is live on both `webot.agency` and `webot.studio`.

- Agency commits:
  - `83aba93` (`feat: add deluxe seo surfaces`)
  - `9cefae3` (`fix: remove unverified linkedin seo signal`)
  - `6a183e1` (`fix: tighten seo landing mobile layout`)
  - `5323f17` (`fix: polish agency mobile hero layout`)
- Studio commits:
  - `fb42f99` (`feat: add deluxe seo surfaces`)
  - `0ac4808` (`fix: remove unverified linkedin seo signal`)
  - `62e68d2` (`fix: tighten seo landing mobile layout`)
- Agency added crawlable offer pages:
  - `plan-itinerary.html`
  - `document-extraction.html`
  - `create-polish.html`
  - `code-automation.html`
  - `research-decisions.html`
  - `terms.html`
- Studio added crawlable offer pages:
  - `agent-jobs.html`
  - `pricing.html`
- SEO surfaces updated:
  - page-specific titles/descriptions/canonicals/OG/Twitter metadata
  - Organization/WebSite/WebPage/Service JSON-LD as appropriate
  - social preview images at `assets/og-webot-agency.png` and `assets/og-webot-studio.png`
  - `robots.txt`, `sitemap.xml`, `llms.txt`
  - Search Console runbook: `docs/GOOGLE-SEARCH-CONSOLE.md`
- Local SEO audit agent reports:
  - Before: Agency `68/100`, Studio `74/100`
  - After: Agency `81/100`, Studio `80/100`
  - Reports: `/Users/webot/Backups/webot-site/seo-agent-audit-20260628T103817Z/`
- Human-style browser validation:
  - Live itinerary/Studio flow passed: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T104633Z`
  - Desktop/mobile SEO screenshots and assertions passed: `/Users/webot/Backups/webot-site/deluxe-seo-browser-screenshots-20260628T104431Z`
  - Checked: canonical, meta description, JSON-LD, single H1, and zero horizontal overflow on the new Agency/Studio SEO pages.
- Latest Agency publish:
  - `scripts/publish-live.sh --dry-run` passed
  - `scripts/publish-live.sh --confirm-live` passed
  - backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T104431Z`
  - post-publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T104431Z/screenshots`
- Remaining audit caveats:
  - Security-header score requires CDN/proxy/hosting-header work; GitHub Pages cannot set these from repo files.
  - PageSpeed/Core Web Vitals score was incomplete because Google's PageSpeed API was rate-limited or lacked an API key.
  - No Wikipedia/Wikidata/LinkedIn sameAs was added because no verified entity profiles were available; do not fake these.
  - Google Search Console still needs account-level verification/submission by a human.

## Latest live delivery validation (2026-06-28 SEO + approval flow)

Full SEO/dashboard/local-agent validation completed and published on 2026-06-28.

- Agency SEO/content commits:
  - `a540407` (`feat: add full seo and local agent flow tests`)
  - `80b69b0` (`fix: clarify privacy job payment language`)
- Studio SEO/dashboard commit:
  - `e06e5e4` (`feat: improve studio seo dashboard path`)
- SEO surface added/verified:
  - page-specific titles, descriptions, robots directives, canonicals, Open Graph, Twitter cards, theme color, and cleaned sitemap inclusion
  - Agency and Studio JSON-LD parse checks
  - `llms.txt` on both sites for AI assistant/crawler summaries
  - no buyer-facing credit/pack wording for Studio one-time jobs, except intentional Office skill-pack products
- Dashboard path strengthened on Agency and Studio:
  - Payment + Intake
  - Agent Route / Agent Draft
  - Lead Review
  - Fresh Review
  - Approval
  - Complete
- Latest live script validation:
  - `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T032140Z/screenshots`
- Latest live publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260628T032115Z/screenshots`
- Latest local model approval-flow report:
  - `/Users/webot/Backups/webot-site/local-agent-approval-flow-20260628T032153Z/local-agent-approval-flow.json`
  - Model: `gemma4-31b-max.Modelfile:latest`
  - Route: `Plan & Itinerary`
  - CRM-style status: `ready_for_customer_review`
- Important caveat: the approval-flow script performs real local Ollama agent calls and creates the approval packet, but it does not submit payment, externally send deliverables, or write into a live CRM. Those remain gated production integrations.

Use these scripts instead of ad-hoc validation:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
scripts/test-itinerary-flow.sh --live
scripts/test-local-agent-approval-flow.sh
```

## Latest docs-only publish (2026-06-28 paid ads + project agent guide)

The no-spend paid ads launch pack and root `AGENTS.md` project guide are published
from the Agency repo. This did not change the core customer-facing HTML pages.

- `AGENTS.md` now captures current project shape, ground-truth files, hard rules,
  validation commands, publish discipline, and the stale status of old `HANDOFF.md`.
- `.nojekyll` keeps GitHub Pages in raw static-file mode for this static site and
  allows the project guide to be fetched as `AGENTS.md`.
- `.gitignore` ignores generated `.axon/` local code-intelligence state so the
  guarded publish script can keep blocking accidental untracked publish payloads.
- `ACTIVE_STATE.md` records the agent-guide addition.
- Paid ads validator remains the gate for the launch pack:
  `scripts/validate-paid-ads.sh`.

## Previous live delivery validation (2026-06-27)

Studio revenue catalog publish completed on 2026-06-27.

- `webot.agency` live root matched `HEAD:index.html` after commit `df4aece`.
- `webot.studio` live root matched `HEAD:index.html` after commit `df05caa`.
- New Studio Stripe catalog live:
  - Starter `$49/mo`
  - Plus `$149/mo`
  - Business `$399/mo`
  - Small one-time reviewed job `$49`
  - Standard one-time reviewed job `$129`
  - Deep one-time reviewed job `$299`
- Live browser checks passed:
  - Agency Studio section shows subscriptions/one-time reviewed jobs and no login/signup claim.
  - Studio desktop and mobile selection updates checkout buttons to all six expected Stripe links.
  - Studio `?payment=confirmed&product=studio-business&session_id=...` selects Business and shows confirmed intake copy.
  - Hosted Stripe checkout pages opened to the expected products/amounts without submitting payment details.
  - Authenticated CRM dashboard filter includes Studio products after live dashboard md5 verification.
- Agency pre-publish backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T235005Z`
- Agency/Studio post-publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T235005Z/screenshots`
- Studio checkout validation screenshots:
  - `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/screenshots`
  - `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/stripe-screenshots`

Previous Agency + Studio launch validation:

Approved live publish completed on 2026-06-27 after Ian approved the screenshots and Studio wordmark.

- `webot.agency` live route returned 200 and matched committed `HEAD:index.html`.
- `webot.studio` live route returned 200 and matched committed `HEAD:index.html`.
- Agency published commit: `5b45a5f` (`feat: launch WeBot agent marketplace homepage`).
- Studio published commit: `63324bc` (`feat: launch WeBot Studio agent dashboard flow`).
- Agency pre-publish backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T215219Z`
- Agency post-publish screenshots:
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T215219Z/screenshots/webot.agency-desktop.png`
  - `/Users/webot/Backups/webot-site/live-post-publish-20260627T215219Z/screenshots/webot.agency-mobile.png`
- Studio pre-publish backup:
  - `/Users/webot/Backups/webot-studio/live-pre-publish-20260627T215420Z`
- Studio post-publish screenshots:
  - `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-desktop.png`
  - `/Users/webot/Backups/webot-studio/live-post-publish-20260627T215420Z-webot.studio-mobile.png`
- Agency local screenshots also passed desktop/mobile before publish:
  - `/tmp/webot-validator/screenshots/agency-desktop-final.png`
  - `/tmp/webot-validator/screenshots/agency-mobile-final.png`
- Studio local screenshots also passed desktop/mobile before publish:
  - `/tmp/webot-validator/screenshots/studio-desktop-final.png`
  - `/tmp/webot-validator/screenshots/studio-mobile-final.png`
- Static link test passed: Agency `65` hrefs, Studio `19` hrefs, no missing hash targets.
- Protected Agency Stripe URLs unchanged: baseline `8`, current `8`, exact URLs unchanged.
- Studio has no live Stripe/payment URL or backend behavior.
- DevTools interaction tests passed:
  - Agency mobile nav opens.
  - Studio agent selection, Plus plan selection, payment-confirmed state, and nav toggle work at `390` and `1440`.
- `scripts/publish-live.sh --dry-run` passed before live publish and created live backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T205952Z`
- `scripts/publish-live.sh --confirm-live` passed and pushed `webot-site` to GitHub Pages.
- `webot-studio` was backed up, pushed, polled until live matched local, and screenshot-verified.

## Current dirty-state notes (2026-06-28)

- `webot-site` SEO/dashboard/privacy cleanup has been published and live-script-verified.
- `webot-studio` SEO/dashboard path has been pushed and live-script-verified through the Agency validation harness.
- The stale `webot-studio/favicon.svg` CR-only dirty state was resolved by restoring the file to HEAD.
- CRM local files under `/Users/webot/.openclaw/workspace` were updated for Studio Stripe product mapping. The live CRM dashboard was also patched and md5-verified after a server-side backup.

## Latest live delivery validation (2026-06-28)

Plan & Itinerary has been added as a first-class Agency + Studio agent family for vacations, date nights, business get-togethers, and road trips.

- Agency content commit published: `e6f2d62` (`feat: add itinerary agent offer flow`).
- Studio commit published: `cad25fb` (`feat: add itinerary agent studio flow`).
- Pricing/demo clarity published:
  - Agency commit `e3ee26b` (`fix: clarify studio one-time job copy`)
  - Studio commit `4c82e35` (`fix: clarify one-time job pricing demo`)
- Agency publish backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T023208Z`.
- Agency publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T023208Z/screenshots`.
- Latest Agency publish backup: `/Users/webot/Backups/webot-site/live-pre-publish-20260628T024721Z`.
- Latest Agency publish screenshots: `/Users/webot/Backups/webot-site/live-post-publish-20260628T024721Z/screenshots`.
- Live script validation passed after Studio propagation: `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T024927Z/screenshots`.

Use this script for itinerary-flow validation instead of ad-hoc browser commands:

```bash
cd /Users/webot/Projects/webot-site
scripts/test-itinerary-flow.sh
scripts/test-itinerary-flow.sh --live
```

Latest passing live run:

- `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260628T024927Z/screenshots`

Covered by the script:

- Agency and Studio `git diff --check`
- JSON-LD parse checks
- inline script compile checks
- desktop/mobile centering and horizontal-overflow checks
- Agency + Studio screenshots
- Studio scenario routing for vacation, date night, business get-together, road trip, PDF cleanup, automation/code review, card/logo, and decision memo
- Studio test chat response and route update
- Studio short paid-flow demo through intake, route, draft, lead review, fresh-context review, and customer-ready state
- Public copy guard against confusing credit/pack wording
- Studio `?payment=confirmed&product=studio-business` return state

## Files (current)

```
index.html       — full landing page (~1743 lines): hero, products, services, FAQ, contact form
consultation.html — discovery call intake (mailto fallback)
success.html    — post-purchase thank-you (?p= URL param drives flow)
projects.html   — internal "WeBot Ops" task dashboard (noindex, reads ops-data.json)
privacy.html    — privacy policy (covers CrazyCade + agency)
ops-data.json   — task manifest for projects.html dashboard
CNAME           — webot.agency
favicon.svg, favicon.png, apple-touch-icon.png
```

## Site architecture (per WEBOT_REFERENCE.md)

This is one of THREE cross-linked sites:
- **webot.agency** — this site, sales/services/products/contact (~/Projects/webot-site)
- **webot.buzz** — news/content hub + newsletter signup (~/Projects/webot-buzz)
- **webot.studio** — managed hosting landing page (~/Projects/webot-studio)

All three cross-link in nav + footer. **If you change the nav on one, mirror the change to the other two** — that's a recurring pattern in the buzz commit history ("Match nav layout to agency").

## Products on the site (current sales surface)

**Live on Agency (Stripe Buy Now):**
- MS Office AI Bundle — $19
- Google Workspace AI Bundle — $19
- Complete Office AI Bundle — $29 (all 10 packs)

**Live on Studio (Stripe checkout):**
- WeBot Studio Starter — $49/mo
- WeBot Studio Plus — $149/mo
- WeBot Studio Business — $399/mo
- WeBot Small one-time reviewed job — $49
- WeBot Standard one-time reviewed job — $129
- WeBot Deep one-time reviewed job — $299

**Contact/scoped paths:**
- AI Agent Development, custom skills, scraping/research, social workflows, and larger automation work now route through Studio or custom quote language.
- F5 Trading references were left alone.

## ⚠️ Hard rules / project-specific constraints

- **Static HTML only.** Don't introduce a build tool, framework, or `package.json`. The "we ship not demo" voice means the site itself stays unfussy. (Per WEBOT_REFERENCE.md.)
- **Local is editing surface; GitHub Pages is the live mirror.** Push to master/main → GitHub Pages auto-rebuilds. No direct prod edits.
- **Cross-site nav consistency.** Change nav here → mirror to webot-buzz + webot-studio. There's commit history showing repeated nav reconciliation.
- **Don't break the three Stripe-live products.** MS Office Bundle, Google Workspace Bundle, Complete Office Bundle all currently take real payments. Don't change their Buy Now URLs without Ian explicitly approving the new Stripe IDs.
- **success.html `?p=` flow types:** existing Office bundles still use the bundle download flow. Old service success mappings may exist for historical links, but current public Agency service buy-now paths have been demoted to Studio/custom quote.
- **Newsletter signup is currently localStorage-only + mailto placeholder — NOT wired to a CRM yet.** Don't claim it's wired in copy until it actually is.
- **Formspree on contact form is placeholder — mailto fallback is what actually works.** Same caveat as above.
- **No paid API top-ups.** $200/mo Max ceiling.

## Open work (carried forward from current focus pivot)

**Current planning focus (2026-06-27):**
- First-pass plan for the "We Bot You!" agent marketplace and Studio signup/payment/dashboard flow is in `.handoffs/WEBOT_AGENT_MARKETPLACE_PLAN_2026-06-27.md`.
- Next-session monetization, Stripe, pricing research, and local-agent delivery plan is in `.handoffs/NEXT_SESSION_MONETIZATION_STRIPE_LOCAL_DELIVERY_PLAN_2026-06-27.md`.
- Revenue-flow checkpoint, pricing research, Stripe/CRM readbacks, Studio checkout implementation, CRM dashboard deployment, screenshots, and current blockers are in `.handoffs/REVENUE_FLOW_CHECKPOINT_2026-06-27.md`.
- Next implementation must resolve Studio intake-to-CRM write automation if manual intake after checkout is no longer enough. The local model approval packet is script-validated, but live CRM writes/external sends remain gated.
- Public Agency + Studio launch pages are live; Studio revenue plumbing is published and validated.

Per Ian's stated focus this week:
- Marketing/social agents to start promoting these existing services (which currently nobody knows about)
- WeBot Buzz revival (separate project, sister site)
- LinkedIn presence
- Daily content cadence

**Likely-soon technical work on this site itself:**
- Newsletter signup wired to a real CRM/list (currently just localStorage)
- Contact form wired to Formspree or similar (currently mailto only)
- Hero image refresh (separate task — generate via `anthropic-skills:image-gen` skill, save to `assets/`)
- New blog/content references when WeBot Buzz revives

## How to pick this up cleanly in a fresh session

1. **`cd ~/Projects/webot-site`**
2. **Read this file** — `cat .handoffs/CURRENT_STATE.md`
3. **Read top of `~/Projects/WEBOT_REFERENCE.md`** for the master agency context (the three sites, brand voice, products)
4. **`git fetch && git status`** — confirm `master` branch
5. **For nav/copy changes:** check webot-buzz + webot-studio + WEBOT_REFERENCE.md for cross-references
6. **For Stripe/payment changes:** stop and confirm with Ian — real money flows through these

## Verification commands (5 sec total)

```bash
# Local
cd ~/Projects/webot-site && pwd && git branch --show-current && git status --short

# Live site reachable + 200?
curl -sS -I https://webot.agency 2>/dev/null | head -1
curl -sS -I https://webot.agency/consultation.html 2>/dev/null | head -1
curl -sS -I https://webot.agency/success.html 2>/dev/null | head -1
```

## Master session contact

Written 2026-05-08. If facts here contradict reality, write `.handoffs/CORRECTIONS_<date>.md` with evidence + surface to Ian. Do NOT silently override.
