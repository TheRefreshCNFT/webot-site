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
  await withApp({ getAvailableSlots: async () => [] }, async (base) => {
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
    assert.equal(calls[0][5], 'Sort invoices\n\nProject quote requested: Yes');
    assert.equal(calls[0][6], 'smb');
    assert.equal(calls[0][1], 'test-only-token');
    assert.ok(!JSON.stringify(body).includes('test-only-token'));
  });
});

test('home lane is accepted and passed to calendar and confirmation', async () => {
  await withApp({}, async (base, calls) => {
    const response = await fetch(`${base}/api/book`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...valid, lane: 'home' })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.event.lane, 'home');
    assert.equal(body.event.laneLabel, 'Home');
    assert.equal(calls[0][6], 'home');
    const emailCall = calls.find((call) => call[0] === 'email');
    assert.ok(emailCall);
    assert.equal(emailCall[6], 'home');
  });
});

test('invalid or missing lane defaults to smb', async () => {
  await withApp({}, async (base, calls) => {
    for (const lane of [undefined, null, 'enterprise', 123]) {
      const response = await fetch(`${base}/api/book`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...valid, lane })
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.event.lane, 'smb');
      assert.equal(calls[calls.length - 1][6], 'smb');
    }
  });
});

test('provider failure returns failure, never success', async () => {
  await withApp({ createBooking: async () => { throw new Error('synthetic failure'); } }, async (base) => {
    const response = await fetch(`${base}/api/book`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal(response.status, 500);
    assert.equal((await response.json()).success, false);
  });
});
