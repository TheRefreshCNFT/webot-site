# Revenue Flow Checkpoint

Date: 2026-06-27
Status: Studio Stripe catalog implemented locally, Stripe/CRM readbacks verified, live CRM dashboard product map updated. Agency + Studio site publish pending final commit/push.

## Active Project

`webot-site` remains the active WeBot project. This pass focused on revenue plumbing for the already-live Agency + Studio launch, not a new product lane.

## What Was Verified

- `webot.agency`, `/consultation.html`, and `/success.html` returned `HTTP/2 200`.
- `webot.studio` returned `200`.
- Stripe API live account readback succeeded without printing secrets:
  - Charges enabled: yes.
  - Payouts enabled: yes.
  - Active products: `17`.
  - Active prices: `24`.
  - Active Payment Links: `13`.
- Existing homepage payment links were mapped through Stripe:
  - All existing wired links returned `200`.
  - Existing bundle hashes remained unchanged.
  - Existing wired Stripe success redirects point to the matching `success.html?p=...` flow.
- CRM public subscription flow was tested with a disposable test address:
  - `POST /subscribe` returned `201`.
  - Authenticated `/subscribers` readback found the test source.
  - The disposable test subscriber was unsubscribed after verification.
- CRM order sync path was verified:
  - Existing local worker: `/Users/webot/.openclaw/workspace/webot/crm/check_stripe.py`.
  - Existing remote CRM order file: `/home/opc/crm/crm_orders.json`.
  - Poller found one previously unimported completed Stripe session: `Lead Desk - Internal Flow Test`, `$10`.
  - Remote CRM orders were backed up and updated.
  - Authenticated remote `/crm_orders.json` readback now matches local and has `3` orders.

## Implemented Catalog Decision

The old broad direct-buy service catalog was demoted. The only Agency homepage Stripe links left are the three existing Office skill packs, which were intentionally preserved:

- MS Office AI Bundle — `$19`
- Google Workspace AI Bundle — `$19`
- Complete Office AI Bundle — `$29`

Custom builds, scraping, social workflows, and agent/skill development now route through Studio or custom quote language instead of stale fixed-price service checkout buttons. F5 Trading references were left alone.

The live Studio launch catalog now has six Stripe Payment Links:

| Key | Public Name | Price |
|---|---:|---:|
| `studio-starter` | WeBot Studio Starter | `$49/mo` |
| `studio-plus` | WeBot Studio Plus | `$149/mo` |
| `studio-business` | WeBot Studio Business | `$399/mo` |
| `studio-credit-quick` | WeBot Small Job Credit | `$49` |
| `studio-credit-standard` | WeBot Standard Job Credit Pack | `$129` |
| `studio-credit-deep` | WeBot Deep Job Credit Pack | `$299` |

Custom Studio setup remains contact-only.

Pricing rationale: this positions WeBot above DIY subscriptions and low-trust gig commodity work, below full agency/enterprise automation retainers, and prices the real value as reviewed delivery, scoping, customer review, and convenience.

## Payment-Flow Screenshots

Screenshots saved under:

- `/Users/webot/Backups/webot-site/revenue-flow-check-20260627T225930Z/screenshots/`
- `/Users/webot/Backups/webot-site/revenue-link-wire-20260627T230407Z/screenshots/`
- `/Users/webot/Backups/webot-site/studio-stripe-catalog-20260627T232927Z/screenshots/`
- `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/screenshots/`
- `/Users/webot/Backups/webot-site/studio-payment-validation-20260627T233600Z/stripe-screenshots/`

Human-style checks completed:

- Agency desktop/mobile current live page rendered.
- Studio desktop/mobile current live page rendered.
- `success.html?p=ms-bundle` rendered.
- `success.html?p=agent` rendered.
- Existing MS Office Checkout opened at `$19.00` without submitting payment.
- Every new Studio Stripe checkout page opened without submitting payment:
  - Starter `$49.00/month`
  - Plus `$149.00/month`
  - Business `$399.00/month`
  - Small Job Credit `$49.00`
  - Standard Job Credit Pack `$129.00`
  - Deep Job Credit Pack `$299.00`
- Studio desktop/mobile screenshots passed.
- Studio `?payment=confirmed&product=studio-credit-standard&session_id=...` return-state test selected the correct product and showed confirmed intake copy.
- Agency scroll-based screenshots passed for agent families, Office products, Studio preview, custom services, and contact sections.
- Authenticated CRM browser screenshot passed with the new Studio product filter selected.

## Hard Blockers

### 1. Multi-Agent Checkout Asset Mismatch

Stripe has an active Multi-Agent Payment Link and it opens, but the Checkout product art says `From $2,500` while the actual checkout amount is `$1,500`.

Action taken:

- The Multi-Agent link was **not** left wired into the homepage patch.

Needed decision:

- Approve `$1,500` and fix the Stripe product asset/text, or
- move Multi-Agent entry pricing to `$2,500`, or
- keep Multi-Agent as contact-assisted until pricing/art are reconciled.

### 2. Studio Intake Is Still Static

The current implementation launches paid Stripe checkout and returns to Studio with product/session query data. It does not yet submit the Studio intake form to the CRM automatically. The Stripe-to-CRM order import path is ready for completed checkout sessions; intake-to-CRM automation is a next implementation step.

## Pricing Evidence

Current-market reference URLs checked during this pass:

- `https://zapier.com/pricing`
- `https://www.browse.ai/pricing`
- `https://www.coderabbit.ai/pricing`
- `https://parseur.com/pricing`
- `https://www.canva.com/pricing/`
- `https://designpickle.com/pricing/`

Local historical pricing reference:

- `/Users/webot/.openclaw/workspace/webot/products/pricing-research.md`

Conclusion: keep skill packs cheap, remove stale service buy-now clutter, and price Studio as reviewed done-for-you output. Higher tiers buy capacity, priority, complexity, active-job support, and convenience, not lower quality for lower tiers.

## Stripe And CRM Verification

- Stripe API readback verified all six Studio links active, correctly priced, with success redirects carrying `product=<key>` and `{CHECKOUT_SESSION_ID}`.
- Phone collection and promotion codes are enabled on all six Studio Payment Links.
- CRM Stripe importer product map recognizes all six Studio product names.
- CRM defaults include `Lead Review` and `Customer Review` checkpoints for every Studio product.
- Live CRM dashboard `/home/opc/crm/index.html` was backed up as `index.html.bak-studio-products-20260627T234018Z`, patched only for Studio product filters/name mapping, pushed, and md5-verified:
  - local/remote patched md5: `9a6737cd442d7d3b234a90ec5172c5b8`
- Served CRM dashboard authenticated browser check selected `WeBot Standard Job Credit Pack`.

## Backups

- `/Users/webot/Backups/webot-site/revenue-flow-check-20260627T225930Z/screenshots/`
- `/Users/webot/Backups/webot-site/revenue-link-wire-pre-20260627T230257Z/`
- `/Users/webot/Backups/webot-site/crm-stripe-poller-pre-20260627T230145Z/`
- `/Users/webot/Backups/webot-site/crm-remote-orders-pre-20260627T230201Z/`
- `/Users/webot/Backups/webot-site/studio-stripe-catalog-pre-20260627T232720Z/`
- `/Users/webot/Backups/webot-site/studio-catalog-fix-pre-20260627T233414Z/`
- `/Users/webot/Backups/webot-site/crm-live-studio-products-20260627T234018Z/`

## Next Step

1. Commit and publish `webot-site` and `webot-studio`.
2. Run post-publish live screenshots and live hash/readback checks.
3. Next implementation step: wire Studio intake submission to CRM after Stripe return, or keep manual intake review as the intentionally gated first version.
