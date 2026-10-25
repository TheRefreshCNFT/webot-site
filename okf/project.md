---
type: Project
title: WeBot Agency website
description: Canonical static public website source for webot.agency, repositioned as an SMB AI automation consultancy with consultation, quote, real chat, and secondary skill-pack entry routes; overhaul implemented and locally verified on the agency-overhaul branch, with live release separately gated.
resource: file:///Users/webot/Projects/webot-site
tags:
- project
- documentation
- webot
generated:
  by: process:okf-project-bundles-1.0.0
  at: '2026-10-25T15:19:07Z'
sources:
- id: state
  resource: file:///Users/webot/Projects/webot-site/.handoffs/CURRENT_STATE.md
  title: Canonical current state
  last_modified: '2026-10-25'
- id: design
  resource: file:///Users/webot/Projects/webot-site/docs/superpowers/specs/2026-10-24-agency-repositioning-design.md
  title: Approved repositioning design
  last_modified: '2026-10-24'
- id: design-ocr
  resource: file:///Users/webot/Projects/webot-site/docs/superpowers/specs/2026-10-24-ocr-showcase-design.md
  title: Confirmed OCR visual showcase addendum
  last_modified: '2026-10-24'
- id: plan-website
  resource: file:///Users/webot/Projects/webot-site/docs/superpowers/plans/2026-10-24-agency-website-overhaul.md
  title: Website overhaul implementation plan
  last_modified: '2026-10-24'
- id: plan-booking
  resource: file:///Users/webot/Projects/webot-site/docs/superpowers/plans/2026-10-24-booking-consultation.md
  title: Booking consultation implementation plan
  last_modified: '2026-10-24'
- id: plan-chat
  resource: file:///Users/webot/Projects/webot-site/docs/superpowers/plans/2026-10-24-agency-chat.md
  title: Ask WeBot chat implementation plan
  last_modified: '2026-10-24'
- id: guide
  resource: file:///Users/webot/Projects/webot-site/AGENTS.md
  title: Scope and operating boundaries
  last_modified: '2026-09-07'
- id: map
  resource: file:///Users/webot/Projects/webot-site/project-map.md
  title: Surface ownership and routing
  last_modified: '2026-10-25'
status: draft
stale_after: '2027-01-23'
---

# WeBot Agency website

## Purpose

Static public Agency website and customer entry surface for SMB AI automation consulting, implementation, quote-based engagements, and secondary self-serve skill packs.[^state][^design]

## Current state

The owner approved the repositioning design and OCR visual showcase addendum on 2026-10-24. All three tracks (website overhaul, booking consultation, Ask WeBot chat) were implemented and locally verified, then published to webot.agency on 2026-10-25 via the guarded publish path after merging the diverged July release line; live root hash parity and browser verification passed, including the OCR showcase at contract dimensions. Two live gated outcomes were tested on 2026-10-25 and are unmet: the booking slots endpoint (book.webot.agency) returns HTTP 500 so the consultation form fails closed with alternatives and no booking is created, and the production chat endpoint (api.webot.agency) returns HTTP 404 so the Ask WeBot widget fails safely without a reachable model. The chat API candidate lives in platform-candidate/ and the webot-platform repository is untouched. OCR real-capture replacement remains separately gated.[^state][^map][^plan-website][^plan-booking][^plan-chat]

## Operational boundaries

- Preserve static HTML/CSS/JavaScript and protected Stripe products, prices, and checkout URLs; the separate skill-pack review owns any later product or payment changes.[^guide][^design]
- Studio is a client review/testing and optional hosting environment, not a public sales journey. Chat requires a real server-side endpoint, approved knowledge, honest limits, and no pricing authority or paid account top-up.[^design]
- OCR work in this phase creates polished synthetic artwork with stable replacement paths only; it does not implement or accept an OCR runtime, and real captures require separate pre-release verification.[^design-ocr][^plan-website]
- Local implementation and verification do not authorize publication; use the existing guarded release route only for an approved live destination, and treat production chat activation as its own gated outcome.[^guide][^state]

## Next actions

- Repair the deployed booking service (book.webot.agency/api/slots returns HTTP 500) and rerun one owner-controlled live acceptance, or deploy the Ask WeBot route to the api.webot.agency runtime with trusted-proxy IP handling, rate-limit topology, and model reachability, then fresh post-deploy verification; OCR real-capture replacement remains a separate gated outcome.[^state]

## Maintenance

This generated concept is `draft`. Review it against the cited project files before consequential work or promotion to `stable`; refresh it when purpose, state, boundaries, or next actions materially change.

[^state]: Canonical current state, last modified 2026-10-25.
[^design]: Approved repositioning design, last modified 2026-10-24.
[^design-ocr]: Confirmed OCR visual showcase addendum, last modified 2026-10-24.
[^plan-website]: Website overhaul implementation plan, last modified 2026-10-24.
[^plan-booking]: Booking consultation implementation plan, last modified 2026-10-24.
[^plan-chat]: Ask WeBot chat implementation plan, last modified 2026-10-24.
[^guide]: Scope and operating boundaries, last modified 2026-09-07.
[^map]: Surface ownership and routing, last modified 2026-10-25.
