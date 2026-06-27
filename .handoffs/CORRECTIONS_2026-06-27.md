# Corrections And Current Evidence

Date: 2026-06-27

This file records facts found during the WeBot agent marketplace planning pass that differ from or sharpen existing handoff state.

## Branch And Commit

- `.handoffs/CURRENT_STATE.md` previously said authoritative branch was `main`, while local checkout was on `master`.
- `git branch -vv` shows both `main` and `master` at `62236e6` with matching origin branches.
- Existing `CURRENT_STATE.md` verified-state section is stale: it lists last commit `cd6d00d`, but current local history has `62236e6 feat: add robots.txt and sitemap.xml for SEO` on top.
- GitHub Pages API confirms `webot-site` builds from `master` at `/`.
- GitHub Pages API confirms `webot-studio` builds from `master` at `/`.

## Dirty Trees

`webot-site` had these pre-existing untracked items before this planning pass:

- `.DS_Store`
- `seo-audit/`
- `templates/`

`webot-studio` had these pre-existing modifications before this planning pass:

- `index.html`
- `favicon.svg`

The `webot-studio` diff appears mostly line-ending churn. Its `CNAME` is UTF-16 little-endian text.

## Live Checks

- `https://webot.agency` returned `HTTP/2 200`.
- `https://webot.agency/consultation.html` returned `HTTP/2 200`.
- `https://webot.agency/success.html` returned `HTTP/2 200`.
- `https://webot.studio` returned `HTTP/2 200`.
- `webot.agency` DNS points to GitHub Pages IPs and `therefreshcnft.github.io`.
- `webot.studio` DNS points to GitHub Pages IPs.
- `webot.agency` live homepage hash matched `master:index.html` and `main:index.html`; branch decision required GitHub Pages source config, which is `master`.
- `webot.studio` live homepage hash matched `master:index.html`.

## Visual Checks

Headless Chrome screenshots captured on 2026-06-27:

- `/tmp/webot-review/webot-agency-home.png`
- `/tmp/webot-review/webot-agency-mobile.png`
- `/tmp/webot-review/webot-studio-home.png`
- `/tmp/webot-review/webot-studio-mobile.png`

Finding: both agency and studio mobile screenshots show horizontal overflow/cropped content. Fix before launch.

## Code Intelligence

- SocratiCode status for `webot-site`: green, indexed chunks available.
- SocratiCode status for `webot-studio`: green, indexed chunks available.
- Axon manifest listed both as `no_parseable_files`.
- `mcp__axon_webot_site.axon_file_context` reported no `.axon/kuzu` directory for `webot-site`.
- `codebase_impact` on `index.html` in both repos found no impacted files because these are standalone static pages.
