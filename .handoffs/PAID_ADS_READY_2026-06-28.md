---
date: 2026-06-28
project: webot-site + webot-studio
status: ready_for_human_ad_spend_approval
---

# Paid Ads Ready Pack

## What changed

- Researched current paid ad platform/spec requirements and prepared a no-spend launch pack.
- Added Google/Microsoft responsive search ad copy for five service families:
  - Gather & Extract
  - Build & Automate
  - Plan & Itinerary
  - Review & Decide
  - Create & Polish
- Added Meta link ad drafts for:
  - personal plans
  - messy files
  - creative desk
  - decision desk
  - monthly access
- Added LinkedIn single image ad drafts for:
  - small business ops
  - technical help
  - research desk
  - Studio flow
- Added a validator script to check character limits, UTM-tagged WeBot URLs, and risky-claim patterns.

## Files

- `.handoffs/paid-ads/PAID_ADS_READY_2026-06-28.md`
- `.handoffs/paid-ads/google-microsoft-search-rsa.csv`
- `.handoffs/paid-ads/meta-link-ads.csv`
- `.handoffs/paid-ads/linkedin-single-image-ads.csv`
- `scripts/validate-paid-ads.mjs`
- `scripts/validate-paid-ads.sh`

## Validation

Run:

```bash
cd /Users/webot/Projects/webot-site
scripts/validate-paid-ads.sh
```

Latest result:

```text
PASS paid ads validation
Search ads: 5
Meta ads: 5
LinkedIn ads: 4
```

## Human gate

No ad campaigns were created, no accounts were touched, no spend was activated, no pixels were installed, and no affiliate/sponsored links were added. Launch still requires Ian to approve:

- spend cap
- platforms
- geo targeting
- billing account
- UTM-only tracking vs conversion pixels/tags
- whether campaigns should be created paused first or launched immediately

Recommended first launch remains: create campaigns paused first, Google Search exact/phrase only, UTM-only attribution if pixels remain gated, review search terms after 48 hours.

## Reflection

- What worked: Keeping ad prep in CSV plus a validator made the output copy-ready instead of just strategic notes.
- What broke: One LinkedIn intro line exceeded the planned character limit by one character.
- Root cause: The copy was written for tone first and checked only after the CSV existed.
- Surprised: The most useful first ad angle is not "AI agents"; it is very concrete work like messy files, trip plans, code/sheets, and decision briefs.
- Concrete change: For future ad work, draft into structured CSV early and run `scripts/validate-paid-ads.sh` before reviewing copy quality.
