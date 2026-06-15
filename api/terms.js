export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Red Sky Terms and Conditions</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { min-height: 100%; background: #586f85; color: #ffffff; font-family: 'DM Sans', sans-serif; font-weight: 300; }
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
    <h1>Terms and Conditions</h1>
    <p class="updated">Last updated: May 2026. Red Sky is a brand of Studio Emily Weil LLC.</p>
    <h2>Service Description</h2>
    <p>Red Sky provides automated weather forecasts via SMS in response to user-initiated text messages. To use the service, text a city name or zip code to +1 989 357 8490.</p>
    <h2>Usage</h2>
    <p>This service is provided for personal, non-commercial use. By signing up you agree to receive automated weather forecast responses only if you have opted in to SMS messages.</p>
    <h2>SMS Consent</h2>
    <p>SMS consent is not a condition of service. You may create an account without opting in to receive text messages.</p>
    <h2>Opt Out</h2>
    <p>Reply STOP at any time to stop receiving messages. Reply START to resume. Reply HELP for assistance. Message and data rates may apply.</p>
    <h2>Disclaimer</h2>
    <p>Weather forecasts are provided by OpenWeatherMap for informational purposes only. We are not responsible for any decisions made based on the weather information provided.</p>
  </div>
</body>
</html>
  `);
}