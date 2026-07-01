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

const DAILY_LIMIT = 950;

async function checkAndIncrementUsage() {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('api_usage')
    .select('call_count')
    .eq('date', today)
    .single();

  const currentCount = existing ? existing.call_count : 0;

  if (currentCount >= DAILY_LIMIT) {
    return false;
  }

  if (existing) {
    await supabase
      .from('api_usage')
      .update({ call_count: currentCount + 1 })
      .eq('date', today);
  } else {
    await supabase
      .from('api_usage')
      .insert({ date: today, call_count: 1 });
  }

  return true;
}

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

  // Check daily usage cap
  const allowed = await checkAndIncrementUsage();
  if (!allowed) {
    throw new Error("Daily weather lookup limit reached. Please try again tomorrow.");
  }

  // Current weather for "Now"
  const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
  const current = currentRes.data;
  const nowTemp = Math.round(current.main.temp);
  const nowDesc = current.weather[0].main;
  const tzOffsetSeconds = current.timezone;

  // 3-hour forecast — get enough entries to find +3hr and +6hr slots
  const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=4`);
  const list = forecastRes.data.list;

  const nowMs = Date.now();
  const target3Ms = nowMs + 3 * 60 * 60 * 1000;
  const target6Ms = nowMs + 6 * 60 * 60 * 1000;

  // Find closest data point to each target time
  function closest(targetMs) {
    return list.reduce((best, item) => {
      const itemMs = item.dt * 1000;
      const bestMs = best.dt * 1000;
      return Math.abs(itemMs - targetMs) < Math.abs(bestMs - targetMs) ? item : best;
    });
  }

  const plus3 = closest(target3Ms);
  const plus6 = closest(target6Ms);

  // Format time using location's local timezone offset
  function formatTime(unixSeconds) {
    const localMs = (unixSeconds + tzOffsetSeconds) * 1000;
    return new Date(localMs).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  }

  function formatLine(label, temp, desc, pop) {
    const rain = Math.round((pop || 0) * 100);
    return `${label}: ${temp}°F, ${desc}, ${rain}% rain`;
  }

  const lines = [
    formatLine("Now", nowTemp, nowDesc, 0),
    formatLine(formatTime(plus3.dt), Math.round(plus3.main.temp), plus3.weather[0].main, plus3.pop),
    formatLine(formatTime(plus6.dt), Math.round(plus6.main.temp), plus6.weather[0].main, plus6.pop),
  ];

  return `📍 ${cityName}:\n${lines.join("\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const incomingMsg = req.body?.Body?.trim();
  const sender = req.body?.From;

  if (incomingMsg?.toUpperCase() === "STOP") {
    await supabase
      .from("subscribers")
      .update({ opted_in: false })
      .eq("phone_number", sender);
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You've been unsubscribed from Red Sky. Reply START to resubscribe."
    });
    return res.status(200).send("OK");
  }

  if (incomingMsg?.toUpperCase() === "START") {
    await supabase
      .from("subscribers")
      .upsert({ phone_number: sender, opted_in: true });
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You're resubscribed to Red Sky! Text any city or zip code to get a forecast. Reply STOP to cancel."
    });
    return res.status(200).send("OK");
  }

  if (incomingMsg?.toUpperCase() === "HELP") {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "Red Sky: Text any city or zip code for a weather forecast. Reply STOP to unsubscribe. Msg & data rates may apply."
    });
    return res.status(200).send("OK");
  }

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("opted_in")
    .eq("phone_number", sender)
    .single();

  if (!subscriber || !subscriber.opted_in) {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You're not subscribed to Red Sky. Sign up at https://getredsky.com to get started."
    });
    return res.status(200).send("OK");
  }

  let replyText;
  try {
    replyText = await getWeather(incomingMsg);
  } catch (err) {
    console.error(err.message);
    replyText = err.message.includes("limit reached")
      ? err.message
      : "Sorry, I couldn't find weather for that location. Try a city name like New York or a zip code like 10001.";
  }

  await client.messages.create({
    from: process.env.TWILIO_SMS_NUMBER,
    to: sender,
    body: replyText,
  });

  res.status(200).send("OK");
}
