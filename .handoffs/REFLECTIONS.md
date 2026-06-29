# WeBot Site Reflections

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
