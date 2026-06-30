# Active State: webot-site

## Current Focus

Keep `webot.agency` stable while finishing the WeBot platform pivot from Vercel
to owned/server-controlled infrastructure.

## Now

- State docs were slimmed on 2026-06-29. Historical long-form state is archived
  under `.handoffs/archive/`.
- The stale monetization handoff with old `VERCEL_TOKEN` blockers was archived;
  `.handoffs/MONETIZATION_API_EXPANSION_HANDOFF_2026-06-28.md` is now a short
  pointer to the owned-infrastructure continuation.
- The current continuation plan is
  `.handoffs/WEBOT_PLATFORM_OWNED_INFRASTRUCTURE_CONTINUATION_2026-06-29.md`.
- `webot-flow` has the new Phase 1 resource inventory requirement in both
  installed skill locations.
- `../webot-platform` has been changed locally so release/readiness/docs/tests
  no longer depend on Vercel as the deployment target.
- `../webot-platform` now requires `npm run release:resource-inventory` before
  release readiness/final release can pass. The actual
  `config/resource-inventory.json` is ignored and must contain redacted
  host/source names only after Ian approves the deployment target and rollback
  path.
- `../webot-platform` has `npm run release:resource-discovery`; latest redacted
  discovery passed and confirmed credential-source paths/modes plus
  wiki/warehouse/project knowledge-source paths without printing secret values.
  It now warns if the Adobe/owned infrastructure intake page is missing from
  `~/.webot/wiki`. `release:safe-evidence` no longer captures live browser
  evidence unless `--capture-public-browser` is explicit.
- `~/.webot/wiki/queries/adobe-cloud-owned-infrastructure-intake.md` now exists
  as the labeled non-secret home for verified Adobe Cloud/owned-server facts.
  The current local inventory found no Adobe-specific credential filename or
  deployment source; it records only non-secret owned-infra source names until
  the exact Adobe target is verified. It now also stores official public Adobe
  service-family notes for App Builder, I/O Runtime, AEM Cloud Manager, and
  Adobe Commerce Cloud.
- After Ian said both entries were saved, the follow-up credential-source scan
  still found no Adobe-specific filename or Adobe/App Builder/AIO/IMS label in
  `~/.webot/credentials`; `supabase.rtf` is present and owner-only (`0600`).
- `../webot-platform` now has `project-map.md` so future agents have the
  host-neutral runtime map, scripts, credential-source rules, and cross-repo
  dependencies before state-changing work.
- `../webot-platform` resource discovery now treats shell self-references such
  as `WEBOT_INTERNAL_OPS_TOKEN="$WEBOT_INTERNAL_OPS_TOKEN"` as references, not
  secret-like values, while still flagging pasted secret-shaped assignments.
- `../webot-platform` final-release and release-input orchestration now treat
  resource discovery as the first durable artifact before inventory, env,
  domain, runtime, browser, readiness, and completion gates.
- `../webot-platform` staging and production env files have been filled with
  locked local release values. The env verifier now accepts approved HTTPS
  Supabase-compatible owned URLs instead of assuming only managed
  `*.supabase.co`, and both staging/production env checks pass.
- `../webot-platform` release DNS/TLS proof now includes
  `supabase.webot.agency` alongside `app.webot.studio` and `api.webot.agency`.
- Staging Stripe test catalog readback now passes directly for all nine tiers
  with `mode=test`, `openOnly=true`, `stripeSecretKeyPrinted=false`, and a
  locked `0600` artifact at
  `../webot-platform/test-results/final-release/staging/stripe-validate-report.json`.
  Production live Stripe readback found the live tier catalog has not been
  created yet.
- `../webot-platform` resource inventory now requires live-system blast radius,
  state-preservation rule, and explicit pre-change approval before owned/Adobe
  release gates can pass.
- `../webot-platform` resource inventory now requires `targetServiceFamily` and
  rejects generic labels such as "Adobe Cloud"; inventory must name the exact
  service family before release planning can pass.
- `../webot-platform` resource inventory now requires `wikiEvidence` pointing
  under `~/.webot/wiki` with `containsSecretValue: false`, so approved
  Adobe/owned facts must be stored in durable non-secret wiki form before GO.
- `../webot-platform` now has `npm run release:owned-runtime-plan`, a local-only
  owned-runtime operator-plan generator that fails closed until inventory
  passes and executes no live commands. It supports `--target staging` and has
  generated `test-results/final-release/staging/owned-runtime-plan.md` for the
  isolated staging route/runtime approval path.
- `../webot-platform` now has
  `docs/operations/owned-infrastructure-intake.md` for the exact Adobe/owned
  target, host/service, credential source, commands, DNS, blast-radius, and
  state-preservation answers needed before creating the ignored inventory file.
- `../webot-platform` provider-auth now depends on the same resource inventory
  gate, so owned-infrastructure status stays WARN until the approved ignored
  inventory passes.
- Public/brand planning now includes privacy/control/data minimization:
  We care about customer outcomes, not collecting customer data.
- `../webot-platform` is now deployed on the owned `cwatchtower` server for
  app/API and Supabase-compatible runtime. `app.webot.studio` and
  `api.webot.agency` route to `webot-platform-app`; `supabase.webot.agency`
  routes to `supabase_kong_webot-platform`.
- Live DNS/TLS proof, production remote Supabase REST/RPC proof, and public
  live browser evidence now pass. The browser evidence was copied into
  `../webot-platform/test-results/final-release/public-live-browser`.
- `../webot-platform` now has a local proxy-origin redirect fix for the owned
  Caddy runtime: auth/session, auth/refresh, auth/signout, dashboard job
  creation, and job action routes redirect through `NEXT_PUBLIC_APP_URL` rather
  than an internal forwarded origin such as `https://0.0.0.0:3000`.
- The remote-smoke browser sensitive-text detector now flags token-shaped
  values such as `sk_live_*`, `whsec_*`, `cs_test_*`, and `service_role` without
  failing safe public docs language that merely says secrets are sensitive.
- Staging proof is not complete: `staging.app.webot.studio` and
  `staging.api.webot.agency` now resolve to `141.148.79.11` but HTTPS/server
  routes are not ready; after Ian reported all three DNS entries saved,
  `supabase-staging.webot.agency` still does not resolve at the active
  authoritative `ns-cloud-e*.googledomains.com` nameservers. The cwatchtower
  runbook lists the target records and notes that server-side staging
  routes/runtime need explicit approval.
- `../webot-platform` now has target-aware cwatchtower deploy scripts for
  production and staging. The staging lane uses isolated paths/containers,
  staging Caddy snippets, and staging Supabase project naming; both staging
  deploy scripts passed `--dry-run` without touching the live server.
- `../webot-platform` now has `npm run release:staging-isolation`, which plans
  and verifies before/after cwatchtower snapshots so staging changes cannot be
  counted as proof if production containers or production Caddy blocks changed.
- `/api/health` now reports `runtimeEnvironment` and `releaseMarker`; remote
  smoke requires the deployed API health response to match the expected runtime.

## Verified

- `webot-site`: `git diff --check` passed.
- `webot-site`: `scripts/test-itinerary-flow.sh` passed at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T190245Z`.
- `../webot-platform`: latest `npm run deploy:check` passed after the
  target-aware staging deploy/isolation work, runtime health marker, and
  remote-smoke runtime identity checks with secrets check, local env check, DB
  contract check, lint, typecheck, 50 Vitest files / 306 tests, 25 Playwright
  E2E tests, cleanup dry-run, build, and local
  agent/fulfillment/payment-webhook proofs.
- `../webot-platform`: focused staging/runtime test set passed with 10 files /
  81 tests covering owned deploy scripts, staging isolation, health, release
  proof, release env prep, owned-runtime plan, release inputs, completion
  audit, final release, and safe evidence. `npm run typecheck`, `npm run lint`,
  and `git diff --check` passed.
- `../webot-platform`: `npm run release:resource-discovery` passed with
  `secretValuesPrinted=false`, 7 expected docs, 22 credential-source paths, 69
  redacted knowledge-source paths, including 6 wiki sources, and no secret-like
  knowledge-source flags.
- `../webot-platform`: `npm run release:safe-evidence -- --dry-run` passed and
  planned no live browser capture by default.
- `../webot-platform`: `npm run release:safe-evidence -- --artifact-dir test-results/final-release --resource-inventory-file config/resource-inventory.json --staging-env-file .env.staging.local --production-env-file .env.production.local --report-file test-results/final-release/safe-evidence-refresh-report.json`
  completed the redacted artifact refresh with `0600` reports and no-secret
  report flags (`secretValuesPrinted=false` or `stripeSecretKeyPrinted=false`
  depending on report type); status remains NO-GO for the expected missing
  inventory, env, DNS, readiness, release input, completion, and platform public
  browser evidence gates.
- `../webot-platform`: `npm test -- tests/deploy-env.test.ts tests/release-domains.test.ts tests/resource-inventory.test.ts tests/resource-discovery.test.ts tests/provider-auth.test.ts tests/release-readiness.test.ts tests/owned-runtime-plan.test.ts tests/release-inputs.test.ts tests/completion-audit.test.ts tests/final-release-safe-evidence.test.ts`,
  `npm run typecheck`, and `npm run lint` passed after adding owned Supabase
  domain proof and self-hostable Supabase env support.
- `../webot-platform`: `npm run env:check:staging -- --env-file .env.staging.local --report-file test-results/final-release/staging-env-check-report.json`
  passed with `secretValuesPrinted=false`.
- `../webot-platform`: `npm run env:check:production -- --env-file .env.production.local --report-file test-results/final-release/production-env-check-report.json`
  passed with `secretValuesPrinted=false`.
- `../webot-platform`: direct staging Stripe readback passed for all nine tiers
  with `mode=test`, `openOnly=true`, `stripeSecretKeyPrinted=false`, and a
  locked `0600` final-release artifact. This proof is now independent of the
  failed staging domain preflight.
- `../webot-platform`: `npm run runtime:local-supabase-proof -- --start --stop --output-file test-results/final-release/local-supabase-runtime-proof.json --timeout-ms 240000`
  passed, started/stopped local Supabase, applied migrations, exercised
  production repository REST/RPC round trips, and wrote a redacted `0600`
  proof artifact.
- `../webot-platform`: `npm run release:domains -- --output-file test-results/final-release/domain-proof.json`
  passes for `app.webot.studio`, `api.webot.agency`, and
  `supabase.webot.agency`.
- `../webot-platform`: `npm run release:provider-auth -- --inventory-file config/resource-inventory.json`
  passes with owned-infrastructure, Supabase, and Stripe credential-source
  proof and `secretValuesPrinted=false`.
- `../webot-platform`: `npm run release:resource-inventory -- --inventory-file config/resource-inventory.json`
  passes against the approved ignored inventory file.
- `../webot-platform`: `npm run runtime:remote-supabase-proof -- --target production --env-file .env.production.local --output-file test-results/final-release/production/supabase-runtime-report.json`
  passes against the owned Supabase-compatible runtime.
- `webot-site`: `scripts/test-itinerary-flow.sh --live` passed at
  `/Users/webot/Backups/webot-site/itinerary-agent-flow-validation-20260629T164332Z`.
- `../webot-platform`: `npm run release:readiness` remains NO-GO only because
  live Stripe tier readback is incomplete; the locked read-only validation
  artifact reports the live `human_basic` product is missing.
- `../webot-platform`: after the live Stripe operator-safety cleanup and
  scanner-safe remote-smoke sensitive-text detector update,
  `npm run deploy:check` passed with secrets check, local env check, DB
  contract check, lint, typecheck, 48 Vitest files / 290 tests, 25 Playwright
  E2E tests, cleanup dry-run, build, and local
  agent/fulfillment/payment-webhook proofs.
  Generated readiness/proof reports no longer surface raw live Stripe child
  commands as operator steps.
- `../webot-platform`: `release:safe-evidence` now has all artifact checks
  passing with `secretValuesPrinted=false`. It remains NO-GO because
  release-readiness has incomplete live Stripe readback, production proof fails
  remote smoke until the local proxy-origin redirect fix is deployed, and
  staging proof stops at the new `domain-preflight` step with partial staging
  DNS/TLS failure. The staging owned-runtime plan artifact now exists locally.
  Completion audit now requires the staging `domain-proof.json` artifact beside
  `staging-proof.json`.
- `../webot-platform`: release readiness and release inputs now report
  incomplete production Stripe readback as the guarded live catalog runbook
  gate, not as a generic invalid env/JSON issue. Read-only live validation now
  writes a locked invalid-catalog artifact at
  `test-results/final-release/production/stripe-validate-report.json`.
- `../webot-platform`: release inputs now propagates failed staging domain
  proof next actions, so the `proof.staging-domain-preflight` operator action
  starts with the exact missing active-authoritative DNS record for
  `supabase-staging.webot.agency`.
- `../webot-platform`: release inputs now validates staging and production
  proof reports by report status and failed steps, not by file presence.
  Failed production proof now points first at the approved owned-runtime deploy
  path for the local proxy-origin redirect fix; live Stripe creation remains
  guarded by the Stripe runbook.
- `../webot-platform`: refreshed final-release inputs now pass resource
  discovery, resource inventory, owned-runtime plan, env reports, production
  domain proof, local Supabase runtime proof, local agent/fulfillment/payment
  proofs, staging Stripe readback, production Supabase runtime proof, and
  public live browser evidence. Remaining blocking checks are
  `release.readiness-report`, `proof.staging-report`,
  `proof.staging-domain-preflight`, `proof.staging-supabase-runtime-report`,
  `proof.production-report`, and `proof.production-stripe-readback-report`.
- `../webot-platform`: refreshed completion audit is NO-GO with blocking gates
  `release.readiness`, `proof.staging`, and `proof.production`. Production
  proof now stops at remote-smoke failure instead of cascading downstream live
  Stripe proof errors inside the same gate.
- `../webot-platform`: current production remote smoke fails `api-health`
  because deployed health has not proved `runtimeEnvironment=production`, and
  fails the customer-flow browser step after navigation to
  `chrome-error://chromewebdata/`. The local runtime marker/proxy-origin work
  still needs approved owned-runtime deployment before live proof can pass.
- `../webot-platform`: public live browser evidence has been refreshed at
  `test-results/final-release/public-live-browser` by running
  `webot-site` live itinerary validation with `WEBOT_TEST_OUTPUT` pointed at
  the platform artifact directory.
- `../webot-platform`: expanded focused tests passed for the redirect/smoke
  patch with 32 tests across auth session, auth refresh, auth signout,
  dashboard job create/actions, and release proof/smoke. `npm run typecheck`,
  `npm run lint`, and `git diff --check` also passed.

## Open Blockers

- Production live Stripe catalog creation/readback is the remaining
  release-readiness hard gate.
  Read-only live validation now writes a locked invalid-catalog artifact and
  reports `Missing Stripe product for human_basic`.
- Production proof is blocked until the local proxy-origin redirect fix is
  deployed through the approved owned-runtime path and remote smoke passes.
- The exact live Stripe write approval phrase is still required before creating
  the live 9-product, 9-price, 9-payment-link subscription catalog.
- Staging DNS/runtime proof is also incomplete for final completion audit.
  `supabase-staging.webot.agency A 141.148.79.11` still appears missing from
  active authoritative DNS, despite Ian reporting all three entries were saved.
  `staging.app.webot.studio` and `staging.api.webot.agency` DNS now resolve,
  but server-side staging route/runtime changes still need explicit approval
  and rollback plan.
- `../webot-platform/docs/stripe/live-catalog-runbook.md` now documents the
  exact approval phrase, dry-run, guarded live `release:proof` command, readback
  artifact, and final gates for the live Stripe catalog step.
- `../webot-platform` `release:readiness` and `release:inputs` now point the
  incomplete production Stripe readback action at that runbook and the guarded
  `--include-stripe-create --confirm-live-stripe` proof command.
- Completion audit remains NO-GO until production proof, live Stripe readback,
  staging proof, and the final audit command all pass with the deployed
  evidence bundle.
- Human approval is required before DNS, production service recreation, live
  Stripe changes, paid ads, affiliate links, tracking pixels, or broader
  data-retention promises.

## Next Actions

- Get explicit approval for live Stripe product/price/payment-link creation,
  then follow `../webot-platform/docs/stripe/live-catalog-runbook.md`.
- Get explicit approval for the owned-runtime deploy of the local proxy-origin
  redirect fix, deploy through the cwatchtower runbook, then rerun remote smoke
  and production proof.
- Rerun release readiness, release inputs, and completion audit after live
  Stripe readback exists and production proof passes.
- After staging DNS resolves, approve and deploy the isolated staging
  runtime/route lane, or explicitly remove staging proof from the final-release
  definition.
- Keep `webot-site` static and protect all live payment links.
