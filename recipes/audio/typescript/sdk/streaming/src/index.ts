import "dotenv/config";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

async function main() {
  // `audio.stream` returns a BinaryResponse — consume it as a Web ReadableStream,
  // ArrayBuffer, Blob, or Uint8Array. Streaming gives low time-to-first-byte for
  // long inputs.
  const response = await client.audio.stream({
    Accept: "audio/mpeg",
    input:
      "Streaming lets you start playing audio before the whole clip is ready. " +
      "This sentence is being synthesized and written to disk chunk by chunk.",
    voice_id: "geffen_32",
    model: "simba-3.2",
  });

  const outFile = "output.mp3";
  // `response.stream()` returns a Web ReadableStream<Uint8Array> (or null if the
  // body was already consumed). Convert to a Node Readable and pipe to disk —
  // `pipeline` handles backpressure and errors.
  const body = response.stream();
  if (!body) throw new Error("Streaming response has no body.");
  await pipeline(Readable.fromWeb(body), createWriteStream(outFile));
  console.log(`Streamed audio to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
