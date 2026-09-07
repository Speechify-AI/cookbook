# Text-to-Speech: voice cloning (TypeScript)

Clone a voice from an audio sample, synthesize speech with the clone, then delete it — the
full create → use → delete lifecycle.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- **Voice cloning enabled on your plan** — otherwise the recipe exits with a message
  pointing to [Speechify pricing](https://speechify.ai/pricing) (the API returns
  `402 voice_cloning_not_included`).
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

Produces an `output.mp3` spoken in the cloned voice, then removes the cloned voice.

## What it does

- `client.voices.create(...)` — clones a voice from `fixtures/spacewalk.wav`. Required
  fields: `name`, `gender`, `sample` (a readable stream of 10–30s of clean speech), and
  `consent`.
- `client.audio.speech(...)` with `voice_id` set to the new voice's id.
- `client.voices.delete({ id })` — cleans up so personal voices don't accumulate.

## Consent

`consent` is a **required** JSON string attesting you have the speaker's permission to
clone their voice (`{"fullName": "...", "email": "..."}`). Only clone voices you are
authorized to. The bundled `fixtures/spacewalk.wav` is ~26s of NASA ISS spacewalk audio
(U.S. government work, public domain); replace it with your own consented sample for real
use.

> Note: `voices.list()` is eventually consistent — a just-deleted voice may still appear in
> the list briefly. The delete itself is immediate (a subsequent delete returns 404).
>
> Voice cloning reference: https://docs.speechify.ai/tts/guides/voice-cloning
