#!/usr/bin/env bash
set -euo pipefail

# Speechify — voice language + model support (Bash + curl + jq).
# Which model + language combinations does a voice support, and which voices
# support model X in locale Y?

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

LOCALE="en"
MODEL="simba-3.2"
VOICE_ID="geffen_32"

# A voice's own .models[] is the authority on what your workspace can synthesize
# with it (clones + enablement) — render it so a picker is driven by the voice.
# Renders one voice object (from stdin) as: id  name (locale) + model→locales map.
render_voice='
  "\(.id)  \(.display_name)  (\(.locale))",
  "  " + ( [ .models[] | "\(.name): " + ([.languages[].locale] | join(", ")) ] | join("  |  ") )
'

# Part 1 — voices advertising MODEL in LOCALE. The `model` query filter returns
# voices claiming that model; each voice's .models[] still holds the full truth.
echo "Voices for locale=\"${LOCALE}\", model=\"${MODEL}\":"
echo
curl --fail-with-body --silent --show-error \
  "https://api.speechify.ai/v1/voices?locale=${LOCALE}&model=${MODEL}" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  | jq -r ".voices[] | ${render_voice}, \"\""

# Part 2 — one voice by id. Capture the HTTP status so a 404 voice_not_found is
# handled gracefully (skip) and the recipe still completes.
echo "Single voice lookup: ${VOICE_ID}"
body=$(curl --silent --show-error --write-out '\n%{http_code}' \
  "https://api.speechify.ai/v1/voices/${VOICE_ID}" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}")
status="${body##*$'\n'}"   # last line is the HTTP status
body="${body%$'\n'*}"      # everything before it is the JSON

if [ "$status" = "404" ]; then
  echo "  ${VOICE_ID} not found (list voices with GET /v1/voices)."
elif [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
  printf '%s' "$body" | jq -r "${render_voice}"
else
  echo "GET /v1/voices/${VOICE_ID} → ${status}: ${body}" >&2
  exit 1
fi
