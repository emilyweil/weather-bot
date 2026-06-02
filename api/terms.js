export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Weather Bot Terms and Conditions</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Terms and Conditions</h1>
        <p>Last updated: May 2026</p>
        <p>Red Sky is a brand of Studio Emily Weil LLC.</p>
        <h2>Service Description</h2>
        <p>This service provides weather forecasts in response to user-initiated text messages. To use the service, text a city name or zip code to the number and you will receive an automated weather forecast response.</p>

        <h2>Usage</h2>
        <p>This service is provided for personal, non-commercial use. By texting this number you agree to receive automated weather forecast responses.</p>

        <h2>Opt Out</h2>
        <p>Text STOP at any time to stop receiving messages. Text START to resume the service. Text HELP for assistance.</p>

        <h2>Disclaimer</h2>
        <p>Weather forecasts are provided by OpenWeatherMap and are for informational purposes only. We are not responsible for any decisions made based on the weather information provided.</p>

        <h2>Changes to Terms</h2>
        <p>We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
      </body>
    </html>
  `);
}