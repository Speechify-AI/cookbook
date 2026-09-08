#!/usr/bin/env bash
set -euo pipefail

# Speechify — handle API errors correctly (Bash + curl + jq).
# Self-demonstrating: POST /v1/audio/speech with a bogus voice_id to trigger a real
# 404 voice_not_found, then handle the error envelope { error: { code, message }, request_id }.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

# Map an error CODE (not the HTTP status) to friendly guidance. Several distinct
# outcomes share a status — 402 is balance vs spend-cap, 404 is unknown voice vs unknown
# model — so branch on the code.
guidance_for() {
  case "$1" in
    voice_not_found)          echo "Unknown voice_id. List voices with GET /v1/voices." ;;
    not_found)                echo "Unknown model. List models with GET /v1/audio/models." ;;
    content_policy_violation) echo "Text failed content screening. Do not retry the same text; edit it." ;;
    rate_limited)             echo "Too many requests per second. Back off and honour the Retry-After header." ;;
    concurrency_limited)      echo "Too many in-flight requests. Reduce concurrency; honour Retry-After." ;;
    payment_required)         echo "Workspace balance exhausted. Top up the workspace." ;;
    spend_cap_exceeded)       echo "This API key hit its monthly USD spend cap. Raise the cap or use another key." ;;
    *)                        echo "Unhandled error code — see message above." ;;
  esac
}

# NOTE: no --fail-with-body here — we WANT the error body to inspect. Dump response
# headers to a temp file (-D) and append the HTTP status (-w) after the body.
headers=$(mktemp)
trap 'rm -f "$headers"' EXIT

response=$(curl --silent --show-error \
  -D "$headers" \
  -w '\n%{http_code}' \
  -X POST "https://api.speechify.ai/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "This request is designed to fail so we can handle the error.",
    "voice_id": "this-voice-does-not-exist",
    "audio_format": "mp3",
    "model": "simba-3.2"
  }')

status="${response##*$'\n'}"   # last line = HTTP status
body="${response%$'\n'*}"      # everything before it = JSON body

if [ "$status" -ge 400 ]; then
  code=$(printf '%s' "$body" | jq -r '.error.code // "unknown"')
  message=$(printf '%s' "$body" | jq -r '.error.message // "no message"')
  # Prefer the Speechify-Request-Id header; the body carries request_id too. Header
  # names are case-insensitive; grep -i. tr strips the trailing CR from the header value.
  request_id=$(grep -i '^Speechify-Request-Id:' "$headers" | head -1 | cut -d' ' -f2- | tr -d '\r')
  [ -n "$request_id" ] || request_id=$(printf '%s' "$body" | jq -r '.request_id // "unknown"')

  echo "Speechify API error (HTTP ${status}, code ${code})" >&2
  echo "  ${message}" >&2
  echo "  $(guidance_for "$code")" >&2

  # On 429, always wait the Retry-After header (seconds) before retrying.
  if [ "$status" -eq 429 ]; then
    retry_after=$(grep -i '^Retry-After:' "$headers" | head -1 | cut -d' ' -f2- | tr -d '\r')
    echo "  Retry-After: ${retry_after:-unknown} seconds" >&2
  fi

  echo "  request_id: ${request_id}" >&2
  exit 1
fi

echo "Unexpected success — the voice_id above should not exist."
