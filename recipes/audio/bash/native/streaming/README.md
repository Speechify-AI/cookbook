# Text-to-Speech: Bash streaming (native REST)

Stream synthesized audio to disk as it is generated — same as the
[TypeScript](../../../typescript/native/streaming) and
[Python](../../../python/native/streaming) native streaming recipes, but as a
self-contained shell script using `curl`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash` and `curl`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x stream.sh
```

## Run

```bash
./stream.sh
```

You'll get an `output.mp3` written chunk by chunk.

## What it does

- `POST https://api.speechify.ai/v1/audio/stream` with `Authorization: Bearer <key>`
  and `Accept: audio/mpeg` (or `audio/ogg`, `audio/aac`, `audio/pcm`).
- JSON body (snake_case on the wire): `input`, `voice_id`, `model`.
- Unlike `/v1/audio/speech`, the response is **raw audio bytes** (HTTP chunked). `curl`
  with `--no-buffer -o output.mp3` writes the bytes straight to disk as they arrive
  — no base64 decoding required.
