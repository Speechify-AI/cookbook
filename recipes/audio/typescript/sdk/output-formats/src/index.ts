import "dotenv/config";
import fs from "node:fs";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (copy .env.example to .env).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });

// Synthesize the SAME sentence into several encodings by varying `output_format`.
// `output_format` uses the `codec_sampleRate_bitrate` shape and takes PRECEDENCE
// over `audio_format` on /v1/audio/speech. Telephony pipelines want ulaw_8000 /
// pcm_16000; media pipelines want the mp3 bitrate variants. Valid values include:
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
    const response = await client.audio.speech({
      input: "Speechify converts text to speech in whatever audio format your pipeline needs.",
      voice_id: "geffen_32",
      model: "simba-3.2",
      output_format: format, // wins over audio_format — don't set both
    });

    // audio_data is base64 regardless of codec. The response echoes the resolved
    // output_format, so you can confirm what the server actually produced.
    fs.writeFileSync(filename, Buffer.from(response.audio_data, "base64"));
    console.log(`Wrote ${filename} (output_format: ${response.output_format ?? format})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
