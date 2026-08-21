#!/usr/bin/env bash
set -euo pipefail

# Speechify TTS speech marks → WebVTT captions (Bash + curl + jq).
# Generates output.mp3 + captions.vtt with one cue per word.

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

: "${SPEECHIFY_API_KEY:?Set SPEECHIFY_API_KEY (copy .env.example to .env).}"

response=$(curl --fail-with-body --silent --show-error \
  -X POST "https://api.speechify.ai/v1/audio/speech" \
  -H "Authorization: Bearer ${SPEECHIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "The quick brown fox jumps over the lazy dog.",
    "voice_id": "geffen_32",
    "audio_format": "mp3",
    "model": "simba-3.2"
  }')

printf '%s' "$response" | jq -r '.audio_data' | base64 -d > output.mp3

# Build a WebVTT file with one cue per word — the basis for karaoke-style highlighting.
# `speech_marks.chunks` holds one entry per word, with start/end times in milliseconds.
# jq formats each entry as HH:MM:SS.mmm --> HH:MM:SS.mmm followed by the word.
{
  echo "WEBVTT"
  echo
  printf '%s' "$response" | jq -r '
    def vtt: . as $ms
      | ($ms / 3600000 | floor) as $h
      | (($ms % 3600000) / 60000 | floor) as $m
      | (($ms % 60000) / 1000 | floor) as $s
      | ($ms % 1000 | floor) as $ml
      | "\($h | tostring | (if length < 2 then "0\(.)" else . end)):\($m | tostring | (if length < 2 then "0\(.)" else . end)):\($s | tostring | (if length < 2 then "0\(.)" else . end)).\($ml | tostring | (if length < 3 then "00\(.)"[-3:] else . end))";
    .speech_marks.chunks[]
      | "\(.start_time // 0 | vtt) --> \(.end_time // 0 | vtt)\n\(.value // "")\n"
  '
} > captions.vtt

word_count=$(printf '%s' "$response" | jq '.speech_marks.chunks | length')
echo "Wrote output.mp3 and captions.vtt (${word_count} words)."
echo "First few word timings (ms):"
printf '%s' "$response" | jq -r '.speech_marks.chunks[:5][] | "  \(.start_time)-\(.end_time)\t\(.value)"'
