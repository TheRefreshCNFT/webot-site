# Self-Improvement Reflection

Date: 2026-06-27
Task: WeBot agent marketplace + Studio planning pass

## What Worked

Using `webot-flow` first kept the pass grounded in repo state, live checks, and protected Stripe rules before planning. SocratiCode plus direct static-file review was enough for the current pure-HTML sites, and headless Chrome screenshots exposed the mobile overflow issue that text review would have missed.

## What Broke

Axon file context was unavailable for `webot-site` despite the managed manifest listing a project entry. Root cause: these static repos have no useful parseable graph and no local `.axon/kuzu` directory for the MCP namespace to read.

## What Surprised Me

`webot-studio` had dirty files before this pass, and the visible diff was mostly line-ending churn. Its `CNAME` is UTF-16, which could make a simple cleanup accidentally look much larger than it is.

## Concrete Change

For WeBot static-site planning passes, run screenshot checks and encoding/line-ending checks before assigning implementation agents, and record dirty-tree ownership as a Phase 0 gate instead of letting content work bury it.

## Follow-Up Note

Ian clarified that Cardsmith belongs under Create & Polish, every delivery path needs a customer review step, and storage should remain short-window/encrypted with a contact-us escalation for customers asking about longer retention. Future plans should capture user-facing service shape as decisions immediately, not leave them as open questions once answered.

Ian then added monetization and runtime constraints: tasteful paid supply links, business card/logo generation, SEO-first offer pages, warm listener/job router instead of cold starts, local/distilled model evaluation, 24-48 hour reviewed delivery language, and premier quality no matter the tier. Concrete change: future product plans should separate "quality level" from "access/capacity/priority" so monetization never implies lower-tier customers get weaker output.

## Tool Scope Cleanup Reflection

Date: 2026-06-27
Task: Remove unused source-routing path from the active WeBot plan

### What Worked

Re-checking the strict free/no-extra value before installing anything kept the project from accumulating a dependency that was interesting but not necessary.

### Concrete Change

Future revenue/product briefs should start with the existing free/local stack and add tools only when a concrete gap appears.

## Revenue Flow Checkpoint Reflection

Date: 2026-06-27
Task: Stripe/CRM payment-flow checkpoint and safe checkout wiring

### What Worked

Following the existing local-first CRM worker uncovered the real Stripe-to-CRM path instead of inventing a new public order endpoint. The poller found one completed checkout session that had not been synced, and a direct remote backup plus targeted SCP avoided running the broader sync path that can send welcome emails.

### What Broke

Headless Chrome screenshots of the local services section rendered blank because the static page relies on fade-in visibility behavior that the simple screenshot command did not trigger reliably. The checkout-page screenshots were valid, so the failure is scoped to local visual capture of animated page sections.

### What Surprised Me

The Multi-Agent Payment Link itself works, but its Stripe artwork advertises a different starting price than the actual checkout amount. That is the kind of mismatch only a real hosted Checkout screenshot catches.

### Concrete Change

For payment work, every newly wired checkout link needs a hosted Checkout screenshot before publish, and price/art mismatches block the publish even when the Payment Link returns `200`.

## Studio Catalog Implementation Reflection

Date: 2026-06-27
Task: Price, create, wire, and validate Studio subscriptions/job credits

### What Worked

The useful business move was pricing against what WeBot actually sells: reviewed, done-for-you AI work with a customer review step. That made the catalog clearer than the old service menu and avoided copying random legacy Squarespace-style products.

### What Broke

The first Studio implementation used friendly local product keys while Stripe success URLs used canonical keys. Browser-return testing caught it before publish.

### What Surprised Me

The live CRM dashboard was not byte-identical to the local `webot/crm/crm.html` source. Pulling the live file, patching only the Studio product map, and md5-verifying the push avoided overwriting newer CRM dashboard work.

### Concrete Change

For production CRM changes, compare live and local dashboard files before SCP. If they differ, patch the live-derived local copy surgically, back up on-server first, and record both md5s.

## Platform Release Gate Reflection

Date: 2026-06-29
Task: Harden platform Stripe readback and final-release proof gates

### What Worked

Auditing the proof chain from the current scripts, not from previous-session
memory, exposed a real gap: the completion audit trusted a passing
`stripe-validate` step without independently inspecting a durable Stripe
readback artifact. Adding an artifact writer in `release:proof` and a separate
reader in `release:completion-audit` made the final gate more resistant to stale
or swapped proof reports.

### What Broke

`npm run release:proof -- --dry-run --env-file ...` initially failed before the
verifier ran when the env file was absent. Root cause: modern Node recognizes
`--env-file`, so without a Node `--` option terminator the runtime could consume
a verifier-owned CLI flag.

### What Surprised Me

The failure only showed up in a realistic npm command; direct unit tests of
`runCli()` and `parseArgs()` were green because they bypassed Node's outer CLI
parser. The verifier itself was fine, but the package-script boundary was not.

### Concrete Change

When writing Node-backed operational scripts, put `--` before the script path in
`package.json` and include at least one npm-level dry-run test or manual
verification for any flag name that overlaps Node runtime options.

## Deployment Header Gate Reflection

Date: 2026-06-29
Task: Add Vercel security/no-store headers to the WeBot platform release gate

### What Worked

Reading the actual `vercel.json` after the broader release-gate hardening showed
a narrow but important production gap: API responses were no-store, but the
dashboard, auth, billing, jobs, API-key, usage, and webhook surfaces did not have
a pinned deployment header contract. Adding a dedicated test plus a completion
audit gate made the fix visible both to CI and to the final product-ready
scoreboard.

### What Broke

The first instinct was to put a regression case in the completion-audit test by
temporarily overwriting `vercel.json`. Root cause: that would be unsafe in a
parallel Vitest suite because another test file could read the config mid-write.

### What Surprised Me

The product-ready audit already covered routes, Stripe, screenshots, and proof
reports, but not the deploy host headers that protect browser behavior once the
app is actually public.

### Concrete Change

Keep file-mutating negative tests out of parallel suites unless they run in an
isolated temp project. For repo-owned config, prefer a direct read-only contract
test plus a positive completion-audit gate.

## Fixture Auth Runtime Gate Reflection

Date: 2026-06-29
Task: Lock platform fixture auth to local runtimes only

### What Worked

Reviewing the current diff instead of blindly committing it found a subtle
deployment edge: `NODE_ENV=production` blocks normal production, but Vercel also
exposes runtime markers that should disable fixture auth in preview/production
contexts even if another variable is mis-set.

### What Broke

The first pass only rejected `WEBOT_ENABLE_TEST_AUTH_HEADERS=true` outside
local. Root cause: treating the variable as a boolean toggle missed the cleaner
contract, which is that remote env files should not carry local fixture-auth
controls at all.

### What Surprised Me

The safest user-facing rule was also simpler operationally: fixture auth is
local-test only, absent from remote envs, and denied by runtime markers before
request handling.

### Concrete Change

When adding test-only bypasses, gate them with both the app runtime helper and
the release env verifier, and make remote env files reject the bypass variable
even when it is set to a harmless-looking value like `false`.

## Job Idempotency Proof Reflection

Date: 2026-06-29
Task: Prove agent job retries are idempotent at the route boundary

### What Worked

Auditing the API contract text against the tests exposed a useful gap: the
repository code had idempotency support, but the route suite did not prove the
customer-visible retry behavior for duplicate create, revision, and cancel
requests.

### What Broke

Nothing broke in implementation; the missing piece was evidence. Root cause was
trusting lower-level idempotency tests to imply the full route contract.

### What Surprised Me

The route already returned exactly the right create semantics: first request
`201`, retry `200`, same job, and no second usage row. That is worth preserving
because agent customers will retry aggressively.

### Concrete Change

For every monetized mutating API promise, keep at least one route-level retry
test that proves both response semantics and billing/usage side effects.

## Bedtime Definition-Of-Done Clarification Reflection

Date: 2026-06-29
Task: Capture Ian's final monetization/API readiness bar before session handoff

### What Worked

Treating the clarification as a hard product gate, not a chat note, keeps the
next session from compressing "locally implemented" into "ready to sell."

### Concrete Change

The monetization/API platform is not done until working staging/production
secrets, release proof, whole-flow human browser testing through safe
post-payment/dashboard/build-station steps, and expert family skill packs are
verified. Final model selection can wait, but only after those non-model
surfaces are truly ready.
