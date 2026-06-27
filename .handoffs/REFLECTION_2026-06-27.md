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
