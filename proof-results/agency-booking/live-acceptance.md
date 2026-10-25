# Booking live acceptance — 2026-10-25

Result: **PASS** (Booking provider acceptance, booking plan Task 5)

## Authorization

Owner-approved as part of the three-action approval on 2026-10-25 ("repair the
deployed booking service and rerun one owner-controlled live acceptance"). One
owner-controlled booking using the owner's submitting address; cleanup of the
test event only if the owner requests it.

## Candidate and runtime identity

- Candidate: `booking-candidate/` in `/Users/webot/Projects/webot-site` (approved
  30-minute consultation service), deployed to `~/booking` on host `cwatchtower`
  (backup of the prior April deployment: `~/booking-backup-20261025`), container
  `webot-booking` on docker network `webot-net` (Caddy `book.webot.agency` →
  `:8081`), rebuilt and restarted 2026-10-25 ~16:25 UTC.
- Credentials: new Google OAuth Desktop client "WeBot Booking" (My First Project,
  consent screen **In production**); fresh offline grants for `ian@webot.agency`
  (booking identity) and `68ian68@gmail.com` (busy-check identity). The original
  OAuth client is retired: its GCP project is inaccessible from every available
  account and its refresh tokens died with `invalid_grant`.

## Observations

- Pre-checks: `GET https://book.webot.agency/api/slots` returns real grouped
  slots (Tue–Fri 10am–5pm ET cadence) after the rebuild.
- Booking executed in a real browser on the live `webot.agency/consultation.html`
  with owner email `68ian68@gmail.com`, summary "Live acceptance — safe to
  delete", project-quote checkbox selected, slot Wednesday 2026-10-28 10:45 AM ET.
- Calendar (observed via API with the booking identity): event "WeBot Discovery
  Call — Ian (live acceptance)" starts 2026-10-28T14:45:00Z, ends
  2026-10-28T15:15:00Z — **exactly 30 minutes** — with a Google Meet link and
  `Project quote requested: Yes` in the description.
- Gmail (observed in the owner inbox via API, not inferred from HTTP 200):
  confirmation "WeBot Discovery Call Confirmed — Wednesday, October 28 at
  10:45 AM EDT" received at `68ian68@gmail.com` at send time 2026-10-25 12:26 EDT.
- Failure surface: before repair the live form showed its designed
  email/phone/try-again alternatives state; after repair the full journey
  (slots → select → submit → confirmation screen with Meet link) works.

## Notes and follow-ups

- Event/email title still says "Discovery Call" while public copy says
  "consultation" — cosmetic drift in `booking-candidate/calendar.js` copy;
  candidate-side fix can ride the next booking deploy.
- The test event and confirmation email were left in place (owner cleanup not
  requested). Delete the 2026-10-28 10:45 AM event if desired.
- Token health: refresh tokens now issue under a Production consent screen, so
  no 7-day expiry applies. If `invalid_grant` ever recurs, follow
  `docs/booking-service-operations.md`.
