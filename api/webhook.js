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

const DAILY_LIMIT = 950; // safety buffer under OpenWeatherMap's 1000/day free cap

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

  // Check daily usage cap before calling the paid endpoint
  const allowed = await checkAndIncrementUsage();
  if (!allowed) {
    throw new Error("Daily weather lookup limit reached. Please try again tomorrow.");
  }

  // One Call API 4.0 - current weather
  const currentApiRes = await axios.get(`https://api.openweathermap.org/data/4.0/onecall/current?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
  const currentData = currentApiRes.data;
  const tzOffsetSeconds = currentData.timezone_offset;
  const nowPoint = currentData.data[0];

  // One Call API 4.0 - hourly timeline (next 4 hours)
  const hourlyApiRes = await axios.get(`https://api.openweathermap.org/data/4.0/onecall/timeline/1hour?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=5`);
  const hourly = hourlyApiRes.data.data; // index 0 = next hour, etc.

  function formatTime(unixSeconds) {
    const localMs = (unixSeconds + tzOffsetSeconds) * 1000;
    return new Date(localMs).toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  }

  function formatLine(label, point) {
    const temp = Math.round(point.temp);
    const desc = point.weather[0].main;
    const rain = Math.round((point.pop || 0) * 100);
    return `${label}: ${temp}°F, ${desc}, ${rain}% rain`;
  }

  const lines = [
    formatLine("Now", nowPoint),
    formatLine(formatTime(hourly[0].dt), hourly[0]),
    formatLine(formatTime(hourly[1].dt), hourly[1]),
    formatLine(formatTime(hourly[2].dt), hourly[2]),
    formatLine(formatTime(hourly[3].dt), hourly[3]),
  ];

  return `📍 ${cityName}:\n${lines.join("\n")}`;
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
      body: "You've been unsubscribed from Red Sky. Reply START to resubscribe."
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
      body: "You're resubscribed to Red Sky! Text any city or zip code to get a forecast. Reply STOP to cancel."
    });
    return res.status(200).send("OK");
  }

  // Handle HELP
  if (incomingMsg?.toUpperCase() === "HELP") {
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "Red Sky: Text any city or zip code for a weather forecast. Reply STOP to unsubscribe. Msg & data rates may apply."
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
      body: "You're not subscribed to Red Sky. Sign up at https://getredsky.com to get started."
    });
    return res.status(200).send("OK");
  }

  // Send weather
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
