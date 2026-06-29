# WeBot Site Reflections

## 2026-06-29 - Local Runtime Proof as Release Gate

What worked: Promoting the local Supabase proof into `release:inputs`,
`release:final`, and `release:completion-audit` prevents future final-release
runs from skipping a real database runtime check.

What broke/root cause: The first proof script existed as a standalone command,
but final audit could still theoretically go green without citing that proof.
Root cause was treating a new verification artifact as evidence without adding
it to every operator-facing gate.

What surprised me: The strongest fix was small: one proof path threaded through
three release scripts and tests, with no product-code churn.

Concrete change: Whenever a new proof artifact closes a real production risk,
wire it into release inputs, final orchestration, and completion audit in the
same slice.

## 2026-06-29 - Local Supabase Runtime Proof

What worked: A real local Supabase proof caught issues that mocked repository
tests missed, then verified the fixes end to end through REST/RPC.

Why: The proof exercised production adapters against local PostgREST and wrote
redacted evidence, so RLS, grants, schema exposure, and RPC SQL all had to be
correct together.

What broke: Service-role REST writes failed, private schema calls were not
available through PostgREST, and the rate-limit RPC had an ambiguous
`counter_key` reference.

Root cause: Prior coverage validated repository request shapes with mocked
`fetch`, but did not prove the deployed Supabase permission/configuration path.

What surprised me: Full table access passed only after RLS policies, grants,
API schema configuration, and append-only trigger maintenance semantics were
aligned.

Concrete change: Keep a real local provider proof for every production
repository family before treating cloud env/proof work as a pure credential
exercise.

## 2026-06-29 - Bounded Vercel Pull Execution

What worked: Turning the Vercel pull into a timeout-bounded,
CI/non-interactive command makes the next real-secret step safer to run when the
project is linked.

What broke/root cause: The first wrapper used `spawnSync` without a timeout, so
an unauthenticated Vercel CLI could still hang during a confirmed pull. Root
cause was treating dry-run safety and confirmed-run safety as the same problem.

What surprised me: The secret scanner caught fake Stripe-shaped values in a
test fixture, which was useful pressure to keep even test data from looking like
real credentials.

Concrete change: Any wrapper around an external credential CLI should include a
timeout, non-interactive env, raw-output suppression, and a hanging-process
test before being trusted in release flow.

## 2026-06-29 - Guarded Vercel Env Pull

What worked: Installing the Vercel CLI and putting a redacted wrapper in front
of `vercel env pull` moved the release path from "missing secrets" to a concrete
external-state gate: link the correct Vercel project, then pull and validate.

What broke/root cause: The global npm install succeeded, but the Hermes Node
global bin directory was not on the Codex shell PATH. Root cause was PATH
surface mismatch, so `~/.local/bin` symlinks were needed for this environment.

What surprised me: A plain `vercel whoami` can hang when auth is absent, so
release checks should prefer bounded, non-interactive commands and local file
evidence over account probes.

Concrete change: Secret-backed release tooling should use guarded wrappers with
dry-run defaults, explicit confirmation flags, no raw CLI output in reports,
and PATH checks that reflect the actual Codex shell.

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

## 2026-06-29 - Remote Supabase Runtime Proof Gate

What worked: Reusing the local Supabase runtime repository proof as the backbone
for a remote staging/production proof avoided inventing a weaker smoke test. It
kept the evidence focused on actual account, entitlement, job, file, usage,
rate-limit, reject, webhook, and cleanup round trips through the production
adapters.

What broke/root cause: The existing deployed proof path could prove browser and
API behavior, but it did not produce a direct deployed Supabase REST/RPC artifact.
Root cause was that local database confidence and deployed customer-flow smoke
were handled as separate gates with no explicit remote database round-trip
artifact between them.

What surprised me: Running the full deploy check refreshed ignored `test-results`,
so `release:inputs` temporarily lost the local proof and public browser evidence
even though the source changes were valid.

Concrete change: After full checks that regenerate or clear ignored artifacts,
rerun durable proof/evidence producers before recording final release-input
state.

## 2026-06-29 - Release Domain Proof Gate

What worked: Turning `app.webot.studio` and `api.webot.agency` into an explicit
DNS/TLS proof made the release report more truthful. The platform now proves
whether the production dashboard and API hostnames resolve and accept HTTPS
instead of relying on env URL shape alone.

What broke/root cause: The env validators already enforced the intended
production hostnames, but no release artifact proved those hostnames existed in
DNS. Root cause was treating "configured URL" and "reachable production URL" as
the same gate.

What surprised me: Both hostnames currently have no DNS records from this
machine, so the missing-domain state is now concrete evidence rather than a
soft deployment note.

Concrete change: Keep DNS/TLS proof in `release:inputs`, `release:final`, and
`release:completion-audit`, and rerun `npm run release:domains` after any DNS or
Vercel routing work before attempting final proof.

## 2026-06-29 - Provider Auth Release Preflight

What worked: A redacted provider-auth report made the external credential state
concrete without waiting for Ian or triggering interactive login flows. It now
shows Vercel, Supabase, and Stripe readiness before env pull/prep/proof work.

What broke/root cause: Manual status probes can hang when Vercel has no stored
credentials. Root cause was treating provider CLIs as safe to call directly
during release investigation, even though some start device-login flows.

What surprised me: Stripe had test-mode CLI access available while live-mode
access was not available, which is exactly the kind of partial credential state
that should be visible before claiming release readiness.

Concrete change: Put `npm run release:provider-auth` first in
`release:inputs` next commands, keep it warning-only, and avoid raw provider CLI
output in release reports.

## 2026-06-29 - Noninteractive Vercel Link Prep

What worked: Letting `release:env-pull` create `.vercel/project.json` from
`VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` gives the release path a clean
noninteractive option when a future shell has release env loaded.

What broke/root cause: The previous env-pull wrapper still depended on a local
Vercel project link, so even with a `VERCEL_TOKEN` and project IDs a future run
could get stuck at the manual `vercel link` step. Root cause was assuming
Vercel CLI auth and project-link metadata would arrive together.

What surprised me: The safer default is a dry run that does not write the link
file but still proves whether the env IDs are present and well-shaped.

Concrete change: Use `npm run release:env-pull -- --link-from-process-env`
before confirmed pulls, and use `--confirm-pull` only when intentionally writing
`.vercel/project.json` and ignored env files.

## 2026-06-29 - Vercel Link Source Preflight Alignment

What worked: Aligning `release:provider-auth`, `release:inputs`, and
`release:env-pull` around the same Vercel project-link sources removed stale
guidance from the release checklist. The reports now say exactly which safe
link source is missing without printing raw Vercel IDs.

What broke/root cause: After adding noninteractive link prep, the older
preflights still treated `.vercel/project.json` as the only project-link proof.
Root cause was improving the executor path without updating the upstream status
reports that tell the operator what to do next.

What surprised me: The mismatch was small but high-friction; it could have sent
a future session back toward interactive `vercel link` even though env IDs are a
valid no-click path.

Concrete change: Whenever adding a new noninteractive release path, update the
preflight/status command in the same slice and add tests that prove the redacted
report accepts the new input source.

## 2026-06-29 - Durable Release Inputs Report

What worked: Adding `--report-file` to `release:inputs` made the top-level
release readiness state durable, matching the proof artifacts produced by the
domain, Supabase, remote-smoke, Stripe, final-release, and completion-audit
commands.

What broke/root cause: The release-input report was previously terminal-only,
so the current NO-GO state had to be copied into handoffs by observation. Root
cause was treating release inputs as an operator prompt instead of a proof
artifact.

What surprised me: The report-file addition was tiny, but it closes a real
handoff gap because future sessions can inspect one JSON file instead of
reconstructing the state from terminal history.

Concrete change: Use
`npm run release:inputs -- --report-file test-results/release-proof/release-inputs-report.json`
when refreshing release state, and cite that artifact in handoffs.

## 2026-06-29 - Screenshot Caret Hydration Noise

What worked: Treating the React hydration warning in `deploy:check` as a real
release-polish issue led to a small proof-harness fix instead of ignoring it
because tests were green.

What broke/root cause: Playwright's default screenshot behavior hides the caret
by temporarily applying inline `caret-color` styles to focused form inputs. On
the `/login` page, that could happen close enough to hydration that React logged
a mismatch even though the application markup was correct.

What surprised me: The app did not need a UI code change; the evidence capture
tool was mutating the page. The right fix was to make screenshots preserve the
initial caret behavior.

Concrete change: For browser proof screenshots that may include forms, pass
`caret: "initial"` so evidence capture does not alter hydrated DOM attributes.
