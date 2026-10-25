# RustDesk service operations

Verified against the owned server on 2026-10-25. Role descriptions only — the private
key never appears here and must not be committed to Git. The `id_ed25519.pub` public
key below is intentionally listed: RustDesk clients need it by design, and
`rustdesk.webot.agency` serves it publicly.

## Topology

- Host: Oracle VM `141.148.79.11`, SSH alias `cwatchtower` (user `opc`), hostname
  `cwatchtower`.
- Image: `rustdesk/rustdesk-server:1.1.16` (pinned tag; host is x86_64, image is
  multi-arch). Two containers on `webot-net`, restart policy `unless-stopped`:
  - `webot-rustdesk-hbbs` (ID/rendezvous server, `172.19.0.19`), command
    `hbbs -r rustdesk.webot.agency`. Volumes: `/home/opc/rustdesk/hbbs` → `/root`
    (persistent: `id_ed25519` keypair, `db_v2.sqlite3`). Publishes `21115/tcp`,
    `21116/tcp`, `21116/udp`, `21118/tcp`, `21119/tcp`. The OSS build listens on
    21115/21116/21118 only; 21119 is published for completeness and currently idle.
  - `webot-rustdesk-hbbr` (relay, `172.19.0.20`), command `hbbr`. Volumes:
    `/home/opc/rustdesk/hbbr` → `/root`. Publishes `21117/tcp`.
- Public key (publishable, given to every client):
  `23aY7AyeWDl3jd1K8KLwuWTsteWXbRnGbBYOs2x6Ru4=`
- Edge: the `caddy` container serves `rustdesk.webot.agency`. The OSS hbbs exposes
  no HTTP API (no listener on 21114 — verified 2026-10-25, connection refused), so
  the site answers with static `respond` directives at `/api/public-key`, `/key.txt`,
  `/id_ed25519.pub`, and `/` carrying the public key, instead of a
  `reverse_proxy` to hbbs. Caddyfile block is dated `2026-10-25`; pre-change backup
  at `/home/opc/crm/Caddyfile.bak-20261025-rustdesk`.
- Host firewall: firewalld `public` zone carries `21115-21119/tcp` and `21116/udp`
  (added 2026-10-25, mirroring every other exposed service on this host).

## Public ingress status — owner action required

Public reachability of 21115-21119 is blocked at the OCI VCN security list as of
2026-10-25. Evidence: with docker ports published and firewalld opened, external
probes from the admin machine still fail, while ports that exist in the security
list pattern (3000, 8000) succeed and published-but-unlisted ports fail (8081
booking, 5006 budget-direct, 4001 host ipfs listening on 0.0.0.0). No OCI
CLI/credentials exist on the host (`oci` binary present at `~/.local/bin/oci` but
`~/.oci` is absent) or on the admin Mac, so this cannot be fixed from either
machine — do not attempt tunnels or third-party relays around it.

Two console changes by the owner unblock the full flow:

1. **OCI console** — VCN → subnet security list → add ingress rules
   `21115-21119` TCP and `21116` UDP (source `0.0.0.0/0`, or narrow the CIDR to the
   client's address for pre-arranged sessions). firewalld and docker are already
   prepared on the host.
2. **DNS** — `webot.agency` is on Google Domains/Squarespace nameservers; add an A
   record `rustdesk.webot.agency` → `141.148.79.11` where `book.webot.agency`'s
   record lives. Caddy then provisions TLS automatically and
   `https://rustdesk.webot.agency/api/public-key` starts answering.

Until both land, clients can only reach hbbs over Tailscale
(`100.127.238.95:21116` verified open on the tailnet).

## Client configuration (stock RustDesk app)

Settings → Network (unlock) → ID Server / Relay Server / API Server / Key.

- ID server: `rustdesk.webot.agency`
- Relay server: `rustdesk.webot.agency`
- API server: `http://rustdesk.webot.agency` (inert on the OSS build — the
  API/console is a Pro feature; harmless to set, keeps the config forward-compatible)
- Key: `23aY7AyeWDl3jd1K8KLwuWTsteWXbRnGbBYOs2x6Ru4=`

Tailnet-only variant until the two console changes land: same fields with ID/relay
`100.127.238.95`.

macOS equivalent, effective when written before first launch (verified 2026-10-25,
the app merges and keeps these values):
`~/Library/Preferences/com.carriez.RustDesk/RustDesk2.toml`:

```toml
[options]
custom-rendezvous-server = 'rustdesk.webot.agency'
relay-server = 'rustdesk.webot.agency'
api-server = 'http://rustdesk.webot.agency'
key = '23aY7AyeWDl3jd1K8KLwuWTsteWXbRnGbBYOs2x6Ru4='
```

Windows rehearsal rig: `desktop-49vp4rp` on the tailnet was offline (last seen
2026-10-23) on 2026-10-25 — the Mac→Windows control rehearsal is pending its return.

## Security posture (control sessions)

- Attended-only: the client reads us the 9-digit ID from their app and approves each
  session request; no persistent or one-time passwords are set on our side.
- Client-visible session: the client watches the entire session; we narrate actions
  as we take them.
- Work-log: every session gets a short log of actions taken, filed with the
  engagement notes.
- Teardown: handoff includes removing our server from the client's app
  (Settings → Network → restore defaults) or uninstalling RustDesk entirely,
  confirmed with the client.
- The `id_ed25519` private key never leaves `/home/opc/rustdesk/hbbs/`; the `.pub`
  counterpart is public by design.

## Verify or repair procedure

1. `docker ps --filter name=webot-rustdesk` — both containers `Up`; the
   `unless-stopped` policy survives host reboots.
2. Logs: `docker logs webot-rustdesk-hbbs` shows `Listening on tcp/udp :21116`;
   `docker logs webot-rustdesk-hbbr` shows `Listening on tcp :21117`.
3. Client registration: `docker logs -f webot-rustdesk-hbbs`, then look for
   `update_pk <id> <client-ip>` — appears seconds after a configured client starts.
4. Public key: `cat /home/opc/rustdesk/hbbs/id_ed25519.pub`, or
   `curl https://rustdesk.webot.agency/api/public-key` once DNS is in place.
5. Caddy changes: `docker exec caddy caddy validate --config /etc/caddy/Caddyfile
   --adapter caddyfile` then the same with `reload`; confirm an existing site after
   every reload, e.g. `curl https://book.webot.agency/health` → `status: ok`.
6. Full rebuild (volumes lost): re-run the two `docker run` commands from the
   topology section with the same volume paths. Losing `id_ed25519` invalidates the
   key on every client — keep a backup of `~/rustdesk` and re-key clients after any
   rebuild that regenerates it.

## Boundaries

- Do not modify, stop, or rebuild any container other than the two
  `webot-rustdesk-*` ones; Caddy changes are limited to the dated
  `rustdesk.webot.agency` block.
- Never print or copy `id_ed25519` (private); only the `.pub` key is handled.
- Do not route around the VCN security-list gap with tunnels or third-party relays;
  record it and wait for the console change.
