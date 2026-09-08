#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS output formats (Bash + curl + jq).
# Synthesizes the SAME sentence in several encodings by varying `output_format`,
# writing each to its own file. `output_format` uses the `codec_sampleRate_bitrate`
# shape and takes PRECEDENCE over `audio_format` on /v1/audio/speech. Telephony wants
# ulaw_8000 / pcm_16000; media wants the mp3 bitrate variants. Valid values include:
# pcm_16000, pcm_24000, ulaw_8000, mp3_24000_64, mp3_24000_128, mp3_22050_160,
# mp3_24000_160, wav_48000. An invalid value returns 400 listing the supported set.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

input="Speechify converts text to speech in whatever audio format your pipeline needs."

# format:filename pairs — loop over them.
outputs=(
  "mp3_24000_128:output_mp3_128.mp3"   # media / default quality
  "ulaw_8000:output_ulaw_8000.ulaw"    # telephony: 8kHz μ-law (RAW, no header)
  "pcm_16000:output_pcm_16000.pcm"     # telephony: raw 16-bit PCM (RAW, no header)
  "wav_48000:output_wav_48000.wav"
)

for pair in "${outputs[@]}"; do
  output_format="${pair%%:*}"
  filename="${pair##*:}"

  response=$(curl --fail-with-body --silent --show-error \
    -X POST "https://api.speechify.ai/v1/audio/speech" \
    -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg input "$input" --arg fmt "$output_format" '{
      input: $input,
      voice_id: "geffen_32",
      model: "simba-3.2",
      output_format: $fmt
    }')")

  # Decode the base64 audio_data field. macOS base64 lacks `--decode`; the short
  # `-d` flag works on both BSD and GNU coreutils.
  printf '%s' "$response" | jq -r '.audio_data' | base64 -d > "$filename"

  # The response echoes the resolved output_format — confirm what the server made.
  resolved=$(printf '%s' "$response" | jq -r '.output_format // empty')
  echo "Wrote ${filename} (output_format: ${resolved:-$output_format})"
done
