import "dotenv/config";
import { SpeechifyClient, SpeechifyError } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Which model + language combinations does a voice support? Two questions:
//  1. Which voices advertise model X in locale Y? (filtered list)
//  2. What does one specific voice support? (single lookup)
const LOCALE = "en";
const MODEL = "simba-3.2";
const VOICE_ID = "geffen_32";

// A voice's own models[] is the authority on what your workspace can synthesize
// with it (it reflects clones + enablement). Render it so a picker is driven by
// the voice, not by an assumption about the model.
function formatSupport(models: { name: string; languages: { locale: string }[] }[]): string {
  return models
    .map((m) => `${m.name}: ${m.languages.map((l) => l.locale).join(", ")}`)
    .join("  |  ");
}

async function main() {
  // Part 1 — voices that advertise `model` in `locale`. The `model` filter returns
  // voices claiming that model; each voice's models[] still holds the full truth.
  console.log(`Voices for locale="${LOCALE}", model="${MODEL}":\n`);
  const page = await client.voices.list({ locale: LOCALE, model: MODEL });
  for await (const voice of page) {
    console.log(`${voice.id}  ${voice.display_name}  (${voice.locale})`);
    console.log(`  ${formatSupport(voice.models)}\n`);
  }

  // Part 2 — one voice by id. Handle a retired/unknown id gracefully so the recipe
  // still completes.
  console.log(`Single voice lookup: ${VOICE_ID}`);
  try {
    const voice = await client.voices.get({ voice_id: VOICE_ID });
    console.log(`${voice.id}  ${voice.display_name}  (${voice.locale})`);
    console.log(`  ${formatSupport(voice.models)}`);
  } catch (err) {
    // 404 voice_not_found → the id is gone from this workspace; keep going.
    if (err instanceof SpeechifyError && err.statusCode === 404) {
      console.log(`  ${VOICE_ID} not found (list voices with client.voices.list).`);
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
