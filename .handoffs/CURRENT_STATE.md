# Agency website — current state

Updated 2026-10-24. Sole current pickup authority. The repositioning design is approved; implementation and live release have not started.

## Approved redesign direction

The owner approved the [Agency repositioning and website overhaul design](../docs/superpowers/specs/2026-10-24-agency-repositioning-design.md). WeBot Agency will become a focused SMB AI automation consultancy led by “Need to streamline your flow? We Bot You.” and a free 30-minute consultation. Studio becomes a client review/testing and optional hosting environment rather than a public sales journey. Skill packs remain a secondary offer with unchanged payment paths during the website phase.

The approved scope includes a real server-side Ask WeBot capability/fit assistant with an approved knowledge base, no pricing authority, honest unknown handling, and booking/quote handoff. The consultation service must implement the real 30-minute duration. The visual direction is custom Signal: carbon, warm white, sharp lime, Bricolage Grotesque, Geist, and Hallmark's Split Studio structure.

The owner approved the written spec on 2026-10-24. Implementation planning is complete across three linked, independently testable tracks: [website overhaul](../docs/superpowers/plans/2026-10-24-agency-website-overhaul.md), [booking consultation](../docs/superpowers/plans/2026-10-24-booking-consultation.md), and [Ask WeBot chat](../docs/superpowers/plans/2026-10-24-agency-chat.md). The owner also confirmed the [OCR visual showcase addendum](../docs/superpowers/specs/2026-10-24-ocr-showcase-design.md): polished synthetic workflow artwork with two fixed 1440 × 900 replacement paths, no OCR runtime implementation, and real-capture verification before promotion. The plans preserve the approved five-page deletions, unchanged Stripe paths, credential-free Booking tests, local-model chat boundaries, and separately gated live/provider acceptance.

Next authorized action: execute the approved plans with the owner-selected subagent-driven approach, task reviews, and local evidence. Implementation has not started; publication, Booking provider acceptance, production chat activation, and OCR runtime acceptance remain separate guarded outcomes. Existing unrelated dirty `.handoffs/REFLECTIONS.md` and `serena-socraticode-investigation-report.md` remain untouched.

## Historical baseline

The sections below are historical: the approved redesign direction above is current.

## Ownership and source

`webot-site` owns the public `webot.agency` static site; `webot-agency` holds company planning. Git master HEAD at documentation baseline: `228a61c9186b5b523eb90732efce5fff97bdbcb7` (2026-07-13, launch-safety hardening). The prior commit `c01ff3b` separates Agency lanes from the Studio catalog. July source changes postdate the June current-state file.

`llms.txt` describes eight Agency consultation lanes and five Studio production families. Preserve the source and protected payment links. GitHub Pages/master remains the declared release route; today's remote branch, deployed byte parity, customer flow and current prices were not rechecked.

## Preserved acceptance

The [June current state](archive/20260907-.handoffs_CURRENT_STATE.md) preserves Agency/Studio live harness acceptance and Platform GO/READY proof references exactly. These remain historical acceptance, not September runtime checks. Its “only final model/runtime selection remains” is superseded as a pickup instruction by each product's own current state and the infrastructure master plan. Platform and Studio documentation and later accepted work must not be replayed from this older root.

Older HANDOFF, ACTIVE_STATE, AGENTS and map are retained byte-for-byte under `archive/20260907-*`; original planning and release evidence remain in place. July launch-surface proof files are retained without a new visual-acceptance claim.

## Documentation checkpoint

README, entry guide, state pointers, map, operations/provenance, troubleshooting and draft OKF now give a coherent pickup path. At baseline `.handoffs/REFLECTIONS.md` was already modified; TROUBLESHOOTING and OKF were untracked. Existing dirty work, public source, Git HEAD and index must remain unchanged by this batch. File evidence lives at `/Users/webot/Backups/infrastructure/agency-buzz-documentation-20260907/`.

## Next work and boundaries

This docs batch is ready for review and a separately authorized scoped local Git checkpoint. No commit, push, release, form submission, payment, service activation or skill change is part of it. For future product work, select the exact Agency outcome, reconcile the relevant current source/live behavior, then use [operations](../docs/OPERATIONS.md) and existing guarded release procedure. Skills and deferred copy cleanup remain deferred.
