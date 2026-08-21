# Text-to-Speech: SSML & emotion (Bash, native REST)

Drive emotion, pitch, rate, pauses, and emphasis by passing **SSML** as the `input` —
same as the [TypeScript](../../../typescript/native/ssml-emotion) and
[Python](../../../python/native/ssml-emotion) native SSML recipes, but as a
self-contained shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://console.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x speech.sh
```

## Run

```bash
./speech.sh
```

You'll get an `output.mp3` that shifts emotion and prosody across the sentence.

## What it does

- Builds the request body with `jq -n --arg input "$SSML" ...` so the SSML string is
  JSON-escaped safely (newlines, quotes, angle brackets).
- `POST https://api.speechify.ai/v1/audio/speech` with `model: "simba-3.2"`
  (full SSML + emotion support).
- **Emotion:** `<speechify:style emotion="...">` — one of `angry`, `cheerful`, `sad`,
  `terrified`, `relaxed`, `fearful`, `surprised`, `calm`, `assertive`, `energetic`,
  `warm`, `direct`, `bright`.
- **Prosody:** `<prosody rate="..." pitch="..." volume="...">`. **Pauses:**
  `<break time="500ms" />`. **Emphasis:** `<emphasis level="strong">`.

> SSML reference: https://docs.speechify.ai/tts/guides/ssml
