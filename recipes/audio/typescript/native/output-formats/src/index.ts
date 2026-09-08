import "dotenv/config";
import fs from "node:fs";

// The "native" counterpart to the output-formats recipe: same result, but calling
// the REST API directly with fetch. `output_format` in the JSON body controls the
// exact codec / sample rate / bitrate and takes PRECEDENCE over `audio_format`.

const token = process.env.SPEECHIFY_API_KEY;
if (!token) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

/** Shape of the POST /v1/audio/speech JSON response (snake_case on the wire). */
interface SpeechResponse {
  audio_data: string; // base64-encoded audio, whatever the codec
  output_format?: string; // resolved format echoed back by the server
  billable_characters_count: number;
}

// output_format uses the `codec_sampleRate_bitrate` shape. Telephony wants
// ulaw_8000 / pcm_16000; media wants the mp3 bitrate variants. Valid values include:
// pcm_16000, pcm_24000, ulaw_8000, mp3_24000_64, mp3_24000_128, mp3_22050_160,
// mp3_24000_160, wav_48000. An invalid value returns 400 listing the supported set.
const OUTPUTS = [
  { format: "mp3_24000_128", filename: "output_mp3_128.mp3" }, // media / default quality
  { format: "ulaw_8000", filename: "output_ulaw_8000.ulaw" }, // telephony: 8kHz μ-law (RAW, no header)
  { format: "pcm_16000", filename: "output_pcm_16000.pcm" }, // telephony: raw 16-bit PCM (RAW, no header)
  { format: "wav_48000", filename: "output_wav_48000.wav" },
] as const;

async function main() {
  for (const { format, filename } of OUTPUTS) {
    const res = await fetch("https://api.speechify.ai/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: "Speechify converts text to speech in whatever audio format your pipeline needs.",
        voice_id: "geffen_32",
        model: "simba-3.2",
        output_format: format, // wins over audio_format — don't set both
      }),
    });

    if (!res.ok) {
      throw new Error(
        `POST /v1/audio/speech → ${res.status} ${res.statusText}: ${await res.text()}`,
      );
    }

    const data = (await res.json()) as SpeechResponse;
    fs.writeFileSync(filename, Buffer.from(data.audio_data, "base64"));
    console.log(`Wrote ${filename} (output_format: ${data.output_format ?? format})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
