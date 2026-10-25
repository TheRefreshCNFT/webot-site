#!/usr/bin/env bash
# 05-privacy.sh — macOS: disable telemetry and cloud features for Ollama and Kimi Code CLI.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
KIMI_HOME="${KIMI_CODE_HOME:-$HOME/.kimi-code}"
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
set_ollama_privacy() {
  echo "Applying Ollama privacy settings..."

  run mkdir -p "$HOME/.ollama"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] write $HOME/.ollama/server.json with disable_ollama_cloud=true"
  else
    printf '{"disable_ollama_cloud":true}\n' > "$HOME/.ollama/server.json"
  fi

  # Make sure environment variables are set in the current session and in
  # common shell profiles so they survive reboots.
  run launchctl setenv OLLAMA_NO_CLOUD 1 || true
  run launchctl setenv OLLAMA_NOHISTORY 1 || true

  for rc in "$HOME/.zshenv" "$HOME/.bash_profile" "$HOME/.zshrc"; do
    if [ -f "$rc" ] || [ "$rc" = "$HOME/.zshenv" ]; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "[dry-run] ensure OLLAMA_NO_CLOUD / OLLAMA_NOHISTORY are exported in $rc"
      else
        {
          grep -q 'OLLAMA_NO_CLOUD' "$rc" 2>/dev/null || cat >> "$rc" <<'EOF'

# Home AI Setup — Ollama privacy
export OLLAMA_NO_CLOUD=1
export OLLAMA_NOHISTORY=1
EOF
        } || true
      fi
    fi
  done
}

set_kimi_privacy() {
  echo "Applying Kimi Code CLI privacy settings..."

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ensure $KIMI_HOME/config.toml disables telemetry and surveys"
    echo "[dry-run] ensure $KIMI_HOME/tui.toml disables auto-update"
    return 0
  fi

  mkdir -p "$KIMI_HOME"

  # config.toml: flip privacy flags without touching the rest of the file.
  local cfg="$KIMI_HOME/config.toml"
  if [ -f "$cfg" ]; then
    sed -i.bak -e 's/^telemetry *= *true/telemetry = false/' \
               -e 's/^disable_feedback_survey *= *false/disable_feedback_survey = true/' \
               -e 's/^auto_session_title *= *true/auto_session_title = false/' \
               -e 's/^builtin_product_skills *= *true/builtin_product_skills = false/' "$cfg" || true
  else
    cat > "$cfg" <<'EOF'
telemetry = false
disable_feedback_survey = true
auto_session_title = false
builtin_product_skills = false
EOF
  fi

  # tui.toml: disable automatic updates.
  local tui="$KIMI_HOME/tui.toml"
  if [ -f "$tui" ]; then
    if grep -q '\[upgrade\]' "$tui"; then
      sed -i.bak -e 's/^auto_install *= *true/auto_install = false/' "$tui" || true
    else
      cat >> "$tui" <<'EOF'

[upgrade]
auto_install = false
EOF
    fi
  else
    cat > "$tui" <<'EOF'
[upgrade]
auto_install = false
EOF
  fi

  # Environment variable override.
  for rc in "$HOME/.zshenv" "$HOME/.bash_profile" "$HOME/.zshrc"; do
    if [ -f "$rc" ] || [ "$rc" = "$HOME/.zshenv" ]; then
      {
        grep -q 'KIMI_DISABLE_TELEMETRY' "$rc" 2>/dev/null || cat >> "$rc" <<'EOF'

# Home AI Setup — Kimi Code CLI telemetry off
export KIMI_DISABLE_TELEMETRY=1
EOF
      } || true
    fi
  done
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — macOS privacy layer ==="
echo "KIMI_HOME=$KIMI_HOME"
echo "DRY_RUN=$DRY_RUN"
echo ""

set_ollama_privacy
set_kimi_privacy

echo ""
echo "=== Privacy layer complete ==="
echo "  Ollama cloud features disabled, history disabled."
echo "  Kimi telemetry off, auto-surveys off, auto-updates off."
if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry-run: no changes were made)"
fi
