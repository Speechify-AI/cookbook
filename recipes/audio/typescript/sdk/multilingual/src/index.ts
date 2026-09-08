import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Target locale is overridable; default is French. simba-3.0 supports
// en, de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR — simba-3.2 is English-only
// (a non-English voice on it returns 400), so multilingual work uses simba-3.0.
const LOCALE = process.env.LOCALE || "fr-FR";
const MODEL = "simba-3.0";

// Keep the sample French; in a real app you'd match the text to LOCALE.
const TEXT = "Bonjour ! Ceci est l'API de synthèse vocale de Speechify.";

async function main() {
  // Discover a voice at runtime instead of hardcoding a non-English id we can't
  // verify: list voices filtered to the locale + model and take the first match.
  const page = await client.voices.list({ locale: LOCALE, model: MODEL });

  let voiceId: string | undefined;
  for await (const v of page) {
    voiceId = v.id; // first match wins
    break;
  }

  if (!voiceId) {
    console.log(`No ${MODEL} voice found for locale "${LOCALE}". Try another LOCALE.`);
    return; // exit 0 — nothing to synthesize
  }

  // `language` (BCP-47) selects the training; omit it and the voice's own locale
  // decides. We pass it explicitly to lock the output language to LOCALE.
  const response = await client.audio.speech({
    input: TEXT,
    voice_id: voiceId,
    model: MODEL,
    language: LOCALE,
    audio_format: "mp3",
  });

  // The SDK returns the audio as a base64-encoded string.
  fs.writeFileSync("output.mp3", Buffer.from(response.audio_data, "base64"));
  console.log(`Wrote output.mp3 (${LOCALE}, voice ${voiceId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
