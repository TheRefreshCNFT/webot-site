---
name: help
description: Show the available home AI starter skills and common commands
type: prompt
whenToUse: When the user asks for help, commands, a refresher, or what skills are available
---

# Home AI help

## Starter skills

- `/skill:home-ai-baseline` — conventions for this local-first setup.
- `/skill:capture` — save an idea, task, note, or seed.
- `/skill:fast` — do a trivial task inline.
- `/skill:verify-work` — check that a change works.

## Common commands

- `ollama list` — show downloaded models.
- `ollama ps` — show models currently loaded.
- `kimi` — start the harness in the current directory.
- `kimi -m local-default "<prompt>"` — run a single prompt with the default local model.
- `kimi --version` — check the harness version.

## Need more?

Custom skill builds and advanced workflows are out of scope for the base setup. Ask your WeBot contact if you want a custom skill or workflow built for your use case.
