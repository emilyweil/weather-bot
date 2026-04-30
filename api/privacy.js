export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Weather Bot Privacy Policy</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p>Last updated: April 2026</p>

        <h2>What We Collect</h2>
        <p>When you text this service, we collect only your phone number and the location query you send, solely to provide you with a weather forecast.</p>

        <h2>How We Use Your Data</h2>
        <p>Your phone number and location query are used only to return a weather forecast response. We do not store, sell, or share your data with any third parties.</p>

        <h2>Opt Out</h2>
        <p>You can stop receiving messages at any time by replying STOP to any message. You can restart the service at any time by texting a city name or zip code.</p>

        <h2>Contact</h2>
        <p>If you have any questions about this privacy policy, reply HELP to any message.</p>
      </body>
    </html>
  `);
}