import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

async function main() {
  const response = await client.audio.speech({
    input: "Hello! This is the Speechify text-to-speech API.",
    voice_id: "george",
    audio_format: "mp3",
    model: "simba-english",
  });

  // The SDK returns the audio as a base64-encoded string.
  const outFile = "output.mp3";
  fs.writeFileSync(outFile, Buffer.from(response.audio_data, "base64"));
  console.log(`Wrote ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
