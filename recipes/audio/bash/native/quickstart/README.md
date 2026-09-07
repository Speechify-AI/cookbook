# Text-to-Speech: Bash quickstart (native REST)

The same as the [TypeScript](../../../typescript/native/quickstart) and
[Python](../../../python/native/quickstart) native quickstarts, but as a self-contained
shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64` (preinstalled on macOS and most Linux distros)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x speech.sh
```

## Run

```bash
./speech.sh
```

You'll get an `output.mp3` in this folder.

## What it does

- `POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <key>`.
- JSON body (snake_case on the wire): `input`, `voice_id`, `audio_format`, `model`.
- Response JSON: `audio_data` (base64), `audio_format`, `billable_characters_count`,
  `speech_marks`. `jq -r '.audio_data' | base64 -d` writes the bytes to disk.

> Bash recipes are the smallest possible demonstration of the wire protocol — no
> language runtime needed. Reach for an SDK once you're past "does this work at all?".
