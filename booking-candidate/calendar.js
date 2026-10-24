const fs = require('fs');
const path = require('path');

// OAuth client credentials
const CLIENT_SECRET_FILE = path.join(__dirname, 'client_secret_351805603923-14v7d6pu6lk3vd78mh0aru478c7j1t2k.apps.googleusercontent.com.json');
const TOKENS = {
  primary: JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens-gmail1.json'), 'utf8')),    // ian@webot.agency — book here
  secondary: JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens-gmail2.json'), 'utf8'))  // 68ian68@gmail.com — check only
};

const creds = JSON.parse(fs.readFileSync(CLIENT_SECRET_FILE, 'utf8'));
const { client_id, client_secret } = creds.web;

// Business rules
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

// --- Timezone helpers (all work in UTC, server-agnostic) ---

// Get current ET offset in hours (-5 for EST, -4 for EDT)
function getETOffsetHours() {
  // Use Intl to determine if we're in EDT or EST right now
  const now = new Date();
  const etFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' });
  const parts = etFormatter.formatToParts(now);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  if (!tzPart) return -5; // fallback
  return tzPart.value.includes('4') ? -4 : -5;
}

// Convert a UTC hour to ET hour
function utcToETHour(utcHour) {
  return (utcHour + getETOffsetHours() + 24) % 24;
}

// Convert an ET hour to UTC hour
function etToUTCHour(etHour) {
  return (etHour - getETOffsetHours() + 24) % 24;
}

// Get the current day of week in ET (0=Sun, 1=Mon, ..., 6=Sat)
function getETDayOfWeek(utcDate) {
  const etOffsetMs = getETOffsetHours() * 3600000;
  const etDate = new Date(utcDate.getTime() + etOffsetMs);
  return etDate.getUTCDay();
}

// Format a UTC Date for display in ET
function formatInET(utcDate, options) {
  return utcDate.toLocaleString('en-US', { ...options, timeZone: 'America/New_York' });
}

// Round up a Date to the next N-minute boundary
function roundUpTo(date, minutes) {
  const ms = minutes * 60000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

// Refresh OAuth token
async function refreshToken(tokens, tokenFile) {
  if (tokens.expiry_date && Date.now() < tokens.expiry_date - 60000) {
    return tokens.access_token;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id, client_secret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(`Token refresh failed: ${data.error} - ${data.error_description}`);
  tokens.access_token = data.access_token;
  tokens.expiry_date = Date.now() + (data.expires_in * 1000);
  fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
  return data.access_token;
}

// Get free/busy times for a calendar
async function getBusyTimes(token, calendarId, timeMin, timeMax) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(`FreeBusy failed: ${data.error.message}`);
  return data.calendars?.[calendarId]?.busy || [];
}

// Generate available slots (all times in UTC internally)
async function getAvailableSlots() {
  const primaryToken = await refreshToken(TOKENS.primary, path.join(__dirname, 'tokens-gmail1.json'));
  const secondaryToken = await refreshToken(TOKENS.secondary, path.join(__dirname, 'tokens-gmail2.json'));

  const now = new Date(); // UTC
  const cutoff = roundUpTo(new Date(now.getTime() + MIN_NOTICE_HOURS * 3600000), SLOT_MINUTES);
  const maxDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 86400000);

  // Query Google Calendar in UTC ISO
  const queryMin = cutoff.toISOString();
  const queryMax = maxDate.toISOString();

  // Get busy times from both calendars
  const [primaryBusy, secondaryBusy] = await Promise.all([
    getBusyTimes(primaryToken, 'primary', queryMin, queryMax),
    getBusyTimes(secondaryToken, 'primary', queryMin, queryMax)
  ]);

  const allBusy = [...primaryBusy, ...secondaryBusy];

  // Generate slots — iterate over days, then hours in ET, convert to UTC
  const slots = [];
  const dayIter = new Date(cutoff);
  dayIter.setUTCHours(0, 0, 0, 0); // Start of day in UTC

  while (dayIter <= maxDate) {
    const etDay = getETDayOfWeek(dayIter);

    if (BUSINESS_DAYS.includes(etDay)) {
      // For each business hour in ET, compute the UTC time
      for (let etHour = START_HOUR_ET; etHour < END_HOUR_ET; etHour++) {
        const utcHour = etToUTCHour(etHour);

        for (let slotMin = 0; slotMin < 60; slotMin += SLOT_MINUTES) {
          const slotStart = new Date(Date.UTC(
            dayIter.getUTCFullYear(), dayIter.getUTCMonth(), dayIter.getUTCDate(),
            utcHour, slotMin, 0, 0
          ));

          // Skip if before cutoff (24hr notice)
          if (slotStart < cutoff) continue;

          // Check conflict with busy periods (all in UTC ISO strings)
          const conflicts = hasConflict(slotStart, allBusy);

          if (!conflicts) {
            slots.push({
              time: slotStart.toISOString(),
              label: formatInET(slotStart, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
              date: formatInET(slotStart, { weekday: 'long', month: 'long', day: 'numeric' }),
              timeStr: formatInET(slotStart, { hour: 'numeric', minute: '2-digit' })
            });
          }
        }
      }
    }

    // Next day
    dayIter.setUTCDate(dayIter.getUTCDate() + 1);
  }

  return slots;
}

// Create calendar event (times are UTC ISO strings from the slot picker)
async function createBooking(accessToken, slotTime, name, email, summary) {
  const event = buildCalendarEvent({
    slotTime,
    name,
    email,
    summary,
    requestId: `wb-${Date.now()}`
  });

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  const data = await res.json();
  if (data.error) throw new Error(`Create event failed: ${data.error.message}`);
  return data;
}

// Send confirmation email via Gmail
async function sendConfirmation(accessToken, toEmail, name, slotTime, meetLink) {
  const slotLabel = formatInET(new Date(slotTime), { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const from = 'ian@webot.agency';

  const subject = `WeBot Discovery Call Confirmed — ${slotLabel}`;
  const text = `Hey ${name},\n\nYour discovery call is booked!\n\n${slotLabel}\n${meetLink ? 'Meet link: ' + meetLink : "We'll send a Google Meet link shortly."}\n\nWe'll also send a calendar invite to ${toEmail}.\n\nIf you need to reschedule, just reply to this email.\n\n— Ian @ WeBot Agency\nhttps://webot.agency`;

  const raw = Buffer.from(
    `To: ${toEmail}\nFrom: ${from}\nSubject: ${subject}\nContent-Type: text/plain; charset=utf-8\n\n${text}`
  ).toString('base64');

  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  const data = await res.json();
  if (data.error) console.error('Email send warning:', data.error.message);
  return data;
}

module.exports = { getAvailableSlots, createBooking, sendConfirmation, getETOffsetHours };
