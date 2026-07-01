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
  if (currentCount >= DAILY_LIMIT) return false;

  if (existing) {
    await supabase.from('api_usage').update({ call_count: currentCount + 1 }).eq('date', today);
  } else {
    await supabase.from('api_usage').insert({ date: today, call_count: 1 });
  }
  return true;
}

// Map Open-Meteo weather codes to short descriptions
function weatherDesc(code) {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed";
}

async function getWeather(location) {
  // Geocode the location using OpenWeatherMap's free geocoding
  const geoKey = process.env.OPENWEATHER_API_KEY;
  let cityName, lat, lon, timezone;

  try {
    const zipRes = await axios.get(`https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(location)},US&appid=${geoKey}`);
    cityName = zipRes.data.name;
    lat = zipRes.data.lat;
    lon = zipRes.data.lon;
  } catch {
    const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${geoKey}`);
    if (!geoRes.data.length) throw new Error("Location not found");
    cityName = geoRes.data[0].name;
    lat = geoRes.data[0].lat;
    lon = geoRes.data[0].lon;
  }

  // Check daily usage cap
  const allowed = await checkAndIncrementUsage();
  if (!allowed) throw new Error("Daily weather lookup limit reached. Please try again tomorrow.");

  // Fetch from Open-Meteo — no API key needed
  const weatherRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation_probability&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=fahrenheit&timezone=auto&forecast_hours=5`
  );

  const data = weatherRes.data;
  timezone = data.timezone;

  const current = data.current;
  const nowTemp = Math.round(current.temperature_2m);
  const nowDesc = weatherDesc(current.weather_code);
  const nowRain = Math.round(current.precipitation_probability || 0);

  // The hourly array starts at the current hour — indices 1-4 give +1hr through +4hr
  const hourly = data.hourly;

  function formatTime(isoString) {
    return new Date(isoString).toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: timezone,
    });
  }

  function formatLine(label, temp, code, rain) {
    return `${label}: ${Math.round(temp)}°F, ${weatherDesc(code)}, ${Math.round(rain)}% rain`;
  }

  const lines = [
    `Now: ${nowTemp}°F, ${nowDesc}, ${nowRain}% rain`,
    formatLine(formatTime(hourly.time[1]), hourly.temperature_2m[1], hourly.weather_code[1], hourly.precipitation_probability[1]),
    formatLine(formatTime(hourly.time[2]), hourly.temperature_2m[2], hourly.weather_code[2], hourly.precipitation_probability[2]),
    formatLine(formatTime(hourly.time[3]), hourly.temperature_2m[3], hourly.weather_code[3], hourly.precipitation_probability[3]),
    formatLine(formatTime(hourly.time[4]), hourly.temperature_2m[4], hourly.weather_code[4], hourly.precipitation_probability[4]),
  ];

  return `📍 ${cityName}:\n${lines.join("\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const incomingMsg = req.body?.Body?.trim();
  const sender = req.body?.From;

  if (incomingMsg?.toUpperCase() === "STOP") {
    await supabase.from("subscribers").update({ opted_in: false }).eq("phone_number", sender);
    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: sender,
      body: "You've been unsubscribed from Red Sky. Reply START to resubscribe."
    });
    return res.status(200).send("OK");
  }

  if (incomingMsg?.toUpperCase() === "START") {
    await supabase.from("subscribers").upsert({ phone_number: sender, opted_in: true });
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
