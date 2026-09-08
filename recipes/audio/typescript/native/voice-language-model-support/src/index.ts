import "dotenv/config";

// The "native" counterpart: GET /v1/voices over raw fetch instead of the
// @speechify/api SDK. Answers which model + language combinations a voice supports.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const LOCALE = "en";
const MODEL = "simba-3.2";
const VOICE_ID = "geffen_32";

// Minimal shapes for the fields this recipe reads.
interface Voice {
  id: string;
  display_name: string;
  locale: string;
  models: { name: string; languages: { locale: string }[] }[];
}
interface VoicesResponse {
  voices: Voice[];
}

// A voice's own models[] is the authority on what your workspace can synthesize
// with it (clones + enablement). Render it so a picker is driven by the voice.
function formatSupport(models: Voice["models"]): string {
  return models
    .map((m) => `${m.name}: ${m.languages.map((l) => l.locale).join(", ")}`)
    .join("  |  ");
}

async function main() {
  // Part 1 — voices advertising `model` in `locale`. The `model` query filter returns
  // voices claiming that model; each voice's models[] still holds the full truth.
  console.log(`Voices for locale="${LOCALE}", model="${MODEL}":\n`);
  const url = `https://api.speechify.ai/v1/voices?locale=${LOCALE}&model=${MODEL}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`GET /v1/voices → ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  const { voices } = (await res.json()) as VoicesResponse;
  for (const voice of voices) {
    console.log(`${voice.id}  ${voice.display_name}  (${voice.locale})`);
    console.log(`  ${formatSupport(voice.models)}\n`);
  }

  // Part 2 — one voice by id. A missing id returns 404 voice_not_found; skip it so
  // the recipe still completes.
  console.log(`Single voice lookup: ${VOICE_ID}`);
  const one = await fetch(`https://api.speechify.ai/v1/voices/${VOICE_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (one.status === 404) {
    console.log(`  ${VOICE_ID} not found (list voices with GET /v1/voices).`);
    return;
  }
  if (!one.ok) {
    throw new Error(
      `GET /v1/voices/${VOICE_ID} → ${one.status} ${one.statusText}: ${await one.text()}`,
    );
  }
  const voice = (await one.json()) as Voice;
  console.log(`${voice.id}  ${voice.display_name}  (${voice.locale})`);
  console.log(`  ${formatSupport(voice.models)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
