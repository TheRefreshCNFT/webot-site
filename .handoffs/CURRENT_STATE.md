# Agency website — current state

Updated 2026-10-25. Sole current pickup authority. The approved repositioning overhaul is published and live on `webot.agency` (master `34e1650`); Booking provider acceptance was completed live on 2026-10-25 (see `proof-results/agency-booking/live-acceptance.md`); production chat activation remains gated on the model-reachability decision.

## Approved redesign direction

The owner approved the [Agency repositioning and website overhaul design](../docs/superpowers/specs/2026-10-24-agency-repositioning-design.md). WeBot Agency will become a focused SMB AI automation consultancy led by “Need to streamline your flow? We Bot You.” and a free 30-minute consultation. Studio becomes a client review/testing and optional hosting environment rather than a public sales journey. Skill packs remain a secondary offer with unchanged payment paths during the website phase.

The approved scope includes a real server-side Ask WeBot capability/fit assistant with an approved knowledge base, no pricing authority, honest unknown handling, and booking/quote handoff. The consultation service must implement the real 30-minute duration. The visual direction is custom Signal: carbon, warm white, sharp lime, Bricolage Grotesque, Geist, and Hallmark's Split Studio structure.

The owner approved the written spec on 2026-10-24. Implementation planning is complete across three linked, independently testable tracks: [website overhaul](../docs/superpowers/plans/2026-10-24-agency-website-overhaul.md), [booking consultation](../docs/superpowers/plans/2026-10-24-booking-consultation.md), and [Ask WeBot chat](../docs/superpowers/plans/2026-10-24-agency-chat.md). The owner also confirmed the [OCR visual showcase addendum](../docs/superpowers/specs/2026-10-24-ocr-showcase-design.md): polished synthetic workflow artwork with two fixed 1440 × 900 replacement paths, no OCR runtime implementation, and real-capture verification before promotion. The plans preserve the approved five-page deletions, unchanged Stripe paths, credential-free Booking tests, local-model chat boundaries, and separately gated live/provider acceptance.

## Implementation status — 2026-10-25

All three approved tracks are implemented and verified with local evidence on branch `agency-overhaul`; reruns on 2026-10-25 confirm the committed state passes.

- Website overhaul: approved Signal design implemented; OCR showcase artwork in place at the two fixed 1440 × 900 replacement paths. Static harness 10/10 and five-viewport browser PASS; refreshed screenshots and confidentiality/caption review in `proof-results/agency-overhaul/` (`proof-review.md`).
- Booking consultation: real 30-minute duration, quote guidance, explicit states, and one-time handoff consumption in `consultation.html` with `js/consultation-handoff.mjs`; credential-free candidate service rules in `booking-candidate/`. Intercepted browser evidence, static checks, and handoff unit tests PASS (`proof-results/agency-booking/`). Booking keeps safe non-Git file/hash checkpoints; live calendar/email provider acceptance has not been performed.
- Ask WeBot chat: bounded contract, server-only approved knowledge, Ollama adapter, deterministic pricing refusal, CORS/rate-limited HTTP boundary, and Next route in `platform-candidate/`, a self-contained candidate root seeded from the Platform baseline; `/Users/webot/Projects/webot-platform` is untouched. Site client in `js/chat.js` and `css/chat.css`. Mocked gates 61/61 with typecheck, lint, and secrets:check PASS; real-model proof 8/8 PASS against the actual local Next controller and running Ollama (`proof-results/agency-chat/live-report.json`, refreshed 2026-10-25, plus six labeled attempts). The verified Ollama `done_reason: "length"` empty-inner-JSON gotcha is recorded in `TROUBLESHOOTING.md`.

Test receipts stay separate: mocked unit/browser tests, real local model responses, and human visual review are recorded as distinct evidence and are not merged into one blanket "tested" claim.

## Live release — 2026-10-25

The overhaul was published through the guarded path (`scripts/publish-live.sh --confirm-live --allow-dirty` on `master`, after integrating the diverged July launch-surface release line from `origin/master` by merge, not force-push). Pre-publish backup: `~/Backups/webot-site/live-pre-publish-20261025T151419Z/`; post-publish screenshots: `~/Backups/webot-site/live-post-publish-20261025T151419Z/screenshots/`. Live root hash matched `HEAD:index.html` on poll attempt 4.

Live verification on 2026-10-25 (curl plus a real-browser pass): new homepage, consultation, success, chat client/CSS, OCR assets, and `llms.txt` all serve 200; the five retired pages 404 as designed; the OCR showcase renders with both images decoding at the contract 1440 × 900; protected Stripe checkout hashes snapshot unchanged. The publish sanity gate was aligned to the approved overhaul harnesses; the retired July launch-surface/itinerary harnesses are historical evidence only (see `docs/PUBLISH-LIVE.md` and TROUBLESHOOTING).

Two live gated outcomes were tested and are **unmet**:

- Booking provider acceptance: `https://book.webot.agency/api/slots` returns HTTP 500 (host answers, root 404). The live consultation form fails closed with the email/phone alternatives state and the submit button stays disabled; no booking, calendar event, or email was created. The candidate service rules in `booking-candidate/` remain locally accepted only.
- Production chat activation: `https://api.webot.agency/api/agency/chat` returns HTTP 404. The live Ask WeBot widget opens and fails safely with booking/phone/email alternatives and no fabricated answer; the model is not reachable from the production runtime. Deploying the route still requires trusted-proxy IP handling, rate-limit topology, and local-model reachability from the actual runtime, then fresh post-deploy response/privacy verification.

OCR real-capture replacement (overwrite the two PNGs at 1440 × 900 and repeat the confidentiality/browser checks) remains separately gated and unstarted.

## Backend repair progress — 2026-10-25

Booking: **ACCEPTED live** on 2026-10-25. Root cause was both dead Google OAuth refresh tokens (`invalid_grant`) plus an April-era service (15-minute appointments). The approved `booking-candidate/` (30-minute) is deployed on the host (`~/booking`, prior build backed up at `~/booking-backup-20261025`, container `webot-booking` on docker network `webot-net`, Caddy `book.webot.agency` → `:8081`). Credentials were renewed under a new OAuth Desktop client "WeBot Booking" (consent screen published to Production) with fresh offline grants for both identities; the original OAuth client is retired (its GCP project is inaccessible from every available account). Full live acceptance evidence — exactly 30-minute event with Meet link, quote flag, and delivered Gmail confirmation — is in `proof-results/agency-booking/live-acceptance.md`. Topology and renewal/deploy runbook: `docs/booking-service-operations.md`. Known cosmetic drift: event title still says "Discovery Call" (candidate fix can ride the next booking deploy).

Chat: **activated in production** on 2026-10-25. The route was ported into webot-platform (`e77a1ff`, with `AGENCY_CHAT_OLLAMA_URL` support), gated (56/56 chat tests, typecheck, lint, secrets), and released through the platform's guarded staging and production orchestrators; production proof passed with all steps green. Model reachability runs over Tailscale: the cwatchtower host joined the tailnet (`100.127.238.95`), and this Mac's Ollama is exposed tailnet-only via `tailscale serve` tcp/11434 (Ollama itself stays on Mac loopback). Live verification: real model replies on `api.webot.agency/api/agency/chat` and in the browser widget on `webot.agency` (screenshot `/tmp/chat-live-success.png`). Receipts by mode: mocked unit/browser tests (local), real local model proof 8/8 (local), staging real reply, production real reply + browser pass. Known exception: the staging aggregate `staging-proof` fails inside its `deploy:check` on the platform's preserved-unresolved `config/capability-registry.json` dirt (proven pre-existing; the production proof explicitly runs with `--skip-deploy-check` per the platform's own chain). Production chat now depends on this Mac being awake with Ollama running; when unavailable, the widget fails safe with booking/phone/email alternatives, as designed.

Existing unrelated dirty `.handoffs/REFLECTIONS.md` remains untouched.

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
