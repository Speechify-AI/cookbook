import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { SpeechifyClient, SpeechifyError } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Bundled sample: ~26s of NASA ISS spacewalk audio (public domain).
const samplePath = path.resolve(import.meta.dirname, "../fixtures/spacewalk.wav");

async function main() {
  // 1. Clone a voice from an audio sample (10–30s of clean speech works well).
  //    `consent` is REQUIRED: a JSON string attesting you have the speaker's
  //    permission to clone their voice. Use the real consenting person's details.
  let voice;
  try {
    voice = await client.voices.create({
      name: "cookbook-cloned-voice",
      gender: "male",
      sample: fs.createReadStream(samplePath),
      consent: JSON.stringify({ fullName: "Jane Doe", email: "jane@example.com" }),
    });
  } catch (err) {
    // Voice cloning is gated by plan. A 402 means it isn't included in yours.
    if (err instanceof SpeechifyError && err.statusCode === 402) {
      console.error(
        "\nVoice cloning isn't included in your current Speechify plan.\n" +
          "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n",
      );
      process.exit(1);
    }
    throw err;
  }
  console.log(`Cloned voice created: ${voice.id} (${voice.display_name}, type=${voice.type})`);

  try {
    // 2. Synthesize speech using the cloned voice — pass its id as voice_id.
    const speech = await client.audio.speech({
      input: "Hello from a voice cloned with the Speechify API.",
      voice_id: voice.id,
      audio_format: "mp3",
      model: "simba-english",
    });
    fs.writeFileSync("output.mp3", Buffer.from(speech.audio_data, "base64"));
    console.log("Wrote output.mp3");
  } finally {
    // 3. Clean up so cloned voices don't accumulate on your account.
    //    Remove this to keep the voice and reuse it later via voice.id.
    await client.voices.delete({ voice_id: voice.id });
    console.log(`Deleted cloned voice ${voice.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
