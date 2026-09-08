import "dotenv/config";
import { SpeechifyClient, SpeechifyError } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// SpeechifyError.body is typed `unknown`; this is the shape it carries on the wire.
interface ErrorEnvelope {
  error?: { code?: string; message?: string };
  request_id?: string;
}

// Map an error CODE (not the HTTP status) to friendly, actionable guidance.
// Several distinct outcomes share a status — 402 is both a balance problem and a
// spend-cap problem; 404 is both an unknown voice and an unknown model — so the code
// is what you branch on. Anything not listed falls through to the message from the API.
function guidanceFor(code: string | undefined): string {
  switch (code) {
    case "voice_not_found":
      return "Unknown voice_id. List available voices with client.voices.list().";
    case "not_found":
      return "Unknown model. List available models with client.models.list().";
    case "content_policy_violation":
      // Persistent: the text was screened before synthesis and is not billed.
      // Retrying the SAME text will fail again — change the text.
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
  try {
    // Deliberately trigger a 404 voice_not_found by passing a bogus voice_id.
    await client.audio.speech({
      input: "This request is designed to fail so we can handle the error.",
      voice_id: "this-voice-does-not-exist",
      audio_format: "mp3",
      model: "simba-3.2",
    });

    console.log("Unexpected success — the voice_id above should not exist.");
  } catch (err) {
    // The SDK throws SpeechifyError for non-2xx responses. Catch it specifically so
    // real bugs (network, programming errors) still surface as unhandled.
    if (err instanceof SpeechifyError) {
      // statusCode = HTTP status; the machine-readable code lives in the body envelope
      // { error: { code, message }, request_id }. Always log request_id when reporting.
      const status = err.statusCode;
      const body = err.body as ErrorEnvelope | undefined;
      const code = body?.error?.code;
      const message = body?.error?.message;
      const requestId = body?.request_id;

      console.error(`Speechify API error (HTTP ${status}, code ${code ?? "unknown"})`);
      console.error(`  ${message ?? "no message"}`);
      console.error(`  ${guidanceFor(code)}`);
      console.error(`  request_id: ${requestId ?? "unknown"}`);

      // Exit non-zero so callers/CI see this as a failure.
      process.exit(1);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
