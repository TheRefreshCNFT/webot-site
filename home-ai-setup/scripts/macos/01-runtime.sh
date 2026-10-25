#!/usr/bin/env bash
# 01-runtime.sh — macOS: install Ollama, bind to loopback, disable cloud features, start service.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables — update these per engagement if needed
# -----------------------------------------------------------------------------
OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11434}"
OLLAMA_ORIGINS="${OLLAMA_ORIGINS:-http://localhost,https://localhost,http://127.0.0.1,https://127.0.0.1}"
OLLAMA_DOWNLOAD_URL="${OLLAMA_DOWNLOAD_URL:-https://ollama.com/download/Ollama-darwin.zip}"
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
ensure_dir() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] mkdir -p $1"
  else
    mkdir -p "$1"
  fi
}

install_ollama() {
  if command -v ollama >/dev/null 2>&1; then
    echo "Ollama already installed: $(ollama --version 2>/dev/null || true)"
    return 0
  fi

  if command -v brew >/dev/null 2>&1; then
    echo "Installing Ollama via Homebrew..."
    run brew install --cask ollama
  else
    echo "Homebrew not found; downloading official Ollama macOS archive..."
    run curl -fsSL "$OLLAMA_DOWNLOAD_URL" -o /tmp/ollama-darwin.zip
    run unzip -o /tmp/ollama-darwin.zip -d /tmp/ollama-install
    run cp -R /tmp/ollama-install/Ollama.app /Applications/
  fi
}

configure_ollama() {
  echo "Configuring Ollama for loopback-only, no-cloud, no-history operation..."

  # Persist server.json
  ensure_dir "$HOME/.ollama"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] write $HOME/.ollama/server.json: {\"disable_ollama_cloud\": true}"
  else
    printf '{"disable_ollama_cloud":true}\n' > "$HOME/.ollama/server.json"
  fi

  # Set environment variables for the current session; the service plist / launch agent
  # will inherit them if launched from this shell. For persistence across reboots we
  # also append to the most common macOS shell profiles.
  run launchctl setenv OLLAMA_HOST "$OLLAMA_HOST" || true
  run launchctl setenv OLLAMA_NO_CLOUD 1 || true
  run launchctl setenv OLLAMA_NOHISTORY 1 || true
  run launchctl setenv OLLAMA_ORIGINS "$OLLAMA_ORIGINS" || true

  for rc in "$HOME/.zshenv" "$HOME/.bash_profile" "$HOME/.zshrc"; do
    if [ -f "$rc" ] || [ "$rc" = "$HOME/.zshenv" ]; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "[dry-run] append Ollama env exports to $rc"
      else
        {
          grep -q 'OLLAMA_HOST' "$rc" 2>/dev/null || cat >> "$rc" <<EOF

# Home AI Setup — Ollama privacy bindings
export OLLAMA_HOST="$OLLAMA_HOST"
export OLLAMA_NO_CLOUD=1
export OLLAMA_NOHISTORY=1
export OLLAMA_ORIGINS="$OLLAMA_ORIGINS"
EOF
        } || true
      fi
    fi
  done
}

start_ollama() {
  echo "Starting / restarting Ollama service..."
  if command -v brew >/dev/null 2>&1 && brew services list | grep -q '^ollama'; then
    run brew services restart ollama
  elif [ -d /Applications/Ollama.app ]; then
    # App mode: launch or restart the menubar app. It registers a login item for auto-start.
    run osascript -e 'quit app "Ollama"' || true
    run open -a Ollama
  else
    echo "WARNING: Ollama installed but no known start method; please start it manually." >&2
  fi
}

thermals_note() {
  echo ""
  echo "Power / thermals sanity check:"
  echo "  - If this is a laptop used as an always-on box, confirm it is plugged in and"
  echo "    set Energy Saver to prevent sleep when connected to power."
  echo "  - Ollama loads models into RAM/VRAM and can spin fans; leave the machine in a"
  echo "    ventilated space."
  echo "  - For Intel Macs, large models fall back to CPU and may thermal-throttle."
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — macOS runtime layer ==="
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
