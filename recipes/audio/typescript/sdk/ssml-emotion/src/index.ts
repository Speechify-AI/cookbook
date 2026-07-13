import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// SSML input must have a single <speak> root. Speechify supports standard SSML
// (prosody / break / emphasis) plus the <speechify:style emotion="..."> tag.
// Emotions: angry, cheerful, sad, terrified, relaxed, fearful, surprised, calm,
//           assertive, energetic, warm, direct, bright.
const ssml = `<speak>
  <speechify:style emotion="cheerful">Great news — the build passed!</speechify:style>
  <break time="500ms" />
  <prosody rate="slow" pitch="low">But read the next part carefully.</prosody>
  <break time="300ms" />
  <speechify:style emotion="assertive">Do not deploy on a Friday.</speechify:style>
  <break time="400ms" />
  This is <emphasis level="strong">critical</emphasis>.
</speak>`;

async function main() {
  const response = await client.audio.speech({
    input: ssml,
    voice_id: "george",
    audio_format: "mp3",
    model: "simba-english", // simba-english supports full SSML + emotion control
  });

  const outFile = "output.mp3";
  fs.writeFileSync(outFile, Buffer.from(response.audio_data, "base64"));
  console.log(`Wrote ${outFile} (${response.billable_characters_count} billable characters)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
