# WeBot Paid Ads Launch Pack - Ready Draft

Date: 2026-06-28
Status: ready for human approval, not activated

## Guardrail

Do not launch, create billing spend, add pixels, add affiliate IDs, or activate paid/sponsored links without Ian's explicit approval. This pack is copy-ready prep only.

## Source Notes

- Google Ads responsive search ads: https://support.google.com/google-ads/answer/7684791
- Google Ads Editor ad field limits: https://support.google.com/google-ads/editor/answer/57747
- Microsoft Advertising responsive search ads: https://help.ads.microsoft.com/#apex/ads/en/56843/0
- Meta Ads Guide: https://www.facebook.com/business/ads-guide
- LinkedIn single image ad specs: https://www.linkedin.com/help/lms/answer/a424655
- Search benchmark context: https://localiq.com/blog/search-advertising-benchmarks/

Benchmarks are directional only. The first paid run should be treated as validation, not a promise of acquisition cost.

## Positioning

Lead with the thing competitors usually bury: WeBot sells reviewed deliverables, not access to a vague AI toy.

Primary message:

- Send the blocked task.
- WeBot routes it to the right agent family.
- The agent drafts.
- Lead review and fresh-context review happen before customer approval.
- Customer gets a practical deliverable.

Do not lead with generic "AI agents" or "automation platform" copy. That market is noisy and expensive. Lead with the real jobs people already know they need:

- PDFs, invoices, links, screenshots, and messy files turned into clean notes or tables.
- Spreadsheet, code, formula, and workflow help.
- Vacation, date night, business gathering, and road-trip plans.
- Vendor comparison, decision memos, executive briefs, and research summaries.
- Cards, posts, business-card concepts, logo direction, and simple brand notes.

## Recommended Launch Order

1. Google Search and Microsoft Search
   - Best first channel because intent is explicit.
   - Start with exact and phrase match only.
   - Use the CSV in `google-microsoft-search-rsa.csv`.
   - Mirror winners from Google into Microsoft with `utm_source=microsoft`.

2. Meta link ads
   - Best for itinerary, messy-file cleanup, cards/copy, and broad small-task awareness.
   - Use the CSV in `meta-link-ads.csv`.
   - Launch only after spend cap is approved.

3. LinkedIn single image ads
   - Best for B2B research, operations, spreadsheet/code, and vendor comparison work.
   - Higher CPC risk. Use tight daily caps.
   - Use the CSV in `linkedin-single-image-ads.csv`.

Hold for now:

- Office skill packs at `$19` and `$29`. Search CPC can swallow the margin quickly. Promote them through organic, email, bundles, or retargeting after tracking is approved.
- Generic "AI agent platform" keywords. They attract curiosity clicks and competitor shoppers.
- LinkedIn broad awareness. Use only narrow audiences or retargeting once tracking is approved.

## Campaign Files

- Search RSA copy: `.handoffs/paid-ads/google-microsoft-search-rsa.csv`
- Meta link ads: `.handoffs/paid-ads/meta-link-ads.csv`
- LinkedIn single image ads: `.handoffs/paid-ads/linkedin-single-image-ads.csv`
- Validation script: `scripts/validate-paid-ads.sh`

## Search Campaign Setup

Campaigns:

- `Studio Search - Gather Extract`
- `Studio Search - Build Automate`
- `Studio Search - Plan Itinerary`
- `Studio Search - Review Decide`
- `Studio Search - Create Polish`

Initial match types:

- Exact match for strongest pain terms.
- Phrase match for close variants.
- No broad match in the first test.

Starter keywords by ad group:

Gather Extract:

- [pdf to spreadsheet service]
- [invoice data extraction service]
- [data cleanup service]
- [ocr cleanup service]
- "pdf data extraction"
- "convert invoices to spreadsheet"
- "web research service"
- "messy data cleanup"

Build Automate:

- [spreadsheet formula help]
- [code review service]
- [automation consultant]
- [workflow automation help]
- "google sheets formula help"
- "excel automation help"
- "script debugging help"
- "small business automation help"

Plan Itinerary:

- [custom travel itinerary planner]
- [road trip planner service]
- [date night planner]
- [business dinner planning]
- "vacation itinerary service"
- "custom trip planning"
- "road trip itinerary help"
- "event run of show help"

Review Decide:

- [vendor comparison service]
- [business research service]
- [decision memo service]
- [executive brief service]
- "compare vendors for business"
- "research brief service"
- "source backed research"
- "product comparison research"

Create Polish:

- [business card design help]
- [thank you card message]
- [social post writing service]
- [logo concept help]
- "brand notes help"
- "tone rewrite service"
- "short copywriting help"
- "business card copy help"

Shared negative keywords:

- free
- template
- course
- jobs
- career
- salary
- internship
- definition
- school
- homework
- app download
- ai girlfriend
- illegal
- hack
- torrent
- cracked

## Budget Recommendation

Lean validation:

- `14 days`
- `$25/day total`
- Google Search only
- Exact and phrase match only
- Goal: see which service family earns qualified clicks and checkout starts.

Useful validation:

- `14 days`
- `$60/day total`
- Google Search `$35/day`
- Microsoft Search `$10/day`
- Meta `$10/day`
- LinkedIn `$5/day` only if a narrow B2B audience is available; otherwise move that `$5` to Google.

Serious validation:

- `21 days`
- `$120/day total`
- Google Search `$60/day`
- Microsoft Search `$15/day`
- Meta `$25/day`
- LinkedIn `$20/day`
- Requires conversion tracking approval first.

Recommended first move: useful validation, but without LinkedIn unless Ian wants B2B specifically.

## Landing URLs

Use UTM links without pixels until tracking is approved:

- `https://webot.studio/?utm_source=google&utm_medium=cpc&utm_campaign=studio_search_gather_extract&utm_content=rsa_v1`
- `https://webot.studio/?utm_source=google&utm_medium=cpc&utm_campaign=studio_search_build_automate&utm_content=rsa_v1`
- `https://webot.studio/?utm_source=google&utm_medium=cpc&utm_campaign=studio_search_plan_itinerary&utm_content=rsa_v1`
- `https://webot.studio/?utm_source=google&utm_medium=cpc&utm_campaign=studio_search_review_decide&utm_content=rsa_v1`
- `https://webot.studio/?utm_source=google&utm_medium=cpc&utm_campaign=studio_search_create_polish&utm_content=rsa_v1`

For custom/enterprise manual outbound later:

- `https://webot.agency/consultation.html?utm_source=linkedin&utm_medium=paid_social&utm_campaign=agency_custom_consultation&utm_content=ops_v1`

## Creative Direction

Do:

- Show the review path: intake, route, draft, lead review, fresh review, approval, complete.
- Show before/after work: messy file to clean table, notes to decision memo, rough plan to reviewed itinerary.
- Use plain business language.
- Keep mobile creative readable.

Avoid:

- Fake chat screenshots that imply a live autonomous bot is talking to everyone.
- "Guaranteed", "#1", "instant", or ranking claims.
- Promising legal, financial, medical, or tax advice.
- Showing customer data, fake invoices with real-looking identities, or third-party logos.

## Human Approval Checklist

Before activation Ian must choose:

- Spend cap: lean, useful, or serious validation.
- Platforms: Google, Microsoft, Meta, LinkedIn.
- Geo target: United States only unless otherwise approved.
- Tracking: UTM-only manual Stripe review, or conversion pixels/tags.
- Billing account: confirmed active and correct.
- Whether campaigns are created paused first or launched immediately.

Recommended human-approved launch settings:

- Create campaigns paused first.
- Use UTM-only launch if pixels are still gated.
- Start Google Search exact/phrase only.
- Do not launch LinkedIn until budget and audience are explicit.
- Review first 48 hours manually for junk searches and add negatives.

## Validation

Run:

```bash
cd /Users/webot/Projects/webot-site
scripts/validate-paid-ads.sh
```

The script checks:

- Google/Microsoft RSA headline and description limits.
- Meta primary text, headline, and description limits.
- LinkedIn intro text, headline, and description limits.
- UTM-tagged WeBot HTTPS landing URLs.
- Basic risky-claim exclusions.
