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
