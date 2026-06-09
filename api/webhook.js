import twilio from "twilio";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
async function getWeather(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // First geocode the location to get clean city name and coordinates
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
  const zipUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(location)},US&appid=${apiKey}`;

  let cityName, lat, lon;

  try {
    // Try zip code first
    const zipRes = await axios.get(zipUrl);
    cityName = zipRes.data.name;
    lat = zipRes.data.lat;
    lon = zipRes.data.lon;
  } catch {
    // Fall back to city name search
    const geoRes = await axios.get(geoUrl);
    if (!geoRes.data.length) throw new Error("Location not found");
    cityName = geoRes.data[0].name;
    lat = geoRes.data[0].lat;
    lon = geoRes.data[0].lon;
  }

  // Get forecast using coordinates
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=3`;
  const response = await axios.get(forecastUrl);
  const forecasts = response.data.list;

  const labels = ["Now", "In 3 hours", "In 6 hours"];
  const lines = forecasts.map((f, i) => {
    const temp = Math.round(f.main.temp);
    const desc = f.weather[0].description;
    const rain = Math.round((f.pop || 0) * 100);
    return `${labels[i]}: ${temp}°F, ${desc}, ${rain}% chance of rain`;
  });

  return `📍 ${cityName} Forecast:\n${lines.join("\n")}`;
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const incomingMsg = req.body?.Body?.trim();
  const sender = req.body?.From;

  // Handle STOP
  if (incomingMsg?.toUpperCase() === "STOP") {
    await supabase
      .from("subscribers")
      .update({ opted_in: false })
      .eq("phone_number", sender);
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You've been unsubscribed from Weatherline. Reply START to resubscribe."
    });
    return res.status(200).send("OK");
  }

  // Handle START
  if (incomingMsg?.toUpperCase() === "START") {
    await supabase
      .from("subscribers")
      .upsert({ phone_number: sender, opted_in: true });
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You're resubscribed to Weatherline! Text any city or zip code to get a forecast. Reply STOP to cancel."
    });
    return res.status(200).send("OK");
  }

  // Handle HELP
  if (incomingMsg?.toUpperCase() === "HELP") {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "Weatherline: Text any city or zip code for a weather forecast. Reply STOP to unsubscribe. Msg & data rates may apply."
    });
    return res.status(200).send("OK");
  }

  // Check if sender is opted in
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("opted_in")
    .eq("phone_number", sender)
    .single();

  if (!subscriber || !subscriber.opted_in) {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You're not subscribed to Weatherline. Sign up at https://weather-bot-plum-two.vercel.app to get started."
    });
    return res.status(200).send("OK");
  }

  // Send weather
  let replyText;
  try {
    replyText = await getWeather(incomingMsg);
  } catch (err) {
    console.error(err.message);
    replyText = "Sorry, I couldn't find weather for that location. Try a city name like New York or a zip code like 10001.";
  }

  await client.messages.create({
    from: process.env.TWILIO_SMS_NUMBER,
    to: sender,
    body: replyText,
  });

  res.status(200).send("OK");
}