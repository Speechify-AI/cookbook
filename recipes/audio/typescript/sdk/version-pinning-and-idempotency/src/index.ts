import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

// API VERSION PINNING. `version` fixes the dated wire contract this client speaks.
// Resolution order server-side: request header → workspace default → oldest supported.
// The SDK auto-sends its build-date version; pass `version` to override and opt into a
// specific dated contract (YYYY-MM-DD). Breaking wire changes ship under new dates.
const client = new SpeechifyClient({
  token: process.env.SPEECHIFY_API_KEY,
  version: "2026-09-13",
});

async function main() {
  // IDEMPOTENCY. Generate the key ONCE and reuse it across retries of the SAME
  // logical request. Replay within 24h returns the first response (server sets
  // `Idempotent-Replayed: true`). Same key + different body → 409 idempotency_conflict.
  const key = crypto.randomUUID();

  // consent-challenge creation is rate-limited (a few dozen/hour per workspace),
  // so this recipe calls it exactly twice. On 429 honour `Retry-After`.
  const first = await client.voices.consentChallenges.create({
    "Idempotency-Key": key,
    full_name: "Jane Doe",
  });
  console.log(`1st challenge id: ${first.id}`);
  console.log(`  phrase: ${first.phrase}`);

  // Same key, same body → server replays the first result instead of minting a new one.
  const second = await client.voices.consentChallenges.create({
    "Idempotency-Key": key,
    full_name: "Jane Doe",
  });
  console.log(`2nd challenge id: ${second.id}`);

  // Self-proving: replayed call returns the SAME challenge id.
  console.log(first.id === second.id ? "✅ ids match — replay proven" : "❌ ids differ");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
