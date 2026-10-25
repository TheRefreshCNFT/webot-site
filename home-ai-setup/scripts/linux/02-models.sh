#!/usr/bin/env bash
# 02-models.sh — Linux: pull tier-matched Ollama models and smoke-test.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables — refresh these picks at install time.
# -----------------------------------------------------------------------------
TIER="${TIER:-2}"

TIER1_MODELS=(qwen2.5:3b llama3.2:3b)
TIER2_MODELS=(qwen2.5:14b gemma3:12b mistral-small:22b)
TIER3_MODELS=(qwen2.5:32b qwen2.5-coder:32b)
TIER4_MODELS=(qwen2.5:72b llama3.1:70b)

SMOKE_PROMPT="Say hello in exactly one sentence."
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
models_for_tier() {
  case "$TIER" in
    1) echo "${TIER1_MODELS[@]}" ;;
    2) echo "${TIER2_MODELS[@]}" ;;
    3) echo "${TIER3_MODELS[@]}" ;;
    4) echo "${TIER4_MODELS[@]}" ;;
    *) echo "Invalid TIER: $TIER (must be 1-4)" >&2; exit 2 ;;
  esac
}

model_present() {
  local m="$1"
  if command -v ollama >/dev/null 2>&1; then
    ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$m"
  else
    return 1
  fi
}

pull_model() {
  local m="$1"
  if model_present "$m"; then
    echo "Model already present: $m"
  else
    echo "Pulling model: $m"
    run ollama pull "$m"
  fi
}

smoke_test() {
  local m="$1"
  echo "Smoke-testing model: $m"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ollama run $m '$SMOKE_PROMPT'"
    return 0
  fi
  timeout 300 ollama run "$m" "$SMOKE_PROMPT" || {
    echo "WARNING: smoke test failed for $m (timeout or error)." >&2
    return 1
  }
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — Linux model layer ==="
echo "TIER=$TIER"
echo "Models: $(models_for_tier)"
echo "DRY_RUN=$DRY_RUN"
echo ""

if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama command not found. Run 01-runtime.sh first." >&2
  exit 1
fi

if [ "$DRY_RUN" -eq 0 ]; then
  if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "WARNING: Ollama server not responding on 127.0.0.1:11434. Attempting to start..." >&2
    sudo systemctl start ollama || true
    sleep 3
  fi
fi

models=( $(models_for_tier) )
for m in "${models[@]}"; do
  pull_model "$m"
done

first_model="${models[0]}"
smoke_test "$first_model" || true

echo ""
echo "=== Model layer complete ==="
if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry-run: no changes were made)"
fi
