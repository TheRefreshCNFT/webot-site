# WeBot Site Reflections

## 2026-06-29 - Release Input Env-Prep Guidance

What worked: Making `release:inputs` lead with the env-prep import command
turns the remaining release blocker into an executable next step instead of a
static list of missing files.

What broke/root cause: The env-prep helper existed, but the operator-facing
preflight still jumped straight to env checks and proof artifacts. Root cause
was docs/tooling drift after adding the safer secret import path.

What surprised me: The verifier's `nextCommands` are now as important as the
checks themselves because they are what a tired future session will probably
follow first.

Concrete change: Whenever a release helper is added, surface it immediately in
`release:inputs` next commands and assert that command order in tests.

## 2026-06-29 - Final Audit Readback Handoff

What worked: Treating generated proof artifacts as first-class release inputs
kept the final-release path honest and reduced manual steps. The dry-run report
was the right read-back artifact because it exposed the exact completion-audit
command without touching live Stripe or deployed targets.

What broke/root cause: The previous flow verified that Stripe readback pointers
existed in env files, but `release:final` did not automatically hand the
`stripe-validate-report.json` files from `release:proof` to the audit. Root
cause was a boundary mismatch between proof generation and readiness/audit input
loading.

What surprised me: The local gates were strong enough that the missing handoff
showed up as release choreography friction, not a security gap.

Concrete change: Future release orchestrators should pass generated proof
artifacts directly into downstream audits and include dry-run command assertions
for every generated artifact path.

## 2026-06-29 - Release Inputs Alignment

What worked: Re-running `release:inputs` after capturing public-live screenshots
made the stale readback-pointer requirement obvious. The verifier output was
good enough to show that the next command still lacked the explicit Stripe
readback artifact arguments.

What broke/root cause: `release:inputs` had not been updated after
`release:final` learned to pass generated `stripe-validate-report.json`
artifacts into the completion audit. Root cause was another choreography drift
between a preflight verifier and the final orchestrator.

What surprised me: The old env-pointer check looked stricter, but it was
actually less accurate because it asked for generated proof as if it were a
secret input.

Concrete change: When a release artifact moves from manual input to generated
output, update every operator-facing verifier and command suggestion in the
same slice.

## 2026-06-29 - Release Env Prep

What worked: Exporting the deploy env rule contract let the prep helper share
the same source of truth as `env:check`, which keeps the skeleton from drifting
away from the actual gate.

What broke/root cause: The release path had precise validators but no safe way
to create or inspect the ignored staging/production env files. Root cause was
that the checklist lived in docs and verifier output, not in a runnable helper.

What surprised me: A non-mutating `--check-only` mode was more useful than
creating placeholder files during this session, because it preserved the true
current failure state while proving the next command.

Concrete change: For secret-backed gates, provide both a redacted checker and a
local skeleton writer, and make the checker mode the default verification in
handoffs until real secrets are available.

## 2026-06-29 - Process Env Import

What worked: Checking required variable names before writing files proved the
shell had no release secrets loaded, so the next implementation could focus on
the import path without pretending readiness.

What broke/root cause: The env prep helper could generate skeletons, but it did
not yet make use of a shell where secrets were already loaded. Root cause was a
missing bridge between process-level secret loading and ignored local env files.

What surprised me: The strongest current action was not creating placeholder
files; it was making the tool ready to consume real secrets safely when they
appear.

Concrete change: Secret-prep helpers should support a value-preserving import
mode from `process.env`, with reports that continue to show only variable names
and statuses.
