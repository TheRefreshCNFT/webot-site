---
project: webot-site (webot.agency main agency website)
last_updated: 2026-05-31
status: LIVE on webot.agency, tracking infrastructure upgraded
last_master_session_review: 2026-05-08 (Claude master orchestration session)
authoritative_branch: main
live_url: https://webot.agency
deployment: GitHub Pages from TheRefreshCNFT/webot-site (master branch)
---

# webot.agency — Current State (Master Orchestrator Navigator)

**Read this FIRST when picking up this project in any new session.**

## What this is

The main agency website for **WeBot Agency** (subsidiary of F5 Products LLC). Pure static HTML/CSS/JS — no build tools, no frameworks, no `package.json`. Single-page landing + a few sub-pages, deployed via **GitHub Pages**.

Tagline: *"We Bot You."* Brand voice: direct, confident, no-BS, anti-hype, "we ship not demo."

## Verified state (2026-05-08)

```
✅ Local repo:    ~/Projects/webot-site
✅ Branch:        main
✅ Remote:        https://github.com/TheRefreshCNFT/webot-site.git
✅ Live URL:      https://webot.agency (CNAME-mapped)
✅ Deployment:    GitHub Pages (auto-deploys on push to master/main)
✅ Working tree:  1 uncommitted entry — review before push
✅ Last commit:   cd6d00d "Add privacy policy page for CrazyCade + webot.agency"
```

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

**Live (Stripe Buy Now):**
- MS Office AI Bundle — $19
- Google Workspace AI Bundle — $19
- Complete Office AI Bundle — $29 (all 10 packs)

**Coming soon:**
- BudBee — privacy AI assistant, $5/mo
- Toury — AI tour guide, free forever
- F5 Trading — trading platform

**Services (Stripe Buy Now per service):**
- AI Agent Development — From $500
- Multi-Agent — From $1,500
- Custom Skill Building — From $150
- Data Scraping & Research — From $200
- Social Media Agent — $200/mo or $750 build
- AI at Home Setup — $250/2hrs
- AI Consultation — $175/hr or $150/hr retainer
- AI Webinars (3 levels) — $49 / $149 / $349

## ⚠️ Hard rules / project-specific constraints

- **Static HTML only.** Don't introduce a build tool, framework, or `package.json`. The "we ship not demo" voice means the site itself stays unfussy. (Per WEBOT_REFERENCE.md.)
- **Local is editing surface; GitHub Pages is the live mirror.** Push to master/main → GitHub Pages auto-rebuilds. No direct prod edits.
- **Cross-site nav consistency.** Change nav here → mirror to webot-buzz + webot-studio. There's commit history showing repeated nav reconciliation.
- **Don't break the three Stripe-live products.** MS Office Bundle, Google Workspace Bundle, Complete Office Bundle all currently take real payments. Don't change their Buy Now URLs without Ian explicitly approving the new Stripe IDs.
- **success.html `?p=` flow types:** agent / multi-agent / skill-build / scraping / social → service intake. ms-bundle / google-bundle / complete-bundle → download flow. consultation → booking flow. webinar-* → registration. home-setup → scheduling. Don't change the `?p=` value mapping without checking every Stripe Buy Now button that drives traffic to it.
- **Newsletter signup is currently localStorage-only + mailto placeholder — NOT wired to a CRM yet.** Don't claim it's wired in copy until it actually is.
- **Formspree on contact form is placeholder — mailto fallback is what actually works.** Same caveat as above.
- **No paid API top-ups.** $200/mo Max ceiling.

## Open work (carried forward from current focus pivot)

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
4. **`git fetch && git status`** — confirm `main` branch
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
