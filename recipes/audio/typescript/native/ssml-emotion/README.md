# Text-to-Speech: SSML & emotion (TypeScript, native REST)

The same as [`ssml-emotion`](../../sdk/ssml-emotion), but calling the REST API directly
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

You'll get an `output.mp3` that shifts emotion and prosody across the sentence.

## What it does

- `POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <key>`.
- JSON body has SSML as the `input` value (single `<speak>` root), plus `voice_id`,
  `audio_format`, and `model: "simba-3.2"` (full SSML + emotion support).
- **Emotion:** `<speechify:style emotion="...">` — one of `angry`, `cheerful`, `sad`,
  `terrified`, `relaxed`, `fearful`, `surprised`, `calm`, `assertive`, `energetic`,
  `warm`, `direct`, `bright`.
- **Prosody:** `<prosody rate="..." pitch="..." volume="...">` (named steps or
  percentages). **Pauses:** `<break time="500ms" />`. **Emphasis:**
  `<emphasis level="strong">`.

> SSML reference: https://docs.speechify.ai/tts/guides/ssml
