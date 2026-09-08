import "dotenv/config";
import fs from "node:fs";

// The "native" counterpart to the multilingual recipe: GET /v1/voices to discover
// a voice, then POST /v1/audio/speech — over raw fetch instead of the SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

// Target locale is overridable; default is French. simba-3.0 supports
// en, de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR — simba-3.2 is English-only
// (a non-English voice on it returns 400), so multilingual work uses simba-3.0.
const LOCALE = process.env.LOCALE || "fr-FR";
const MODEL = "simba-3.0";

// Keep the sample French; in a real app you'd match the text to LOCALE.
const TEXT = "Bonjour ! Ceci est l'API de synthèse vocale de Speechify.";

interface Voice {
  id: string;
}
interface VoicesResponse {
  voices: Voice[];
}
interface SpeechResponse {
  audio_data: string; // base64-encoded audio
  billable_characters_count: number;
}

async function main() {
  // Discover a voice at runtime instead of hardcoding a non-English id we can't
  // verify: list voices filtered to the locale + model and take the first match.
  const listUrl = new URL("https://api.speechify.ai/v1/voices");
  listUrl.searchParams.set("locale", LOCALE);
  listUrl.searchParams.set("model", MODEL);

  const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!listRes.ok) {
    throw new Error(
      `GET /v1/voices → ${listRes.status} ${listRes.statusText}: ${await listRes.text()}`,
    );
  }
  const { voices } = (await listRes.json()) as VoicesResponse;

  const voiceId = voices[0]?.id;
  if (!voiceId) {
    console.log(`No ${MODEL} voice found for locale "${LOCALE}". Try another LOCALE.`);
    return; // exit 0 — nothing to synthesize
  }

  // `language` (BCP-47) selects the training; omit it and the voice's own locale
  // decides. We pass it explicitly to lock the output language to LOCALE.
  const res = await fetch("https://api.speechify.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: TEXT,
      voice_id: voiceId,
      model: MODEL,
      language: LOCALE,
      audio_format: "mp3",
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /v1/audio/speech → ${res.status} ${res.statusText}: ${await res.text()}`);
  }

  const data = (await res.json()) as SpeechResponse;
  fs.writeFileSync("output.mp3", Buffer.from(data.audio_data, "base64"));
  console.log(
    `Wrote output.mp3 (${LOCALE}, voice ${voiceId}, ${data.billable_characters_count} billable characters)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
