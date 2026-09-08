import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

async function main() {
  // Read the model catalog at runtime instead of hardcoding model ids — the set,
  // the default, and each model's languages change over time.
  const { models, dialogue_models } = await client.models.list();

  for (const m of models) {
    // `default` = used when a request omits `model`; `recommended` = what to reach
    // for on a new integration (may differ from the default). `endpoints` lists the
    // routes the model is valid on — only streaming-native models serve
    // /v1/audio/stream/with-timestamps.
    const flags = [
      m.default && "default",
      m.recommended && "recommended",
      m.deprecated && "deprecated",
      m.curated_voices && "curated-voices",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`${m.id}${flags ? `  [${flags}]` : ""}`);
    console.log(`  ${m.description}`);
    console.log(`  languages: ${m.languages.join(", ")}`);
    console.log(`  endpoints: ${m.endpoints.join(", ")}\n`);
  }

  // Multi-speaker models are returned separately: they are valid only on
  // POST /v1/audio/dialogue, not the single-utterance endpoints.
  if (dialogue_models.length) {
    console.log(`Dialogue (multi-speaker) models: ${dialogue_models.map((m) => m.id).join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
