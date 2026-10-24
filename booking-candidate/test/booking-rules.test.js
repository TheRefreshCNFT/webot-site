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
