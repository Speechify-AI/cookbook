# Text-to-Speech: TypeScript quickstart

Synthesize a sentence to an `output.mp3` file using the `@speechify/api` SDK.

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

You'll get an `output.mp3` in this folder.

## What it does

- Creates a `SpeechifyClient` with your API key.
- Calls `client.audio.speech(...)` with `input`, `voiceId`, `audioFormat`, and `model`
  (`simba-3.2` for English, lowest latency; `simba-3.0` for multilingual — English plus German, Spanish, French, Italian, and Portuguese).
- Decodes the base64 `response.audio_data` and writes it to disk.
