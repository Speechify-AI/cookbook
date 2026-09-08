# Text-to-Speech: voice cloning (TypeScript, native REST)

The same as [`voice-cloning`](../../sdk/voice-cloning) — clone → synthesize → delete, with
**verified consent** — but calling the REST API directly with `fetch` + multipart
`FormData` instead of the `@speechify/api` SDK.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- **Voice cloning enabled on your plan** — otherwise the recipe exits with a message
  pointing to [Speechify pricing](https://speechify.ai/pricing) (the API returns
  `402 voice_cloning_not_included`).
- Node 20+ (for built-in `fetch`, `FormData`, and `Blob`)
- **Two recordings of the same consenting person** (see [Consent](#consent)):
  - a voice **sample** to clone — 10–30s of clean speech
  - a **consent recording** — that person reading the challenge phrase this recipe prints

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
pnpm install
```

## Run

Because consent is verified against a phrase the API generates, this is a two-step run:

```bash
pnpm start   # 1st run: prints the phrase to read, then exits
# record the speaker reading that phrase → consent.wav, and their voice → sample.wav
pnpm start   # 2nd run: clones, synthesizes, deletes
```

Put `sample.wav` and `consent.wav` in the recipe folder, or point `SAMPLE_PATH` /
`CONSENT_RECORDING_PATH` at them. Produces an `output.mp3` in the cloned voice, then
removes the cloned voice.

## What it does

- `POST /v1/voices/consent-challenges` (JSON `{ full_name }`) — returns a `phrase` the
  speaker must read aloud and an `id`; cached in `.consent-challenge.json` between runs
  (single-use).
- `POST /v1/voices` (**multipart/form-data**): fields `name`, `gender`,
  `consent_challenge_id`, and `sample` + `consent_recording` file parts. Pass a
  `FormData` instance as `body` and let `fetch` set the `Content-Type` boundary — do
  **not** set it yourself.
- `POST /v1/audio/speech` with the returned voice's `id` as `voice_id`.
- `DELETE /v1/voices/{id}` — cleans up so personal voices don't accumulate.

All calls pin `Speechify-Version: 2026-09-13`, the API version the verified-consent flow
ships on.

## Consent

Cloning requires **verified consent**. You create a consent challenge, the speaker records
themselves reading the returned `phrase`, and that recording is sent as `consent_recording`
and retained as the consent record. The `consent_recording` **must be the same person** as
the voice `sample` — so there is no shippable sample that comes with valid consent, and this
recipe is deliberately bring-your-own-audio. Only clone voices you are authorized to.

> The old `consent` JSON field (`fullName` + `email`) is removed on `Speechify-Version:
2026-09-13` — see the
> [migration guide](https://docs.speechify.ai/build/guides/deprecations/migrating-voice-cloning-consent).
>
> Voice cloning reference: https://docs.speechify.ai/build/guides/voice-cloning/overview
