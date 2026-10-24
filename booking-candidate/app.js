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
