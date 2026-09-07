# Agency operations

Read [current state](../.handoffs/CURRENT_STATE.md) before acting. No operational command was executed in the 2026-09-07 documentation batch.

| Task | Existing route and effects |
| --- | --- |
| Documentation | Local reads/link checks, `git diff --check`, OKF strict validation; no product harness needed |
| Relevant Agency/Studio product change | Inspect `scripts/test-itinerary-flow.sh` and its JS before running; use `--live` only when that live validation is in scope |
| Local model approval flow | Inspect `scripts/test-local-agent-approval-flow.sh`; not part of static documentation |
| Paid-ad CSV checks | `scripts/validate-paid-ads.sh` is the existing no-spend validation route; activation remains separately gated |
| Publish | [PUBLISH-LIVE.md](PUBLISH-LIVE.md), `scripts/publish-live.sh --dry-run`, then approved `--confirm-live` |
| Rollback | Inspect `scripts/rollback-live.sh`; requires a full target commit and clean master, compares payment-link hashes; execute mode creates a backup Git bundle, rollback commit and guarded publish |

Publish dry-run downloads live pages, creates local backups and checks the tree; it is not side-effect-free. Rollback dry-run runs `git fetch origin master`. Neither is needed for a document-only checkpoint. Do not invent a release target or reuse an old target blindly. The existing publish runbook requires human screenshot and scope approval for the release.

Keep Git commits scoped to reviewed docs. A push to the serving branch may publish; do not equate a local checkpoint with release permission. Preserve existing dirty `.handoffs/REFLECTIONS.md`.
