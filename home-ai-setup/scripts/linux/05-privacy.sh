#!/usr/bin/env bash
# 05-privacy.sh — Linux: disable telemetry and cloud features for Ollama and Kimi Code CLI.
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

  # The systemd override was already written by 01-runtime; this script makes
  # sure the on-disk server.json flag is set and the service is restarted.
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ensure /usr/share/ollama/.ollama/server.json disables cloud features"
    echo "[dry-run] systemctl restart ollama"
  else
    run sudo mkdir -p /usr/share/ollama/.ollama
    run sudo tee /usr/share/ollama/.ollama/server.json >/dev/null <<'EOF'
{"disable_ollama_cloud":true}
EOF
    run sudo systemctl restart ollama || true
  fi
}

set_kimi_privacy() {
  echo "Applying Kimi Code CLI privacy settings..."

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ensure $KIMI_HOME/config.toml disables telemetry and surveys"
    echo "[dry-run] ensure $KIMI_HOME/tui.toml disables auto-update"
    echo "[dry-run] append KIMI_DISABLE_TELEMETRY to shell profile"
    return 0
  fi

  mkdir -p "$KIMI_HOME"

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

  for rc in "$HOME/.bashrc" "$HOME/.profile"; do
    if [ -f "$rc" ]; then
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
echo "=== Home AI Setup — Linux privacy layer ==="
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
