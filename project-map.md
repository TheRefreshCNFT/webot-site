# Agency website map

| Surface | Ownership |
| --- | --- |
| [Current state](.handoffs/CURRENT_STATE.md) | Sole current pickup, source baseline and acceptance boundaries |
| [Approved redesign](docs/superpowers/specs/2026-10-24-agency-repositioning-design.md) | Approved SMB automation positioning, real chat, consultation, visual and acceptance contract; implemented and locally verified on `agency-overhaul` |
| [OCR showcase addendum](docs/superpowers/specs/2026-10-24-ocr-showcase-design.md) | Confirmed polished synthetic artwork and two-image replacement contract; OCR runtime excluded; real-capture replacement still separately gated |
| Implementation plans: [website](docs/superpowers/plans/2026-10-24-agency-website-overhaul.md), [booking](docs/superpowers/plans/2026-10-24-booking-consultation.md), [chat](docs/superpowers/plans/2026-10-24-agency-chat.md) | Approved-spec execution tracks, exact file ownership, credential-free tests, live gates and checkpoints; executed 2026-10-24/25 with local evidence; live provider acceptance and publication remain separately gated |
| [Homepage](index.html), [public summary](llms.txt) | Approved SMB automation positioning in source on `agency-overhaul`; the live site remains legacy until an approved publish |
| `create-polish.html`, `document-extraction.html`, `code-automation.html`, `research-decisions.html`, `plan-itinerary.html` | Static service pages |
| `consultation.html`, `success.html` | Intake and post-conversion surfaces |
| `projects.html`, `ops-data.json` | Noindex operations dashboard and its data |
| `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, `CNAME` | Policy and crawler/domain surfaces |
| `scripts/`, [publish runbook](docs/PUBLISH-LIVE.md) | Existing guarded release and validation helpers |
| `booking-candidate/`, `platform-candidate/` | Self-contained candidate runtime roots owned by this repo's overhaul tracks (credential-free booking service rules; Ask WeBot Next.js API and tests); the webot-platform repo stays untouched |
| `proof-results/agency-overhaul/`, `proof-results/agency-booking/`, `proof-results/agency-chat/` | Refreshed 2026-10-25 verification evidence for the three tracks; receipts kept separate for mocked tests, real local model proof, and visual review |
| `proof-results/launch-surface/`, `.handoffs/archive/`, `.planning/` | Retained evidence and historical planning; no automatic execution |
| [Provenance](docs/SOURCE-PROVENANCE.md), [operations](docs/OPERATIONS.md) | Scope, historical facts and supported pickup |
| [Company planning](../webot-agency/README.md), [Buzz](../webot-buzz/README.md) | Separate related roots |
| [Studio](../webot-studio/AGENTS.md), [Platform](../webot-platform/AGENTS.md) | Their own source/runtime authority; already documented |
| [OKF](okf/project.md) | Derived source-grounded draft |

## Skill needs — recorded, deferred

Use existing `webot-flow` for authorized delivery and `okf-project-bundles` for bundle updates. The repository's publish/rollback and itinerary harnesses already exist; no replacement skill or script is needed for documentation. Future UI work can use existing frontend/browser capabilities when selected, with actual desktop/mobile customer-flow proof. Brand changes require cross-site impact review. Do not consolidate, install or edit skills during this pass.
