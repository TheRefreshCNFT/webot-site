# Technical SEO Audit - WeBot Agency + Studio

Date: 2026-06-28

## Current Deluxe Configuration

- Crawlable HTML landing pages exist for Agency homepage plus five agent-family search intents.
- Studio has homepage plus crawlable `agent-jobs.html` and `pricing.html` support pages.
- Canonicals, robots directives, Open Graph, Twitter large-image cards, sitemap entries, and JSON-LD are present on the public pages.
- `robots.txt` on both sites allows standard crawling and explicitly manages major AI crawler user agents while preserving sitemap discovery.
- `llms.txt` on both sites lists canonical pages and delivery model details for AI/assistant readability.
- `projects.html` and `success.html` remain intentionally excluded from the sitemap and marked noindex where appropriate.

## Remaining Human Gates

- Google Search Console property verification and sitemap submission require owner access. See `docs/GOOGLE-SEARCH-CONSOLE.md`.
- HTTP security headers require a CDN/server layer such as Cloudflare because GitHub Pages does not support arbitrary project-defined response headers.
- Google Business Profile, maps, Wikipedia, and Wikidata should only be added if real verified profiles/entities exist. Do not create fake entity signals for SEO.

## Local Agent Baseline

The pre-upgrade local agent audit scored:

- Agency: `68/100`
- Studio: `74/100`

Those before reports are stored in `seo-audit/agent-runs/`. Post-publish reports should be generated after the live URLs update.
