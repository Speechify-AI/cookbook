#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS voice cloning (Bash + curl + jq).
# Full lifecycle: clone → use → delete, with verified consent.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

BASE="https://api.speechify.ai"
# The verified-consent flow ships on this API version — pin it explicitly.
VERSION="2026-09-13"

# Cloning requires VERIFIED consent: the speaker records themselves reading a
# phrase the API returns, and that recording is kept as the consent record. It
# must be the SAME person as the voice sample, so this recipe is
# bring-your-own-audio — there is no sample that ships with valid consent.
CONSENT_FULL_NAME="${CONSENT_FULL_NAME:-Jane Doe}"
SAMPLE="${SAMPLE_PATH:-sample.wav}"
CONSENT="${CONSENT_RECORDING_PATH:-consent.wav}"
# The challenge is single-use and its phrase is dynamic, so we cache it between
# runs: run once to get the phrase, record it, run again to submit.
CHALLENGE_CACHE=".consent-challenge.json"

auth=(-H "Authorization: Bearer ${SPEECHIFY_API_KEY}" -H "Speechify-Version: ${VERSION}")

# 1. Get (or reuse) a consent challenge. Its `phrase` is what the speaker must
#    read aloud; `id` ties the recording to this consent on the create.
if [ ! -f "$CHALLENGE_CACHE" ]; then
  curl --fail-with-body --silent --show-error \
    -X POST "${BASE}/v1/voices/consent-challenges" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg n "$CONSENT_FULL_NAME" '{full_name: $n}')" \
    > "$CHALLENGE_CACHE"
fi
challenge_id=$(jq -r '.id' < "$CHALLENGE_CACHE")
phrase=$(jq -r '.phrase' < "$CHALLENGE_CACHE")
expires_at=$(jq -r '.expires_at' < "$CHALLENGE_CACHE")

# 2. Make sure we have both recordings before spending the (single-use) challenge.
if [ ! -f "$SAMPLE" ] || [ ! -f "$CONSENT" ]; then
  echo ""
  echo "Consent required. Have ${CONSENT_FULL_NAME} record themselves reading this phrase, exactly as written:"
  echo ""
  echo "  \"${phrase}\""
  echo ""
  echo "Then provide these files and re-run (paths override via SAMPLE_PATH / CONSENT_RECORDING_PATH):"
  [ ! -f "$SAMPLE" ]  && echo "  sample:  ${SAMPLE}  (${CONSENT_FULL_NAME}'s voice, 10-30s of clean speech)"
  [ ! -f "$CONSENT" ] && echo "  consent: ${CONSENT}  (the SAME person reading the phrase above)"
  echo ""
  echo "Challenge expires ${expires_at}. If it has expired, delete ${CHALLENGE_CACHE} and re-run."
  exit 1
fi

# 3. Clone the voice. POST /v1/voices is multipart/form-data — `curl -F` builds
#    the body and sets the Content-Type boundary automatically.
create_body=$(mktemp)
trap 'rm -f "$create_body"' EXIT

http_status=$(curl --silent --show-error --output "$create_body" --write-out '%{http_code}' \
  -X POST "${BASE}/v1/voices" \
  "${auth[@]}" \
  -F "name=cookbook-cloned-voice" \
  -F "gender=male" \
  -F "consent_challenge_id=${challenge_id}" \
  -F "sample=@${SAMPLE}" \
  -F "consent_recording=@${CONSENT}")

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
  echo "If this is a consent_* error, the challenge may be spent or expired — delete ${CHALLENGE_CACHE} and re-run." >&2
  exit 1
fi

rm -f "$CHALLENGE_CACHE"  # challenge is spent

voice_id=$(jq -r '.id' < "$create_body")
display_name=$(jq -r '.display_name' < "$create_body")
voice_type=$(jq -r '.type' < "$create_body")
echo "Cloned voice created: ${voice_id} (${display_name}, type=${voice_type})"

# Ensure we always delete the cloned voice, even on failure of step 4.
cleanup() {
  del_status=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    -X DELETE "${BASE}/v1/voices/${voice_id}" \
    "${auth[@]}")
  if [ "$del_status" -ge 200 ] && [ "$del_status" -lt 300 ]; then
    echo "Deleted cloned voice ${voice_id}"
  else
    echo "DELETE /v1/voices/${voice_id} → ${del_status}" >&2
  fi
}
trap 'cleanup; rm -f "$create_body"' EXIT

# 4. Synthesize speech using the cloned voice — pass its id as voice_id.
speech_response=$(curl --fail-with-body --silent --show-error \
  -X POST "${BASE}/v1/audio/speech" \
  "${auth[@]}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg vid "$voice_id" '{
    input: "Hello from a voice cloned with the Speechify API.",
    voice_id: $vid,
    audio_format: "mp3",
    model: "simba-3.0"
  }')")

printf '%s' "$speech_response" | jq -r '.audio_data' | base64 -d > output.mp3
echo "Wrote output.mp3"

# 5. Cleanup runs from the EXIT trap.
