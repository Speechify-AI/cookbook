# Text-to-Speech: voice cloning (TypeScript)

Clone a voice from an audio sample, synthesize speech with the clone, then delete it — the
full create → use → delete lifecycle, with **verified consent**.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- **Voice cloning enabled on your plan** — otherwise the recipe exits with a message
  pointing to [Speechify pricing](https://speechify.ai/pricing) (the API returns
  `402 voice_cloning_not_included`).
- Node 20+
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

- `client.voices.consentChallenges.create({ full_name })` — starts a consent challenge and
  returns a `phrase` the speaker must read aloud (cached in `.consent-challenge.json`
  between runs; single-use).
- `client.voices.create(...)` — clones the voice. Required: `name`, `gender`, `sample` (a
  readable stream of 10–30s of clean speech), `consent_challenge_id`, and
  `consent_recording` (the speaker reading the phrase).
- `client.audio.speech(...)` with `voice_id` set to the new voice's id.
- `client.voices.delete({ voice_id })` — cleans up so personal voices don't accumulate.

## Consent

Cloning requires **verified consent**. You create a consent challenge, the speaker records
themselves reading the returned `phrase`, and that recording is sent as `consent_recording`
and retained as the consent record. The `consent_recording` **must be the same person** as
the voice `sample` — so there is no shippable sample that comes with valid consent, and this
recipe is deliberately bring-your-own-audio. Only clone voices you are authorized to.

> The old `consent` JSON field (`fullName` + `email`) is removed in SDK 4.x — see the
> [migration guide](https://docs.speechify.ai/build/guides/deprecations/migrating-voice-cloning-consent).
>
> Note: `voices.list()` is eventually consistent — a just-deleted voice may still appear in
> the list briefly. The delete itself is immediate (a subsequent delete returns 404).
>
> Voice cloning reference: https://docs.speechify.ai/build/guides/voice-cloning/overview
