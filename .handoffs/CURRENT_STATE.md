---
project: webot-site (webot.agency main agency website)
last_updated: 2026-06-27
status: LIVE on webot.agency; Studio Stripe catalog implemented and pending final site publish
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

## Verified state (2026-06-27 local validation)

```
✅ Local repo:    ~/Projects/webot-site
✅ Branch:        master (confirmed by GitHub Pages API on 2026-06-27)
✅ Remote:        https://github.com/TheRefreshCNFT/webot-site.git
✅ Live URL:      https://webot.agency (CNAME-mapped)
✅ Deployment:    GitHub Pages from master /
✅ Working tree:  Studio revenue plumbing in progress; review status before next task
✅ Last publish:  webot-site `5b45a5f`; webot-studio `63324bc`
✅ Previous base: 62236e6 "feat: add robots.txt and sitemap.xml for SEO"
```

See `.handoffs/CORRECTIONS_2026-06-27.md` for branch/deploy evidence, live checks, screenshots, Studio dirty-tree notes, and code-intelligence limitations.

## Latest live delivery validation (2026-06-27)

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

## Current dirty-state notes (2026-06-27)

- `webot-site` has local changes for the Studio revenue/catalog pass: Agency copy/funnel, privacy text, and handoff docs.
- `webot-studio/index.html` has local changes for live Stripe checkout links, product selection, payment-return state, and customer-facing copy.
- `webot-studio` still shows `favicon.svg` modified from a pre-existing CR-only dirty state; `git diff --ignore-cr-at-eol -- favicon.svg` is empty. Do not normalize it unless Ian asks.
- CRM local files under `/Users/webot/.openclaw/workspace` were updated for Studio Stripe product mapping. The live CRM dashboard was also patched and md5-verified after a server-side backup.

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
- WeBot Small Job Credit — $49
- WeBot Standard Job Credit Pack — $129
- WeBot Deep Job Credit Pack — $299

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
- Next implementation must resolve Studio intake-to-CRM automation if manual intake after checkout is no longer enough.
- Public Agency + Studio launch pages are live; local revenue plumbing is ready for commit/publish validation.

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
