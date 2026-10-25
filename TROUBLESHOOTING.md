# Troubleshooting

Read this file before research or build work in this root.

## Root-level issues

Verified documentation pickup issue recorded below.

## Entry contract

Record each verified novel gotcha with a searchable symptom, applies-to, observable symptom, verified cause or **Unconfirmed** status, safe resolution/workaround, verification scenario, source/date, and escalation boundary.

## Old handoff predates the current source — 2026-09-07

Applies to Agency pickup. Symptom: June handoff says only Platform model selection remains, although July Agency source commits and later accepted Platform/Studio work exist. Verified cause: state prose was older than source history. Safe resolution: use the new current-state routing and preserve the June acceptance as dated evidence. Verification: local HEAD/log, llms.txt and original state inspection, 2026-09-07. Escalation: do not replay old platform plans or claim fresh live proof from archived GO labels.

## Ollama empty JSON response despite `format: "json"` or schema — 2026-10-24

Applies to Ask WeBot candidate model generation. Symptom: the public route returns the safe fallback and private diagnostics report `provider_inner_json`, while the provider returned HTTP 200. Observable cause: the preserved synthetic quote envelope had `done: true`, `done_reason: "length"`, and `response: ""`; the 500-token generation budget was exhausted before inner JSON appeared. Safe resolution: classify empty length-exhausted responses separately as `provider_length`, use the exact response JSON schema, and keep generation bounded at 1,200 tokens with the existing 20-second timeout and public validation. Verification: the targeted quote then ended with `done_reason: "stop"` and valid handoff JSON; the full actual Next/Ollama proof passed 8/8 and 61/61 mocked regressions passed on 2026-10-24. Escalation: do not log raw prompts/completions, fabricate a capability-specific fallback, raise the timeout silently, or treat further schema/token tuning as proven without a fresh real-model run.

## `git add` refuses refreshed evidence under `proof-results/` — 2026-10-25

Applies to committing refreshed browser/live evidence in this root. Symptom: `git add proof-results/...` fails with "The following paths are ignored by one of your .gitignore files: proof-results" even though the evidence files are already tracked and show as modified. Verified cause: `.gitignore` lists `proof-results/`, and plain `git add` on an ignored path is refused; tracking predates (or outlives) the ignore rule, so modifications still appear in `git status` but cannot be staged by path. Safe resolution: stage with `git add -u -- <paths>` (tracked-only update) or `git add -f <paths>`; verify with `git diff --cached --stat` before committing. Verification: 2026-10-25 closeout committed refreshed `proof-results/agency-*` evidence via `git add -u` after the plain add failed. Escalation: do not force-add untracked generated output (for example `node_modules`, `tsconfig.tsbuildinfo`) to work around the ignore rule.

## Booking slots endpoint 500 with `invalid_grant` — 2026-10-25

Applies to the live booking service behind `book.webot.agency`. Symptom: `/api/slots` returns HTTP 500 and the browser form shows its "Could not load available times" alternatives state; container logs show `Token refresh failed: invalid_grant - Bad Request` from `calendar.js`. Verified cause: both OAuth refresh tokens (booking account and busy-check account) were dead on 2026-10-25; the deployed service also predated the approved 30-minute candidate. Safe resolution: see `docs/booking-service-operations.md` — renew both grants via the console-owned redirect URI, rebuild from `booking-candidate/`, restart, verify slots. Verification: root cause and token state confirmed from server logs and refresh probes on 2026-10-25; repair paused on a Workspace passkey gate for the console-owning account. Escalation: do not bypass the consent flow, reuse tokens across accounts, expose credential values, or leave unrelated local services stopped while awaiting the human gate.
