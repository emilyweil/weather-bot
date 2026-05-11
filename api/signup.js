import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required." });

  // Basic E.164 format check
  const cleaned = phone.replace(/\s+/g, "");
  if (!/^\+1\d{10}$/.test(cleaned)) {
    return res.status(400).json({ error: "Please enter a valid US number in the format +12125551234." });
  }

  try {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: cleaned,
      body: "You're subscribed to Weatherline! Text any city or zip code to get a weather forecast. Reply STOP to cancel, HELP for help. Msg & data rates may apply."
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send confirmation. Please try again." });
  }
}