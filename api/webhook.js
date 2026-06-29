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

  // Geocode the location
  let cityName, lat, lon;
  try {
    const zipRes = await axios.get(`https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(location)},US&appid=${apiKey}`);
    cityName = zipRes.data.name;
    lat = zipRes.data.lat;
    lon = zipRes.data.lon;
  } catch {
    const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`);
    if (!geoRes.data.length) throw new Error("Location not found");
    cityName = geoRes.data[0].name;
    lat = geoRes.data[0].lat;
    lon = geoRes.data[0].lon;
  }

  // Get true current weather for "Now"
  const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
  const current = currentRes.data;
  const nowTemp = Math.round(current.main.temp);
  const nowDesc = current.weather[0].description;

  // Get forecast list (3-hour intervals) to find +3hr and +6hr points
  const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=6`);
  const list = forecastRes.data.list;

  const nowMs = Date.now();
  const target3 = nowMs + 3 * 60 * 60 * 1000;
  const target6 = nowMs + 6 * 60 * 60 * 1000;

  function closestTo(targetMs) {
    return list.reduce((best, item) => {
      const itemMs = item.dt * 1000;
      const bestMs = best.dt * 1000;
      return Math.abs(itemMs - targetMs) < Math.abs(bestMs - targetMs) ? item : best;
    });
  }

  const plus3 = closestTo(target3);
  const plus6 = closestTo(target6);

  // Use nearest forecast entry to "now" for rain probability on the "Now" line
  const nowPop = Math.round((closestTo(nowMs).pop || 0) * 100);

  function formatLine(label, temp, desc, pop) {
    return `${label}: ${temp}°F, ${desc}, ${pop}% chance of rain`;
  }

  function formatTimeLabel(item) {
    return new Date(item.dt * 1000).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      hour12: true,
    });
  }

  const lines = [
    formatLine("Now", nowTemp, nowDesc, nowPop),
    formatLine(formatTimeLabel(plus3), Math.round(plus3.main.temp), plus3.weather[0].description, Math.round((plus3.pop || 0) * 100)),
    formatLine(formatTimeLabel(plus6), Math.round(plus6.main.temp), plus6.weather[0].description, Math.round((plus6.pop || 0) * 100)),
  ];

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