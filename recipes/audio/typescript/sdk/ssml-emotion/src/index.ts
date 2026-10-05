import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

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

async function main() {
  const response = await client.audio.speech({
    input: ssml,
    voice_id: "geffen_32",
    audio_format: "mp3",
    model: "simba-3.2",
  });

  const outFile = "output.mp3";
  fs.writeFileSync(outFile, Buffer.from(response.audio_data, "base64"));
  console.log(`Wrote ${outFile} (${response.billable_characters_count} billable characters)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
