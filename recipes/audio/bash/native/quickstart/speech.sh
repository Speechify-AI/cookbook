#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS quickstart (Bash + curl + jq).
# Calls POST /v1/audio/speech and decodes the base64 audio_data to output.mp3.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

response=$(curl --fail-with-body --silent --show-error \
  -X POST "https://api.speechify.ai/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello! This is the Speechify text-to-speech REST API, from curl.",
    "voice_id": "geffen_32",
    "audio_format": "mp3",
    "model": "simba-3.2"
  }')

# Decode the base64 audio_data field into the output file. macOS base64 lacks
# `--decode`; the long flag works on both BSD and GNU coreutils.
printf '%s' "$response" | jq -r '.audio_data' | base64 -d > output.mp3

billed=$(printf '%s' "$response" | jq -r '.billable_characters_count')
echo "Wrote output.mp3 (${billed} billable characters)"
