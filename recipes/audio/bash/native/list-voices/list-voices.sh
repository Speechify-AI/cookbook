#!/usr/bin/env bash
set -euo pipefail

# Speechify — list TTS voices (Bash + curl + jq).
# GET /v1/voices returns the shared catalogue + your workspace clones. The endpoint
# is cursor-paged: it hands you one page + a cursor, so we loop it ourselves.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

# Cap console noise on large catalogs; we still walk every page.
MAX_PRINT=25

printed=0
total=0
cursor=""

# Real cursor pagination: keep fetching while has_more, feeding next_cursor back as
# ?cursor=. `limit` maxes at 200; `locale` is a BCP-47 prefix filter. -G + --data-urlencode
# builds the query string safely (cursors can contain URL-significant characters).
while :; do
  args=(--fail-with-body --silent --show-error -G
    "https://api.speechify.ai/v1/voices"
    -H "Authorization: Bearer ${SPEECHIFY_API_KEY}"
    --data-urlencode "locale=en")
  if [ -n "$cursor" ]; then
    args+=(--data-urlencode "cursor=${cursor}")
  fi
  response=$(curl "${args[@]}")

  count=$(printf '%s' "$response" | jq '.voices | length')
  remaining=$((MAX_PRINT - printed))
  if [ "$remaining" -gt 0 ]; then
    # Print up to `remaining` voices from this page. `type` is "shared" (catalogue)
    # or "personal" (your clones); each entry in `models` is a model the voice serves.
    printf '%s' "$response" | jq -r --argjson n "$remaining" '
      .voices[:$n][]
      | "\(.id)  \(.display_name)\n  \(.locale)  \(.gender)  \(.type)\n  models: \(.models | map(.name) | join(", "))\n"
    '
    [ "$count" -lt "$remaining" ] && printed=$((printed + count)) || printed=$((printed + remaining))
  fi
  total=$((total + count))

  has_more=$(printf '%s' "$response" | jq -r '.has_more')
  [ "$has_more" = "true" ] || break
  cursor=$(printf '%s' "$response" | jq -r '.next_cursor')
done

if [ "$total" -gt "$MAX_PRINT" ]; then
  echo "... and $((total - MAX_PRINT)) more"
fi
echo "Total voices: ${total}"
