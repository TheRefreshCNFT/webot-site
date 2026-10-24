---
type: Project
title: WeBot Agency website
description: Canonical static public website source for webot.agency, being repositioned as an SMB AI automation consultancy with consultation, quote, real chat, and secondary skill-pack entry routes.
resource: file:///Users/webot/Projects/webot-site
tags:
- project
- documentation
- webot
generated:
  by: process:okf-project-bundles-1.0.0
  at: '2026-10-24T15:26:40Z'
sources:
- id: state
  resource: file:///Users/webot/Projects/webot-site/.handoffs/CURRENT_STATE.md
  title: Canonical current state
  last_modified: '2026-10-24'
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
  last_modified: '2026-10-24'
status: draft
stale_after: '2027-01-22'
---

# WeBot Agency website

## Purpose

Static public Agency website and customer entry surface for SMB AI automation consulting, implementation, quote-based engagements, and secondary self-serve skill packs.[^state][^design]

## Current state

The owner approved the repositioning design and OCR visual showcase addendum on 2026-10-24. Three linked website, Booking, and Ask WeBot implementation plans are complete; the owner selected subagent-driven execution. Product implementation, verification, provider acceptance, and live release have not started.[^state][^design-ocr][^plan-website][^plan-booking][^plan-chat]

## Operational boundaries

- Preserve static HTML/CSS/JavaScript and protected Stripe products, prices, and checkout URLs; the separate skill-pack review owns any later product or payment changes.[^guide][^design]
- Studio is a client review/testing and optional hosting environment, not a public sales journey. Chat requires a real server-side endpoint, approved knowledge, honest limits, and no pricing authority or paid account top-up.[^design]
- OCR work in this phase creates polished synthetic artwork with stable replacement paths only; it does not implement or accept an OCR runtime, and real captures require separate pre-release verification.[^design-ocr][^plan-website]
- Local implementation does not authorize publication; use the existing guarded release route only for an approved live destination.[^guide][^state]

## Next actions

- Execute the three approved plans with subagent-driven task reviews and local product-flow evidence; keep Booking provider acceptance, OCR runtime acceptance, and publication separately gated.[^state][^plan-website][^plan-booking][^plan-chat]

## Maintenance

This generated concept is `draft`. Review it against the cited project files before consequential work or promotion to `stable`; refresh it when purpose, state, boundaries, or next actions materially change.

[^state]: Canonical current state, last modified 2026-10-24.
[^design]: Approved repositioning design, last modified 2026-10-24.
[^design-ocr]: Confirmed OCR visual showcase addendum, last modified 2026-10-24.
[^plan-website]: Website overhaul implementation plan, last modified 2026-10-24.
[^plan-booking]: Booking consultation implementation plan, last modified 2026-10-24.
[^plan-chat]: Ask WeBot chat implementation plan, last modified 2026-10-24.
[^guide]: Scope and operating boundaries, last modified 2026-09-07.
[^map]: Surface ownership and routing, last modified 2026-10-24.
