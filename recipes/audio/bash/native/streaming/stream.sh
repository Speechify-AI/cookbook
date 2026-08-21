#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS streaming (Bash + curl).
# POST /v1/audio/stream returns raw audio bytes (HTTP chunked) — curl writes
# them straight to output.mp3 as they arrive.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

# The `Accept` header selects the container/codec:
#   audio/mpeg | audio/ogg | audio/aac | audio/pcm (returns audio/L16, 24 kHz mono).
curl --fail-with-body --silent --show-error --no-buffer \
  -X POST "https://api.speechify.ai/v1/audio/stream" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: audio/mpeg" \
  -d '{
    "input": "Streaming lets you start playing audio before the whole clip is ready. This sentence is being synthesized and written to disk chunk by chunk.",
    "voice_id": "geffen_32",
    "model": "simba-3.2"
  }' \
  -o output.mp3

echo "Streamed audio to output.mp3"
