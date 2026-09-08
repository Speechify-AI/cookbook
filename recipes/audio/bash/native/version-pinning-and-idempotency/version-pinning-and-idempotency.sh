#!/usr/bin/env bash
set -euo pipefail

# Speechify — API version pinning & idempotency (Bash + curl + jq).
# POST /v1/voices/consent-challenges twice with the SAME Idempotency-Key: the second
# call replays the first response instead of minting a new challenge.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

URL="https://api.speechify.ai/v1/voices/consent-challenges"

# Generate the key ONCE and reuse it (retries of the SAME logical request).
KEY=$(uuidgen)

# `Speechify-Version` pins the dated wire contract (resolution: request header →
# workspace default → oldest supported). `Idempotency-Key` makes this side-effect POST
# safe to retry. consent-challenge creation is rate-limited (a few dozen/hour per
# workspace) — call it exactly twice. On 429 honour `Retry-After`.
mint() {
  curl --fail-with-body --silent --show-error -D - \
    "$URL" \
    -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
    -H "Speechify-Version: 2026-09-13" \
    -H "Idempotency-Key: ${KEY}" \
    -H "Content-Type: application/json" \
    -d '{"full_name":"Jane Doe"}'
}

# `-D -` prepends response headers to the body; split on the blank line.
first=$(mint)
first_id=$(printf '%s' "$first" | sed '1,/^\r\{0,1\}$/d' | jq -r '.id')
echo "1st challenge id: ${first_id}"

second=$(mint)
second_id=$(printf '%s' "$second" | sed '1,/^\r\{0,1\}$/d' | jq -r '.id')
echo "2nd challenge id: ${second_id}"

# The server flags a replay with this response header (case-insensitive match).
replayed=$(printf '%s' "$second" | grep -i '^Idempotent-Replayed:' | tr -d '\r' | awk '{print $2}')
echo "Idempotent-Replayed: ${replayed:-<absent>}"

if [ "$first_id" = "$second_id" ]; then
  echo "ids match — replay proven"
else
  echo "ids differ" >&2
  exit 1
fi
