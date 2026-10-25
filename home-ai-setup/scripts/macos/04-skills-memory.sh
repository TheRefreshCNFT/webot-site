#!/usr/bin/env bash
# 04-skills-memory.sh — macOS: seed skills and create memory/knowledge layout.
set -euo pipefail

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_DIR="${SEED_DIR:-$SCRIPT_DIR/../../seed-skills}"
AGENTS_TEMPLATE="${AGENTS_TEMPLATE:-$SCRIPT_DIR/../../client-template/AGENTS.md}"
SKILLS_HOME="${SKILLS_HOME:-$HOME/.agents/skills}"
KIMI_SKILLS_HOME="${KIMI_SKILLS_HOME:-$HOME/.kimi-code/skills}"
HOME_AI_ROOT="${HOME_AI_ROOT:-$HOME/WebotHomeAI}"
DRY_RUN=0

# Seed skills to copy. Add or remove skills here; do not reference internal source paths.
SEED_SKILLS=(capture fast help home-ai-baseline verify-work)

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
copy_skill() {
  local name="$1"
  local src="$SEED_DIR/$name"
  if [ ! -d "$src" ]; then
    echo "ERROR: seed skill not found: $src" >&2
    return 1
  fi

  for dest_root in "$SKILLS_HOME" "$KIMI_SKILLS_HOME"; do
    local dest="$dest_root/$name"
    if [ -d "$dest" ]; then
      echo "Skill already exists: $dest (skipping)"
    else
      run mkdir -p "$dest_root"
      run cp -R "$src" "$dest"
    fi
  done
}

create_memory_layout() {
  echo "Creating home AI memory and knowledge layout under $HOME_AI_ROOT..."
  for dir in "$HOME_AI_ROOT/memory/seeds" "$HOME_AI_ROOT/knowledge/notes" "$HOME_AI_ROOT/knowledge/documents" "$HOME_AI_ROOT/projects" "$HOME_AI_ROOT/backups"; do
    run mkdir -p "$dir"
  done

  # Create an empty quick-capture inbox if it does not exist.
  if [ "$DRY_RUN" -eq 0 ] && [ ! -f "$HOME_AI_ROOT/memory/inbox.md" ]; then
    printf '# Inbox\n\n' > "$HOME_AI_ROOT/memory/inbox.md"
  elif [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] ensure $HOME_AI_ROOT/memory/inbox.md exists"
  fi

  # Copy the project AGENTS.md baseline.
  if [ -f "$AGENTS_TEMPLATE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "[dry-run] cp $AGENTS_TEMPLATE $HOME_AI_ROOT/AGENTS.md"
    elif [ ! -f "$HOME_AI_ROOT/AGENTS.md" ]; then
      run cp "$AGENTS_TEMPLATE" "$HOME_AI_ROOT/AGENTS.md"
    else
      echo "Project AGENTS.md already exists: $HOME_AI_ROOT/AGENTS.md (skipping)"
    fi
  else
    echo "WARNING: AGENTS.md template not found at $AGENTS_TEMPLATE" >&2
  fi
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
echo "=== Home AI Setup — macOS skills & memory layer ==="
echo "SEED_DIR=$SEED_DIR"
echo "SKILLS_HOME=$SKILLS_HOME"
echo "HOME_AI_ROOT=$HOME_AI_ROOT"
echo "DRY_RUN=$DRY_RUN"
echo ""

for skill in "${SEED_SKILLS[@]}"; do
  copy_skill "$skill"
done

create_memory_layout

echo ""
echo "=== Skills & memory layer complete ==="
if [ "$DRY_RUN" -eq 1 ]; then
  echo "(dry-run: no changes were made)"
fi
