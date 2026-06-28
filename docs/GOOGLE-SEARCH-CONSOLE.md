# Google Search Setup - WeBot Agency + Studio

Date: 2026-06-28

## Current State

The sites are prepared for Google Search crawling and sitemap submission:

- `https://webot.agency/robots.txt` points to `https://webot.agency/sitemap.xml`.
- `https://webot.studio/robots.txt` points to `https://webot.studio/sitemap.xml`.
- Both sites have canonical tags, title tags, meta descriptions, Open Graph, Twitter large-image cards, JSON-LD, `llms.txt`, and crawlable sitemap entries.
- No Google Search Console verification token is present yet. Do not claim Search Console submission until the verified property confirms it.

## Search Console Human Gate

1. Open Google Search Console.
2. Add or open the domain properties:
   - `webot.agency`
   - `webot.studio`
3. Verify ownership by DNS TXT record if the domain property is not already verified.
4. Submit these sitemaps:
   - `https://webot.agency/sitemap.xml`
   - `https://webot.studio/sitemap.xml`
5. Use URL Inspection for these launch URLs after publish:
   - `https://webot.agency/`
   - `https://webot.agency/plan-itinerary.html`
   - `https://webot.agency/document-extraction.html`
   - `https://webot.agency/create-polish.html`
   - `https://webot.agency/code-automation.html`
   - `https://webot.agency/research-decisions.html`
   - `https://webot.studio/`
   - `https://webot.studio/agent-jobs.html`
   - `https://webot.studio/pricing.html`
6. After 48-72 hours, check indexing, query impressions, crawl status, and enhancement warnings.

## Security Header Gate

GitHub Pages does not let this repo set arbitrary HTTP security headers. For top-tier headers, put the domains behind Cloudflare or another CDN and configure:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- A reviewed `Content-Security-Policy` that accounts for Google Analytics, Stripe, fonts, and current inline scripts before enforcement.

Do not add an enforcing CSP blindly from the repo; test in report-only mode first.

## Notes

`llms.txt` is maintained for assistant and AI crawler readability. It is not a substitute for Google Search Console, sitemap submission, canonical tags, structured data, or crawlable HTML pages.
