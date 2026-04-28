const twilio = require("twilio");
const axios = require("axios");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function getWeather(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial&cnt=3`;

  const response = await axios.get(url);
  const forecasts = response.data.list;
  const cityName = response.data.city.name;

  const lines = forecasts.map((f) => {
    const time = new Date(f.dt * 1000).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      hour12: true,
    });
    const temp = Math.round(f.main.temp);
    const desc = f.weather[0].description;
    return `${time}: ${temp}°F, ${desc}`;
  });

  return `📍 ${cityName} Forecast:\n${lines.join("\n")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const incomingMsg = req.body?.Body?.trim();
  const sender = req.body?.From;

  let replyText;

  if (!incomingMsg) {
    replyText = "Please send a city name or zip code to get the weather!";
  } else {
    try {
      replyText = await getWeather(incomingMsg);
    } catch (err) {
      console.error(err.message);
      replyText = "Sorry, I couldn't find weather for that location. Try a city name like New York or a zip code like 10001.";
    }
  }

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: sender,
    body: replyText,
  });

  res.status(200).send("OK");
}