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
