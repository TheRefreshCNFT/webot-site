# Phase 06 Plan: Model Runtime and Evaluation

## Objective

Prepare runtime inventory, routing contracts, evaluation corpus, approval-flow harness coverage, and queue/resource policy. Final model choices are deferred until Phases 01-05 pass and the platform/API/queue/eval gates exist.

Requirements: MODEL-01, MODEL-02, MODEL-03, MODEL-04, MODEL-05, COPY-02, SEC-05.

## Dependencies

- Phases 01-05 must be complete before final model choices are made.
- This phase may prepare manifests, contracts, evals, and bakeoff procedure, but must not expose local model/runtime details in public copy.

## Read First

- `.planning/PROJECT.md`
- `.planning/requirements/WE-API-MONETIZATION-REQUIREMENTS.md`
- `scripts/test-local-agent-approval-flow.sh`
- `../webot-platform/docs/api/v1-contract.md`
- `../webot-platform/docs/security/threat-model.md`

## Tasks

### Task 1: Create Runtime Inventory Manifest and Router Contract

Files:
- `../webot-platform/docs/runtime/model-inventory.md`
- `../webot-platform/docs/runtime/router-contract.md`
- `../webot-platform/lib/runtime/router.ts`
- `../webot-platform/tests/runtime/router-contract.test.ts`

Action:
- Record the local inventory from MODEL-01 in a private/internal runtime manifest.
- Define the router contract by service category per MODEL-02 without selecting final models.
- Router outputs must be internal-only and must not leak local inventory, model names, prompts, or tool internals to public/API/customer responses.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/runtime/router-contract.test.ts`
- Automated: `cd ../webot-platform && grep -R -Ei "Ollama|llama|MLX|ComfyUI|FLUX|Qwen|LTX|prompt" app/api app/\\(dashboard\\) components && exit 1 || true`

Done:
- Runtime inventory and routing contracts exist internally, and public/customer surfaces remain implementation-agnostic.

### Task 2: Build Service-Category Eval Corpus and Approval Harness Coverage

Files:
- `../webot-platform/evals/service-corpus/*.json`
- `../webot-platform/evals/run-service-evals.ts`
- `scripts/test-local-agent-approval-flow.sh`
- `../webot-platform/tests/evals/service-corpus.test.ts`

Action:
- Create evaluation cases for all eight service families and the requested new services from TAX-02/MODEL-03.
- Extend approval-flow harness coverage per MODEL-04 so each family can produce a reviewable packet without sending deliverables or submitting charges.
- Include safe-reject cases that verify SEC-05 behavior.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/evals/service-corpus.test.ts`
- Automated: `scripts/test-local-agent-approval-flow.sh`

Done:
- Every service family has eval coverage and approval-flow proof before model bakeoffs are considered.

### Task 3: Define Queue/Resource Policy and Bakeoff Gate

Files:
- `../webot-platform/docs/runtime/queue-resource-policy.md`
- `../webot-platform/docs/runtime/quant-bakeoff-procedure.md`
- `../webot-platform/lib/runtime/resource-policy.ts`
- `../webot-platform/tests/runtime/resource-policy.test.ts`

Action:
- Define queue/resource policy for concurrency, local resource protection, API usage limits, job priority, retry behavior, and failure safety per MODEL-05.
- Define the quant bakeoff procedure and explicitly block final model choices until Phases 01-05 pass and this phase's eval/resource tests pass.
- Keep all model/runtime specifics out of public copy and API reject responses per COPY-02 and SEC-05.

Verify:
- Automated: `cd ../webot-platform && npm test -- --run tests/runtime/resource-policy.test.ts`
- Automated: `grep -E "Phases 01-05|eval|resource|queue|bakeoff" ../webot-platform/docs/runtime/quant-bakeoff-procedure.md`

Done:
- Model selection is ready to be decided from evidence after platform, queue, and eval gates exist.

## Acceptance Tests

- `cd ../webot-platform && npm test -- --run tests/runtime`
- `cd ../webot-platform && npm test -- --run tests/evals`
- `scripts/test-local-agent-approval-flow.sh`

## Source Coverage Audit

- MODEL-01 and MODEL-02 covered by Task 1.
- MODEL-03 and MODEL-04 covered by Task 2.
- MODEL-05 covered by Task 3.
- COPY-02 and SEC-05 covered across all tasks through leak/safe-reject guards.
