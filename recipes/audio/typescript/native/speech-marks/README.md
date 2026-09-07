# Text-to-Speech: speech marks → captions (TypeScript, native REST)

The same as [`speech-marks`](../../sdk/speech-marks), but calling the REST API directly
with `fetch` instead of the `@speechify/api` SDK.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- Node 20+ (for built-in `fetch`)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
pnpm install
```

## Run

```bash
pnpm start
```

You'll get `output.mp3` and a `captions.vtt` with one cue per word.

## What it does

- `POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <key>`.
- JSON response includes `audio_data` (base64) and `speech_marks.chunks` — one entry per
  word with `start_time` / `end_time` (milliseconds) and `value`.
- Formats those into a WebVTT file (one cue per word). Group words into phrases for
  sentence-level captions, or use the times to highlight words during playback.

> Speech marks reference: https://docs.speechify.ai/tts/guides/speech-marks
