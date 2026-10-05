# Text-to-Speech: SSML pauses, pacing & pronunciation (TypeScript, native REST)

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

You'll get an `output.mp3` with timed pauses, one slower sentence, and `CI` spoken as
"continuous integration".

## What it does

- `POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <key>`.
- JSON body has SSML as the `input` value (single `<speak>` root), plus `voice_id`,
  `audio_format`, and `model: "simba-3.2"`.
- **Pauses:** `<break time="500ms" />`. **Pacing:** `<prosody rate="...">` (named steps or
  percentages). **Pronunciation:** `<sub alias="...">` speaks the alias in place of the text.
- Emotion (`<speechify:style emotion>`), pitch, volume, and emphasis tags are accepted and
  not applied on current models (`simba-3.2`, `simba-3.0`).

> SSML reference: https://docs.speechify.ai/build/guides/text-to-speech/ssml
