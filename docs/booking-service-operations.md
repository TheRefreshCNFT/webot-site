# Booking service operations

Verified against the owned server on 2026-10-25. Role descriptions only — credential
values never appear here and must not be committed to Git.

## Topology

- Host: Oracle VM `141.148.79.11`, SSH alias `cwatchtower` (user `opc`), hostname `cwatchtower`.
- App home: `~/booking` on the host. Container `webot-booking` runs the image built from
  `~/booking/Dockerfile` (`node:20-slim`, `npm ci --production`, `CMD node server.js`,
  internal port 8081, published `8081:8081`, restart policy `unless-stopped`).
- Edge: the `caddy` container proxies `book.webot.agency` → `webot-booking:8081`
  (verified Caddyfile block).
- Source of truth for app code: `booking-candidate/` in this repository (approved
  30-minute consultation, quote guidance, credential-free tests). The deployed copy in
  `~/booking` is updated from it; a pre-repair snapshot is `~/booking-backup-20261025`.

## Credential files (server-only, baked into the image)

- `client_secret_<id>.apps.googleusercontent.com.json` — Google OAuth client
  credentials. Current client: Desktop type "WeBot Booking" in the `68ian68@gmail.com`
  Google Cloud project ("My First Project"), consent screen **In production** since
  2026-10-25 (a Testing-status app kills refresh tokens after 7 days). The file is
  stored in the `{"web": ...}` shape because `server.js`/`calendar.js` read
  `creds.web.*`; the filename is legacy and does not match the current client ID.
  The original 2026-04 client is retired: its project is inaccessible from every
  available account and its grants died with `invalid_grant`.
- `tokens-gmail1.json` — OAuth grant for `ian@webot.agency` (creates calendar events
  with Meet, sends confirmation mail).
- `tokens-gmail2.json` — OAuth grant for `68ian68@gmail.com` (free/busy check only).
- There are **no volume mounts**; tokens are copied into the image at build time, so any
  token change requires a rebuild and container restart.

## Deploy or repair procedure

1. Back up: `cp -a ~/booking ~/booking-backup-<date>` on the host.
2. Copy candidate sources: `server.js`, `app.js`, `booking-rules.js`, `calendar.js`,
   `package.json` from `booking-candidate/`. Keep tokens, client secret, `Dockerfile`,
   `.dockerignore`, and `package-lock.json` in place.
3. Rebuild and restart exactly (the `webot-net` attach is required — Caddy reaches
   the container by name on that network; without it the public edge 502s):
   `docker build -t webot-booking ~/booking && docker stop webot-booking && docker rm webot-booking && docker run -d --name webot-booking --restart unless-stopped --network webot-net -p 8081:8081 webot-booking`
4. Verify: `curl -s localhost:8081/health` returns `status: ok`, and
   `curl -s localhost:8081/api/slots` returns grouped slots (or the designed 500 while
   tokens are dead — check `docker logs webot-booking`).

## OAuth token renewal

`invalid_grant` on refresh means the refresh token is dead (both token files failed on
2026-10-25). Renewal is a fresh consent flow:

1. Confirm the authorized redirect URI in the Google Cloud console (project owned by
   `ian@webot.agency`, client `351805603923-...`). The on-server client file lists
   `http://localhost:3000/callback`; the console list had drifted by 2026-10-25
   (`redirect_uri_mismatch`), so verify or re-add it there first.
2. Run a loopback callback listener on a machine whose port 3000 is free (borrowed
   ports must be restored immediately after), then open the consent URL with
   `response_type=code`, `access_type=offline`, `prompt=consent`, the five original
   scopes (`calendar.events calendar.readonly gmail.modify gmail.readonly gmail.send`),
   and `login_hint` per account. Repeat for `ian@webot.agency` then `68ian68@gmail.com`.
3. Exchange each `code` server-side at `https://oauth2.googleapis.com/token`
   (`grant_type=authorization_code`, same redirect URI) and write the full token JSON to
   the matching `tokens-gmail<N>.json`. Never print `client_secret` or tokens.
4. Rebuild and restart the container; verify `/api/slots` returns real slots.

## Boundaries

- Do not commit credential files or values to Git; do not print them in logs or chat.
- Do not leave unrelated local services (for example a Docker-published dashboard)
  stopped while paused on a human gate — restore them first.
- Live acceptance (one owner-controlled booking) follows the booking plan's Task 5:
  exact 30-minute event, Meet link, Gmail confirmation, quote text, cleanup only if the
  owner requests it.
