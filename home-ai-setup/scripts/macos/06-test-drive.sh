#!/usr/bin/env bash
# 06-test-drive.sh — macOS: guided pre-handoff test drive.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
HOME_AI_ROOT="${HOME_AI_ROOT:-$HOME/WebotHomeAI}"
BACKUP_DIR="$HOME_AI_ROOT/backups/$(date +%Y%m%d-%H%M%S)"
SMOKE_PROMPT="Say hello in exactly one sentence."
AGENT_PROMPT="List the top-level files in $HOME_AI_ROOT and briefly describe what this home AI setup is for."
DRY_RUN=0

# -----------------------------------------------------------------------------
# Argument parsing
# -----------------------------------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] $*"
  else
    echo "+ $*"
    "$@"
  fi
}

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
checklist_item() {
  echo ""
  echo "[ ] $1"
}

chat_sanity() {
  checklist_item "Chat sanity: local model responds via Ollama"
  local model
  model="$(ollama list 2>/dev/null | awk 'NR==2{print $1; exit}')"
  if [ -z "$model" ]; then
    echo "  FAIL: no downloaded model found. Run 02-models.sh first." >&2
    return 1
  fi
  echo "  Using model: $model"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ollama run $model '$SMOKE_PROMPT'"
  else
    timeout 180 ollama run "$model" "$SMOKE_PROMPT" && echo "  PASS: model responded."
  fi
}

agent_task() {
  checklist_item "Agent task: harness starts and can read the project AGENTS.md"
  if ! command -v kimi >/dev/null 2>&1; then
    echo "  FAIL: kimi not found. Run 03-harness.sh first." >&2
    return 1
  fi
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] kimi -p '$AGENT_PROMPT'"
  else
    # Non-interactive single prompt; may take a moment on first run.
    timeout 180 kimi -p "$AGENT_PROMPT" || {
      echo "  FAIL: harness task did not complete." >&2
      return 1
    }
    echo "  PASS: harness completed a task."
  fi
}

restart_persistence() {
  checklist_item "Restart persistence: Ollama service is set to auto-start"
  if command -v brew >/dev/null 2>&1 && brew services list | grep -q '^ollama.*started'; then
    echo "  PASS: brew service reports ollama as started."
  elif [ -d /Applications/Ollama.app ] && pgrep -x Ollama >/dev/null 2>&1; then
    echo "  PASS: Ollama app is running (login item handles auto-start)."
  else
    echo "  NOTE: verify auto-start manually in System Settings > Login Items or via 'brew services'." >&2
  fi
}

backup_spot_check() {
  checklist_item "Backup / restore spot check: snapshot config to $BACKUP_DIR"
  run mkdir -p "$BACKUP_DIR"
  if [ -f "$HOME/.kimi-code/config.toml" ]; then
    run cp "$HOME/.kimi-code/config.toml" "$BACKUP_DIR/"
  fi
  if [ -f "$HOME/.ollama/server.json" ]; then
    run cp "$HOME/.ollama/server.json" "$BACKUP_DIR/"
  fi
  if command -v ollama >/dev/null 2>&1; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "[dry-run] ollama list > $BACKUP_DIR/ollama-models.txt"
    else
      ollama list > "$BACKUP_DIR/ollama-models.txt" || true
    fi
  fi
  echo "  PASS: backup snapshot created at $BACKUP_DIR"
}

family_profile_note() {
  checklist_item "Family / multi-user profile (if children use the machine)"
  echo "  Confirm with the client:"
  echo "    - Separate OS user accounts for children, or"
  echo "    - Restricted harness profile with limited skills/models."
  echo "  Record the chosen setup in the handoff notes."
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — macOS test drive ==="
echo "HOME_AI_ROOT=$HOME_AI_ROOT"
echo "DRY_RUN=$DRY_RUN"
echo ""
echo "Run through this checklist with the client before handing off."

chat_sanity || true
agent_task || true
restart_persistence
backup_spot_check
family_profile_note

echo ""
echo "=== Test drive complete ==="
if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry-run: no changes were made)"
fi
