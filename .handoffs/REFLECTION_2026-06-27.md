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
