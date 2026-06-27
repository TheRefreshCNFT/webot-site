# Phase 0 Revenue Baseline

Date: 2026-06-27
Status: Verified baseline checkpoint; no Stripe, CRM, credential, DNS, or production behavior was changed.

## Definition Of Done For This Checkpoint

- Re-orient from `webot-flow`, `webot-project-delivery-flow`, and `code-intelligence`.
- Verify Agency and Studio local branch, dirty state, live reachability, and live-vs-HEAD root hash.
- Map payment, CRM, credential, Studio, and Pi boundaries without printing secrets or changing live flows.
- Record the next safe unlock and human gates.

## Verification Evidence

- `webot-site` local branch: `master`, aligned with `origin/master`, clean working tree.
- `webot-studio` local branch: `master`, aligned with `origin/master`, known dirty file only: `favicon.svg`.
- `webot-studio` dirty file detail: `favicon.svg | 26 +++++++++++++-------------`, `13 insertions`, `13 deletions`; existing handoff says this is CR/line-ending-only noise.
- `webot.agency`, `/consultation.html`, and `/success.html` returned `HTTP/2 200`.
- Agency live root hash matched `webot-site` `HEAD:index.html`: `7b76f722454b2891f5013b407c71592751e6185b791d44ce096799bbbae90e63`.
- Studio live root hash matched `webot-studio` `HEAD:index.html`: `2d3a77d8be7c7a4e8c416da03e9b9c9ff6dae0f4259220b24800722803a524b4`.
- `gh api repos/TheRefreshCNFT/webot-site/pages --jq '.source.branch + "/" + .source.path'` returned `master//`.
- `gh api repos/TheRefreshCNFT/webot-studio/pages --jq '.source.branch + "/" + .source.path'` returned `master//`.
- SocratiCode status was green for both repos:
  - `webot-site`: `72` indexed chunks, graph `6 files, 0 edges`.
  - `webot-studio`: `24` indexed chunks, graph `1 files, 0 edges`.
- Axon impact analysis is unavailable for these static repos:
  - `mcp__axon_webot_site.axon_impact("index.html")` -> `No .axon/kuzu directory`.
  - `mcp__axon_webot_studio.axon_impact("index.html")` -> `No .axon/kuzu directory`.
- Warehouse search found no locked prior solution for this exact Stripe/Studio revenue pass.

## Integration Map

### Agency Site

- Static HTML only; no build tooling.
- Live Stripe links are present in `index.html` only.
- Protected checkout link snapshot contains `8` Stripe URLs, all hashed during this pass:
  - `index.html:1743` `checkout_url_sha256=2d6f9512217ae71118fd0840ae6abd3e45401ebb7219d44569e054095bd4713b`
  - `index.html:1752` `checkout_url_sha256=b5c0fc8ce0a75275152016a0b534ef6982c8ceec2509de4eb45bf02284c76b2d`
  - `index.html:1761` `checkout_url_sha256=5872cb42f2630b9911dfee4861c775577fd78979185441bbafb3549ea30a7b9f`
  - `index.html:1842` `checkout_url_sha256=7e02dc6cd4a705c039737fbb13f34872964461fe85a1e6b54dd555ed80460503`
  - `index.html:1853` `checkout_url_sha256=a7c6573a203b4de11658cdc82788abe999e6aca2f8083a3a464b16f7b27b1837`
  - `index.html:1869` `checkout_url_sha256=b8205f32223aeeff4bda4dd1cb7e64e5eb8fc1c71d320798b9823d9855b46ccf`
  - `index.html:1880` `checkout_url_sha256=e14ef3e43e51b2fbbce3a28c4c7212bec47046e791738633115952ce0d28da3e`
  - `index.html:1891` `checkout_url_sha256=052fed80c65d213d0576e031cc7409b61fae50f059826d544af56e90a8268904`
- `index.html` contact form is still a Formspree placeholder with mailto fallback.
- `success.html` intake form is still a Formspree placeholder with mailto fallback.
- `success.html` post-purchase email capture posts to `https://crm.webot.agency/subscribe`.
- Homepage newsletter signup remains localStorage/mailto style, not CRM-backed.
- GA4 property `G-D3XESX21VE` is present on Agency pages.

### Studio Site

- Static HTML only; no live payment backend.
- Customer flow is currently simulated/static: agent selection, plan selection, payment-confirmed state, intake, dashboard/kanban, review language.
- Studio contact paths are mailto links to `ian@webot.agency`.
- No Stripe URL was found in `webot-studio/index.html`.
- No CRM mutation path was found in `webot-studio/index.html`.

### Credentials And Local Ops

Credential files were located by path only; contents were not opened.

- Main credential directory: `~/.webot/credentials/`.
- Stripe-related local path: `~/.webot/credentials/stripe_leads.rtf`.
- General credential map: `~/Projects/credentials/SECRETS_MAP.md`.
- Pi local orchestration root exists at `~/.pi/agent/`.
- Relevant Pi assets found include `~/.pi/agent/agents/`, `~/.pi/agent/skills/`, `~/.pi/agent/models.json`, `~/.pi/agents/models.json`, `~/.pi/agent/auth.json`, and `~/.pi/agent/run-history.jsonl`.

## Human Gates Still Active

Stop for Ian before:

- Opening or using credentials.
- Creating, changing, or replacing Stripe products, prices, coupons, or Payment Links.
- Mutating CRM records or enabling CRM writeback.
- Adding affiliate IDs, paid/sponsored links, tracking pixels, DNS changes, production service changes, or outbound campaigns.

## Next Safe Unlock

The next bounded work item is **pricing research and Stripe product mapping**:

1. Keep using the existing free/local tool stack unless a specific gap appears.
2. Use Scrapling or direct browser/search workflows for scraping and extraction tasks as needed.
3. Do not open credentials or create/change Stripe products until Ian approves the exact scope.
4. Produce launch/cohort pricing, product names, success/cancel flow mapping, and CRM readback requirements before implementation.

## Backup Evidence

Before updating `ACTIVE_STATE.md`, a verified matching backup was written:

- `/Users/webot/Backups/webot-site/phase0-revenue-baseline-20260627T221023Z/ACTIVE_STATE.md.pre`
- SHA-256 for original and backup: `1a6c636b50c31463750c18fb4b59e97897b8e97f05ae36c126b8257318f58b8d`
