# Reflections

This file was slimmed on 2026-06-29 so old operational notes do not look like
current release instructions.

Historical archive:

- `.handoffs/archive/REFLECTIONS-20260629T194000Z-pre-owned-infra-slim.md`

## Current Operational Truth

- Legacy hosted release tooling is superseded for `webot-platform`.
- The current deployment target is owned/open infrastructure, presently the
  cwatchtower owned-server lane documented in
  `../webot-platform/docs/deployment/cwatchtower-owned-runtime.md`.
- Resource inventory must happen before planning or state-changing work.
- Use `.handoffs/CURRENT_STATE.md`, `ACTIVE_STATE.md`,
  `.handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md`,
  and `~/.webot/wiki/queries/adobe-cloud-owned-infrastructure-intake.md` as the
  current pickup surface.
- Live cwatchtower deploys, DNS changes, and live Stripe catalog creation remain
  explicit human gates.

## Latest Reflection

The useful lesson from the archived file is procedural: old reflections can
contain commands that were correct at the time but harmful after an
infrastructure pivot. Keep reflections concise, archive long files, and put
current executable commands in runbooks and state docs.
