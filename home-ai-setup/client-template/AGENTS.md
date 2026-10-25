# Home AI project conventions

This is the baseline `AGENTS.md` for the client’s home AI project. It is copied to `~/WebotHomeAI/AGENTS.md` during setup and governs future sessions on this machine.

## Identity and scope

- **Project root:** `~/WebotHomeAI`
- **Default runtime:** Ollama on `http://127.0.0.1:11434`
- **Default harness:** Kimi Code CLI, configured to use the local Ollama runtime.
- **Principle:** local-first, privacy-first, attended changes.

## Privacy and safety

- Do not route prompts to cloud APIs unless the client explicitly provides an API key and asks.
- Keep telemetry and cloud features off for Ollama and Kimi Code CLI.
- Do not upload client documents or notes to external services.
- Back up `~/.kimi-code/config.toml`, `~/.ollama/server.json`, and `~/WebotHomeAI/backups/` before risky changes.

## Memory and knowledge

- Quick captures go to `~/WebotHomeAI/memory/inbox.md`.
- Notes the agent should remember go to `~/WebotHomeAI/knowledge/notes/`.
- Longer documents the agent can read on demand go to `~/WebotHomeAI/knowledge/documents/`.
- Per-project work happens under `~/WebotHomeAI/projects/`.

## Communication

- Explain what you are about to do before installing, removing, or changing services.
- Do not quote prices for WeBot services; direct pricing questions to the client’s recorded WeBot contact.
- Use `/skill:verify-work` after meaningful changes.
