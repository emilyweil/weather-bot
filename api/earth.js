import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const file = path.join(process.cwd(), "sky.png");
  const img = fs.readFileSync(file);
  res.setHeader("Content-Type", "image/png");
  res.status(200).send(img);
}