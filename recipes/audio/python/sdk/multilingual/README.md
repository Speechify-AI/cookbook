# Text-to-Speech: multilingual (Python, SDK)

Synthesize non-English speech with the `speechify-api` SDK. Discovers a voice for
the target locale at runtime, then synthesizes a French sentence to `output.mp3`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- Python 3.10+ and [uv](https://docs.astral.sh/uv/)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
uv sync
```

## Run

```bash
uv run main.py
# override the target locale (de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR):
LOCALE=de-DE uv run main.py
```

You'll get an `output.mp3` in this folder.

## What it does

- Uses `model="simba-3.0"` — the multilingual model (English + de-DE, es-ES,
  es-MX, fr-FR, it-IT, pt-BR). `simba-3.2` is **English-only**: a non-English
  voice on it returns `400`.
- `client.voices.list(locale=..., model="simba-3.0")` → an iterable pager; takes
  the **first** match's `.id`. Discovering the voice at runtime avoids hardcoding
  a non-English id you can't verify. Prints a message and exits if none match.
- `client.audio.speech(input=, voice_id=, model=, language=, audio_format=)`.
  The `language` argument (BCP-47, e.g. `fr-FR`) selects the training; omit it
  and the voice's own locale decides. Decodes the base64 `audio_data` to disk.
- `LOCALE` env var overrides the target locale (default `fr-FR`). The sample
  text stays French — in a real app you'd match the text to `LOCALE`.
