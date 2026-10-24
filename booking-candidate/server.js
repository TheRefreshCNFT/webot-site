const express = require('express');
const { getAvailableSlots, createBooking, sendConfirmation, etToUTC } = require('./calendar');
const path = require('path');

const app = express();
app.use(express.json());

// CORS — allow webot.agency
app.use((req, res, next) => {
  const allowed = ['https://webot.agency', 'http://localhost:3000', 'http://localhost:5500'];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available slots
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await getAvailableSlots();
    // Group by date for the frontend
    const grouped = {};
    for (const slot of slots) {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push({
        time: slot.time,
        label: slot.timeStr
      });
    }
    res.json({ success: true, slots: grouped });
  } catch (err) {
    console.error('Slots error:', err);
    res.status(500).json({ success: false, error: 'Failed to load available slots. Please try again.' });
  }
});

// Book a slot
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, summary, slotTime } = req.body;

    // Validate
    if (!name || !email || !summary || !slotTime) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    // Verify the slot is still available (re-check before booking)
    const slots = await getAvailableSlots();
    const slotExists = slots.some(s => s.time === slotTime);
    if (!slotExists) {
      return res.status(409).json({ success: false, error: 'This slot is no longer available. Please pick another.' });
    }

    // Get fresh token and create the event
    const fs = require('fs');
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

    const accessToken = tokenData.access_token;

    // Create calendar event (includes Google Meet link)
    const event = await createBooking(accessToken, slotTime, name, email, summary);

    // Send confirmation email
    const meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null;
    await sendConfirmation(accessToken, email, name, slotTime, meetLink);

    const slotLabel = new Date(slotTime).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'
    });

    console.log(`Booked: ${name} (${email}) — ${slotLabel}`);

    res.json({
      success: true,
      message: 'Your discovery call is booked!',
      event: {
        time: slotLabel,
        meetLink
      }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, error: 'Booking failed. Please try again.' });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`WeBot Booking API running on port ${PORT}`);
});
