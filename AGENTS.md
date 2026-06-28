# WeBot Site Agent Guide

This repo is the public `webot.agency` site. Read this file after
`.handoffs/CURRENT_STATE.md` and before changing anything.

## Project Shape

- Static HTML/CSS/JS only. Do not add a build step, framework, package manager, or
  `package.json`.
- Deployed by GitHub Pages from `TheRefreshCNFT/webot-site` on `master`.
- Live site: `https://webot.agency`.
- Sister sites:
  - `~/Projects/webot-studio` -> `https://webot.studio`
  - `~/Projects/webot-buzz` -> `https://webot.buzz`
- Brand voice: direct, confident, no hype. "We Bot You." and "we ship" are the
  center of gravity.

## Ground Truth Files

Read these in order when starting:

1. `.handoffs/CURRENT_STATE.md` - current verified state and hard rules.
2. `ACTIVE_STATE.md` - current focus, completed work, blockers, and next steps.
3. `llms.txt` - concise public offer summary.
4. `docs/PUBLISH-LIVE.md` and `scripts/publish-live.sh` before any publish.

`HANDOFF.md` is old April 2026 archaeology. Prefer `.handoffs/CURRENT_STATE.md`
and `ACTIVE_STATE.md` for current state.

## Current Site Files

- `index.html` - homepage, products, services, FAQ, contact/newsletter.
- `consultation.html` - discovery call intake path.
- `success.html` - post-purchase/thank-you flows.
- `projects.html` - internal noindex ops dashboard reading `ops-data.json`.
- `privacy.html` - privacy policy for Agency, Studio, CrazyCade, payments, and
  active-job files.
- `llms.txt`, `robots.txt`, `sitemap.xml` - SEO and assistant/crawler surfaces.
- `.nojekyll` - keeps GitHub Pages in raw static-file mode so docs such as
  `AGENTS.md` can be served directly when needed.
- `scripts/test-itinerary-flow.sh` - primary Agency + Studio validation harness.
- `scripts/test-local-agent-approval-flow.sh` - local Ollama approval-flow test.
- `scripts/validate-paid-ads.sh` - no-spend paid ads CSV validation.
- `scripts/publish-live.sh` - guarded live publish script.

## Hard Rules

- Local repo is the editing surface. The live site is a read-only mirror; publish
  only by pushing through the guarded script.
- Do not directly edit production-hosted files.
- Do not change Stripe checkout URLs or live payment products without Ian's
  explicit approval. The three Agency Office bundle links and Studio products are
  real money paths.
- Do not claim the newsletter/contact flows are fully CRM-wired unless the code
  and live behavior prove it. Current public copy must respect the localStorage
  and mailto fallback reality noted in `CURRENT_STATE.md`.
- If nav, footer, shared ecosystem language, or cross-site product positioning
  changes here, check whether `webot-studio` and `webot-buzz` need matching edits.
- Do not activate paid ads, affiliate links, tracking pixels, broader retention
  promises, or outbound paid campaigns without human approval.
- Keep buyer-facing Studio copy on monthly access and one-time reviewed jobs.
  Avoid "credits" or "packs" except for the intentional Office skill-pack
  products.
- No paid API top-ups.

## Validation

For a normal content/code change:

```bash
cd /Users/webot/Projects/webot-site
git diff --check
scripts/test-itinerary-flow.sh
```

For live validation after relevant Studio/itinerary/dashboard changes:

```bash
scripts/test-itinerary-flow.sh --live
```

For local model approval-flow work:

```bash
scripts/test-local-agent-approval-flow.sh
```

For paid ad CSV work:

```bash
scripts/validate-paid-ads.sh
```

For publish readiness and live publish:

```bash
scripts/publish-live.sh --dry-run
scripts/publish-live.sh --confirm-live
```

The publish script backs up live pages, snapshots hashed payment links, checks
required core files, scans for forbidden terms, pushes `master`, polls live
`index.html` until it matches `HEAD`, and captures desktop/mobile screenshots
when Chrome is available.

## Completion Discipline

Before saying work is done:

- Inspect the files you changed.
- Run the validation that matches the risk.
- If publishing, use `scripts/publish-live.sh`; do not hand-roll a deploy.
- Update `.handoffs/CURRENT_STATE.md` only when verified status, live publish
  state, or hard rules changed.
- Update `ACTIVE_STATE.md` when current focus, blockers, or next steps changed.
- Leave unrelated dirty files alone unless they block the publish gate.
