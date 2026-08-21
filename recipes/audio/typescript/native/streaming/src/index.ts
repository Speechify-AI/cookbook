import "dotenv/config";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// The "native" counterpart to the streaming recipe: same result, but calling the
// REST API directly with fetch instead of the @speechify/api SDK. Useful when you
// can't (or don't want to) add the SDK, or to see the raw wire protocol.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

async function main() {
  // `POST /v1/audio/stream` returns raw audio bytes (HTTP chunked) instead of
  // JSON + base64. The `Accept` header selects the container/codec:
  //   audio/mpeg | audio/ogg | audio/aac | audio/pcm (returns audio/L16, 24 kHz mono).
  const res = await fetch("https://api.speechify.ai/v1/audio/stream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      input:
        "Streaming lets you start playing audio before the whole clip is ready. " +
        "This sentence is being synthesized and written to disk chunk by chunk.",
      voice_id: "geffen_32",
      model: "simba-3.2",
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`POST /v1/audio/stream → ${res.status} ${res.statusText}: ${await res.text()}`);
  }

  const outFile = "output.mp3";
  // `res.body` is a Web ReadableStream<Uint8Array>. Convert to a Node Readable
  // and pipe to disk — `pipeline` handles backpressure and errors.
  await pipeline(Readable.fromWeb(res.body), createWriteStream(outFile));
  console.log(`Streamed audio to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
