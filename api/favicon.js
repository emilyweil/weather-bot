import { readFileSync } from "fs";
import { join } from "path";

export default function handler(req, res) {
  try {
    const filePath = join(process.cwd(), "RedSkyFavicon1.png");
    const img = readFileSync(filePath);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(img);
  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
}
