#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="${WEBOT_AGENT_RECOVERY_OUT:-$HOME/Backups/$PROJECT_NAME/subagent-stall-$STAMP}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/recover-subagent-stall.sh [agent-id ...]

Purpose:
  Create a bounded recovery snapshot when Codex subagent close/wait calls stall.
  This script intentionally does not call close_agent, wait_agent, archive,
  delete, kill, or any mutating Codex command. It exists so the main session can
  stop waiting on stale subagent handles and continue from a written checkpoint.

Inputs:
  agent-id args              Optional stale subagent IDs to record.
  WEBOT_STALE_AGENT_IDS      Optional space-separated IDs when args are omitted.
  WEBOT_AGENT_RECOVERY_OUT   Optional output directory override.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ids=("$@")
if [[ ${#ids[@]} -eq 0 && -n "${WEBOT_STALE_AGENT_IDS:-}" ]]; then
  # shellcheck disable=SC2206
  ids=(${WEBOT_STALE_AGENT_IDS})
fi

mkdir -p "$OUT_DIR"

{
  echo "subagent stall recovery snapshot"
  echo "created_utc=$STAMP"
  echo "project=$PROJECT_NAME"
  echo "repo=$ROOT_DIR"
  echo
  echo "stale_agent_ids:"
  if [[ ${#ids[@]} -eq 0 ]]; then
    echo "- none supplied"
  else
    for id in "${ids[@]}"; do
      echo "- $id"
    done
  fi
  echo
  echo "operator_note:"
  echo "Do not call wait_agent or close_agent on these stale handles from the main session."
  echo "If the subagent pool remains full, start a fresh Codex session and resume from handoffs."
  echo "This script is intentionally non-mutating so it cannot trap the active session."
} > "$OUT_DIR/README.txt"

if command -v codex >/dev/null 2>&1; then
  codex --version > "$OUT_DIR/codex-version.txt" 2>&1 || true
  codex doctor > "$OUT_DIR/codex-doctor.txt" 2>&1 || true
else
  echo "codex CLI not found on PATH" > "$OUT_DIR/codex-version.txt"
fi

git -C "$ROOT_DIR" status --short --branch > "$OUT_DIR/git-status.txt" 2>&1 || true

if [[ -d "$HOME/.codex/sessions" ]]; then
  {
    echo "Recent local session references for stale IDs."
    echo "This is read-only evidence from ~/.codex/sessions."
    echo
    if [[ ${#ids[@]} -eq 0 ]]; then
      echo "No IDs supplied; skipping targeted search."
    else
      for id in "${ids[@]}"; do
        echo "== $id =="
        rg -n --fixed-strings "$id" "$HOME/.codex/sessions" 2>/dev/null | tail -20 || true
        echo
      done
    fi
  } > "$OUT_DIR/session-references.txt"
fi

cat > "$OUT_DIR/next-step.txt" <<'NEXT'
Recommended recovery:
1. Continue the main work without waiting on the stale handles.
2. Keep this snapshot path in the handoff.
3. If spawning remains blocked, start a new Codex session and resume from:
   .handoffs/CURRENT_STATE.md
   ACTIVE_STATE.md
   .handoffs/WEBOT_PLATFORM_DELUXE_CONTINUATION_2026-06-28.md
NEXT

echo "Recovery snapshot written to: $OUT_DIR"
echo "No agent close/wait calls were made."
