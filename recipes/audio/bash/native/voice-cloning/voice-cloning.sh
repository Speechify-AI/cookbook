#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS voice cloning (Bash + curl + jq).
# Full lifecycle: clone → use → delete.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

BASE="https://api.speechify.ai"
# Bundled sample: ~26s of NASA ISS spacewalk audio (public domain).
SAMPLE="fixtures/spacewalk.wav"

# 1. Clone a voice from an audio sample (10-30s of clean speech works well).
#    POST /v1/voices is multipart/form-data — `curl -F` builds the body and sets
#    the Content-Type boundary automatically. `consent` is REQUIRED: a JSON
#    string attesting you have the speaker's permission to clone their voice.
http_status=0
create_body=$(mktemp)
trap 'rm -f "$create_body"' EXIT

http_status=$(curl --silent --show-error --output "$create_body" --write-out '%{http_code}' \
  -X POST "${BASE}/v1/voices" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -F "name=cookbook-cloned-voice" \
  -F "gender=male" \
  -F 'consent={"fullName":"Jane Doe","email":"jane@example.com"};type=text/plain' \
  -F "sample=@${SAMPLE};type=audio/wav")

if [ "$http_status" = "402" ]; then
  echo ""
  echo "Voice cloning isn't included in your current Speechify plan."
  echo "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing"
  exit 1
fi
if [ "$http_status" -lt 200 ] || [ "$http_status" -ge 300 ]; then
  echo "POST /v1/voices → ${http_status}" >&2
  cat "$create_body" >&2
  echo >&2
  exit 1
fi

voice_id=$(jq -r '.id' < "$create_body")
display_name=$(jq -r '.display_name' < "$create_body")
voice_type=$(jq -r '.type' < "$create_body")
echo "Cloned voice created: ${voice_id} (${display_name}, type=${voice_type})"

# Ensure we always delete the cloned voice, even on failure of step 2.
cleanup() {
  del_status=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    -X DELETE "${BASE}/v1/voices/${voice_id}" \
    -H "Authorization: Bearer ${SPEECHIFY_API_KEY}")
  if [ "$del_status" -ge 200 ] && [ "$del_status" -lt 300 ]; then
    echo "Deleted cloned voice ${voice_id}"
  else
    echo "DELETE /v1/voices/${voice_id} → ${del_status}" >&2
  fi
}
trap 'cleanup; rm -f "$create_body"' EXIT

# 2. Synthesize speech using the cloned voice — pass its id as voice_id.
speech_response=$(curl --fail-with-body --silent --show-error \
  -X POST "${BASE}/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg vid "$voice_id" '{
    input: "Hello from a voice cloned with the Speechify API.",
    voice_id: $vid,
    audio_format: "mp3",
    model: "simba-3.0"
  }')")

printf '%s' "$speech_response" | jq -r '.audio_data' | base64 -d > output.mp3
echo "Wrote output.mp3"

# 3. Cleanup runs from the EXIT trap.
