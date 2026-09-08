import "dotenv/config";

// The "native" counterpart to the error-handling recipe: handle the raw REST error
// envelope from POST /v1/audio/speech instead of catching the SDK's SpeechifyError.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

/** The error envelope every non-2xx response returns. */
interface ErrorEnvelope {
  error: { code: string; message: string };
  request_id?: string;
}

// Map an error CODE (not the HTTP status) to friendly, actionable guidance. Several
// distinct outcomes share a status — 402 is balance vs spend-cap, 404 is unknown voice
// vs unknown model — so the code is what you branch on.
function guidanceFor(code: string | undefined): string {
  switch (code) {
    case "voice_not_found":
      return "Unknown voice_id. List voices with GET /v1/voices.";
    case "not_found":
      return "Unknown model. List models with GET /v1/audio/models.";
    case "content_policy_violation":
      // Persistent: text screened before synthesis, not billed. Do not retry same text.
      return "Text failed content screening. Do not retry the same text; edit it.";
    case "rate_limited":
      return "Too many requests per second. Back off and honour the Retry-After header.";
    case "concurrency_limited":
      return "Too many in-flight requests. Reduce concurrency; honour Retry-After.";
    case "payment_required":
      return "Workspace balance exhausted. Top up the workspace.";
    case "spend_cap_exceeded":
      return "This API key hit its monthly USD spend cap. Raise the cap or use another key.";
    default:
      return "Unhandled error code — see message above.";
  }
}

async function main() {
  const res = await fetch("https://api.speechify.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Deliberately bogus voice_id → 404 voice_not_found, so we can handle it.
      input: "This request is designed to fail so we can handle the error.",
      voice_id: "this-voice-does-not-exist",
      audio_format: "mp3",
      model: "simba-3.2",
    }),
  });

  if (!res.ok) {
    // Prefer request_id from the header; the body carries it too. Log it on every error.
    const requestId = res.headers.get("Speechify-Request-Id") ?? undefined;
    const envelope = (await res.json().catch(() => undefined)) as ErrorEnvelope | undefined;
    const code = envelope?.error?.code;
    const message = envelope?.error?.message;

    console.error(`Speechify API error (HTTP ${res.status}, code ${code ?? "unknown"})`);
    console.error(`  ${message ?? "no message"}`);
    console.error(`  ${guidanceFor(code)}`);

    // On 429, always wait the Retry-After header (seconds) before retrying.
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      console.error(`  Retry-After: ${retryAfter ?? "unknown"} seconds`);
    }

    console.error(`  request_id: ${requestId ?? envelope?.request_id ?? "unknown"}`);
    process.exit(1);
  }

  console.log("Unexpected success — the voice_id above should not exist.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
