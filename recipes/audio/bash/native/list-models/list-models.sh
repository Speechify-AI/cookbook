#!/usr/bin/env bash
set -euo pipefail

# Speechify — list TTS models (Bash + curl + jq).
# GET /v1/audio/models returns the models you can pass as the `model` parameter.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

response=$(curl --fail-with-body --silent --show-error \
  "https://api.speechify.ai/v1/audio/models" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}")

# Print each model with its flags, languages and endpoints.
printf '%s' "$response" | jq -r '
  .models[]
  | ( [ (if .default then "default" else empty end),
        (if .recommended then "recommended" else empty end),
        (if .deprecated then "deprecated" else empty end),
        (if .curated_voices then "curated-voices" else empty end) ]
      | if length > 0 then "  [" + join(", ") + "]" else "" end ) as $flags
  | "\(.id)\($flags)\n  \(.description)\n  languages: \(.languages | join(", "))\n  endpoints: \(.endpoints | join(", "))\n"
'

# Multi-speaker models are returned separately (valid only on POST /v1/audio/dialogue).
printf '%s' "$response" \
  | jq -r 'if (.dialogue_models | length) > 0 then "Dialogue (multi-speaker) models: " + ([.dialogue_models[].id] | join(", ")) else empty end'
