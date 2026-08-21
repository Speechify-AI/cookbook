#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS SSML & emotion (Bash + curl + jq).
# SSML must have a single <speak> root. Speechify supports standard SSML
# (prosody / break / emphasis) plus <speechify:style emotion="..."> with
# emotions: angry, cheerful, sad, terrified, relaxed, fearful, surprised,
#           calm, assertive, energetic, warm, direct, bright.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

read -r -d '' SSML <<'EOF' || true
<speak>
  <speechify:style emotion="cheerful">Great news — the build passed!</speechify:style>
  <break time="500ms" />
  <prosody rate="slow" pitch="low">But read the next part carefully.</prosody>
  <break time="300ms" />
  <speechify:style emotion="assertive">Do not deploy on a Friday.</speechify:style>
  <break time="400ms" />
  This is <emphasis level="strong">critical</emphasis>.
</speak>
EOF

# Build the JSON body with jq so the SSML string is escaped correctly.
body=$(jq -n \
  --arg input "$SSML" \
  '{input: $input, voice_id: "geffen_32", audio_format: "mp3", model: "simba-3.2"}')

response=$(curl --fail-with-body --silent --show-error \
  -X POST "https://api.speechify.ai/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$body")

printf '%s' "$response" | jq -r '.audio_data' | base64 -d > output.mp3
billed=$(printf '%s' "$response" | jq -r '.billable_characters_count')
echo "Wrote output.mp3 (${billed} billable characters)"
