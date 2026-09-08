# Text-to-Speech: multilingual (TypeScript, SDK)

Synthesize non-English speech with the Speechify SDK. Discovers a voice for the
target locale at runtime, then synthesizes a French sentence to `output.mp3`.

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
# override the target locale (de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR):
LOCALE=de-DE pnpm start
```

You'll get an `output.mp3` in this folder.

## What it does

- Uses `model: "simba-3.0"` — the multilingual model (English + de-DE, es-ES,
  es-MX, fr-FR, it-IT, pt-BR). `simba-3.2` is **English-only**: a non-English
  voice on it returns `400`.
- `client.voices.list({ locale, model: "simba-3.0" })` → a paginated `Page`;
  takes the **first** match's `.id`. Discovering the voice at runtime avoids
  hardcoding a non-English id you can't verify. Prints a message and exits if
  no voice matches.
- `client.audio.speech({ input, voice_id, model, language, audio_format })`.
  The `language` parameter (BCP-47, e.g. `fr-FR`) selects the training; omit it
  and the voice's own locale decides. Decodes the base64 `audio_data` to disk.
- `LOCALE` env var overrides the target locale (default `fr-FR`). The sample
  text stays French — in a real app you'd match the text to `LOCALE`.
