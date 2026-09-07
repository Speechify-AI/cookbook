# Text-to-Speech: speech marks → captions (TypeScript)

Generate an `output.mp3` plus a synced `captions.vtt` from word-level speech marks — the
basis for caption sync and karaoke-style highlighting.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- Node 20+

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

- Calls `client.audio.speech(...)` and reads `response.speech_marks.chunks` — one entry
  per word with `startTime` / `endTime` (milliseconds) and `value`.
- Formats those into a WebVTT file (one cue per word). Group words into phrases for
  sentence-level captions, or use the times to highlight words during playback.

> Speech marks reference: https://docs.speechify.ai/tts/guides/speech-marks
