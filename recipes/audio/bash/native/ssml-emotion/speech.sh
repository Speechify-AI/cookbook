#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS SSML pauses, pacing & pronunciation (Bash + curl + jq).
# SSML must have a single <speak> root. simba-3.2 and simba-3.0 apply <break>,
# <prosody rate> and <sub alias>. They accept <prosody pitch>, <prosody volume>,
# <emphasis> and <speechify:style emotion> but do not apply them.

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
  Great news, the build passed!
  <break time="500ms" />
  <prosody rate="slow">But read the next part carefully.</prosody>
  <break time="300ms" />
  Do not deploy on a Friday.
  <break time="400ms" />
  Check the <sub alias="continuous integration">CI</sub> dashboard before you merge.
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
