# Publish Live Runbook

Use `scripts/publish-live.sh` to publish GitHub Pages from `master` only after a human has approved the current screenshots and release scope.

## Approval Gate

Do not publish from a surprise working tree.

Before live publish:

1. Review local changes and screenshot the pages being shipped.
2. Get human approval for the screenshots and the exact publish scope.
3. Run the dry-run command and inspect the backup path.
4. Run the live command only with explicit approval.

## Latest Local Validation Snapshot

As of 2026-06-27, local validation passed but live publish is still waiting on human approval. No live publish or push has happened.

- Agency local route `4173` and Studio local route `4174` returned 200.
- Final local screenshots passed:
  - `/tmp/webot-validator/screenshots/agency-desktop-final.png`
  - `/tmp/webot-validator/screenshots/agency-mobile-final.png`
  - `/tmp/webot-validator/screenshots/studio-desktop-final.png`
  - `/tmp/webot-validator/screenshots/studio-mobile-final.png`
- Static link tests passed: Agency `65` hrefs, Studio `19` hrefs, no missing hash targets.
- Protected Agency Stripe URLs are unchanged: baseline `8`, current `8`, exact URLs unchanged.
- Studio has no live Stripe/payment URL or backend behavior.
- DevTools interaction tests passed at `390` and `1440`: Agency mobile nav opens; Studio agent selection, Plus plan selection, payment-confirmed state, and nav toggle work.
- Latest dry-run backup:
  - `/Users/webot/Backups/webot-site/live-pre-publish-20260627T205952Z`

Remaining dirty-state warning:

- `webot-site` has active local delivery/docs changes and untracked files; review `git status --short --untracked-files=all` before publish.
- `webot-studio` has `index.html` and `favicon.svg` modified. `favicon.svg` is pre-existing CR-only dirty with `git diff --ignore-cr-at-eol -- favicon.svg` empty; `index.html` has substantive local delivery changes.

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
