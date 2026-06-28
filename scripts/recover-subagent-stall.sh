#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
OUT_DIR="${WEBOT_AGENT_RECOVERY_OUT:-$HOME/Backups/$PROJECT_NAME/subagent-stall-$STAMP}"
DIAGNOSTIC_TIMEOUT_SECONDS="${WEBOT_AGENT_RECOVERY_TIMEOUT_SECONDS:-8}"

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

run_bounded() {
  local outfile="$1"
  shift
  local tmpfile="$outfile.tmp"

  set +e
  perl -e '
    my $timeout = shift @ARGV;
    my @cmd = @ARGV;
    my $pid = fork();
    die "fork failed: $!\n" unless defined $pid;
    if ($pid == 0) {
      setpgrp(0, 0);
      exec @cmd;
      die "exec failed: $!\n";
    }
    my $elapsed = 0;
    while (1) {
      my $done = waitpid($pid, 1);
      if ($done == $pid) {
        exit(($? >> 8) || 0);
      }
      if ($elapsed >= $timeout) {
        kill "TERM", -$pid;
        select undef, undef, undef, 0.5;
        kill "KILL", -$pid;
        waitpid($pid, 0);
        exit 124;
      }
      sleep 1;
      $elapsed++;
    }
  ' "$DIAGNOSTIC_TIMEOUT_SECONDS" "$@" > "$tmpfile" 2>&1
  local status=$?
  set -e

  if [[ "$status" -eq 124 ]]; then
    {
      echo "Command timed out after ${DIAGNOSTIC_TIMEOUT_SECONDS}s: $*"
      echo
      cat "$tmpfile" 2>/dev/null || true
    } > "$outfile"
    rm -f "$tmpfile"
    return 0
  fi

  mv "$tmpfile" "$outfile"
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
  run_bounded "$OUT_DIR/codex-version.txt" codex --version
  run_bounded "$OUT_DIR/codex-doctor.txt" codex doctor
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
