#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/publish-live.sh [--dry-run]
  scripts/publish-live.sh --confirm-live [--allow-dirty]

Options:
  --dry-run             Default. Run checks and live backups, but never push.
  --confirm-live        Permit the live publish action after all gates pass.
  --allow-dirty         Permit reviewed modified/staged files, but still block
                        untracked files in live mode.
  --allow-release-branch Permit a clean agency-launch-* branch that is exactly
                        one fast-forward release commit ahead of origin/master.
  --branch <name>       Required publish branch. Defaults to PUBLISH_BRANCH or master.
  --remote <name>       Git remote to push. Defaults to PUBLISH_REMOTE or origin.
  --poll-url <url>      Live URL to poll after publish. Defaults to https://webot.agency/.
  --screenshot-url <u>  URL to screenshot after publish. May be repeated.
  --skip-screenshots    Skip post-publish screenshot capture.
  -h, --help            Show this help.

This script is safe by default: without --confirm-live it cannot push.
USAGE
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

warn() {
  printf 'WARN: %s\n' "$*" >&2
}

info() {
  printf '==> %s\n' "$*"
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || die "Run from inside the webot-site git checkout."
cd "$repo_root"

project_name="webot-site"
backup_root="${BACKUP_ROOT:-$HOME/Backups/$project_name}"
warehouse_dir="${WAREHOUSE_DIR:-$HOME/.webot/warehouse/$project_name}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
pre_backup_dir="$backup_root/live-pre-publish-$timestamp"
post_backup_dir="$backup_root/live-post-publish-$timestamp"
screenshot_dir="$post_backup_dir/screenshots"

dry_run=1
confirm_live=0
allow_dirty=0
allow_release_branch=0
skip_screenshots=0
target_branch="${PUBLISH_BRANCH:-master}"
remote_name="${PUBLISH_REMOTE:-origin}"
poll_url="https://webot.agency/"
screenshot_urls=("https://webot.agency/" "https://webot.studio/")

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      confirm_live=0
      shift
      ;;
    --confirm-live)
      dry_run=0
      confirm_live=1
      shift
      ;;
    --allow-dirty)
      allow_dirty=1
      shift
      ;;
    --allow-release-branch)
      allow_release_branch=1
      shift
      ;;
    --branch)
      [[ $# -ge 2 ]] || die "--branch requires a value."
      target_branch="$2"
      shift 2
      ;;
    --remote)
      [[ $# -ge 2 ]] || die "--remote requires a value."
      remote_name="$2"
      shift 2
      ;;
    --poll-url)
      [[ $# -ge 2 ]] || die "--poll-url requires a value."
      poll_url="$2"
      shift 2
      ;;
    --screenshot-url)
      [[ $# -ge 2 ]] || die "--screenshot-url requires a value."
      screenshot_urls+=("$2")
      shift 2
      ;;
    --skip-screenshots)
      skip_screenshots=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

mode_label="DRY RUN"
if [[ "$confirm_live" -eq 1 ]]; then
  mode_label="LIVE PUBLISH"
fi

print_git_state() {
  printf 'Repository: %s\n' "$repo_root"
  printf 'Mode: %s\n' "$mode_label"
  printf 'Target branch: %s\n' "$target_branch"
  printf 'Remote: %s\n' "$remote_name"
  printf 'Remote URL: %s\n' "$(git remote get-url "$remote_name" 2>/dev/null || printf 'missing')"
  printf 'Current branch: %s\n' "$(git branch --show-current)"
}

record_metadata() {
  local dir="$1"
  mkdir -p "$dir"
  {
    date -u +"timestamp_utc=%Y-%m-%dT%H:%M:%SZ"
    printf 'repo=%s\n' "$repo_root"
    printf 'mode=%s\n' "$mode_label"
    printf 'target_branch=%s\n' "$target_branch"
    printf 'current_branch=%s\n' "$(git branch --show-current)"
    printf 'remote=%s\n' "$remote_name"
    printf 'remote_url=%s\n' "$(git remote get-url "$remote_name" 2>/dev/null || printf 'missing')"
    printf 'head=%s\n' "$(git rev-parse HEAD)"
    printf '\n## git status --short --branch\n'
    git status --short --branch
    printf '\n## git log -5 --oneline --decorate\n'
    git log -5 --oneline --decorate
  } > "$dir/git-metadata.txt"
}

check_branch_and_remote() {
  local current_branch remote_url
  current_branch="$(git branch --show-current)"
  if [[ "$current_branch" != "$target_branch" ]]; then
    [[ "$allow_release_branch" -eq 1 && "$current_branch" == agency-launch-* ]] || die "Current branch is '$current_branch', expected '$target_branch'."
    git fetch "$remote_name" "$target_branch"
    [[ "$(git rev-list --count "$remote_name/$target_branch..HEAD")" == 1 ]] || die "Release branch must be exactly one commit ahead of $remote_name/$target_branch."
    git merge-base --is-ancestor "$remote_name/$target_branch" HEAD || die "Release branch is not a fast-forward of $remote_name/$target_branch."
  fi
  remote_url="$(git remote get-url "$remote_name" 2>/dev/null || true)"
  [[ -n "$remote_url" ]] || die "Remote '$remote_name' is not configured."
}

print_changed_files() {
  local status
  status="$(git status --porcelain=v1)"
  if [[ -z "$status" ]]; then
    printf 'Working tree: clean\n'
  else
    printf 'Working tree has changes:\n'
    git status --short
  fi
}

check_git_cleanliness() {
  local status untracked
  status="$(git status --porcelain=v1)"
  if [[ -z "$status" ]]; then
    return 0
  fi

  print_changed_files
  if [[ "$allow_dirty" -ne 1 ]]; then
    if [[ "$dry_run" -eq 1 ]]; then
      warn "Dry-run continuing, but live publish would refuse this dirty tree without --allow-dirty."
      return 0
    fi
    die "Dirty working tree. Review changes first, or pass --allow-dirty after human approval."
  fi

  untracked="$(git ls-files --others --exclude-standard)"
  if [[ -n "$untracked" ]]; then
    printf 'Untracked files present:\n%s\n' "$untracked"
    if [[ "$dry_run" -eq 1 ]]; then
      warn "Dry-run continuing, but live publish would refuse untracked files even with --allow-dirty."
      return 0
    fi
    die "Untracked files are not publish-reviewed. Stage or remove them before live publish."
  fi
}

backup_live_pages() {
  mkdir -p "$pre_backup_dir"
  record_metadata "$pre_backup_dir"

  local -a urls=(
    "https://webot.agency/|index.html"
    "https://webot.agency/consultation.html|consultation.html"
    "https://webot.agency/success.html|success.html"
    "https://webot.agency/privacy.html|privacy.html"
  )

  info "Backing up current live pages to $pre_backup_dir"
  local pair url name out headers
  for pair in "${urls[@]}"; do
    url="${pair%%|*}"
    name="${pair#*|}"
    out="$pre_backup_dir/$name"
    headers="$pre_backup_dir/$name.headers"
    curl -fsSL --retry 2 --connect-timeout 10 --max-time 30 -D "$headers" "$url" -o "$out"
    [[ -s "$out" ]] || die "Backup file is missing or empty: $out"
    printf '  backed up %s -> %s (%s bytes)\n' "$url" "$out" "$(wc -c < "$out" | tr -d ' ')"
  done
}

snapshot_payment_links() {
  local out tmp entry file rest line url hash
  out="$pre_backup_dir/payment-link-snapshot.txt"
  tmp="$(mktemp)"
  rg -n -o "https://buy[.]stripe[.]com/[^\"' <)]+" -- "$repo_root"/*.html > "$tmp" 2>/dev/null || true
  {
    printf '# Protected payment-link snapshot\n'
    printf '# Values are hashed so the snapshot can be shared without exposing full checkout URLs.\n'
    if [[ ! -s "$tmp" ]]; then
      printf 'No matching checkout URLs found in root HTML files.\n'
    else
      while IFS= read -r entry; do
        file="${entry%%:*}"
        rest="${entry#*:}"
        line="${rest%%:*}"
        url="${rest#*:}"
        hash="$(printf '%s' "$url" | shasum -a 256 | awk '{print $1}')"
        printf '%s:%s checkout_url_sha256=%s\n' "${file#$repo_root/}" "$line" "$hash"
      done < "$tmp"
    fi
  } > "$out"
  rm -f "$tmp"
}

check_no_forbidden_term() {
  local bad_upper bad_lower search_paths tmp
  bad_upper="Paper""clip"
  bad_lower="paper""clip"
  search_paths=("$repo_root")
  if [[ -d "$warehouse_dir" ]]; then
    search_paths+=("$warehouse_dir")
  fi

  tmp="$(mktemp)"
  if rg -n "${bad_upper}|${bad_lower}" -- "${search_paths[@]}" > "$tmp" 2>/dev/null; then
    cat "$tmp"
    rm -f "$tmp"
    die "Forbidden term check failed."
  fi
  rm -f "$tmp"
}

check_core_files() {
  local -a required=(index.html consultation.html success.html privacy.html CNAME robots.txt sitemap.xml)
  local file
  for file in "${required[@]}"; do
    [[ -s "$repo_root/$file" ]] || die "Required core file is missing or empty: $file"
  done
}

run_sanity_checks() {
  info "Running pre-publish sanity checks"
  have_cmd rg || die "rg is required for sanity checks."
  check_core_files
  check_no_forbidden_term
  scripts/test-launch-surface.sh
  snapshot_payment_links
  printf '  core files: ok\n'
  printf '  forbidden term scan: ok\n'
  printf '  Agency/Studio launch surface browser proof: ok\n'
  printf '  payment-link hash snapshot: %s\n' "$pre_backup_dir/payment-link-snapshot.txt"
}

publish_live() {
  if [[ "$confirm_live" -ne 1 ]]; then
    info "Dry-run only: would run git push $remote_name $target_branch"
    return 0
  fi

  info "Publishing with git push $remote_name HEAD:$target_branch"
  git push "$remote_name" "HEAD:$target_branch"
}

hash_url() {
  local url="$1"
  curl -fsSL --connect-timeout 10 --max-time 30 "$url" | shasum -a 256 | awk '{print $1}'
}

hash_git_file() {
  local file="$1"
  git show "HEAD:$file" | shasum -a 256 | awk '{print $1}'
}

poll_live_update() {
  [[ "$confirm_live" -eq 1 ]] || return 0

  local expected actual attempt max_attempts sleep_seconds
  max_attempts="${PUBLISH_POLL_ATTEMPTS:-12}"
  sleep_seconds="${PUBLISH_POLL_SLEEP_SECONDS:-10}"
  expected="$(hash_git_file index.html)"

  info "Polling $poll_url until it matches HEAD:index.html"
  for ((attempt = 1; attempt <= max_attempts; attempt++)); do
    actual="$(hash_url "$poll_url" || true)"
    if [[ "$actual" == "$expected" ]]; then
      printf '  live root matches HEAD on attempt %s\n' "$attempt"
      return 0
    fi
    printf '  attempt %s/%s not updated yet; sleeping %ss\n' "$attempt" "$max_attempts" "$sleep_seconds"
    sleep "$sleep_seconds"
  done

  warn "Live root did not match HEAD:index.html within polling window. Check GitHub Pages status before announcing publish."
}

find_chrome() {
  if [[ -n "${CHROME_BIN:-}" && -x "${CHROME_BIN:-}" ]]; then
    printf '%s\n' "$CHROME_BIN"
    return 0
  fi

  local candidate
  for candidate in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    google-chrome-stable google-chrome chromium chromium-browser chrome; do
    if [[ "$candidate" == /* && -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
    if [[ "$candidate" != /* ]] && have_cmd "$candidate"; then
      command -v "$candidate"
      return 0
    fi
  done
  return 1
}

safe_name_for_url() {
  printf '%s' "$1" \
    | sed -E 's#^https?://##; s#/$##; s#[^A-Za-z0-9._-]+#-#g'
}

capture_screenshots() {
  [[ "$confirm_live" -eq 1 ]] || return 0
  [[ "$skip_screenshots" -ne 1 ]] || {
    warn "Skipping post-publish screenshots by request."
    return 0
  }

  local chrome url slug desktop mobile
  chrome="$(find_chrome || true)"
  if [[ -z "$chrome" ]]; then
    warn "Chrome/Chromium was not found; screenshots skipped."
    return 0
  fi

  mkdir -p "$screenshot_dir"
  record_metadata "$post_backup_dir"

  info "Capturing post-publish screenshots with $chrome"
  for url in "${screenshot_urls[@]}"; do
    slug="$(safe_name_for_url "$url")"
    desktop="$screenshot_dir/$slug-desktop.png"
    mobile="$screenshot_dir/$slug-mobile.png"
    "$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1200 --screenshot="$desktop" "$url" >/dev/null 2>&1 || warn "Desktop screenshot failed for $url"
    "$chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" --screenshot="$mobile" "$url" >/dev/null 2>&1 || warn "Mobile screenshot failed for $url"
    [[ -s "$desktop" ]] && printf '  desktop: %s\n' "$desktop"
    [[ -s "$mobile" ]] && printf '  mobile:  %s\n' "$mobile"
  done
}

print_next_steps() {
  printf '\nDone.\n'
  printf 'Pre-publish backup: %s\n' "$pre_backup_dir"
  printf 'Git metadata: %s\n' "$pre_backup_dir/git-metadata.txt"
  printf 'Payment snapshot: %s\n' "$pre_backup_dir/payment-link-snapshot.txt"
  if [[ "$confirm_live" -eq 1 && "$skip_screenshots" -ne 1 ]]; then
    printf 'Post-publish screenshots: %s\n' "$screenshot_dir"
  else
    printf 'Post-publish screenshots: not captured in dry-run mode.\n'
  fi
  if [[ "$confirm_live" -eq 1 ]]; then
    printf 'Next: review live desktop/mobile screenshots before telling humans the publish is approved.\n'
  else
    printf 'Next: get human screenshot approval, then rerun with --confirm-live when ready.\n'
  fi
}

main() {
  print_git_state
  check_branch_and_remote
  check_git_cleanliness
  backup_live_pages
  run_sanity_checks
  publish_live
  poll_live_update
  capture_screenshots
  print_next_steps
}

main "$@"
