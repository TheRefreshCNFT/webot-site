# Booking Consultation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the real booking service create 30-minute consultations and carry optional project-quote intent from the visitor or Ask WeBot into the existing event description without changing the public booking schema.

**Architecture:** Extract credential-free scheduling/event rules into CommonJS modules, inject provider operations into an Express app factory, and keep `server.js` as the only credential-reading entry point. The static consultation page uses separate ES modules for handoff and UI; browser tests intercept every booking URL so local tests cannot create events or send email.

**Tech Stack:** Node 20+ CommonJS, Express 4, Node built-in test runner, static HTML/CSS/JavaScript ES modules, existing Platform Playwright.

**Linked tracks:** [Website overhaul](2026-10-24-agency-website-overhaul.md) supplies `tokens.css`, `css/site.css`, and shared policy copy. [Ask WeBot chat](2026-10-24-agency-chat.md) produces the explicit handoff consumed here.

## Global Constraints

- Service root: `/Users/webot/Projects/webot-booking`; frontend root: `/Users/webot/Projects/webot-site`.
- The booking root is intentionally non-Git. Do not initialize Git. Each task ends with a scoped file backup and SHA-256 receipt instead of a commit; website changes use scoped Git commits.
- Actual service constants become `SLOT_MINUTES = 15` and `APPOINTMENT_MINUTES = 30`; availability conflicts and event end time must both use 30 minutes.
- Preserve business hours Tue–Fri 10:00–17:00 ET, 24-hour notice, 14-day window, and the existing `/health`, `/api/slots`, `/api/book` routes.
- Public request remains `{name,email,summary,slotTime}`; success remains `{success,event:{time,meetLink}}`. Encode quote intent in `summary` as `Project quote requested: Yes`.
- Keep the quote checkbox unchecked initially. Its label is exactly **“I'd also like a project quote.”**
- Quote guidance requests current repetitive steps, involved tools/files/systems, frequency/volume, desired output, and desired deadline/budget range.
- Never import `calendar.js` or start `server.js` in credential-free tests. They read credentials; slot requests can refresh/rewrite tokens; booking creates a real event and sends email.
- Do not run `/api/slots`, `npm start`, Docker builds, deployment, service restart, or provider calls as casual tests.
- Do not expand into atomic reservation/idempotency or Gmail-delivery semantics. Record those existing limitations without claiming to fix them.
- Publication and live calendar/email acceptance require separate explicit authorization and an owner-controlled test identity.
- Preserve unrelated dirty files in both roots and all payment links.

## File Map

- Create service `booking-rules.js`: pure duration, conflict, quote-summary, and event-building rules.
- Create service `app.js`: injected Express application with no credential imports.
- Modify service `calendar.js`: consume the pure rules; retain provider calls.
- Modify service `server.js`: wire real provider dependencies and listen.
- Create service `test/booking-rules.test.js` and `test/app.test.js`: credential-free tests.
- Modify service `package.json`: add only the built-in test script.
- Create site `js/consultation-handoff.mjs`: parse/consume explicit chat handoff.
- Create site `js/consultation.mjs`: booking UI and API states.
- Create site `css/consultation.css`: booking-specific layout and eight-state controls.
- Modify site `consultation.html`: 30-minute copy, quote controls, external modules.
- Create site `test/consultation-handoff.test.mjs` and `scripts/test-consultation-browser.mjs`: unit and intercepted-browser evidence.
- Create site `proof-results/agency-booking/`: screenshots and reports.

---

### Task 1: Extract and test the real 30-minute/event rules

**Files:**
- Create: `/Users/webot/Projects/webot-booking/booking-rules.js`
- Create: `/Users/webot/Projects/webot-booking/test/booking-rules.test.js`
- Modify: `/Users/webot/Projects/webot-booking/package.json`

**Interfaces:**
- Produces: `APPOINTMENT_MINUTES`, `SLOT_MINUTES`, `getSlotEnd(slotTime)`, `hasConflict(slotTime,busy)`, `composeBookingSummary(summary,quoteRequested)`, and `buildCalendarEvent({slotTime,name,email,summary,requestId})`.

- [ ] **Step 1: Write the failing pure-rule tests**

Create `test/booking-rules.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  APPOINTMENT_MINUTES,
  getSlotEnd,
  hasConflict,
  composeBookingSummary,
  buildCalendarEvent
} = require('../booking-rules');

test('appointment duration is 30 minutes for ends and conflicts', () => {
  assert.equal(APPOINTMENT_MINUTES, 30);
  const start = '2026-10-27T14:00:00.000Z';
  assert.equal(getSlotEnd(start), '2026-10-27T14:30:00.000Z');
  assert.equal(hasConflict(start, [{ start: '2026-10-27T14:15:00.000Z', end: '2026-10-27T14:20:00.000Z' }]), true);
  assert.equal(hasConflict(start, [{ start: '2026-10-27T14:30:00.000Z', end: '2026-10-27T15:00:00.000Z' }]), false);
});

test('quote intent stays inside the existing summary field', () => {
  assert.equal(composeBookingSummary('Sort weekly invoices', false), 'Sort weekly invoices');
  assert.equal(composeBookingSummary('Sort weekly invoices', true), 'Sort weekly invoices\n\nProject quote requested: Yes');
});

test('calendar event has a 30-minute end and exact quote summary', () => {
  const event = buildCalendarEvent({
    slotTime: '2026-10-27T14:00:00.000Z',
    name: 'Alex',
    email: 'alex@example.test',
    summary: composeBookingSummary('Sort weekly invoices', true),
    requestId: 'wb-test-fixed'
  });
  assert.equal(event.start.dateTime, '2026-10-27T14:00:00.000Z');
  assert.equal(event.end.dateTime, '2026-10-27T14:30:00.000Z');
  assert.match(event.description, /Project quote requested: Yes/);
  assert.equal(event.conferenceData.createRequest.requestId, 'wb-test-fixed');
  assert.deepEqual(event.attendees, [{ email: 'ian@webot.agency' }, { email: 'alex@example.test' }]);
});
```

- [ ] **Step 2: Run tests and confirm the module is absent**

Run from `/Users/webot/Projects/webot-booking`: `node --test test/booking-rules.test.js`

Expected: FAIL `Cannot find module '../booking-rules'`; no credential file is read.

- [ ] **Step 3: Implement the complete pure module**

Create `booking-rules.js`:

```js
const SLOT_MINUTES = 15;
const APPOINTMENT_MINUTES = 30;

function getSlotEnd(slotTime) {
  const start = new Date(slotTime);
  if (Number.isNaN(start.getTime())) throw new Error('Invalid slot time.');
  return new Date(start.getTime() + APPOINTMENT_MINUTES * 60000).toISOString();
}

function hasConflict(slotTime, busyPeriods) {
  const start = new Date(slotTime).toISOString();
  const end = getSlotEnd(slotTime);
  return busyPeriods.some((busy) => start < busy.end && end > busy.start);
}

function composeBookingSummary(summary, quoteRequested) {
  const clean = summary.trim();
  return quoteRequested ? `${clean}\n\nProject quote requested: Yes` : clean;
}

function buildCalendarEvent({ slotTime, name, email, summary, requestId }) {
  return {
    summary: `WeBot Discovery Call — ${name}`,
    description: `Contact: ${email}\n\nInterest:\n${summary}\n\n---\nBooked via webot.agency`,
    start: { dateTime: new Date(slotTime).toISOString(), timeZone: 'America/New_York' },
    end: { dateTime: getSlotEnd(slotTime), timeZone: 'America/New_York' },
    attendees: [{ email: 'ian@webot.agency' }, { email }],
    reminders: {
      useDefault: false,
      overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 15 }]
    },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };
}

module.exports = {
  SLOT_MINUTES,
  APPOINTMENT_MINUTES,
  getSlotEnd,
  hasConflict,
  composeBookingSummary,
  buildCalendarEvent
};
```

Change `package.json` scripts to exactly:

```json
"scripts": {
  "start": "node server.js",
  "test": "node --test test/*.test.js"
}
```

- [ ] **Step 4: Run pure tests**

Run: `npm test`

Expected: PASS, `3` tests; no Google requests or file writes outside the project.

- [ ] **Step 5: Create the non-Git checkpoint**

```bash
mkdir -p /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-1
cp booking-rules.js package.json /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-1/
shasum -a 256 booking-rules.js package.json > /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-1/SHA256SUMS
```

Expected: only the two safe source files and hashes are copied; never copy credential/token JSON.

---

### Task 2: Wire 30-minute rules through the real controller without importing credentials in tests

**Files:**
- Create: `/Users/webot/Projects/webot-booking/app.js`
- Create: `/Users/webot/Projects/webot-booking/test/app.test.js`
- Modify: `/Users/webot/Projects/webot-booking/calendar.js`
- Modify: `/Users/webot/Projects/webot-booking/server.js`

**Interfaces:**
- Consumes: Task 1 pure functions.
- Produces: `createBookingApp({getAvailableSlots,getPrimaryAccessToken,createBooking,sendConfirmation})` returning an Express app; `server.js` remains the sole executable entry point.

- [ ] **Step 1: Write failing API contract tests with injected fakes**

Create `test/app.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createBookingApp } = require('../app');

const slotTime = '2026-10-27T14:00:00.000Z';
const valid = { name: 'Alex', email: 'alex@example.test', summary: 'Sort invoices', slotTime };

async function withApp(overrides, run) {
  const calls = [];
  const app = createBookingApp({
    getAvailableSlots: async () => [{ time: slotTime }],
    getPrimaryAccessToken: async () => 'test-only-token',
    createBooking: async (...args) => { calls.push(['create', ...args]); return { hangoutLink: 'https://meet.google.com/test-only' }; },
    sendConfirmation: async (...args) => { calls.push(['email', ...args]); return { id: 'test-only' }; },
    ...overrides
  });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`, calls); }
  finally { await new Promise((resolve) => server.close(resolve)); }
}

test('health and grouped slots preserve the public shapes', async () => {
  await withApp({}, async (base) => {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, 'ok');
    const slots = await fetch(`${base}/api/slots`);
    assert.deepEqual(await slots.json(), { success: true, slots: {} });
  });
});

test('validation and stale slots never call providers', async () => {
  await withApp({ getAvailableSlots: async () => [] }, async (base, calls) => {
    const invalid = await fetch(`${base}/api/book`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    assert.equal(invalid.status, 400);
    const stale = await fetch(`${base}/api/book`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal(stale.status, 409);
    assert.equal(calls.length, 0);
  });
});

test('success sends quote intent and never exposes credentials', async () => {
  await withApp({}, async (base, calls) => {
    const response = await fetch(`${base}/api/book`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...valid, summary: 'Sort invoices\n\nProject quote requested: Yes' })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.event.meetLink, 'https://meet.google.com/test-only');
    assert.equal(calls[0][4], 'Sort invoices\n\nProject quote requested: Yes');
    assert.equal(calls[0][1], 'test-only-token');
    assert.ok(!JSON.stringify(body).includes('test-only-token'));
  });
});

test('provider failure returns failure, never success', async () => {
  await withApp({ createBooking: async () => { throw new Error('synthetic failure'); } }, async (base) => {
    const response = await fetch(`${base}/api/book`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal(response.status, 500);
    assert.equal((await response.json()).success, false);
  });
});
```

- [ ] **Step 2: Run and confirm app-factory failure**

Run: `npm test`

Expected: pure tests PASS; API tests FAIL `Cannot find module '../app'`. No credential module is imported.

- [ ] **Step 3: Add the credential-free Express app**

Create `app.js`:

```js
const express = require('express');

function createBookingApp({ getAvailableSlots, getPrimaryAccessToken, createBooking, sendConfirmation }) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.use((req, res, next) => {
    const allowed = ['https://webot.agency', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:4180'];
    const origin = req.headers.origin;
    if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.get('/api/slots', async (req, res) => {
    try {
      const slots = await getAvailableSlots();
      const grouped = {};
      for (const slot of slots) {
        if (!grouped[slot.date]) grouped[slot.date] = [];
        grouped[slot.date].push({ time: slot.time, label: slot.timeStr });
      }
      res.json({ success: true, slots: grouped });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to load available slots. Please try again.' });
    }
  });

  app.post('/api/book', async (req, res) => {
    try {
      const { name, email, summary, slotTime } = req.body || {};
      if (![name, email, summary, slotTime].every((value) => typeof value === 'string' && value.trim())) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
      }
      if (name.length > 200 || email.length > 320 || summary.length > 8000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Please check your details and try again.' });
      }
      if (Number.isNaN(new Date(slotTime).getTime())) {
        return res.status(400).json({ success: false, error: 'Please choose a valid time.' });
      }
      const slots = await getAvailableSlots();
      if (!slots.some((slot) => slot.time === slotTime)) {
        return res.status(409).json({ success: false, error: 'This slot is no longer available. Please pick another.' });
      }
      const accessToken = await getPrimaryAccessToken();
      const event = await createBooking(accessToken, slotTime, name.trim(), email.trim(), summary.trim());
      const meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null;
      await sendConfirmation(accessToken, email.trim(), name.trim(), slotTime, meetLink);
      const time = new Date(slotTime).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'
      });
      res.json({ success: true, message: 'Your discovery call is booked!', event: { time, meetLink } });
    } catch {
      res.status(500).json({ success: false, error: 'Booking failed. Please try again.' });
    }
  });

  return app;
}

module.exports = { createBookingApp };
```

- [ ] **Step 4: Wire the pure rules into `calendar.js`**

At the top, retain existing `SLOT_MINUTES` only once by replacing the business-constant block with:

```js
const {
  SLOT_MINUTES,
  APPOINTMENT_MINUTES,
  getSlotEnd,
  hasConflict,
  buildCalendarEvent
} = require('./booking-rules');
const MIN_NOTICE_HOURS = 24;
const BUSINESS_DAYS = [2, 3, 4, 5];
const START_HOUR_ET = 10;
const END_HOUR_ET = 17;
const MAX_DAYS_AHEAD = 14;
```

Inside `getAvailableSlots`, replace the `slotEnd` and `conflicts` statements with:

```js
const conflicts = hasConflict(slotStart, allBusy);
```

Inside `createBooking`, replace the `startUTC`, `endUTC`, and `event` declarations with:

```js
const event = buildCalendarEvent({
  slotTime,
  name,
  email,
  summary,
  requestId: `wb-${Date.now()}`
});
```

Leave token refresh, provider URLs, Gmail behavior, exports, and all other scheduling logic unchanged. `APPOINTMENT_MINUTES` is intentionally imported even though the pure helpers own its direct use; add a startup-free source assertion in `test/booking-rules.test.js` rather than removing it solely for lint aesthetics:

```js
const fs = require('node:fs');
test('real calendar source consumes the shared duration rules', () => {
  const source = fs.readFileSync(require.resolve('../calendar.js'), 'utf8');
  assert.match(source, /hasConflict\(slotStart, allBusy\)/);
  assert.match(source, /buildCalendarEvent\(\{/);
  assert.doesNotMatch(source, /const APPOINTMENT_MINUTES = 15/);
});
```

- [ ] **Step 5: Make `server.js` the only credential-reading composition root**

Replace `server.js` with:

```js
const fs = require('fs');
const path = require('path');
const { getAvailableSlots, createBooking, sendConfirmation } = require('./calendar');
const { createBookingApp } = require('./app');

async function getPrimaryAccessToken() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens-gmail1.json'), 'utf8'));
  const creds = JSON.parse(fs.readFileSync(path.join(__dirname, 'client_secret_351805603923-14v7d6pu6lk3vd78mh0aru478c7j1t2k.apps.googleusercontent.com.json'), 'utf8'));
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.web.client_id,
      client_secret: creds.web.client_secret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error('Token refresh failed');
  return tokenData.access_token;
}

const app = createBookingApp({ getAvailableSlots, getPrimaryAccessToken, createBooking, sendConfirmation });
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`WeBot Booking API running on port ${PORT}`));
```

Do not execute this file in local unit tests.

- [ ] **Step 6: Run all credential-free tests and syntax checks**

Run: `npm test && node --check app.js && node --check calendar.js && node --check server.js`

Expected: PASS, `8` tests total; no provider request, token rewrite, event, or email. Existing limitation to record in the implementation receipt: availability recheck and event creation remain non-atomic, and Gmail API errors may still be logged without failing booking.

- [ ] **Step 7: Create the non-Git checkpoint and website documentation commit**

```bash
mkdir -p /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-2
cp app.js booking-rules.js calendar.js server.js package.json /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-2/
shasum -a 256 app.js booking-rules.js calendar.js server.js package.json > /Users/webot/Projects/webot-site/proof-results/agency-booking/checkpoints/task-2/SHA256SUMS
cd /Users/webot/Projects/webot-site
git add proof-results/agency-booking/checkpoints
git commit -m "test: checkpoint credential-free booking rules"
```

---

### Task 3: Add quote guidance, accessible states, and explicit chat-handoff consumption

**Files:**
- Create: `/Users/webot/Projects/webot-site/js/consultation-handoff.mjs`
- Create: `/Users/webot/Projects/webot-site/test/consultation-handoff.test.mjs`
- Create: `/Users/webot/Projects/webot-site/js/consultation.mjs`
- Create: `/Users/webot/Projects/webot-site/css/consultation.css`
- Modify: `/Users/webot/Projects/webot-site/consultation.html`

**Interfaces:**
- Consumes: handoff key `webot.consultationHandoff.v1`, value `{version:1,summary:string,requestQuote:boolean}`; shared Signal CSS.
- Produces: `consumeConsultationHandoff(storage)` returning `{summary,requestQuote}|null` and always clearing the key after a read attempt.

- [ ] **Step 1: Write failing handoff tests**

Create `test/consultation-handoff.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { consumeConsultationHandoff, HANDOFF_KEY } from '../js/consultation-handoff.mjs';

function storage(value) {
  return {
    value,
    getItem(key) { assert.equal(key, HANDOFF_KEY); return this.value; },
    removeItem(key) { assert.equal(key, HANDOFF_KEY); this.value = null; }
  };
}

test('valid handoff is consumed once', () => {
  const target = storage(JSON.stringify({ version: 1, summary: 'Sort invoices every Friday', requestQuote: true }));
  assert.deepEqual(consumeConsultationHandoff(target), { summary: 'Sort invoices every Friday', requestQuote: true });
  assert.equal(target.value, null);
});

test('invalid, oversized, and non-quote handoffs fail closed and clear', () => {
  for (const value of ['{', JSON.stringify({ version: 1, summary: '', requestQuote: true }), JSON.stringify({ version: 1, summary: 'x'.repeat(4001), requestQuote: true })]) {
    const target = storage(value);
    assert.equal(consumeConsultationHandoff(target), null);
    assert.equal(target.value, null);
  }
  const noQuote = storage(JSON.stringify({ version: 1, summary: 'Discuss research', requestQuote: false }));
  assert.deepEqual(consumeConsultationHandoff(noQuote), { summary: 'Discuss research', requestQuote: false });
});
```

- [ ] **Step 2: Run and confirm missing-module failure**

Run from `/Users/webot/Projects/webot-site`: `node --test test/consultation-handoff.test.mjs`

Expected: FAIL `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the handoff module**

Create `js/consultation-handoff.mjs`:

```js
export const HANDOFF_KEY = "webot.consultationHandoff.v1";

export function consumeConsultationHandoff(storage) {
  const raw = storage.getItem(HANDOFF_KEY);
  storage.removeItem(HANDOFF_KEY);
  if (!raw || raw.length > 5000) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.summary !== "string" || typeof value.requestQuote !== "boolean") return null;
    const summary = value.summary.trim();
    if (!summary || summary.length > 4000) return null;
    return { summary, requestQuote: value.requestQuote };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run handoff tests**

Run: `node --test test/consultation-handoff.test.mjs`

Expected: PASS, `2` tests.

- [ ] **Step 5: Add the booking form and quote guidance**

In `consultation.html`, keep the canonical/favicons and shared head links from the website track. Replace the old inline style with `<link rel="stylesheet" href="/css/consultation.css">`. Replace every public `15-minute`/`15 min` phrase with `30-minute`/`30 min`. Replace the booking form body with:

```html
<main class="booking-shell" id="main">
  <a class="brand" href="/">We<span class="brand-mark">Bot</span></a>
  <section class="booking-intro">
    <h1>Tell us what you want to automate.</h1>
    <p>Book a free 30-minute consultation. We will discuss the current work, the result you need, and whether automation is a sensible fit.</p>
  </section>
  <div id="bookingForm" class="booking-grid">
    <form class="booking-card" id="consultationForm" novalidate>
      <div class="form-group"><label for="bookName">Name</label><input id="bookName" name="name" autocomplete="name" maxlength="200" required></div>
      <div class="form-group"><label for="bookEmail">Email</label><input id="bookEmail" name="email" type="email" autocomplete="email" maxlength="320" required></div>
      <div class="form-group">
        <label for="bookSummary">What do you want to automate?</label>
        <textarea id="bookSummary" name="summary" maxlength="4000" aria-describedby="summaryHelp" required></textarea>
        <p class="field-help" id="summaryHelp">A sentence or two is enough to start. Do not include passwords or confidential records.</p>
      </div>
      <div class="quote-control">
        <input id="quoteRequested" type="checkbox">
        <label for="quoteRequested">I'd also like a project quote</label>
      </div>
      <div id="quoteGuidance" class="quote-guidance" hidden>
        <p>For a useful scoping discussion, add any details you know:</p>
        <ul>
          <li>The repetitive steps you perform today.</li>
          <li>The apps, websites, files, or systems involved.</li>
          <li>How often it happens and the approximate volume.</li>
          <li>The output or finished result you want.</li>
          <li>Any desired deadline or budget range.</li>
        </ul>
        <p>You are requesting a consultation and quote, not an instant estimate.</p>
      </div>
      <fieldset class="slot-section">
        <legend>Pick a time</legend>
        <div id="slotPicker" aria-live="polite"><p class="loading">Loading available times…</p></div>
      </fieldset>
      <button id="bookBtn" class="button button-primary" type="submit" disabled>Book free 30-minute consultation</button>
      <p id="formError" class="form-error" role="alert" hidden></p>
      <p class="field-help">Available Tue–Fri, 10am–5pm ET. 24-hour notice required. We will send a Google Meet link and calendar invite.</p>
    </form>
    <aside class="booking-card">
      <h2>What happens next</h2>
      <p><strong>Talk:</strong> we identify the workflow and desired result.</p>
      <p><strong>Scope:</strong> if it is a fit, we recommend deliverables, timing, and a quote.</p>
      <p><strong>Build and launch:</strong> we build, review with you, and agree handoff, deployment, or optional support.</p>
      <p>Prefer another route? <a href="tel:+17542101827">Call +1 754 210 1827</a> or <a href="mailto:hello@webot.agency">email hello@webot.agency</a>.</p>
    </aside>
  </div>
  <section id="successScreen" class="booking-card success-screen" aria-live="polite" hidden>
    <h2>You're booked!</h2>
    <p>We will send a Google Meet link and calendar invite to your email.</p>
    <p id="successTime"></p>
    <div id="meetLink"></div>
    <a class="button button-secondary" href="/">Back to WeBot Agency</a>
  </section>
</main>
<script type="module" src="/js/consultation.mjs"></script>
```

Remove the old inline booking script and GA loader from this page in this redesign; do not add replacement tracking.

- [ ] **Step 6: Add booking-specific styles**

Create `css/consultation.css`:

```css
@import url("./site.css");
.booking-shell { width: min(1040px, calc(100% - 2 * var(--space-6))); margin: 0 auto; padding-block: var(--space-8) var(--space-20); }
.booking-intro { display: grid; gap: var(--space-4); padding-block: var(--space-12); }
.booking-intro h1 { max-width: 15ch; }
.booking-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); gap: var(--space-6); align-items: start; }
.booking-card { min-width: 0; padding: var(--space-6); background: var(--color-paper-raised); border: var(--rule); border-radius: var(--radius-lg); }
.booking-card aside, aside.booking-card { display: grid; gap: var(--space-5); }
.form-group { margin-bottom: var(--space-5); }
.form-group label, .slot-section legend { display: block; margin-bottom: var(--space-2); font-weight: 700; }
.form-group input, .form-group textarea { width: 100%; min-height: 48px; padding: var(--space-3) var(--space-4); border: var(--rule); border-radius: var(--radius-sm); background: var(--color-paper); color: var(--color-ink); }
.form-group textarea { min-height: 144px; resize: vertical; }
.form-group input:focus, .form-group textarea:focus { border-color: var(--color-accent); }
.field-help { margin-top: var(--space-2); font-size: var(--text-sm); }
.quote-control { display: flex; gap: var(--space-3); align-items: flex-start; margin-block: var(--space-5); }
.quote-control input { width: 24px; height: 24px; flex: 0 0 auto; accent-color: var(--color-accent); }
.quote-control label { min-height: 44px; display: flex; align-items: center; cursor: pointer; }
.quote-guidance { padding: var(--space-4); margin-bottom: var(--space-5); border-left: 2px solid var(--color-accent); background: var(--color-accent-soft); }
.quote-guidance li { margin: var(--space-2) 0 var(--space-2) var(--space-5); color: var(--color-ink-soft); }
.slot-section { min-width: 0; margin: 0 0 var(--space-5); padding: 0; border: 0; }
.date-nav { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.date-label { flex: 1; text-align: center; font-weight: 700; }
.slots-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2); }
.slot-btn { min-height: 44px; border: var(--rule); border-radius: var(--radius-sm); background: var(--color-paper); color: var(--color-ink); }
.slot-btn:hover { border-color: var(--color-accent); }
.slot-btn.selected { background: var(--color-accent); color: var(--color-accent-ink); }
.slot-btn:disabled { opacity: 0.5; }
.form-error { margin-top: var(--space-3); color: var(--color-error); }
.success-screen { text-align: center; }
.success-screen p { margin: var(--space-4) auto; }
#bookBtn { width: 100%; white-space: normal; }
@media (max-width: 780px) { .booking-grid { grid-template-columns: minmax(0, 1fr); } .booking-shell { width: min(100% - 2 * var(--space-4), 1040px); } }
@media (max-width: 360px) { .slots-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```

- [ ] **Step 7: Implement the booking browser module**

Create `js/consultation.mjs`:

```js
import { consumeConsultationHandoff } from "./consultation-handoff.mjs";

const API = "https://book.webot.agency";
const elements = Object.fromEntries(["bookingForm", "consultationForm", "bookName", "bookEmail", "bookSummary", "quoteRequested", "quoteGuidance", "slotPicker", "bookBtn", "formError", "successScreen", "successTime", "meetLink"].map((id) => [id, document.getElementById(id)]));
let allSlots = {};
let dateKeys = [];
let currentDateIndex = 0;
let selectedSlot = null;
let loading = false;

const handoff = consumeConsultationHandoff(window.sessionStorage);
if (handoff) {
  elements.bookSummary.value = handoff.summary;
  elements.quoteRequested.checked = handoff.requestQuote;
  elements.quoteGuidance.hidden = !handoff.requestQuote;
}

function updateSubmit() {
  elements.bookBtn.disabled = loading || !selectedSlot || !elements.bookName.value.trim() || !elements.bookEmail.validity.valid || !elements.bookSummary.value.trim();
}
function showError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = !message;
}
function button(label, className = "") {
  const node = document.createElement("button");
  node.type = "button";
  node.className = className;
  node.textContent = label;
  return node;
}
function renderDate() {
  const key = dateKeys[currentDateIndex];
  elements.slotPicker.replaceChildren();
  const nav = document.createElement("div");
  nav.className = "date-nav";
  const previous = button("Previous day", "button button-secondary button-small");
  previous.textContent = "‹";
  previous.setAttribute("aria-label", "Previous available day");
  previous.disabled = currentDateIndex === 0;
  previous.addEventListener("click", () => { currentDateIndex -= 1; renderDate(); });
  const label = document.createElement("div");
  label.className = "date-label";
  label.textContent = key;
  const next = button("Next day", "button button-secondary button-small");
  next.textContent = "›";
  next.setAttribute("aria-label", "Next available day");
  next.disabled = currentDateIndex === dateKeys.length - 1;
  next.addEventListener("click", () => { currentDateIndex += 1; renderDate(); });
  nav.append(previous, label, next);
  const grid = document.createElement("div");
  grid.className = "slots-grid";
  for (const slot of allSlots[key]) {
    const choice = button(slot.label, `slot-btn${selectedSlot === slot.time ? " selected" : ""}`);
    choice.dataset.time = slot.time;
    choice.setAttribute("aria-pressed", String(selectedSlot === slot.time));
    choice.addEventListener("click", () => { selectedSlot = slot.time; showError(""); renderDate(); updateSubmit(); });
    grid.append(choice);
  }
  elements.slotPicker.append(nav, grid);
}
async function loadSlots() {
  elements.slotPicker.innerHTML = '<p class="loading">Loading available times…</p>';
  try {
    const response = await fetch(`${API}/api/slots`);
    const data = await response.json();
    if (!response.ok || !data.success || typeof data.slots !== "object") throw new Error("Slots unavailable");
    allSlots = data.slots;
    dateKeys = Object.keys(allSlots);
    selectedSlot = null;
    if (!dateKeys.length) {
      const message = document.createElement("p");
      message.textContent = "No available times in the next 14 days. Please email hello@webot.agency or call +1 754 210 1827.";
      elements.slotPicker.replaceChildren(message);
    } else {
      currentDateIndex = 0;
      renderDate();
    }
  } catch {
    const message = document.createElement("p");
    message.textContent = "Could not load available times. Please email hello@webot.agency, call +1 754 210 1827, or try again later.";
    elements.slotPicker.replaceChildren(message);
  }
  updateSubmit();
}

elements.quoteRequested.addEventListener("change", () => { elements.quoteGuidance.hidden = !elements.quoteRequested.checked; });
for (const input of [elements.bookName, elements.bookEmail, elements.bookSummary]) input.addEventListener("input", updateSubmit);
elements.consultationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (elements.bookBtn.disabled) return;
  loading = true;
  elements.bookBtn.textContent = "Booking…";
  updateSubmit();
  showError("");
  const summary = `${elements.bookSummary.value.trim()}${elements.quoteRequested.checked ? "\n\nProject quote requested: Yes" : ""}`;
  try {
    const response = await fetch(`${API}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: elements.bookName.value.trim(), email: elements.bookEmail.value.trim(), summary, slotTime: selectedSlot })
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.event?.time) throw new Error(data.error || "Booking failed. Please try again or contact us directly.");
    elements.bookingForm.hidden = true;
    elements.successScreen.hidden = false;
    elements.successTime.textContent = data.event.time;
    if (data.event.meetLink) {
      const link = document.createElement("a");
      link.className = "button button-secondary";
      link.href = data.event.meetLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Join via Google Meet";
      elements.meetLink.replaceChildren(link);
    }
    elements.successScreen.focus?.();
  } catch (error) {
    showError(error.message || "Booking failed. Please try again or contact us directly.");
    if (error.message.includes("no longer available")) await loadSlots();
  } finally {
    loading = false;
    elements.bookBtn.textContent = "Book free 30-minute consultation";
    updateSubmit();
  }
});

loadSlots();
```

- [ ] **Step 8: Run syntax and handoff checks, then commit**

Run: `node --check js/consultation.mjs && node --test test/consultation-handoff.test.mjs`

Expected: PASS, `2` tests.

```bash
git add consultation.html css/consultation.css js/consultation.mjs js/consultation-handoff.mjs test/consultation-handoff.test.mjs
git commit -m "feat: add consultation quote handoff"
```

---

### Task 4: Prove all booking states without contacting the live service

**Files:**
- Create: `scripts/test-consultation-browser.mjs`
- Create: `proof-results/agency-booking/browser-report.json` and screenshots

**Interfaces:**
- Consumes: completed frontend and shared design system.
- Produces: browser proof for loading, no availability, validation, stale/failure, success, quote serialization, handoff, and responsive layouts.

- [ ] **Step 1: Write the intercepted browser harness**

Create `scripts/test-consultation-browser.mjs`:

```js
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "proof-results", "agency-booking");
const server = spawn("python3", ["-m", "http.server", "4180", "--bind", "127.0.0.1"], { cwd: root, detached: true, stdio: "ignore" });
const report = { status: "FAIL", scenarios: [], network: "all book.webot.agency requests intercepted" };
const slot = { time: "2026-10-27T14:00:00.000Z", label: "10:00 AM" };
const slots = { "Tuesday, October 27": [slot] };

try {
  await waitFor("http://127.0.0.1:4180/consultation.html");
  const { chromium } = await import(pathToFileURL(path.resolve(root, "../webot-platform/node_modules/playwright/index.mjs")).href);
  const browser = await chromium.launch({ headless: true });
  await mkdir(output, { recursive: true });
  try {
    for (const width of [320, 375, 414, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      let posted = null;
      await page.route("https://book.webot.agency/api/slots", (route) => route.fulfill(json({ success: true, slots })));
      await page.route("https://book.webot.agency/api/book", async (route) => {
        posted = route.request().postDataJSON();
        await route.fulfill(json({ success: true, event: { time: "Tuesday, October 27 at 10:00 AM", meetLink: "https://meet.google.com/test-only" } }));
      });
      await page.goto("http://127.0.0.1:4180/consultation.html", { waitUntil: "networkidle" });
      assert(await page.getByText("Book a free 30-minute consultation.", { exact: false }).first().isVisible());
      assert.equal(await page.locator("#quoteRequested").isChecked(), false);
      assert.equal(await page.locator("#quoteGuidance").isVisible(), false);
      assert.equal(await page.locator("#bookBtn").isDisabled(), true);
      await page.locator("#quoteRequested").check();
      assert.equal(await page.locator("#quoteGuidance").isVisible(), true);
      for (const text of ["repetitive steps", "apps, websites, files, or systems", "How often", "output or finished result", "deadline or budget range"]) assert(await page.getByText(text, { exact: false }).isVisible());
      await page.fill("#bookName", "Alex");
      await page.fill("#bookEmail", "alex@example.test");
      await page.fill("#bookSummary", "Sort invoices every Friday");
      await page.locator(".slot-btn").click();
      assert.equal(await page.locator("#bookBtn").isEnabled(), true);
      if (width === 375) {
        await page.locator("#bookBtn").click();
        await page.locator("#successScreen").waitFor({ state: "visible" });
        assert.equal(posted.summary, "Sort invoices every Friday\n\nProject quote requested: Yes");
        assert.equal(posted.slotTime, slot.time);
      }
      const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert(dimensions.scroll <= dimensions.width + 1, `${width}: horizontal overflow`);
      await page.screenshot({ path: path.join(output, `consultation-${width}.png`), fullPage: true });
      report.scenarios.push({ width, result: "PASS", quotePosted: width === 375 });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    await page.addInitScript(() => sessionStorage.setItem("webot.consultationHandoff.v1", JSON.stringify({ version: 1, summary: "Prepare a weekly lead list", requestQuote: true })));
    await page.route("https://book.webot.agency/api/slots", (route) => route.fulfill(json({ success: true, slots })));
    await page.goto("http://127.0.0.1:4180/consultation.html", { waitUntil: "networkidle" });
    assert.equal(await page.inputValue("#bookSummary"), "Prepare a weekly lead list");
    assert.equal(await page.locator("#quoteRequested").isChecked(), true);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("webot.consultationHandoff.v1")), null);
    report.scenarios.push({ handoff: "PASS" });

    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", (route) => route.fulfill(json({ success: true, slots: {} })));
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.getByText("No available times", { exact: false }).isVisible());
    report.scenarios.push({ noAvailability: "PASS" });

    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false }) }));
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.getByText("Could not load available times", { exact: false }).isVisible());
    assert(await page.getByRole("link", { name: "email hello@webot.agency" }).isVisible());
    report.scenarios.push({ loadFailure: "PASS" });

    await page.unroute("https://book.webot.agency/api/slots");
    await page.route("https://book.webot.agency/api/slots", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill(json({ success: true, slots }));
    });
    const navigation = page.goto("http://127.0.0.1:4180/consultation.html", { waitUntil: "networkidle" });
    await page.getByText("Loading available times", { exact: false }).waitFor({ state: "visible" });
    await navigation;
    await page.locator(".slot-btn").waitFor();
    report.scenarios.push({ loadingState: "PASS" });

    await page.route("https://book.webot.agency/api/book", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, error: "Synthetic booking failure" }) }));
    await page.fill("#bookName", "Alex");
    await page.fill("#bookEmail", "not-an-email");
    await page.fill("#bookSummary", "Sort invoices every Friday");
    await page.locator(".slot-btn").click();
    assert.equal(await page.locator("#bookBtn").isDisabled(), true);
    await page.fill("#bookEmail", "alex@example.test");
    assert.equal(await page.locator("#bookBtn").isEnabled(), true);
    await page.locator("#bookBtn").click();
    await page.locator("#formError").waitFor({ state: "visible" });
    assert.equal(await page.locator("#formError").textContent(), "Synthetic booking failure");
    assert.equal(await page.locator("#bookingForm").isVisible(), true);
    assert.equal(await page.locator("#successScreen").isVisible(), false);
    report.scenarios.push({ validation: "PASS", bookingFailureDoesNotShowSuccess: "PASS" });

    await page.unroute("https://book.webot.agency/api/book");
    await page.route("https://book.webot.agency/api/book", (route) => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "This slot is no longer available. Please pick another." }) }));
    await page.locator("#bookBtn").click();
    await page.getByText("This slot is no longer available", { exact: false }).waitFor();
    await page.locator(".slot-btn").waitFor();
    assert.equal(await page.locator(".slot-btn.selected").count(), 0);
    assert.equal(await page.locator("#bookBtn").isDisabled(), true);
    report.scenarios.push({ staleSlot: "PASS" });
    await page.close();
    report.status = "PASS";
  } finally { await browser.close(); }
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  if (server.pid) try { process.kill(-server.pid, "SIGTERM"); } catch {}
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

function json(body) { return { status: 200, contentType: "application/json", body: JSON.stringify(body) }; }
function assert(condition, message) { if (!condition) throw new Error(message); }
async function waitFor(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
```

- [ ] **Step 2: Run the harness and inspect screenshots**

Run: `node scripts/test-consultation-browser.mjs`

Expected: PASS; all booking requests intercepted; success only after `{success:true}`; quote summary exact; no live event/email. Inspect all five screenshots for clipping, readable guidance, accessible controls, and one-column mobile layout. Fix and rerun for any visual failure.

- [ ] **Step 3: Run combined local verification**

Run from `/Users/webot/Projects/webot-booking`: `npm test`

Run from `/Users/webot/Projects/webot-site`:

```bash
node --test test/consultation-handoff.test.mjs
node --test scripts/test-agency-static.mjs
node scripts/test-consultation-browser.mjs
node scripts/test-agency-browser.mjs
git diff --check
```

Expected: all PASS. No live calendar, Gmail, deployment, or publish command is part of this gate.

- [ ] **Step 4: Commit frontend and safe-service evidence**

```bash
git add scripts/test-consultation-browser.mjs proof-results/agency-booking
git commit -m "test: verify consultation and quote flow"
```

---

### Task 5: Separately authorized live calendar/email acceptance

**Files:**
- Create only after authorization: `/Users/webot/Projects/webot-site/proof-results/agency-booking/live-acceptance.md`
- Modify only through the owning release procedure: deployed Booking source and proxy/runtime configuration if separately approved

**Interfaces:**
- Consumes: locally accepted candidate, owner-controlled test name/email, explicit permission for one real event and email.
- Produces: observed 30-minute event, Meet result, confirmation outcome, quote text, and cleanup record. This gate is not authorized by local implementation.

- [ ] **Step 1: Establish the live source-to-runtime mapping**

Read the current owning deployment/runbook and identify the actual controller, container/process, image/source revision, credential mount, proxy route, and rollback target. Compare candidate hashes with the runtime source without printing credentials. Stop if the mapping is unresolved or drift is unexpected.

- [ ] **Step 2: Obtain the exact live-test authorization**

Record explicit approval for: one owner-controlled consultation, one Google Calendar event, one Meet request, one Gmail confirmation, any required guarded deployment/restart, and cleanup. Do not treat plan approval or local test approval as this authorization.

- [ ] **Step 3: Execute one bounded acceptance and verify provider artifacts**

Book a slot with summary `Live acceptance — safe to delete` and quote intent selected. Verify directly in the owner-controlled Google Calendar that start-to-end is exactly 30 minutes and the description includes `Project quote requested: Yes`. Record Meet URL presence and whether Gmail actually succeeded; do not infer email success from HTTP 200. Delete only the created test event and any test email if the owner requests cleanup.

- [ ] **Step 4: Record truthful live disposition**

Create `live-acceptance.md` with candidate revision, runtime identity, test time, 30-minute start/end evidence, Meet result, Gmail result, quote text evidence, cleanup, rollback state, and `PASS` only if every required observation passed. Keep provider IDs and personal details out of Git. A failed live gate leaves local acceptance intact but marks the overall booking outcome unmet.

## Spec Coverage and Consistency Review

- Spec §5: Tasks 1–4 implement real 30-minute duration, unchanged schema, quote guidance, explicit states, failure-not-success, alternatives, and approved handoff. Task 5 separately gates real provider acceptance.
- Spec §6: the exact `webot.consultationHandoff.v1` key, 4,000-character summary bound, `requestQuote` boolean, summary suffix, one-time consumption, and clear-after-read match the chat plan.
- Spec §10: no live claim is made from unit/browser fakes; protected payment and unrelated files remain outside this track.
- Non-Git booking checkpoints replace impossible commit steps without initializing Git. Website changes retain frequent scoped commits.
