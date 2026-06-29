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

  // True current weather for "Now"
  const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
  const current = currentRes.data;
  const nowTemp = Math.round(current.main.temp);
  const nowDesc = current.weather[0].description;
  const tzOffsetSeconds = current.timezone;

  // Forecast list, 3-hour blocks
  const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=8`);
  const list = forecastRes.data.list;

  const nowMs = Date.now();
  const target3Ms = nowMs + 3 * 60 * 60 * 1000;
  const target6Ms = nowMs + 6 * 60 * 60 * 1000;

  // Find the two points surrounding a target time, then interpolate
  function interpolate(targetMs) {
    let before = null, after = null;
    for (const item of list) {
      const itemMs = item.dt * 1000;
      if (itemMs <= targetMs) before = item;
      if (itemMs >= targetMs && !after) after = item;
    }
    if (!before) before = list[0];
    if (!after) after = list[list.length - 1];
    if (before === after) {
      return { temp: before.main.temp, pop: before.pop || 0, desc: before.weather[0].description };
    }
    const beforeMs = before.dt * 1000;
    const afterMs = after.dt * 1000;
    const ratio = (targetMs - beforeMs) / (afterMs - beforeMs);
    const temp = before.main.temp + (after.main.temp - before.main.temp) * ratio;
    const pop = (before.pop || 0) + ((after.pop || 0) - (before.pop || 0)) * ratio;
    // Use whichever data point is closer in time for the description
    const desc = ratio < 0.5 ? before.weather[0].description : after.weather[0].description;
    return { temp, pop, desc };
  }

  const at3 = interpolate(target3Ms);
  const at6 = interpolate(target6Ms);
  const nowPopSource = interpolate(nowMs);

  // Round the TARGET time to the nearest hour for the label (in local time)
  function labelForTarget(targetMs) {
    const localMs = targetMs + tzOffsetSeconds * 1000 - (new Date().getTimezoneOffset() * 0); 
    const roundedHourMs = Math.round(targetMs / (60 * 60 * 1000)) * 60 * 60 * 1000;
    const localRounded = roundedHourMs + tzOffsetSeconds * 1000;
    const d = new Date(localRounded);
    return d.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  }

  function formatLine(label, temp, desc, pop) {
    return `${label}: ${Math.round(temp)}°F, ${desc}, ${Math.round(pop * 100)}% chance of rain`;
  }

  const lines = [
    formatLine("Now", nowTemp, nowDesc, nowPopSource.pop),
    formatLine(labelForTarget(target3Ms), at3.temp, at3.desc, at3.pop),
    formatLine(labelForTarget(target6Ms), at6.temp, at6.desc, at6.pop),
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