# Home AI Setup — research and plan

Date: 2026-10-25. Status: **research/planning only**. No product, copy, or infrastructure changes are authorized by this document. The owner wants this tackled as a fresh session after approving the plan.

## 1. The offer

Add a home-user side to WeBot Agency alongside the SMB lane: **Home AI Setup** — we install, configure, and hand off a private AI setup that runs on the client's own machine. Target buyers: home-lab enthusiasts, privacy-minded families, and power users who want a local assistant but do not want to assemble the stack themselves. Owner framing: "even easier to set up for people" — the whole market that can be serviced but is currently unserved by the business-focused copy.

Packaging follows the existing Studio distinction: a **one-time reviewed job** (consultation → spec → remote setup session(s) → handoff document → short follow-up), with an optional monthly check-in retainer. Pricing authority stays with the owner; the chat assistant must never quote prices.

## 2. Intake — the four qualifying questions (owner-specified)

The Home intake must capture, in the client's words:

1. **What are they trying to set up?** The vision: a chat assistant, a voice assistant, smart-home integration, a coding helper, a family knowledge base, etc.
2. **What are they trying to achieve?** The concrete outcome: "draft replies to my email," "control my lights by voice without a cloud," "help the kids with homework without their data leaving the house."
3. **How much do they already know?** None / can follow instructions / power user. This sets session length, handoff-document depth, and whether the session is teach-as-we-go or we-just-do-it.
4. **What device and specs will it run on?** OS, CPU, GPU + VRAM (or Apple Silicon unified memory), RAM, free storage, desktop vs. laptop vs. always-on box. This determines the model tier we propose.

Site shape (proposal): the consultation form gains a lane switch — tabs **Small/Medium Business** and **Home** — with the Home variant adding a skill-level select and a hardware-spec block on top of the existing name/email/summary/slot fields. The handoff module carries the lane so the booking summary and calendar event say which intake was used. Same 30-minute consultation rules; the four questions above map to the Home tab's summary guidance text.

## 3. Remote control session — researched, decision needed

Requirement: an easy remote connection that offers control of the user's session while we install and configure.

**LiveKit verdict: no (as deployed).** `livekit-townhall` on Oracle (host network, port 7880, TURN at `livekit.f5tw.art:3478`, config `/home/opc/livekit-townhall/livekit.yaml`) is a WebRTC SFU — media plus data channels. Remote control over it is a build-it-yourself project, not a product: LiveKit's own [cloud-gaming example](https://github.com/livekit-examples/cloud-gaming) pipes datachannel input into a virtual keyboard/mouse/gamepad inside a Linux container, and the [teleop example](https://github.com/livekit-examples/teleop) does the same for robots. There is no consent UI, no unattended/per-OS client, no session-code flow, and we would have to write and maintain the input-injection side for Windows, macOS, and Linux ourselves. Keep LiveKit for what it is doing (townhall).

**Recommendation: self-host RustDesk (hbbs/hbbr) on Oracle**, following the established pattern — docker containers on the `webot-net` network, Caddy fronting, Tailscale for administration. Clients install the stock RustDesk app, read us a session code, and approve control every session. That is the right consent model for home users: attended-only by default, no persistent passwords, nothing installed permanently on our side, and the client can watch everything we do.

| Option | Fit | Notes |
|---|---|---|
| **RustDesk self-hosted** (recommended) | Best | Matches existing infra pattern; Win/macOS/Linux/Android clients; attended session codes; we own the relay. |
| MeshCentral | Later, maybe | Full device-management platform (MSP-style). Right if WeBot ever manages fleets of client machines; heavier than needed for one-off setups. |
| Tailscale-only | Secondary channel | Already on the Mac and the server; ideal for headless/CLI work and for administering our own rigs, but gives no screen control of a client's machine. Use as a complement, not the product. |
| Chrome Remote Desktop | Fallback | Zero infra, but requires the client's Google account and grants persistent access; weaker consent story. Offer only if RustDesk cannot run. |

Security posture for control sessions (write into the runbook): attended-only, no stored credentials, client-visible session, a short work-log of actions taken, and explicit teardown/uninstall instructions for the client afterward.

## 4. The stack we install

Base setup scope (owner-listed): model options/download/config, harness install/config, runtime engine/config, initial agent setup, initial harness setup (skills, memory, knowledge stores), plus the standard items below. **Custom workflows and custom skills are explicitly out of base scope** — same category, scoped and priced separately per engagement.

- **Runtime engine:** Ollama by default (headless service, OpenAI-compatible API, one-command model pulls). LM Studio for clients who want a GUI. MLX path on Apple Silicon when the client is Mac-only.
- **Model selection by hardware tier** (current landscape, refresh picks at install time — the local-LLM market moves monthly; see the [VRAM tier guides](https://www.promptquorum.com/local-llms) and [Ollama rankings](https://www.morphllm.com/best-ollama-models)):
  - ~8 GB RAM: small 3–4B class (e.g. Qwen3.5-4B / Llama 3.2 3B class) — chat and light tasks.
  - 16 GB RAM or 12 GB VRAM: gpt-oss-20b / Gemma 4 12B / Qwen3-14B class — the mainstream sweet spot.
  - 24 GB VRAM or 32–36 GB unified memory: Qwen3.8-27B / qwen3-coder:30b class — serious local assistant.
  - Large unified-memory Macs: 70B+ tier.
  We present 2–3 options matched to the client's measured hardware, the client picks, we download and configure.
- **Harness:** Kimi Code CLI as the primary agent harness (free for the client, our proven shop tool). Alternatives (Claude Code, OpenClaw-class harnesses) offered where a client's goals fit them better.
- **Initial harness setup:** skills directory seeded from our existing proven skill set with the client's own copies, memory system configured, knowledge stores pointed at the client's documents/notes, and the project-convention files (AGENTS.md-style) established so future sessions with us — or their own tinkering — start from a sane baseline. "Already created skills are available; how to get more" is part of the handoff conversation; custom skill builds are the separately priced item.
- **Standard items to add beyond the owner list:** auto-start on boot; backup/update story for models and config; privacy pass (telemetry and cloud features off); power/thermals sanity check for always-on boxes; family/multi-user profile if children will use it; a guided test drive before handoff; teardown instructions for the remote-access tool.

## 5. Execution outline for the next session (after owner approval)

1. Approve plan, remote-tool choice (expected: RustDesk), and price points for the base job + optional retainer.
2. Stand up RustDesk hbbs/hbbr on Oracle (webot-net, Caddy, Tailscale-administered); rehearse Mac→Mac and Mac→Windows control sessions. The Windows desktop already on the tailnet (`desktop-49vp4rp`) is the natural fake-client rehearsal rig.
3. Site work: Home/SMB lane tabs on the consultation form, Home hardware/skill fields, handoff lane plumbing, chat knowledge v4 (Home lane at receptionist level — fit and outcome only, no methods), homepage/llms.txt copy for the new lane. Extend consultation and chat test harnesses with Home scenarios; run the full gate set; publish through `scripts/publish-live.sh`.
4. Build the reusable install runbook + per-OS setup scripts (runtime install, tier-matched model pulls, harness config, skills/memory/knowledge seed, privacy pass, test-drive checklist). This is the productized heart of the offer.
5. Dry-run the entire client journey end-to-end on the rehearsal rig with synthetic data; record proof artifacts.

## 6. Open questions for the owner

- RustDesk (attended-only, self-hosted) approved as the remote-control tool?
- Base-setup price point and retainer price point?
- Do we offer hardware advice/purchasing guidance (upsell path) or strictly software setup on hardware the client already owns?
- Is a family/multi-user (kids) profile inside the base job or an add-on?
- Tab naming: "Home" vs "Home Lab" vs "At Home"?

## Sources

- LiveKit remote-control reality: [livekit-examples/cloud-gaming](https://github.com/livekit-examples/cloud-gaming), [livekit-examples/teleop](https://github.com/livekit-examples/teleop)
- Self-hosted remote-support landscape: [ComputingForGeeks comparison](https://computingforgeeks.com/guacamole-vs-rustdesk-vs-meshcentral/), [OpenMSP MeshCentral review](https://www.openmsp.ai/blog/meshcentral-review), [OpenMSP MSP tools directory](https://www.openmsp.ai/blog/open-source-msp-tools-complete-directory-of)
- Local model tiers: [PromptQuorum VRAM tier list](https://www.promptquorum.com/local-llms), [Morph Ollama model rankings](https://www.morphllm.com/best-ollama-models), [daily.dev local LLM guide](https://daily.dev/blog/best-local-llm-models-run/)
- Home/voice ecosystem: [Home Assistant + local LLM guide](https://www.aitooldiscovery.com/how-to/home-assistant-local-llm), [local voice stack (Whisper/Piper/openWakeWord)](https://www.promptquorum.com/power-local-llm/voice-assistant-local-mobile-offline)
