import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

/** Format a time in milliseconds as a WebVTT timestamp: HH:MM:SS.mmm */
function vttTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const millis = Math.floor(ms % 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(millis, 3)}`;
}

async function main() {
  const response = await client.audio.speech({
    input: "The quick brown fox jumps over the lazy dog.",
    voice_id: "geffen_32",
    audio_format: "mp3",
    model: "simba-3.2",
  });

  fs.writeFileSync("output.mp3", Buffer.from(response.audio_data, "base64"));

  // `speech_marks.chunks` holds one entry per word, with start/end times in the audio.
  const words = response.speech_marks.chunks;

  // Build a WebVTT file with one cue per word — the basis for karaoke-style highlighting.
  let vtt = "WEBVTT\n\n";
  for (const w of words) {
    vtt += `${vttTime(w.start_time ?? 0)} --> ${vttTime(w.end_time ?? 0)}\n${w.value ?? ""}\n\n`;
  }
  fs.writeFileSync("captions.vtt", vtt);

  console.log(`Wrote output.mp3 and captions.vtt (${words.length} words).`);
  console.log("First few word timings (ms):");
  for (const w of words.slice(0, 5)) {
    console.log(`  ${w.start_time}–${w.end_time}\t${w.value}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
