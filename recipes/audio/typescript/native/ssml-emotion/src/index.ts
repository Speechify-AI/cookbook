import "dotenv/config";
import fs from "node:fs";

// The "native" counterpart to the ssml-emotion recipe: same result, but calling the
// REST API directly with fetch instead of the @speechify/api SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

// SSML input must have a single <speak> root. simba-3.2 and simba-3.0 apply <break>,
// <prosody rate> and <sub alias>. They accept <prosody pitch>, <prosody volume>,
// <emphasis> and <speechify:style emotion> but do not apply them.
const ssml = `<speak>
  Great news, the build passed!
  <break time="500ms" />
  <prosody rate="slow">But read the next part carefully.</prosody>
  <break time="300ms" />
  Do not deploy on a Friday.
  <break time="400ms" />
  Check the <sub alias="continuous integration">CI</sub> dashboard before you merge.
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
      model: "simba-3.2",
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
