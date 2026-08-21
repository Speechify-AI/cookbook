import "dotenv/config";
import fs from "node:fs";

// The "native" counterpart to the ssml-emotion recipe: same result, but calling the
// REST API directly with fetch instead of the @speechify/api SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

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

/** Shape of the POST /v1/audio/speech JSON response (snake_case on the wire). */
interface SpeechResponse {
  audio_data: string; // base64-encoded audio
  audio_format: string;
  billable_characters_count: number;
}

async function main() {
  const res = await fetch("https://api.speechify.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: ssml,
      voice_id: "geffen_32",
      audio_format: "mp3",
      model: "simba-3.2", // simba-3.2 supports full SSML + emotion control
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /v1/audio/speech → ${res.status} ${res.statusText}: ${await res.text()}`);
  }

  const data = (await res.json()) as SpeechResponse;
  fs.writeFileSync("output.mp3", Buffer.from(data.audio_data, "base64"));
  console.log(`Wrote output.mp3 (${data.billable_characters_count} billable characters)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
