import "dotenv/config";

// The "native" counterpart to the list-models recipe: GET /v1/audio/models over
// raw fetch instead of the @speechify/api SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

interface Model {
  id: string;
  name: string;
  description: string;
  default: boolean;
  recommended: boolean;
  deprecated: boolean;
  curated_voices: boolean;
  languages: string[];
  endpoints: string[];
}
interface ModelsResponse {
  models: Model[];
  dialogue_models: Model[];
}

async function main() {
  const res = await fetch("https://api.speechify.ai/v1/audio/models", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`GET /v1/audio/models → ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  const { models, dialogue_models } = (await res.json()) as ModelsResponse;

  for (const m of models) {
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
  if (dialogue_models.length) {
    console.log(`Dialogue (multi-speaker) models: ${dialogue_models.map((m) => m.id).join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
