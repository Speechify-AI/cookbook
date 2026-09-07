# Text-to-Speech: voice cloning (TypeScript, native REST)

The same as [`voice-cloning`](../../sdk/voice-cloning) — clone → synthesize → delete —
but calling the REST API directly with `fetch` + multipart `FormData` instead of the
`@speechify/api` SDK.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- **Voice cloning enabled on your plan** — otherwise the recipe exits with a message
  pointing to [Speechify pricing](https://speechify.ai/pricing) (the API returns
  `402 voice_cloning_not_included`).
- Node 20+ (for built-in `fetch`, `FormData`, and `Blob`)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
pnpm install
```

## Run

```bash
pnpm start
```

Produces an `output.mp3` spoken in the cloned voice, then removes the cloned voice.

## What it does

- `POST /v1/voices` (**multipart/form-data**): fields `name`, `gender`, `consent`, and a
  `sample` file part. Pass a `FormData` instance as `body` and let `fetch` set the
  `Content-Type` boundary automatically — do **not** set it yourself.
- `POST /v1/audio/speech` with the returned voice's `id` as `voice_id`.
- `DELETE /v1/voices/{id}` — cleans up so personal voices don't accumulate.

## Consent

`consent` is a **required** JSON string attesting you have the speaker's permission to
clone their voice (`{"fullName": "...", "email": "..."}`). Only clone voices you are
authorized to. The bundled `fixtures/spacewalk.wav` is ~26s of NASA ISS spacewalk audio
(U.S. government work, public domain); replace it with your own consented sample for
real use.

> Voice cloning reference: https://docs.speechify.ai/tts/guides/voice-cloning
