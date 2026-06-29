#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="${WEBOT_KILL_SUBAGENT_OUT:-$HOME/Backups/$PROJECT_NAME/kill-stale-subagents-$STAMP}"
STATE_DIR="${WEBOT_STALE_SUBAGENT_STATE_DIR:-$HOME/.webot/stale-subagents}"
STATE_FILE="${WEBOT_STALE_SUBAGENT_STATE_FILE:-$STATE_DIR/$PROJECT_NAME.tsv}"
TERM_GRACE_SECONDS="${WEBOT_KILL_SUBAGENT_TERM_GRACE_SECONDS:-3}"
CONFIRM_KILL=0
DRY_RUN=0
KILL_ALL_STALE=0

usage() {
  cat <<'USAGE'
Usage:
  scripts/kill-stale-subagents.sh [options] <agent-id> [agent-id ...]

Options:
  --confirm-kill       Actually send TERM/KILL to matching safe process IDs.
  --dry-run            Only report what would be killed.
  --all-stale          Include agent IDs recorded in ~/.webot/stale-subagents.
  -h, --help           Show this help.

Purpose:
  Clear stale Codex subagent handles without risking the active Codex session.
  The script can only kill local OS processes whose command line contains one
  of the supplied agent IDs. It refuses to kill its own process, parent shell,
  or any ancestor process of the current run.

Safety:
  - Does not call close_agent or wait_agent, because those calls can block.
  - Does not kill broad "codex" processes by name.
  - Requires --confirm-kill before sending signals.
  - Writes a backup/report under ~/Backups/<project>/.

Note:
  Some hosted subagent slots are tool-runtime handles, not local processes. If
  no matching process is found, this script records the stale IDs and exits
  cleanly; freeing the remote slot may still require a fresh Codex session.
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
      KILL_ALL_STALE=1
      shift
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

if [[ "$KILL_ALL_STALE" -eq 1 && -f "$STATE_FILE" ]]; then
  while IFS=$'\t' read -r _created _project _repo _reason agent_id; do
    [[ -z "${agent_id:-}" || "$agent_id" == "agent_id" ]] && continue
    ids+=("$agent_id")
  done < "$STATE_FILE"
fi

if [[ ${#ids[@]} -eq 0 ]]; then
  echo "No agent IDs supplied or recorded." >&2
  usage >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

unique_ids=()
for id in "${ids[@]}"; do
  [[ -z "$id" ]] && continue
  seen=0
  if [[ ${#unique_ids[@]} -gt 0 ]]; then
    for existing in "${unique_ids[@]}"; do
      [[ "$existing" == "$id" ]] && seen=1
    done
  fi
  [[ "$seen" -eq 0 ]] && unique_ids+=("$id")
done

ancestor_pids=()
pid="$$"
while [[ -n "$pid" && "$pid" != "0" ]]; do
  ancestor_pids+=("$pid")
  pid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)"
done

is_ancestor_pid() {
  local candidate="$1"
  for ancestor in "${ancestor_pids[@]}"; do
    [[ "$candidate" == "$ancestor" ]] && return 0
  done
  return 1
}

contains_agent_id() {
  local command="$1"
  for id in "${unique_ids[@]}"; do
    [[ "$command" == *"$id"* ]] && return 0
  done
  return 1
}

matching_pids=()
process_report="$OUT_DIR/process-scan.tsv"
{
  echo -e "decision\tpid\tppid\tcommand"
  while IFS= read -r line; do
    proc_pid="$(awk '{print $1}' <<< "$line")"
    proc_ppid="$(awk '{print $2}' <<< "$line")"
    proc_cmd="${line#"$proc_pid $proc_ppid "}"

    if ! contains_agent_id "$proc_cmd"; then
      continue
    fi

    if [[ "$proc_cmd" == *"kill-stale-subagents.sh"* ]]; then
      echo -e "skip-cleanup-script\t$proc_pid\t$proc_ppid\t$proc_cmd"
      continue
    fi

    if is_ancestor_pid "$proc_pid"; then
      echo -e "skip-active-ancestor\t$proc_pid\t$proc_ppid\t$proc_cmd"
      continue
    fi

    matching_pids+=("$proc_pid")
    echo -e "kill-candidate\t$proc_pid\t$proc_ppid\t$proc_cmd"
  done < <(ps -axo pid=,ppid=,command=)
} > "$process_report"

{
  echo "stale subagent kill report"
  echo "created_utc=$STAMP"
  echo "project=$PROJECT_NAME"
  echo "repo=$ROOT_DIR"
  echo "confirm_kill=$CONFIRM_KILL"
  echo "dry_run=$DRY_RUN"
  echo
  echo "agent_ids:"
  for id in "${unique_ids[@]}"; do
    echo "- $id"
  done
  echo
  echo "active_ancestor_pids:"
  for ancestor in "${ancestor_pids[@]}"; do
    echo "- $ancestor"
  done
  echo
  echo "process_report=$process_report"
} > "$OUT_DIR/README.txt"

git -C "$ROOT_DIR" status --short --branch > "$OUT_DIR/git-status.txt" 2>&1 || true

if [[ ${#matching_pids[@]} -eq 0 ]]; then
  {
    echo "No local process command lines matched the supplied stale agent IDs."
    echo "The subagent pool may be held by the Codex tool runtime rather than a local process."
  } > "$OUT_DIR/action.txt"
  echo "No local matching subagent processes found."
  echo "Report written to: $OUT_DIR"
  exit 0
fi

if [[ "$DRY_RUN" -eq 1 || "$CONFIRM_KILL" -eq 0 ]]; then
  {
    echo "Kill candidates found, but no signals were sent."
    echo "Run again with --confirm-kill to terminate these candidate PIDs:"
    printf '%s\n' "${matching_pids[@]}"
  } > "$OUT_DIR/action.txt"
  echo "Kill candidates found; no signals sent."
  echo "Report written to: $OUT_DIR"
  exit 0
fi

{
  echo "Sending TERM to candidate PIDs:"
  printf '%s\n' "${matching_pids[@]}"
} > "$OUT_DIR/action.txt"

kill -TERM "${matching_pids[@]}" 2>> "$OUT_DIR/action.txt" || true
sleep "$TERM_GRACE_SECONDS"

still_running=()
for proc_pid in "${matching_pids[@]}"; do
  if kill -0 "$proc_pid" 2>/dev/null; then
    still_running+=("$proc_pid")
  fi
done

if [[ ${#still_running[@]} -gt 0 ]]; then
  {
    echo
    echo "Sending KILL to PIDs still running after ${TERM_GRACE_SECONDS}s:"
    printf '%s\n' "${still_running[@]}"
  } >> "$OUT_DIR/action.txt"
  kill -KILL "${still_running[@]}" 2>> "$OUT_DIR/action.txt" || true
fi

echo "Terminated local matching subagent process candidates."
echo "Report written to: $OUT_DIR"
