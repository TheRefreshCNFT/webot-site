#!/usr/bin/env bash
# 01-runtime.sh — Linux: install Ollama, bind to loopback, disable cloud features, enable systemd service.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11434}"
OLLAMA_ORIGINS="${OLLAMA_ORIGINS:-http://localhost,https://localhost,http://127.0.0.1,https://127.0.0.1}"
INSTALL_SCRIPT_URL="${INSTALL_SCRIPT_URL:-https://ollama.com/install.sh}"
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
install_ollama() {
  if command -v ollama >/dev/null 2>&1; then
    echo "Ollama already installed: $(ollama --version 2>/dev/null || true)"
    return 0
  fi

  echo "Installing Ollama via official install script..."
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] curl -fsSL $INSTALL_SCRIPT_URL | sh"
  else
    curl -fsSL "$INSTALL_SCRIPT_URL" | sh
  fi
}

configure_ollama() {
  echo "Configuring Ollama for loopback-only, no-cloud, no-history operation..."

  # The official installer creates the ollama user and systemd service.
  # We override the service with environment variables.
  local override_dir="/etc/systemd/system/ollama.service.d"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] mkdir -p $override_dir"
    echo "[dry-run] write $override_dir/webot-home-ai.conf with OLLAMA_* env vars"
    echo "[dry-run] write /usr/share/ollama/.ollama/server.json with disable_ollama_cloud=true"
  else
    run sudo mkdir -p "$override_dir"
    run sudo tee "$override_dir/webot-home-ai.conf" >/dev/null <<EOF
[Service]
Environment="OLLAMA_HOST=$OLLAMA_HOST"
Environment="OLLAMA_NO_CLOUD=1"
Environment="OLLAMA_NOHISTORY=1"
Environment="OLLAMA_ORIGINS=$OLLAMA_ORIGINS"
EOF
    # Server.json lives under /usr/share/ollama/.ollama for the service user.
    run sudo mkdir -p /usr/share/ollama/.ollama
    run sudo tee /usr/share/ollama/.ollama/server.json >/dev/null <<'EOF'
{"disable_ollama_cloud":true}
EOF
    run sudo systemctl daemon-reload
  fi
}

start_ollama() {
  echo "Enabling and starting Ollama service..."
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] systemctl enable --now ollama"
  else
    run sudo systemctl enable --now ollama
  fi
}

thermals_note() {
  echo ""
  echo "Power / thermals sanity check:"
  echo "  - If this is an always-on box, disable sleep in your desktop environment or"
  echo "    via systemd/logind configuration."
  echo "  - Ensure the machine has adequate airflow; sustained model loading can run"
  echo "    CPU/GPU hot for long periods."
  echo "  - On laptops, keep the lid open or use clamshell mode with active cooling."
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — Linux runtime layer ==="
echo "OLLAMA_HOST=$OLLAMA_HOST"
echo "DRY_RUN=$DRY_RUN"
echo ""

install_ollama
configure_ollama
start_ollama
thermals_note

echo ""
echo "=== Runtime layer complete ==="
if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry-run: no changes were made)"
fi
