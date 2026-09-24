import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const file = path.join(process.cwd(), "RedSkyFlavicon1.png");
    const img = fs.readFileSync(file);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(img);
  } catch (err) {
    console.error("Favicon error:", err.message);
    res.status(404).send("Not found: " + err.message);
  }
}
