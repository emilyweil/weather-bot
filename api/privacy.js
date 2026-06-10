export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Red Sky Privacy Policy</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { min-height: 100%; background: #4a6887; color: #ffffff; font-family: 'DM Sans', sans-serif; font-weight: 300; }
    .page { max-width: 700px; margin: 0 auto; padding: 4rem 2rem; }
    a.back { display: inline-block; margin-bottom: 3rem; font-size: 0.95rem; color: rgba(255,255,255,0.65); text-decoration: none; letter-spacing: 0.05em; }
    a.back:hover { color: #ffffff; }
    h1 { font-size: 2rem; font-weight: 200; letter-spacing: -0.01em; margin-bottom: 0.5rem; }
    .updated { font-size: 0.95rem; color: rgba(255,255,255,0.65); margin-bottom: 2.5rem; }
    h2 { font-size: 0.95rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 2rem 0 0.75rem; color: #ffffff; }
    p { font-size: 0.95rem; line-height: 1.8; color: #ffffff; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="page">
    <a class="back" href="/">&larr; Back to Red Sky</a>
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: May 2026. Red Sky is a brand of Studio Emily Weil LLC.</p>
    <h2>What We Collect</h2>
    <p>When you sign up or text this service, we collect only your phone number and the location queries you send, solely to provide you with weather forecasts.</p>
    <h2>How We Use Your Data</h2>
    <p>Your phone number and location queries are used only to return weather forecast responses. We do not store, sell, or share your data or mobile number with any third parties.</p>
    <h2>Message Frequency</h2>
    <p>You will receive one message per request you send. This service only sends messages in direct response to your inbound texts.</p>
    <h2>Message and Data Rates</h2>
    <p>Message and data rates may apply. Please check with your mobile carrier for details.</p>
    <h2>Opt Out</h2>
    <p>Reply STOP to any message to unsubscribe at any time. Reply START to resubscribe. Reply HELP for assistance.</p>
  </div>
</body>
</html>
  `);
}