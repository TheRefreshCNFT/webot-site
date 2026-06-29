# Session Reflections

## 2026-06-29 - Payment Webhook Proof Gate

- What worked: Turning the Stripe webhook entitlement path into a redacted
  release artifact made the no-charge payment proof reusable by
  `release:inputs`, `release:final`, `release:safe-evidence`, and
  `release:completion-audit`.
- Why it worked: The route, signature verifier, webhook event repository, and
  entitlement sync code were already factored enough to exercise through one
  local fixture script without contacting Stripe or submitting payment.
- What broke: The first proof fixture used a fixed signature timestamp that
  drifted outside Stripe's tolerance window, and plain Node's stripped TS loader
  could not resolve the Next route dependency.
- Root cause: Unit tests hid runtime differences: Vitest tolerated the import
  shape, while the real package script needed `tsx`; webhook signatures also
  need current timestamps unless verifier time is injectable end-to-end.
- Surprise: The direct package-script run was more valuable than the focused
  tests here because it caught the runtime loader mismatch before the full
  release refresh.
- Concrete change: For any new release proof script, run the package command
  directly before relying on tests, then wire the artifact into safe-evidence
  so generated reports prove the command works in the same path users will run.

## 2026-06-29 - Completion-Audit Blocking Gates

- What worked: Adding `blockingGates` preserved the existing completion-audit
  report while making the actual release blockers impossible to miss.
- Why it worked: The audit already had structured per-gate status and issues,
  so the new field could be derived from the same source of truth.
- What broke: Previous handoff wording could be misread because
  `remainingAllowedWork` always said `final model/runtime selection`, even while
  env, DNS, Stripe, and deployed proof gates were failing.
- Root cause: Deferred product work and release blockers were reported in
  separate concepts, but only the deferred-work field was obvious at the top
  level.
- Surprise: The refreshed final-release evidence now shows a smaller blocker
  list because local Supabase and public-browser evidence pass; the remaining
  blockers are the true external gates.
- Concrete change: Any future `NO-GO` release summary should cite
  `blockingGates` first, then mention deferred model/runtime selection only as
  allowed follow-up work after external gates are green.

## 2026-06-29 - Completion-Audit Readiness Artifact Gate

- What worked: The final-release, release-inputs, and completion-audit scripts
  already had clear artifact paths, so the durable readiness report could be
  wired through with narrow script and test changes.
- Why it worked: Running the no-auth evidence refresh after the full test suite
  exposed whether generated next commands matched the real orchestrated path.
- What broke: The first implementation aligned `release:final` and
  `release:completion-audit`, but `release:inputs` still generated a manual
  completion-audit command without `--release-readiness-report`.
- Root cause: The manual next-command builder was a separate release path from
  the final-release orchestrator and needed its own regression expectation.
- Surprise: The full test suite can clean final-release evidence artifacts, so
  proof reports should be regenerated after broad verification before handoff
  claims.
- Concrete change: For every new release artifact gate, update both the
  orchestrated command and the release-inputs next-command path, then refresh
  evidence after the final full suite.

## 2026-06-29 - Safe Evidence Refresh Runner

- What worked: A single `release:safe-evidence` command now refreshes the
  final-release proof bundle without interactive auth, deploys, payments, or
  live Stripe creation.
- Why it worked: Separating best-effort evidence refresh from the fail-fast
  `release:final -- --execute` path preserves the production release gate while
  still making no-auth sessions useful.
- What broke: The first actual run falsely reported `PASS` because planned
  executable steps started as `SKIPPED` and the runner treated all skipped steps
  as intentionally skipped.
- Root cause: I reused the public release-step shape without a distinct
  planned/executable state, so execution state and report state were conflated.
- Surprise: The dry-run report initially leaked internal `args` and `env` fields
  even though the other release reports expose only public command metadata.
- Concrete change: For release runners, execute based on the presence of an
  internal executable command, then map every result back to a public report
  shape before writing artifacts.

## 2026-06-29 - Safe Evidence Artifact Audit

- What worked: Adding artifact readback checks made the safe-evidence report
  prove that generated JSON reports and browser screenshots are usable, not just
  that commands were attempted.
- Why it worked: The audit is independent of command exit status, so expected
  `NO-GO` commands can still prove they produced locked-down redacted evidence.
- What broke: A test fixture initially used a literal secret-shaped string and
  the repository secret scanner caught it during full deploy verification.
- Root cause: The negative test needed to exercise secret detection without
  committing a raw pattern into source.
- Surprise: The secret scanner provided a better test-design constraint than
  the unit test itself; it forced the fixture to construct the pattern at
  runtime.
- Concrete change: Negative security fixtures should build sensitive-looking
  strings from fragments so tests still exercise detection while source remains
  scan-clean.

## 2026-06-29 - Agent API Release Proof

- What worked: Driving the real local API route handlers with a generated API
  key gave a stronger proof than isolated unit assertions. It covered auth,
  account boundary, preflight, idempotency, usage, rejects, limits, and response
  redaction in one no-charge release artifact.
- Why it worked: The platform already had route-level tests and in-memory
  repositories; the proof script reused those real handlers and then wired the
  resulting report into `release:final`, `release:inputs`,
  `release:safe-evidence`, and `release:completion-audit`.
- What broke: The first proof run failed because usage rows existed but did not
  carry `api_key_id` for API-key-created jobs.
- Root cause: `createJob`, cancellation, and revision usage effects recorded
  account/job/entitlement data but did not pass `context.auth.apiKeyId` into
  `recordUsage`.
- Surprise: The proof found a monetization-relevant data gap that the existing
  API-key auth and usage ledger tests did not catch, which is exactly why these
  end-to-end local release proofs are worth the extra ceremony.
- Concrete change: Any agent-commerce gate should prove customer-billable
  accounting fields, not only successful request handling. For usage/limits,
  require both account scope and API-key scope in the report.

## 2026-06-29 - Deploy Check Proof Artifact Order

- What worked: Moving the direct agent API and payment webhook proofs to the end
  of `deploy:check` preserved the exact redacted release artifacts that the
  final handoff needs to cite.
- Why it worked: The broad test and browser phases can clean `test-results`, so
  proof artifacts that matter for release evidence need to be generated after
  those cleanup-prone phases.
- What broke: The earlier follow-up made `deploy:check` stricter, but ran the
  proofs before tests/build, which meant a passing gate could still leave no
  durable proof files behind.
- Root cause: I optimized for fail-fast verification before accounting for the
  artifact lifecycle of the full gate.
- Surprise: The fix did not need new logic; the existing proof commands already
  wrote locked-down redacted reports when they were simply run last.
- Concrete change: When a release command both verifies behavior and writes
  handoff evidence, place it after cleanup-prone test phases or explicitly
  regenerate/read back the artifact before claiming it.

## 2026-06-29 - Release Env File Permissions

- What worked: Treating `.env.staging.local` and `.env.production.local` as
  secret-bearing release inputs exposed a simple local hardening gap that did
  not need provider auth to fix.
- Why it worked: The existing env prep and env check scripts already owned the
  release-env lifecycle, so permission enforcement fit naturally at creation
  time and at remote env validation time.
- What broke: The current ignored env files were mode `0644`, and successful
  content validation would not have noticed that future real secrets were
  readable by group/world users.
- Root cause: Earlier gates focused on redacted reports and placeholder
  detection, but did not include filesystem permissions for the source env
  files themselves.
- Surprise: Adding the permission gate did not disturb local development
  because the check only applies to staging/production env-file inputs, not
  `.env.example` local checks.
- Concrete change: Secret-bearing release input files should be created and
  validated with owner-only permissions before any content/readiness claim is
  trusted.

## 2026-06-29 - Release Gate Env Permission Propagation

- What worked: Reusing the env-file mode validator across `env:check`,
  `release:readiness`, and final-release preflight made the permission rule a
  real release invariant instead of a single-command check.
- Why it worked: Completion audit trusts the readiness report and final-release
  preflight, so the invariant had to live on every path that consumes remote env
  files directly.
- What broke: Full `deploy:check` initially failed because completion-audit
  fixtures created valid-looking env files with default `0644` permissions.
- Root cause: Test fixtures had been proving content shape while bypassing
  source-file secrecy assumptions.
- Surprise: The failing fixtures usefully demonstrated the exact production
  risk: a valid env file can still be unsafe if its filesystem mode is wrong.
- Concrete change: Any test fixture that represents a secret-bearing release
  input should set `0600`, and any release path that reads that input directly
  should enforce it before parsing values.

## 2026-06-29 - Pulled Release Env File Lockdown

- What worked: Auditing the Vercel env-pull wrapper after hardening env prep
  found the remaining path that could create real secret files with default
  filesystem permissions.
- Why it worked: The pull wrapper already captured Vercel output silently and
  validated values, so adding `chmod 0600` immediately after a successful pull
  kept the security invariant close to the file creation point.
- What broke: Nothing broke in verification; the existing fake Vercel fixture
  naturally wrote env files with ordinary defaults, so the new mode assertions
  proved the wrapper was doing the hardening.
- Root cause: The previous permission work covered generated skeleton envs and
  env consumers, but not env files created by an external CLI subprocess.
- Surprise: The short README path lagged the detailed deployment runbook, so
  both needed updating to keep operators from reaching for raw `vercel env pull`.
- Concrete change: Any script that delegates secret-file creation to a provider
  CLI should lock the resulting file before parsing, validating, or reporting
  success.

## 2026-06-29 - Failed Pull Partial Secret Files

- What worked: Re-reading the env-pull patch after committing exposed the
  failed-subprocess edge before real provider secrets were available.
- Why it worked: Thinking in terms of filesystem side effects, not command
  status, made it obvious that a CLI can write an env file and still exit
  nonzero.
- What broke: Nothing in the broader gate; the new fake Vercel fixture proved a
  partial secret file is locked and the raw subprocess output stays out of the
  report.
- Root cause: The first patch tied chmod to successful validation, but partial
  writes are still secret-bearing release inputs.
- Surprise: The fix was a one-flag state machine: record that a pull was
  attempted, then lock any resulting file before deciding whether validation can
  continue.
- Concrete change: For provider CLI wrappers, treat "file exists after attempted
  run" as enough reason to apply secret-file protections, regardless of exit
  code.

## 2026-06-29 - Existing Release Env File Refusals

- What worked: Checking the overwrite-refusal path found one more place where
  the command touched the release env lifecycle without improving file
  permissions.
- Why it worked: Treating "I will not overwrite this" as still being an
  opportunity to make the existing secret file safer keeps the operator workflow
  secure by default.
- What broke: Nothing in the release gates; the existing overwrite-refusal test
  only needed a mode assertion.
- Root cause: The earlier patches focused on files written by the command, but
  ignored files the command intentionally leaves in place.
- Surprise: The safest behavior is also the least disruptive one: chmod the
  existing file and still refuse to overwrite it.
- Concrete change: Release env tooling should apply owner-only permissions to
  any target env file it detects during confirmed secret workflows, even when no
  content changes are made.

## 2026-06-29 - Vercel Project Link File Lockdown

- What worked: Extending the same confirmed-pull discipline to
  `.vercel/project.json` made generated and pre-existing project-link metadata
  behave consistently.
- Why it worked: The env-pull script already creates project links with `0600`
  when using `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID`; existing link files should
  not get weaker treatment.
- What broke: Nothing in the broader release gate; the linked-project env-pull
  test gained a direct mode assertion.
- Root cause: Existing provider metadata was accepted as a readiness signal
  without normalizing its local filesystem mode.
- Surprise: This is not a secret-value leak in the same class as env files, but
  locking the metadata keeps the release workspace consistently private.
- Concrete change: Provider helper files that unlock release automation should
  be normalized to owner-only mode whenever a confirmed secret-bearing workflow
  uses them.

## 2026-06-29 - Release Inputs Project Link Audit

- What worked: After locking `.vercel/project.json` during confirmed env pulls,
  adding a release-input audit made the same privacy assumption visible in the
  final GO/NO-GO evidence layer.
- Why it worked: `release:inputs` already centralizes local artifact readiness,
  so a permissive project-link file belongs there as a warning with a concrete
  remediation command.
- What broke: The happy-path fixture had to stop creating the link file with
  default mode and explicitly set `0600`.
- Root cause: The release-input verifier treated provider-link presence as
  enough evidence, even though the env-pull workflow now considers its mode
  part of safe operation.
- Surprise: This kept the external blocker list unchanged while making local
  evidence sharper: provider auth can still be absent, but if a link file
  appears it must be private.
- Concrete change: When a release helper begins enforcing permissions, update
  the independent release-input/completion evidence path too, so readiness
  reports cannot drift from runtime behavior.

## 2026-06-29 - Provider Auth Project Link Audit

- What worked: Bringing the project-link mode check into `release:provider-auth`
  made the earliest provider snapshot agree with `release:env-pull` and
  `release:inputs`.
- Why it worked: Provider auth already reports credential/link readiness without
  printing secrets, so it is the right first warning when local provider helper
  files are too permissive.
- What broke: The tests used fake file existence, so the verifier needed a tiny
  `statMode` dependency hook to keep production behavior real and tests clean.
- Root cause: The provider-auth layer was still treating link presence as
  enough, even after later layers started requiring owner-only permissions.
- Surprise: Adding the stat hook made the test intent clearer: fake existence
  now has to say whether the fake file is private.
- Concrete change: When release evidence has layered checks, put the same local
  privacy invariant in the earliest layer that can explain it.

## 2026-06-29 - Provider Auth Credential File Audit

- What worked: Extending the provider-auth audit from helper metadata to the
  actual Vercel and Supabase credential files closed the next obvious local
  release-auth exposure path without needing Ian at the desk.
- Why it worked: The verifier already accepted a `statMode` dependency from the
  Vercel project-link audit, so Vercel auth and Supabase access-token mode
  checks could share one owner-only helper and keep reports redacted.
- What broke: Nothing in the full platform gate; the env-token happy path
  needed an explicit regression so future patches do not inspect irrelevant
  local credential files when environment tokens are the selected source.
- Root cause: Provider-auth evidence was confirming that credential files
  existed, but not that the files were protected like the release env files and
  Vercel project link.
- Surprise: The current shell has no Vercel or Supabase credential files, so
  the value of the patch is mostly future-proofing: when auth appears, unsafe
  file modes will be surfaced immediately instead of silently consumed.
- Concrete change: Any release-auth source that comes from a local file should
  be owner-only before it counts as usable evidence, and env-token alternatives
  should stay redacted and independent.

## 2026-06-29 - Stripe CLI Config File Audit

- What worked: Checking the Stripe CLI config file after Vercel/Supabase auth
  files made the provider-auth report cover every local credential source it
  currently depends on.
- Why it worked: The Stripe check already runs `stripe whoami` without exposing
  raw output, so adding config-file mode evidence gave the report a filesystem
  privacy check without reading secret contents.
- What broke: Nothing; the local config was already `0600`, so the new evidence
  tightened the report without changing the current external blocker list.
- Root cause: Stripe CLI availability and key status were visible, but the
  backing local config file's privacy state was not part of provider-auth
  evidence.
- Surprise: `XDG_CONFIG_HOME` support was worth covering in tests, because a
  future shell can move Stripe config away from the default home path while
  still being a local credential-file source.
- Concrete change: Provider-auth checks should treat CLI config files as
  credential material: detect them by path/mode only, never print contents, and
  require owner-only permissions when present.

## 2026-06-29 - Completion Audit Blocker IDs

- What worked: Adding `blockingGateIds` gave the completion-audit report a quick
  operator/agent summary without removing the detailed gate objects.
- Why it worked: The audit already computes every failing gate, so the flat list
  is derived from the same source of truth and cannot drift from
  `blockingGates`.
- What broke: Nothing; focused completion and safe-evidence tests covered both
  the NO-GO and GO report shapes.
- Root cause: The report was machine-complete but clumsy to summarize in quick
  terminal/readback tooling because object arrays stringified as `[object
  Object]` unless every caller mapped IDs manually.
- Surprise: The best fix was not a new parser; it was a tiny report field that
  makes the intended handoff view explicit.
- Concrete change: Evidence reports that humans and agents both read should
  expose a terse ID list next to detailed objects whenever the detailed shape is
  not naturally terminal-friendly.

## 2026-06-29 - Release Input Action Summaries

- What worked: Adding `blockingCheckIds`, `warningCheckIds`, and
  `operatorActions` to `release:inputs` turned the existing report into a real
  handoff checklist without creating a separate source of truth.
- Why it worked: The fields are derived directly from the authoritative checks,
  so they inherit the same redaction and cannot drift from the pass/fail state.
- What broke: Nothing in focused release tests or the full platform gate.
- Root cause: `nextCommands` showed the release sequence, but not which commands
  were urgent in the current shell or which checks were warnings versus hard
  blockers.
- Surprise: The current final-release report has only 14 operator actions once
  local/public proofs are passing, which makes the external launch surface much
  easier to reason about.
- Concrete change: Release reports should pair full machine-verifiable evidence
  with a compact operator checklist whenever the next step depends on credentials
  or provider state outside the current session.
