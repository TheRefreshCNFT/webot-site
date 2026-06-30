# Active State: webot-site

## Current Focus

Keep `webot.agency` stable while finishing the WeBot platform owned/server
release path on cwatchtower.

## Now

- `webot-flow` includes the Phase 1 resource inventory requirement and
  `~/.webot/wiki` as a search location.
- `../webot-platform` has been pivoted away from the legacy hosted release
  target: no legacy hosted release path,
  host-neutral env prep, owned-runtime inventory/planning gates, cwatchtower
  deploy scripts, self-hostable Supabase-compatible runtime proof, and Stripe
  readback artifacts.
- Active platform process surfaces were swept for the legacy provider. No
  active package script, active source/doc file, provider metadata directory, or
  provider-named file remains outside ignored/generated/archive history.
- The Hermes/global legacy provider CLI package and stale user-bin command
  links were removed. The legacy provider command, short alias, and
  `vercelm`-style command are no longer found in interactive zsh, and no
  matching provider process is running.
- `../webot-platform` now has a process-surface regression test that fails if
  package scripts, deploy assets, operational scripts, smoke/proof tests,
  root config, active docs, current `PATH`, root provider metadata, or common
  hosted/serverless deploy commands regain a legacy provider process path.
- `../webot-platform` renamed the generic provider auth gate to
  `release:owned-resource-auth`; generated release-input commands now write
  `owned-resource-auth-report.json` and do not emit stale provider auth
  process wording.
- `webot-site/scripts/verify-owned-runtime-process-clean.mjs` now scans
  platform tests, active operator docs/planning docs, `~/.webot/wiki`,
  `~/.webot/handoffs`, shell startup files, current `PATH`, and the stale
  `vercelm`-style command name in addition to scripts/deploy/workflows, so
  smoke/proof tests cannot quietly reintroduce the old hosted-provider command
  path.
- A read-only explorer subagent independently audited `../webot-platform`
  active package scripts, scripts, smoke/proof tests, docs/runbooks, root
  configs, generated command builders, and hosted-provider equivalents. It
  found no active legacy-provider blocker; remaining hits are intentional
  guardrail tests/docs or history-only `HEAD`/archive references.
- Both installed `webot-flow` skill copies now require quoted literal searches
  and prohibit subagents from running vendor CLIs such as payment, DNS,
  hosting, or deploy tools without exact explicit approval.
- Current owned target is cwatchtower. Adobe Cloud remains unverified until a
  specific Adobe service family/account/environment is identified. Fresh
  resource discovery still finds no Adobe-specific credential filename/path.
- Public brand planning includes the privacy/control direction: We care about
  customer outcomes, not collecting customer data.
- Production app/API/Supabase-compatible runtime is deployed on cwatchtower, but
  the latest local app/API patch is not deployed. The fresh production remote
  smoke fails at API runtime identity and customer-flow navigation.
- `npm run release:production-cwatchtower` is the preferred production app/API
  operator path. It defaults to dry-run, runs local env/owned-resource/app
  deploy dry-run preflights before live mutation, requires `--execute
  --confirm-live` plus the exact approval phrase from the approval packet for
  the cwatchtower app/API deploy, and does not create live Stripe catalog
  objects.
- `npm run release:approval-packet` writes the locked owned-launch approval
  packet at `../webot-platform/test-results/final-release/owned-launch-approval-packet.json`
  and `.md`. It is local-only and gives copy-ready exact approval text for the
  remaining production app/API and isolated staging routes/runtime gates. It now
  validates locked redacted prerequisite evidence
  for each gate before marking it approval-ready, including resource inventory,
  owned-runtime plan, owned-resource auth, target env-check, dry-run,
  domain/isolation, and Stripe readback artifacts as applicable. The refreshed
  packet marks production app/API and isolated staging routes/runtime
  `APPROVAL_REQUIRED`, and live Stripe `COMPLETE`. Production and staging
  cwatchtower commands in the packet now include `--approval-phrase` with the
  exact gate text. The production cwatchtower, staging cwatchtower, and live
  Stripe catalog approval phrases are centralized in
  `../webot-platform/scripts/release-approval-text.js`.
- `npm run release:safe-evidence` now refreshes that owned-launch approval
  packet automatically after `release:inputs`, so every safe-evidence run leaves
  the current approval text and gate prerequisites beside the NO-GO/GO evidence.
- Staging app/API/Supabase DNS now resolves at the active authoritative Google
  nameservers. Staging HTTPS/routes/runtime are not deployed and require
  explicit approval before any cwatchtower change.
- Live Stripe subscription catalog is created and open-only readback validates
  all nine tiers with `stripeSecretKeyPrinted=false`. Test-mode Stripe catalog
  also validates for all nine tiers.
- Raw live Stripe tier creation now fails closed unless
  `--confirm-live-stripe` is present; the guarded `release:proof` wrapper passes
  that flag only for the documented live catalog path. The guarded
  `release:proof` and `release:final -- --include-live-stripe-create` paths now
  also fail closed unless `--approval-phrase` exactly matches the centralized
  live Stripe catalog approval phrase.
- Staging and production env files now include non-secret
  `WEBOT_RELEASE_MARKER` values and pass env checks.
- Remote smoke now requires `/api/health.releaseMarker` to exactly match the
  env `WEBOT_RELEASE_MARKER`, not just be non-empty.
- `release:inputs` now content-validates staging and production
  `remote-smoke-report.json` artifacts, including API health, browser
  screenshots, and the customer-flow readiness screenshot.
- `release:inputs` now content-validates staging and production Supabase runtime
  reports instead of accepting file presence; the current stale staging artifact
  is blocked because it has `status: FAIL` and no passing
  `repositories.runtime-roundtrip` step.
- When staging domain proof is failing, `release:inputs` now routes staging
  remote-smoke and staging Supabase runtime next actions to clear the
  staging HTTPS/server-route preflight first. Current DNS rows pass; the active
  staging preflight failure is HTTPS/routes/runtime.
- While staging HTTPS/routes are still missing, `release:inputs` treats stale
  staging remote-smoke and staging Supabase runtime artifacts as WARN rather
  than independent blocking failures. They become actionable again after the
  guarded staging route/runtime deploy.
- Production remote-smoke/proof next actions in `release:inputs` now point at
  the guarded production cwatchtower deploy command and exact approval path
  instead of stale proxy-fix wording.
- The cwatchtower runbook/readiness docs now clarify that staging
  `release:domains -- --target staging` is DNS+HTTPS proof. Before approved
  staging routes exist, the per-domain DNS rows are useful propagation evidence
  even though the command still fails HTTPS.
- `release:inputs` now has a first-class
  `proof.staging-isolation-report` gate, so staging cannot go READY without the
  before/after cwatchtower production-invariant comparison.
- Current read-only cwatchtower before/after production-invariant snapshots
  passed staging isolation proof. Fresh snapshots are still required around any
  approved staging deploy.
- Staging app/API and Supabase deploy dry-runs now check local env,
  credential-source, and deploy asset prerequisites before reporting PASS
  without requiring `--confirm-staging`; real staging deploys still require
  `--confirm-staging` plus the exact approval phrase.
- `npm run release:staging-cwatchtower` is the preferred staging operator path.
  It defaults to dry-run, writes a locked report, and only executes server-side
  staging changes with `--execute --confirm-staging` plus the exact approval
  phrase after explicit approval. Reports suppress child command output;
  DNS-only preflight requires the exact staging host set; and
  after-snapshot/isolation proof still run after a failed post-mutation step
  where possible.
- `npm run release:cwatchtower-snapshot` exists as the read-only command for
  staging before/after snapshots.
- The cwatchtower app/API deploy script now records the previous `current`
  release at `releases/previous` before promotion, and the runbook rollback
  command uses the owned-runtime compose file.
- `../webot-platform/project-map.md`, ignored resource inventory metadata, and
  regenerated owned-runtime plan are synced to the guarded cwatchtower deploy
  script and corrected rollback command.
- The owned-runtime plan readiness preflight now includes the staging and
  production Stripe readback artifact arguments used by the runbooks.
- `.handoffs/REFLECTIONS.md`, `.handoffs/SESSION_REFLECTIONS.md`, and
  `.handoffs/REFLECTION_2026-06-27.md` are concise current pointers; large
  historical reflection files containing legacy provider process notes were
  archived.

## Verified

- `../webot-platform`: production `release:domains` PASS for
  `app.webot.studio`, `api.webot.agency`, and `supabase.webot.agency`.
- `../webot-platform`: staging `release:domains` FAIL only because staging
  HTTPS/routes are not ready; DNS now passes for `staging.app.webot.studio`,
  `staging.api.webot.agency`, and `supabase-staging.webot.agency`.
- `../webot-platform`: staging `release:proof` FAIL at `domain-preflight`.
- `../webot-platform`: `release:readiness` GO after live Stripe creation and
  open-only production readback.
- `../webot-platform`: `release:inputs` NO-GO on `proof.staging-report`,
  `proof.staging-domain-preflight`, `proof.production-report`, and
  `proof.production-remote-smoke-report`. It now warns, rather than blocks,
  on staging remote-smoke and staging Supabase runtime while staging
  HTTPS/routes are not deployed.
- `../webot-platform`: `release:completion-audit` NO-GO on
  `proof.staging` and `proof.production`.
- `../webot-platform`: `release:safe-evidence` refreshed the final artifact set
  and is NO-GO on staging/production owned-runtime proof artifacts plus
  aggregate `release-inputs` and `completion-audit`; local Supabase, public browser
  evidence, production domain proof, env checks, owned-runtime inventory, and
  the approval-packet step pass. Fresh 2026-06-29T23:10Z safe-evidence refresh
  passed resource discovery, resource inventory, owned-runtime plan,
  owned-resource auth, env prep/checks, production domains, local Supabase,
  local agent API, fulfillment, payment webhook, release readiness,
  final-release dry-run, approval packet, and artifact checks; failed step IDs
  are `staging-domain-preflight`, `release-inputs`, and `completion-audit`.
- `../webot-platform`: staging isolation proof passes at
  `test-results/final-release/staging/staging-isolation-report.json` from
  read-only cwatchtower snapshots; no live deploy/restart/route/DNS/payment
  mutation was run.
- `webot-site`: `git diff --check` and `scripts/test-itinerary-flow.sh` passed
  at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T231359Z`.
- `../webot-platform`: app/API deploy dry-run passes for production and staging,
  and staging app/API plus Supabase dry-runs pass without `--confirm-staging`.
- `../webot-platform`: live Stripe creation/readback was run through the
  approved guarded path. The reports are locked at
  `test-results/final-release/production/stripe-create-report.json` and
  `test-results/final-release/production/stripe-validate-report.json`; readback
  is `validated_catalog` for all nine tiers with
  `stripeSecretKeyPrinted=false`.
- `../webot-platform`: raw live Stripe create without `--confirm-live-stripe`
  fails closed before any API call. Focused Stripe/release guard tests passed:
  2 files / 21 tests. `npm run typecheck`, `npm run lint`,
  `npm run secrets:check`, and `git diff --check` passed.
- `../webot-platform`: latest focused release-gate regression passed with
  5 files / 57 tests covering release proof/remote smoke, owned deploy scripts,
  cwatchtower staging isolation, release inputs, and completion audit.
  `npm run typecheck`, `npm run lint`, and `npm run secrets:check` passed.
- `../webot-platform`: latest process/release focused regression passed with
  7 files / 69 tests for owned-resource auth, release inputs, release domains,
  completion audit, safe evidence, resource discovery, and the
  no-legacy-provider guard. `npm run typecheck`, `npm run lint`, and
  `npm run secrets:check` passed.
- `webot-site`: widened process-clean verifier passed, scanning 116
  process/test files and 66 active docs/skill/wiki/shell files; interactive zsh
  has no legacy hosted-provider command, shortcut, `vercelm`-style command, or
  common hosted/serverless deploy command on `PATH`.
- `webot-platform`: focused no-legacy-provider regression passed after a fresh
  audit. Direct interactive zsh checks found no `vercel`, `vc`, `vercelm`,
  Netlify, Railway, Fly, Wrangler, Firebase, or Heroku deploy commands on
  `PATH`; no matching active provider process was running.
- `../webot-platform`: latest staging orchestrator focused regression passed
  with 3 files / 19 tests, followed by typecheck, lint, secrets check, and
  `git diff --check`.
- `../webot-platform`: latest production/staging orchestrator focused
  regression passed with 4 files / 24 tests. Broader process/release regression
  passed with 7 files / 69 tests, followed by typecheck, lint, secrets check,
  and `git diff --check`.
- `../webot-platform`: latest release-input/staging guidance regression passed
  with 6 files / 58 tests, followed by typecheck, lint, secrets check,
  `git diff --check`, and a refreshed `release:safe-evidence` artifact set.
- `../webot-platform`: latest process/smoke/approval regression passed with
  6 files / 34 tests, followed by typecheck, lint, secrets check,
  approval-packet refresh, and `git diff --check`.
- `../webot-platform`: latest evidence-backed approval-packet regression passed
  with 1 file / 4 tests, and the broader process/smoke/approval regression
  passed with 6 files / 34 tests, followed by typecheck, lint, secrets check,
  approval-packet refresh, artifact redaction/evidence checks, and
  `git diff --check`.
- `../webot-platform`: latest safe-evidence approval-packet integration passed
  with 3 files / 24 tests, followed by typecheck, lint, secrets check,
  `git diff --check`, refreshed safe evidence, and locked approval packet
  artifacts at mode `0600`.
- `../webot-platform`: latest cwatchtower exact-approval-phrase enforcement
  passed with 8 files / 82 tests, followed by typecheck, production/staging
  cwatchtower dry-runs, resource inventory and owned-runtime plan refreshes,
  approval-packet refresh, lint, secrets check, and `git diff --check`.
- `../webot-platform`: latest approval-phrase centralization check passed with
  5 files / 36 tests covering the approval packet, Stripe runbook, production
  cwatchtower, staging cwatchtower, and release inputs. `npm run typecheck`,
  `npm run lint`, `npm run secrets:check`, approval packet refresh, and locked
  packet artifact checks passed.
- `../webot-platform`: latest live Stripe exact-approval enforcement passed
  with 6 files / 58 tests covering release proof, final release, readiness,
  release inputs, approval packet, and Stripe runbook. Missing live Stripe
  `--approval-phrase` now fails before any live Stripe child command can be
  added; exact-phrase dry-run passes and remains non-mutating.
- `../webot-platform`: completion-audit production remote-smoke failure wording
  now points to the approved production cwatchtower app/API deploy path instead
  of stale proxy-fix wording. The production live-Stripe missing-approval guard
  artifact now preserves `target: production` and `stripeMode: live` while
  failing closed before child commands. Focused release-proof/completion-audit
  tests passed with 2 files / 38 tests, followed by typecheck, lint, secrets
  check, and site validation.
- `../webot-platform`: post-live-Stripe state alignment verification passed
  with 7 files / 80 tests covering approval packet, Stripe catalog docs,
  readiness, release inputs, completion audit, release proof, and safe
  evidence. `npm run typecheck`, `npm run lint`, `npm run secrets:check`, and
  `git diff --check` passed. `webot-site` `git diff --check` and
  `scripts/test-itinerary-flow.sh` also passed.
- A read-only subagent audit after the fresh safe-evidence run found no
  remaining blocker that can be fully cleared without an approval-gated owned
  runtime mutation: production app/API deploy or isolated staging
  route/runtime deploy.

## Next Actions

- Ask Ian for explicit approval before production app/API deploy:
  approval packet text:
  `I approve running the production WeBot platform app/API cwatchtower deploy on owned infrastructure with rollback through releases/previous.`
  Command:
  `npm run release:production-cwatchtower -- --execute --confirm-live
  --approval-phrase 'I approve running the production WeBot platform app/API
  cwatchtower deploy on owned infrastructure with rollback through
  releases/previous.'
  --report-file
  test-results/final-release/production/production-cwatchtower-release.json`.
- After approved deploy, rerun production domain proof, remote smoke, and
  production proof through the orchestrator.
- For staging, DNS now resolves for app, API, and Supabase. Ask for explicit
  approval before isolated staging HTTPS/server routes/runtime deploy, and
  use `npm run release:staging-cwatchtower -- --execute --confirm-staging
  --approval-phrase 'I approve running the isolated staging WeBot platform
  app/API and Supabase runtime deploy on cwatchtower with before/after
  production-invariant snapshots.'
  --report-file
  test-results/final-release/staging/staging-cwatchtower-release.json` so
  fresh before/after cwatchtower isolation snapshots and proofs run in order.
- For Stripe, use `docs/stripe/live-catalog-runbook.md` for repair/rerun paths.
  Do not recreate or replace live products, prices, or Payment Links unless the
  approved idempotent runbook path is being used intentionally.

## Do Not Do

- Do not SSH-deploy, restart, or alter cwatchtower live services without the
  specific approval above.
- Do not create, replace, or mutate live Stripe products, prices, or Payment
  Links outside the documented approved/idempotent runbook path.
- Do not directly edit production-hosted static site files.
- Do not change existing Agency Office bundle links or Studio payment links.
