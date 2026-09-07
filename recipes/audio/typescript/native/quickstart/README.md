# Text-to-Speech: TypeScript quickstart (native REST)

The same as [`quickstart`](../../sdk/quickstart), but calling the REST API directly with `fetch`
instead of the `@speechify/api` SDK — no SDK dependency, and you see the raw wire protocol.

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

You'll get an `output.mp3` in this folder.

## What it does

- `POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <key>`.
- JSON body (snake_case on the wire): `input`, `voice_id`, `audio_format`, `model`.
- Response JSON: `audio_data` (base64), `audio_format`, `billable_characters_count`,
  `speech_marks`. Decode `audio_data` and write it to disk.

> Prefer the SDK ([`quickstart`](../../sdk/quickstart)) for retries, types, and streaming helpers.
> Reach for raw REST when you're on a language/runtime without an SDK.
