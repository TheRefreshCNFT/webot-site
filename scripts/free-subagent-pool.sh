#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="${WEBOT_FREE_SUBAGENT_POOL_OUT:-$HOME/Backups/$PROJECT_NAME/free-subagent-pool-$STAMP}"
STATE_DIR="${WEBOT_STALE_SUBAGENT_STATE_DIR:-$HOME/.webot/stale-subagents}"
STATE_FILE="${WEBOT_STALE_SUBAGENT_STATE_FILE:-$STATE_DIR/$PROJECT_NAME.tsv}"
CONFIRM_KILL=0
DRY_RUN=0
ALL_STALE=0
REASON="free-subagent-pool"

usage() {
  cat <<'USAGE'
Usage:
  scripts/free-subagent-pool.sh [options] [agent-id ...]

Options:
  --confirm-kill       Send TERM/KILL to safe local process candidates.
  --dry-run            Write reports only; never send signals or append markers.
  --all-stale          Include IDs recorded in ~/.webot/stale-subagents/.
  --reason TEXT        Reason recorded for newly supplied IDs.
  -h, --help           Show this help.

Purpose:
  One-command cleanup for stale Codex subagent handles.

  This wrapper:
    1. records newly supplied agent IDs as stale breadcrumbs;
    2. writes a bounded recovery snapshot;
    3. runs local process cleanup for supplied and/or recorded stale IDs;
    4. reports whether anything local was killed.

Safety contract:
  - Does not call close_agent, wait_agent, archive, delete, or agent APIs.
  - Does not kill broad "codex" processes by name.
  - Only kills local OS processes whose command line contains a stale agent ID.
  - Delegates signal safety checks to scripts/kill-stale-subagents.sh.
  - Requires --confirm-kill before any signal is sent.

Examples:
  scripts/free-subagent-pool.sh --all-stale --confirm-kill
  scripts/free-subagent-pool.sh --confirm-kill 019f0f49-dc28-7360-b8d4-0920c9028237
  WEBOT_STALE_AGENT_IDS="id1 id2" scripts/free-subagent-pool.sh --confirm-kill

Note:
  If the report says no local process matched, the slot is held by the Codex
  tool runtime rather than a process this shell can terminate. In that case,
  keep working without subagents or start a fresh Codex session from handoffs.
USAGE
}

ids=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --confirm-kill)
      CONFIRM_KILL=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --all-stale)
      ALL_STALE=1
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

recorded_ids=()
if [[ "$ALL_STALE" -eq 1 && -f "$STATE_FILE" ]]; then
  while IFS=$'\t' read -r _created _project _repo _reason agent_id; do
    [[ -z "${agent_id:-}" || "$agent_id" == "agent_id" ]] && continue
    recorded_ids+=("$agent_id")
  done < "$STATE_FILE"
fi

combined_ids=()
if [[ ${#ids[@]} -gt 0 ]]; then
  combined_ids+=("${ids[@]}")
fi
if [[ ${#recorded_ids[@]} -gt 0 ]]; then
  combined_ids+=("${recorded_ids[@]}")
fi
unique_ids=()
for id in "${combined_ids[@]}"; do
  [[ -z "$id" ]] && continue
  seen=0
  if [[ ${#unique_ids[@]} -gt 0 ]]; then
    for existing in "${unique_ids[@]}"; do
      [[ "$existing" == "$id" ]] && seen=1
    done
  fi
  [[ "$seen" -eq 0 ]] && unique_ids+=("$id")
done

if [[ ${#unique_ids[@]} -eq 0 ]]; then
  echo "No agent IDs supplied or recorded. Use --all-stale or pass IDs." >&2
  usage >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

{
  echo "free subagent pool report"
  echo "created_utc=$STAMP"
  echo "project=$PROJECT_NAME"
  echo "repo=$ROOT_DIR"
  echo "state_file=$STATE_FILE"
  echo "confirm_kill=$CONFIRM_KILL"
  echo "dry_run=$DRY_RUN"
  echo "all_stale=$ALL_STALE"
  echo
  echo "agent_ids:"
  for id in "${unique_ids[@]}"; do
    echo "- $id"
  done
} > "$OUT_DIR/README.txt"

git -C "$ROOT_DIR" status --short --branch > "$OUT_DIR/git-status.txt" 2>&1 || true

if [[ ${#ids[@]} -gt 0 ]]; then
  marker_dir="$OUT_DIR/stale-marker"
  marker_args=("--reason" "$REASON")
  if [[ "$DRY_RUN" -eq 1 ]]; then
    marker_args+=("--dry-run")
  fi
  WEBOT_STALE_SUBAGENT_OUT="$marker_dir" \
    "$ROOT_DIR/scripts/mark-stale-subagent.sh" --no-snapshot "${marker_args[@]}" "${ids[@]}" \
    > "$OUT_DIR/mark-stale-subagent.txt" 2>&1 || {
      {
        echo "mark-stale-subagent.sh failed; continuing to bounded cleanup."
        echo
        cat "$OUT_DIR/mark-stale-subagent.txt" 2>/dev/null || true
      } > "$OUT_DIR/mark-stale-subagent.failed.txt"
    }
fi

WEBOT_AGENT_RECOVERY_OUT="$OUT_DIR/recovery-snapshot" \
  WEBOT_AGENT_RECOVERY_TIMEOUT_SECONDS="${WEBOT_AGENT_RECOVERY_TIMEOUT_SECONDS:-5}" \
  "$ROOT_DIR/scripts/recover-subagent-stall.sh" "${unique_ids[@]}" \
  > "$OUT_DIR/recover-subagent-stall.txt" 2>&1 || {
    {
      echo "recover-subagent-stall.sh failed; continuing to local kill scan."
      echo
      cat "$OUT_DIR/recover-subagent-stall.txt" 2>/dev/null || true
    } > "$OUT_DIR/recover-subagent-stall.failed.txt"
  }

kill_args=()
if [[ "$ALL_STALE" -eq 1 ]]; then
  kill_args+=("--all-stale")
fi
if [[ "$DRY_RUN" -eq 1 ]]; then
  kill_args+=("--dry-run")
elif [[ "$CONFIRM_KILL" -eq 1 ]]; then
  kill_args+=("--confirm-kill")
fi

WEBOT_KILL_SUBAGENT_OUT="$OUT_DIR/local-kill-scan" \
  "$ROOT_DIR/scripts/kill-stale-subagents.sh" "${kill_args[@]}" "${unique_ids[@]}" \
  > "$OUT_DIR/kill-stale-subagents.txt" 2>&1

cat > "$OUT_DIR/next-step.txt" <<'NEXT'
Interpretation:
- If local-kill-scan/action.txt says local matching processes were terminated,
  retry subagent creation once.
- If it says no local matching process command lines matched, the remaining
  pool lock is held by the Codex tool runtime and cannot be killed safely from
  this repo shell. Continue without subagents or start a fresh Codex session
  from the handoff files.
NEXT

echo "Free-subagent-pool report written to: $OUT_DIR"
echo "Kill scan summary:"
sed -n '1,8p' "$OUT_DIR/kill-stale-subagents.txt"
