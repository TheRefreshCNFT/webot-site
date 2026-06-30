# Session Reflections

This active file is intentionally slim so historical process notes do not read
like current release instructions.

Historical archive:

- `.handoffs/archive/SESSION_REFLECTIONS-20260629T200856Z-provider-pivot-history.md`

## Current Operational Truth

- Current release authority lives in `.handoffs/CURRENT_STATE.md`,
  `ACTIVE_STATE.md`, and
  `.handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md`.
- The platform release path is owned/server-controlled infrastructure, currently
  the cwatchtower owned-runtime lane documented in
  `../webot-platform/docs/deployment/cwatchtower-owned-runtime.md`.
- Resource inventory must happen before planning or state-changing work.
- Live deploys, DNS changes, and live Stripe catalog creation remain explicit
  human gates.

Add only current, compact reflections here. Archive this file again if it grows
past quick-pickup size.

## 2026-06-29 - DNS Gate Precision

- What worked: treating staging DNS as evidence, not assumption, kept live
  cwatchtower changes gated until the active authoritative nameservers showed
  the record.
- What broke/root cause: the operator guidance named the FQDN and required A
  record but did not spell out the DNS UI Host/Name field, leaving room to save
  the right-looking value in the wrong shape or inactive DNS surface.
- Surprise: none of the common wrong-name variants had A/CNAME records either,
  which made the blocker a visibility/active-zone issue rather than an obvious
  typo.
- Concrete change: release domain proof now emits zone, type, Host/Name, value,
  and "do not use full hostname or @" guidance, and release-input operator
  actions inherit that tested wording.

## 2026-06-29 - Wrong-Zone DNS Detection

- What worked: rerunning authoritative DNS proof after the field-level guidance
  exposed that the A record exists in `webot.studio`, not `webot.agency`.
- What broke/root cause: treating "no A record for the required host" as the
  whole diagnosis hid a likely wrong-zone save.
- Surprise: the expected IP was present under a sibling zone, which made the
  fix much more concrete than another generic DNS propagation wait.
- Concrete change: keep wrong-zone evidence in release artifacts and operator
  actions before asking for staging deploy approval.

## 2026-06-29 - Live Money-Surface Double Guard

- What worked: using a read-only subagent for Stripe source inspection found the
  exact place where process policy could become code policy without touching
  live billing.
- What broke/root cause: live catalog creation was guarded by the runbook and
  `release:proof`, but the raw creation script still accepted `--mode live` if
  called directly with a live key.
- Surprise: the existing wrapper was already hiding live commands from dry-run
  reports correctly; only the raw script needed the extra fail-closed check.
- Concrete change: raw live Stripe creation now also requires
  `--confirm-live-stripe` and fails before any API call without it.

## 2026-06-29 - Main-Thread Literal Search Discipline

- What worked: the stale-text sweep caught no remaining active missing-DNS
  blocker after rerunning with fixed-string patterns.
- What broke/root cause: I briefly put a backticked string inside a shell search
  pattern and then a leading-dash pattern without `--`, causing local shell/rg
  parsing mistakes.
- Surprise: the mistake happened in the main thread despite the subagent guard
  already being written.
- Concrete change: for command-shaped or backticked text, use one fixed-string
  pattern at a time with `rg --fixed-strings -- "$pattern"` or an equivalent
  quoted loop.
