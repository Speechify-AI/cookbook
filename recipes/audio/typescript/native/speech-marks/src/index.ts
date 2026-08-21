import "dotenv/config";
import fs from "node:fs";

// The "native" counterpart to the speech-marks recipe: same result, but calling
// the REST API directly with fetch instead of the @speechify/api SDK.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

/** Shape of the POST /v1/audio/speech JSON response (snake_case on the wire). */
interface SpeechMarkChunk {
  start_time?: number; // milliseconds
  end_time?: number; // milliseconds
  value?: string;
}
interface SpeechResponse {
  audio_data: string; // base64-encoded audio
  audio_format: string;
  billable_characters_count: number;
  speech_marks: {
    chunks: SpeechMarkChunk[];
  };
}

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
  const res = await fetch("https://api.speechify.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: "The quick brown fox jumps over the lazy dog.",
      voice_id: "geffen_32",
      audio_format: "mp3",
      model: "simba-3.2",
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /v1/audio/speech → ${res.status} ${res.statusText}: ${await res.text()}`);
  }

  const data = (await res.json()) as SpeechResponse;
  fs.writeFileSync("output.mp3", Buffer.from(data.audio_data, "base64"));

  // `speech_marks.chunks` holds one entry per word, with start/end times in the audio.
  const words = data.speech_marks.chunks;

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
