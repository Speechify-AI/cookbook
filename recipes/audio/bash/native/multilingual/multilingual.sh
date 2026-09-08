#!/usr/bin/env bash
set -euo pipefail

# Speechify multilingual TTS (Bash + curl + jq).
# Discovers a voice for the target locale, then synthesizes non-English speech.
# simba-3.0 supports en, de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR — simba-3.2 is
# English-only (a non-English voice on it returns 400), so we use simba-3.0.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

# Target locale is overridable; default is French.
LOCALE="${LOCALE:-fr-FR}"
MODEL="simba-3.0"
# Keep the sample French; in a real app you'd match the text to LOCALE.
TEXT="Bonjour ! Ceci est l'API de synthèse vocale de Speechify."

# Discover a voice at runtime instead of hardcoding a non-English id we can't
# verify: list voices filtered to the locale + model and take the first match.
voices=$(curl --fail-with-body --silent --show-error --get \
  "https://api.speechify.ai/v1/voices" \
  --data-urlencode "locale=${LOCALE}" \
  --data-urlencode "model=${MODEL}" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}")

voice_id=$(printf '%s' "$voices" | jq -r '.voices[0].id // empty')

if [ -z "$voice_id" ]; then
  echo "No ${MODEL} voice found for locale \"${LOCALE}\". Try another LOCALE."
  exit 0
fi

# `language` (BCP-47) selects the training; omit it and the voice's own locale
# decides. We pass it explicitly to lock the output language to LOCALE. jq builds
# the JSON body so the text and ids are safely escaped.
body=$(jq -n \
  --arg input "$TEXT" \
  --arg voice_id "$voice_id" \
  --arg model "$MODEL" \
  --arg language "$LOCALE" \
  '{input: $input, voice_id: $voice_id, model: $model, language: $language, audio_format: "mp3"}')

response=$(curl --fail-with-body --silent --show-error \
  -X POST "https://api.speechify.ai/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$body")

# Decode the base64 audio_data field into the output file. macOS base64 lacks
# `--decode`; the long flag works on both BSD and GNU coreutils.
printf '%s' "$response" | jq -r '.audio_data' | base64 -d > output.mp3

billed=$(printf '%s' "$response" | jq -r '.billable_characters_count')
echo "Wrote output.mp3 (${LOCALE}, voice ${voice_id}, ${billed} billable characters)"
