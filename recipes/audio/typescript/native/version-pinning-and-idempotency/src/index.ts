import "dotenv/config";

// The "native" counterpart: POST /v1/voices/consent-challenges over raw fetch,
// showing API version pinning and idempotency as plain HTTP headers.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

interface ConsentChallenge {
  id: string;
  phrase: string;
  expires_at: string;
}

async function mint(key: string): Promise<Response> {
  // `Speechify-Version` pins the dated wire contract (resolution: request header →
  // workspace default → oldest supported). `Idempotency-Key` makes this side-effect
  // POST safe to retry — same key within 24h replays the first response.
  return fetch("https://api.speechify.ai/v1/voices/consent-challenges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Speechify-Version": "2026-09-13",
      "Idempotency-Key": key,
    },
    body: JSON.stringify({ full_name: "Jane Doe" }),
  });
}

async function main() {
  // One key, reused across both calls (retries of the SAME logical request).
  const key = crypto.randomUUID();

  // consent-challenge creation is rate-limited (a few dozen/hour per workspace),
  // so call it exactly twice. On 429 honour `Retry-After`.
  const res1 = await mint(key);
  if (!res1.ok) {
    throw new Error(
      `POST consent-challenges → ${res1.status} ${res1.statusText}: ${await res1.text()}`,
    );
  }
  const first = (await res1.json()) as ConsentChallenge;
  console.log(`1st challenge id: ${first.id}`);

  const res2 = await mint(key);
  if (!res2.ok) {
    throw new Error(
      `POST consent-challenges → ${res2.status} ${res2.statusText}: ${await res2.text()}`,
    );
  }
  const second = (await res2.json()) as ConsentChallenge;
  console.log(`2nd challenge id: ${second.id}`);

  // The server flags a replay with this response header.
  console.log(`Idempotent-Replayed: ${res2.headers.get("Idempotent-Replayed")}`);
  console.log(first.id === second.id ? "✅ ids match — replay proven" : "❌ ids differ");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
