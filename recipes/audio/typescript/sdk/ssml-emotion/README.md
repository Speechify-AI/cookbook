# Text-to-Speech: SSML pauses, pacing & pronunciation (TypeScript)

Shape pauses, speaking rate, and pronunciation by passing **SSML** as the `input`.

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

You'll get an `output.mp3` with timed pauses, one slower sentence, and `CI` spoken as
"continuous integration".

## What it does

- Sends an SSML document (single `<speak>` root) as `input` to `client.audio.speech`.
- **Pauses:** `<break time="500ms" />` inserts silence of a set length.
- **Pacing:** `<prosody rate="...">` takes `x-slow`, `slow`, `medium`, `fast`, `x-fast`,
  or a percentage such as `-20%`.
- **Pronunciation:** `<sub alias="...">` speaks the alias in place of the written text.
- Uses `model: "simba-3.2"`.
- Emotion (`<speechify:style emotion>`), pitch, volume, and emphasis tags are accepted and
  not applied on current models (`simba-3.2`, `simba-3.0`).

> SSML reference: https://docs.speechify.ai/build/guides/text-to-speech/ssml
