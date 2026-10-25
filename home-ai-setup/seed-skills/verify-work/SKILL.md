---
name: verify-work
description: Run a quick acceptance check on a home AI change or setup step
type: prompt
whenToUse: After completing a setup step, config change, or small task to confirm it works
arguments:
  - target
---

# Verify work

Run a lightweight acceptance check for `$ARGUMENTS`.

## Default checks

1. **Does the relevant service or file exist?** (e.g., `ollama ps`, `kimi --version`, the edited config file.)
2. **Can it perform its basic operation?** (e.g., generate one sentence with the default model, start the harness without errors.)
3. **Are privacy defaults still in place?** (Ollama cloud disabled, Kimi telemetry off.)
4. **Is the change idempotent?** (Re-running the setup step should not break anything.)

## Steps

- Ask the user what they just changed if `$ARGUMENTS` is empty.
- Run the smallest real command that proves the change works.
- Report pass/fail for each check and the exact command used as evidence.
- If a check fails, suggest the most likely fix before moving on.
