---
name: capture
description: Capture ideas, tasks, notes, and seeds into the home AI memory system
type: prompt
whenToUse: When the user wants to save an idea, task, note, or reminder for later
arguments:
  - mode
---

# Capture

Capture `$ARGUMENTS` into the home AI memory system under `~/WebotHomeAI/`.

## Routing

- **default / `--task`** — append a structured todo to `~/WebotHomeAI/memory/inbox.md`.
- **`--note`** — append a timestamped note to `~/WebotHomeAI/knowledge/notes/quick-capture.md`.
- **`--seed`** — create a dated seed file in `~/WebotHomeAI/memory/seeds/` describing the idea and any trigger conditions.

If the mode is not specified, infer it from the content: actionable items become tasks; observations become notes; future ideas become seeds.

## Steps

1. Ensure `~/WebotHomeAI/memory/` and `~/WebotHomeAI/knowledge/notes/` exist.
2. Append the captured item with an ISO-8601 timestamp.
3. Keep the entry one line or one short paragraph unless the user provides more detail.
4. Confirm what was saved and where.
