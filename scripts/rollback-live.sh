#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

usage() {
  cat <<'USAGE'
Usage:
  scripts/rollback-live.sh --target-commit <pre-publish-origin-master> --dry-run
  scripts/rollback-live.sh --target-commit <pre-publish-origin-master> --execute --confirm-rollback

Creates a normal rollback commit for the public Agency files and publishes it
through git. It never force-pushes or edits GitHub Pages directly.
USAGE
}

target=""
execute=0
confirm=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-commit) target="${2:-}"; shift 2 ;;
    --dry-run) execute=0; shift ;;
    --execute) execute=1; shift ;;
    --confirm-rollback) confirm=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ "$target" =~ ^[0-9a-f]{40}$ ]] || { echo "A full --target-commit is required." >&2; exit 2; }
[[ -z "$(git status --porcelain)" ]] || { echo "Refusing rollback from a dirty worktree." >&2; exit 2; }
[[ "$(git branch --show-current)" == "master" ]] || { echo "Refusing rollback outside master." >&2; exit 2; }

git fetch origin master
current="$(git rev-parse HEAD)"
[[ "$current" == "$(git rev-parse origin/master)" ]] || { echo "Local master must match origin/master." >&2; exit 2; }
git cat-file -e "$target^{commit}"
git merge-base --is-ancestor "$target" "$current" || { echo "Rollback target is not an ancestor." >&2; exit 2; }
[[ "$target" != "$current" ]] || { echo "Target is already current." >&2; exit 2; }

payment_hashes() {
  git grep -h -o 'https://buy[.]stripe[.]com/[^"< ]*' "$1" -- '*.html' | sort -u | shasum -a 256 | awk '{print $1}'
}
[[ "$(payment_hashes "$current")" == "$(payment_hashes "$target")" ]] || {
  echo "Refusing rollback because protected payment links differ." >&2
  exit 2
}

echo "Current release: $current"
echo "Rollback target: $target"
if [[ "$execute" -ne 1 ]]; then
  echo "DRY RUN PASS. Re-run with --execute --confirm-rollback."
  exit 0
fi
[[ "$confirm" -eq 1 ]] || { echo "Execution also requires --confirm-rollback." >&2; exit 2; }

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup="$HOME/Backups/webot-site/rollback-$stamp"
install -d -m 700 "$backup"
git bundle create "$backup/current-origin-master.bundle" origin/master
git bundle verify "$backup/current-origin-master.bundle" >/dev/null
chmod 600 "$backup/current-origin-master.bundle"

git restore --source="$target" --staged --worktree -- \
  ':(glob)*.html' ':(glob)assets/**' CNAME robots.txt sitemap.xml llms.txt .nojekyll \
  ':(glob)favicon*' apple-touch-icon.png
[[ -n "$(git diff --cached --name-only)" ]] || { echo "Rollback produced no public changes." >&2; exit 1; }
git diff --cached --check
git commit -m "rollback: restore Agency public release $(printf '%.12s' "$target")"
scripts/publish-live.sh --confirm-live
echo "PASS rollback published through guarded script; recovery bundle: $backup/current-origin-master.bundle"
