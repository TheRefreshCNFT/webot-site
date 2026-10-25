# Home AI Setup — Engagement Runbook

Version: 2026-10-25  
Status: client-side install kit  
Authority: `.handoffs/2026-10-25-home-ai-setup-plan.md`

This runbook is the reusable delivery template for WeBot Agency’s **Home AI Setup** one-time reviewed job. It covers intake, the remote control session, the software stack we install, and the handoff. It is designed to be read by the installer and handed to the client as the post-session document.

---

## 1. The engagement flow

1. **Consultation (30 minutes)** — confirm fit and capture the four qualifying answers (see §2).
2. **Written spec** — one-page summary of hardware tier, model picks, harness choice, family/profile needs, and any out-of-scope custom work.
3. **Remote setup session(s)** — attended control via our self-hosted RustDesk. The client reads us the session code and approves control. We work on their screen; they can watch everything.
4. **Handoff document** — this runbook trimmed to the client’s machine, plus a short work-log of what was installed and configured.
5. **Short follow-up** — one check-in within 48 hours to answer “how is it going?” and catch obvious issues.
6. **Optional monthly check-in retainer** — exists; details scoped separately per client. No prices are quoted in this document.

---

## 2. Intake — four qualifying questions

Capture these in the client’s own words during consultation:

1. **What are you trying to set up?** Chat assistant, voice helper, coding partner, family knowledge base, smart-home integration, etc.
2. **What are you trying to achieve?** Concrete outcome: “draft replies to my email,” “help the kids with homework without data leaving the house,” etc.
3. **How much do you already know?** None / can follow instructions / power user. Sets session length and handoff depth.
4. **What device and specs will it run on?** OS, CPU/GPU, VRAM or Apple Silicon unified memory, RAM, free storage, desktop/laptop/always-on box. Determines the model tier.

---

## 3. Remote control session — RustDesk

> **Planned values (verify at install time):** We use our self-hosted RustDesk server at `rustdesk.webot.agency` (ID server + relay). The client installs the stock RustDesk client from the official site. Our public key is distributed at `https://rustdesk.webot.agency`. Session codes are attended-only; the client reads the code and approves control each session.

### Security posture for control sessions

- **Attended-only.** The client is at the machine during the session.
- **No stored credentials.** We do not save passwords or persistent access on the client machine.
- **Client-visible session.** The client sees the cursor and every action; we narrate what we are doing.
- **Short work-log.** We record the high-level steps taken (installed packages, pulled models, configured files) and give the client a copy.
- **Teardown/uninstall.** After the job, the client removes RustDesk (or disables it) using the instructions in §8.3.

---

## 4. The stack we install

### 4.1 Base scope (included in the one-time job)

- Runtime engine install and configuration.
- Tier-matched model download and configuration.
- Harness install and configuration.
- Initial agent/harness setup: skills, memory system, knowledge stores, project-convention files.
- Auto-start on boot.
- Backup and update story for models and config.
- Privacy pass: telemetry and cloud features off.
- Power and thermals sanity check for always-on boxes.
- Family / multi-user profile when children will use the machine.
- Guided test drive before handoff.
- Teardown instructions for the remote-access tool.

### 4.2 Explicitly out of base scope

- **Custom workflows** and **custom skills** are separately scoped and priced per engagement.
- Hardware procurement advice can be discussed, but purchasing is client-side unless separately agreed.

### 4.3 Runtime / model guidance

**Default runtime:** [Ollama](https://ollama.com) — headless service, OpenAI-compatible API on `http://127.0.0.1:11434`, one-command model pulls.

**GUI-preferring clients:** [LM Studio](https://lmstudio.ai) can be substituted; note that auto-start, API binding, and backup steps differ.

**Apple-Silicon-only clients:** the [MLX](https://github.com/ml-explore/mlx) path is available for clients who do not want the Ollama abstraction.

### 4.4 Hardware tier table

Match the client’s measured hardware to a tier, then present 2–3 concrete models from that tier. **Refresh these picks at install time** — the local-LLM market moves monthly.

| Tier | Hardware | Model class | Example current picks (Ollama tags) |
|------|----------|-------------|-------------------------------------|
| 1 | ~8 GB RAM | Small 3–4B class | `qwen2.5:3b`, `llama3.2:3b` |
| 2 | 16 GB RAM **or** 12 GB VRAM | ~20B / 12B / 14B sweet spot | `qwen2.5:14b`, `gemma3:12b`, `mistral-small:22b` |
| 3 | 24 GB VRAM **or** 32–36 GB unified memory | 27B–30B class | `qwen2.5:32b`, `qwen2.5-coder:32b` |
| 4 | Large unified-memory Macs | 70B+ tier | `qwen2.5:72b`, `llama3.1:70b` |

Use the tier as the single source of truth: set `TIER=1|2|3|4` in `02-models` and let the script pull the tier’s current picks. The installer should update the model arrays at the top of `02-models` before each engagement.

### 4.5 Harness

**Primary harness:** [Kimi Code CLI](https://www.kimi.com/code) — free for the client, installed from the official npm package `@moonshot-ai/kimi-code`. It is configured to talk to the local Ollama runtime by default, so the setup works offline after the install.

**Alternatives:** Claude Code or OpenClaw-class harnesses may fit better for clients whose goals are already centered on those ecosystems. Note them in the written spec if chosen.

### 4.6 Skills, memory, and knowledge stores

We seed the client’s own skills directory with a small, client-appropriate starter set shipped in this kit (`seed-skills/`). The installer must **copy** the directories into place; never symlink them to our internal paths and never reference our source paths at runtime.

The starter set includes:

- `home-ai-baseline` — local-first conventions, privacy defaults, and where things live.
- `capture` — quick capture of ideas/tasks/notes into the home AI memory folder.
- `fast` — execute trivial home-AI tasks inline.
- `verify-work` — conversational checklists for testing a change.
- `help` — one-page refresher of available skills.

Memory and knowledge layout (created under `~/WebotHomeAI` by default):

```text
~/WebotHomeAI/
├── AGENTS.md              # project convention file for this home AI setup
├── memory/
│   └── inbox.md           # quick capture scratchpad
├── knowledge/
│   ├── notes/             # client’s own notes to make available to the agent
│   └── documents/         # longer documents the agent can read
├── projects/              # per-project working directories
└── backups/               # config + model-list snapshots
```

Point knowledge stores at the client’s existing notes/documents folders when asked; the paths above are defaults.

---

## 5. Using the install scripts

The per-OS scripts live in `home-ai-setup/scripts/<os>/`. Run them in order on the client machine:

```text
01-runtime       # install Ollama, start service, auto-start on boot
02-models        # pull tier-matched models and smoke-test
03-harness       # install Kimi Code CLI and baseline config
04-skills-memory # seed skills and create memory/knowledge layout
05-privacy       # disable telemetry/cloud features
06-test-drive    # guided pre-handoff checks
```

Every script:

- Uses strict mode (`set -euo pipefail` or `$ErrorActionPreference = 'Stop'`).
- Is idempotent — safe to re-run.
- Has variables at the top.
- Echoes each action.
- Has a `--dry-run` (or `-DryRun` on Windows) flag that prints what it would do without changing the system.
- Contains no secrets.

Before the session, review the script and update the model picks in `02-models`. During the session, narrate each step.

### 5.1 macOS notes

`01-runtime` prefers Homebrew (`brew install --cask ollama`). If Homebrew is absent, it downloads the official macOS archive. Auto-start is handled by the Ollama app’s login item or `brew services`.

### 5.2 Windows notes

`01-runtime` uses `winget install --id Ollama.Ollama`. It configures the Ollama Windows service for auto-start and sets user-level environment variables.

### 5.3 Linux notes

`01-runtime` uses the official Ollama install script and a systemd override for loopback-only binding and privacy environment variables. It enables and starts the service.

---

## 6. Privacy pass

We leave the stack configured for local-first operation:

- **Ollama:** `OLLAMA_NO_CLOUD=1`, `OLLAMA_NOHISTORY=1`, `OLLAMA_HOST=127.0.0.1:11434`, and `~/.ollama/server.json` with `"disable_ollama_cloud": true`.
- **Kimi Code CLI:** `telemetry = false`, `disable_feedback_survey = true`, `auto_session_title = false`, `builtin_product_skills = false`, `tui.toml` `[upgrade] auto_install = false`, and `KIMI_DISABLE_TELEMETRY=1` set in the shell environment.
- **OS-level telemetry:** documented in the handoff notes; the client can follow their OS privacy guide if they want to go further.

---

## 7. Handoff conversation

Cover these points before ending the session:

- How to start the harness (`kimi` in a terminal, or from their launcher).
- How to switch models (`/model` or `-m <alias>`).
- Where models and config live, and how to back them up (`~/WebotHomeAI/backups/` and the backup steps in the test-drive script).
- Already-created skills are available; custom skill builds are the separately priced item.
- The family/multi-user profile we set up (if any).
- Power/thermals notes for always-on boxes.
- How to reach us for the 48-hour follow-up and the optional retainer.

---

## 8. Client post-session reference

### 8.1 What we installed

- Ollama local runtime, bound to `127.0.0.1:11434`.
- One or more local models pulled from the tier table.
- Kimi Code CLI, configured to use the local Ollama runtime by default.
- A starter skills set under your own skills directory.
- A home AI folder (`~/WebotHomeAI`) with memory, knowledge, projects, and backups.
- Privacy settings applied to Ollama and Kimi Code CLI.

### 8.2 Keeping it up to date

- **Models:** run the model-pull command again (`ollama pull <model>`) or re-run `02-models` after updating its model list. Older models are not deleted automatically.
- **Config:** back up `~/.kimi-code/config.toml`, `~/.kimi-code/tui.toml`, `~/.ollama/server.json`, and your `~/WebotHomeAI/backups/` folder before major changes.
- **Runtime:** Ollama updates can be installed with the same package manager used originally. Kimi Code CLI updates with `kimi upgrade` if you later enable updates, or via `npm install -g @moonshot-ai/kimi-code@latest`.

### 8.3 Removing the remote-access tool

After the job is complete, remove RustDesk from your machine:

- **macOS:** drag RustDesk from Applications to Trash, or run `brew uninstall --cask rustdesk` if installed via Homebrew.
- **Windows:** Settings → Apps → RustDesk → Uninstall.
- **Linux:** `sudo apt remove rustdesk` (Debian/Ubuntu) or the equivalent for your distribution.

If you keep RustDesk for future support sessions, open it only when you initiate a session and do not save our server key as a permanent contact.

### 8.4 If something breaks

1. Check that Ollama is running: `ollama ps` (or `ollama list`).
2. Check that the harness starts: `kimi --version`.
3. Re-run the numbered script for the broken layer; the scripts are idempotent.
4. Use the 48-hour follow-up or retainer channel for anything beyond a simple re-run.

---

## 9. Installer cross-check

Before leaving the session, verify against the approved plan section 4:

| Plan requirement | Where it lives in this runbook |
|------------------|--------------------------------|
| Runtime engine / model options / config | §4.3, §4.4, scripts `01-runtime`, `02-models` |
| Harness install / config | §4.5, script `03-harness` |
| Initial agent / harness setup (skills, memory, knowledge stores) | §4.6, script `04-skills-memory` |
| Auto-start on boot | §4.1, scripts `01-runtime` |
| Backup / update story | §4.1, §8.2 |
| Privacy pass (telemetry/cloud off) | §6, script `05-privacy` |
| Power / thermals sanity | §4.1, installer notes in `01-runtime` |
| Family / multi-user profile | §4.1, §7 |
| Guided test drive | §4.1, script `06-test-drive` |
| Remote-access teardown | §3, §8.3 |
| Custom workflows / custom skills out of scope | §4.2, §7 |

Any deviation should be recorded in the per-client handoff with a reason.
