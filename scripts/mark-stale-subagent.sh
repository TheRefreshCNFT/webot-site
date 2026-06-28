#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="${WEBOT_STALE_SUBAGENT_OUT:-$HOME/Backups/$PROJECT_NAME/stale-subagent-$STAMP}"
STATE_DIR="${WEBOT_STALE_SUBAGENT_STATE_DIR:-$HOME/.webot/stale-subagents}"
STATE_FILE="${WEBOT_STALE_SUBAGENT_STATE_FILE:-$STATE_DIR/$PROJECT_NAME.tsv}"
SNAPSHOT=1
DRY_RUN=0
REASON="close-or-wait-stalled"

usage() {
  cat <<'USAGE'
Usage:
  scripts/mark-stale-subagent.sh [options] <agent-id> [agent-id ...]

Options:
  --dry-run          Validate inputs and write only the backup report.
  --no-snapshot      Do not call scripts/recover-subagent-stall.sh.
  --reason TEXT      Short reason to record. Default: close-or-wait-stalled.
  -h, --help         Show this help.

Purpose:
  Mark subagent handles as stale without touching the agent runtime. This is a
  recovery breadcrumb for cases where close/wait is stuck and the main Codex
  session should continue.

Safety contract:
  - Does not call wait_agent, close_agent, archive, delete, or any agent API.
  - Does not kill processes.
  - Writes a timestamped report under ~/Backups/<project>/.
  - Appends a local TSV marker under ~/.webot/stale-subagents/ unless --dry-run.

Inputs:
  agent-id args              One or more stale subagent IDs.
  WEBOT_STALE_AGENT_IDS      Optional space-separated IDs when args are omitted.
USAGE
}

ids=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --no-snapshot)
      SNAPSHOT=0
      shift
      ;;
    --reason)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --reason" >&2
        exit 2
      fi
      REASON="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      ids+=("$1")
      shift
      ;;
  esac
done

if [[ ${#ids[@]} -eq 0 && -n "${WEBOT_STALE_AGENT_IDS:-}" ]]; then
  # shellcheck disable=SC2206
  ids=(${WEBOT_STALE_AGENT_IDS})
fi

if [[ ${#ids[@]} -eq 0 ]]; then
  echo "No stale agent IDs supplied." >&2
  usage >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

{
  echo "stale subagent marker"
  echo "created_utc=$STAMP"
  echo "project=$PROJECT_NAME"
  echo "repo=$ROOT_DIR"
  echo "reason=$REASON"
  echo "dry_run=$DRY_RUN"
  echo
  echo "stale_agent_ids:"
  for id in "${ids[@]}"; do
    echo "- $id"
  done
  echo
  echo "safety_contract:"
  echo "- no wait_agent call"
  echo "- no close_agent call"
  echo "- no agent runtime mutation"
  echo "- no process kill"
  echo
  echo "resume_note:"
  echo "Treat these handles as stale breadcrumbs. Continue the main work from"
  echo ".handoffs/CURRENT_STATE.md, ACTIVE_STATE.md, and the latest task handoff."
} > "$OUT_DIR/README.txt"

{
  echo "created_utc	project	repo	reason	agent_id"
  for id in "${ids[@]}"; do
    printf '%s\t%s\t%s\t%s\t%s\n' "$STAMP" "$PROJECT_NAME" "$ROOT_DIR" "$REASON" "$id"
  done
} > "$OUT_DIR/stale-subagents.tsv"

git -C "$ROOT_DIR" status --short --branch > "$OUT_DIR/git-status.txt" 2>&1 || true

if [[ "$SNAPSHOT" -eq 1 && -x "$ROOT_DIR/scripts/recover-subagent-stall.sh" ]]; then
  SNAPSHOT_DIR="$OUT_DIR/recovery-snapshot"
  WEBOT_AGENT_RECOVERY_OUT="$SNAPSHOT_DIR" \
    WEBOT_AGENT_RECOVERY_TIMEOUT_SECONDS="${WEBOT_AGENT_RECOVERY_TIMEOUT_SECONDS:-5}" \
    "$ROOT_DIR/scripts/recover-subagent-stall.sh" "${ids[@]}" > "$OUT_DIR/recovery-command.txt" 2>&1 || {
      {
        echo "recover-subagent-stall.sh returned non-zero."
        echo "This marker remains valid because recovery snapshots are best-effort."
      } >> "$OUT_DIR/recovery-command.txt"
    }
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  mkdir -p "$STATE_DIR"
  for id in "${ids[@]}"; do
    printf '%s\t%s\t%s\t%s\t%s\n' "$STAMP" "$PROJECT_NAME" "$ROOT_DIR" "$REASON" "$id" >> "$STATE_FILE"
  done
fi

cat > "$OUT_DIR/next-step.txt" <<'NEXT'
Next step:
Keep moving in the main Codex session. Do not wait on or close the stale
handles from this session. If the subagent pool remains unusable, start a fresh
session and resume from the handoff files.
NEXT

echo "Stale subagent marker written to: $OUT_DIR"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run: no persistent marker was appended."
else
  echo "Persistent marker appended to: $STATE_FILE"
fi
echo "No agent close/wait/runtime calls were made."
