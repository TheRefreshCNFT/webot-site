# Publish Live Runbook

Use `scripts/publish-live.sh` to publish GitHub Pages from `master` only after a human has approved the current screenshots and release scope.

## Approval Gate

Do not publish from a surprise working tree.

Before live publish:

1. Review local changes and screenshot the pages being shipped.
2. Get human approval for the screenshots and the exact publish scope.
3. Run the dry-run command and inspect the backup path.
4. Run the live command only with explicit approval.

## Current Validation Baseline

For the latest verified public-site and platform state, read
`.handoffs/CURRENT_STATE.md` first. That file owns the current evidence paths,
live status, and remaining hard gates.

Before any publish attempt, always refresh the local review:

```bash
git status --short --branch --untracked-files=all
git diff --check
scripts/test-itinerary-flow.sh
```

Use `scripts/test-itinerary-flow.sh --live` when validating live Agency/Studio
browser behavior after relevant public-site, Studio, itinerary, or dashboard
changes.

## Dry Run

```bash
cd /Users/webot/Projects/webot-site
scripts/publish-live.sh --dry-run
```

Dry-run mode:

- Prints branch, remote, and git status.
- Backs up the current live pages to `~/Backups/webot-site/live-pre-publish-<timestamp>/`.
- Saves git metadata and a hashed checkout-link snapshot.
- Runs local sanity checks.
- Does not push.

If the tree is dirty, dry-run reports that a live publish would be refused unless the changes are deliberately reviewed with `--allow-dirty`.

## Live Publish

```bash
cd /Users/webot/Projects/webot-site
scripts/publish-live.sh --confirm-live
```

If reviewed local changes are expected:

```bash
scripts/publish-live.sh --confirm-live --allow-dirty
```

Live mode:

- Requires the current branch to match `master` unless explicitly overridden.
- Requires a configured remote, defaulting to `origin`.
- Refuses untracked files even when `--allow-dirty` is passed.
- Backs up current live HTML before pushing.
- Runs `git push origin master`.
- Polls the live root gently.
- Captures desktop and mobile screenshots for `webot.agency` and `webot.studio` when Chrome is available.

## Backup Paths

Pre-publish live HTML backup:

```text
~/Backups/webot-site/live-pre-publish-<timestamp>/
```

Post-publish screenshot folder:

```text
~/Backups/webot-site/live-post-publish-<timestamp>/screenshots/
```

Each pre-publish backup includes:

- `index.html`
- `consultation.html`
- `success.html`
- `privacy.html`
- response headers for each page
- `git-metadata.txt`
- `payment-link-snapshot.txt`

## Rollback Notes

For GitHub Pages, the safest rollback is usually a reviewed revert commit on `master`, followed by another publish. Use the pre-publish backup to compare the live HTML that existed before the publish, not as a direct edit target.

Do not edit live hosting surfaces directly. Local git remains the source of truth.
