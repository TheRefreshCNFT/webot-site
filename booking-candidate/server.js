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
