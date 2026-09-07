# Agency website entry point

Canonical static source for `webot.agency` is `/Users/webot/Projects/webot-site`. The sibling `webot-agency` root is company planning. Read [current state](.handoffs/CURRENT_STATE.md), [README](README.md), [map](project-map.md), [troubleshooting](TROUBLESHOOTING.md), then the focused [operations](docs/OPERATIONS.md) or release runbook when relevant.

`.handoffs/CURRENT_STATE.md` is the sole current pickup authority. ACTIVE_STATE and HANDOFF are pointers. June planning and archived handoffs preserve historical acceptance; they do not restart completed Platform/Studio work. Orient briefly, then apply current `webot-flow` only when authorized mutation begins; do not repeat a global resource audit on each pickup.

- Keep static HTML/CSS/JS; no build step, framework, package manager or package.json.
- Local source is the edit surface. GitHub Pages is the declared mirror, `TheRefreshCNFT/webot-site` on master. Use `scripts/publish-live.sh` with its runbook for an approved publish.
- Preserve existing Stripe products, prices, checkout links and real-money paths. Changes require Ian's explicit scope approval. No paid API top-ups, ads, affiliate activation, tracking pixels or outbound campaigns from this docs task.
- Public copy must match proven behavior. Do not imply newsletter/contact CRM completion from a localStorage or mailto fallback. Keep model inventory, internal prompts and queue details out of customer copy. Brand voice: direct, confident, no hype; “We Bot You.”
- Respect the Studio distinction between monthly access and one-time reviewed jobs; avoid generic credits/packs terminology except intentional Office skill-pack products. Verify actual current product language at the owning root before changing shared copy.
- For navigation/footer/ecosystem changes, assess Studio and Buzz impact; do not edit them automatically. Platform runtime work belongs in webot-platform under its own authority; cwatchtower is shared infrastructure.
- Preserve unrelated dirty files. Keep skills unchanged; needs are recorded in the map.

Documentation validation: source/readback and local-link checks, `git diff --check`, draft OKF strict validation and a file checkpoint. Product changes require the relevant existing harness and browser evidence. Read script effects before execution; release dry-run creates live backups, and rollback dry-run fetches Git. Do not run them for this docs batch.

The full former guide is preserved in [.handoffs/archive/20260907-AGENTS.md](.handoffs/archive/20260907-AGENTS.md).
