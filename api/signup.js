import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { phone, consent } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required." });

    const cleaned = phone.replace(/\s+/g, "");
    if (!/^\+1\d{10}$/.test(cleaned)) {
      return res.status(400).json({ error: "Please enter a valid US number in the format +12125551234." });
    }

    const { data: existing } = await supabase
      .from("subscribers")
      .select("phone_number, opted_in")
      .eq("phone_number", cleaned)
      .single();

    if (existing) {
      if (consent && !existing.opted_in) {
        await supabase.from("subscribers").update({ opted_in: true }).eq("phone_number", cleaned);
      } else if (existing.opted_in) {
        return res.status(400).json({ error: "This number is already subscribed." });
      }
    } else {
      await supabase.from("subscribers").insert({ phone_number: cleaned, opted_in: consent ? true : false });
    }

    if (consent) {
      await client.messages.create({
        from: process.env.TWILIO_SMS_NUMBER,
        to: cleaned,
        body: "You're subscribed to Red Sky, a service of Studio Emily Weil LLC. Text any city or zip code to get a weather forecast. Reply STOP to cancel, HELP for help. Msg & data rates may apply."
      });
      return res.status(200).json({ success: true, message: "subscribed" });
    }

    return res.status(200).json({ success: true, message: "registered" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message || "Something went wrong. Please try again." });
  }
}