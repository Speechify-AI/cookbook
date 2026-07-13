import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

async function main() {
  // TODO: write your recipe here. See agents/speechify-tts.md for the API surface.
  void client;
  console.log("Replace this with your recipe.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
