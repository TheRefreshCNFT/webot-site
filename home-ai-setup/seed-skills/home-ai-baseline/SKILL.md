---
name: home-ai-baseline
description: Baseline conventions for a private home AI setup installed by WeBot Agency
type: prompt
whenToUse: At the start of any project or session on this home AI machine
---

# Home AI baseline

This machine was configured by WeBot Agency as a local-first, privacy-oriented home AI setup. Apply these defaults unless the client explicitly overrides them.

## Core rules

- **Stay local.** The default model provider is the Ollama runtime on `http://127.0.0.1:11434`. Do not route prompts to cloud APIs unless the client asks and provides the key.
- **No prices.** Do not quote prices for WeBot services. Direct pricing questions to the human contact recorded in `~/WebotHomeAI/AGENTS.md` or the handoff notes.
- **Back up before risky changes.** Copy `~/.kimi-code/config.toml`, `~/.ollama/server.json`, and the `~/WebotHomeAI/backups/` folder before altering models, config, or skills.
- **Keep the client in the loop.** Explain what you are about to do, especially when running commands that install, remove, or change services.

## Where things live

```text
~/WebotHomeAI/
├── AGENTS.md              # this project convention file
├── memory/inbox.md        # quick capture scratchpad
├── knowledge/notes/       # short notes the agent should know about
├── knowledge/documents/   # longer documents the agent can read on demand
├── projects/              # per-project working directories
└── backups/               # config + model-list snapshots
```

Use the `capture` skill to add ideas to `memory/inbox.md` or promote them to `knowledge/notes/`.

## Default model alias

The harness is configured with a `local-default` model alias pointing at the Ollama provider. If the client wants a different model, use `/model` or the `-m` flag with one of the aliases defined in `~/.kimi-code/config.toml`.

## Privacy defaults

- Ollama cloud features are disabled (`OLLAMA_NO_CLOUD=1` and `~/.ollama/server.json`).
- Kimi Code CLI telemetry is off (`telemetry = false`, `KIMI_DISABLE_TELEMETRY=1`).
- Auto-updates for the CLI are disabled in `tui.toml`; the client chooses when to update.

## Getting more help

- `/skill:help` — list the starter skills.
- `/skill:capture` — capture an idea or task.
- `/skill:verify-work` — run a quick acceptance check on a change.
