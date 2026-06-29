# Reflections

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

Surprised: Full table access passed only after RLS policies, grants, API schema
configuration, and append-only trigger maintenance semantics were aligned.

Concrete change: Keep a real local provider proof for every production
repository family before treating cloud env/proof work as a pure credential
exercise.
