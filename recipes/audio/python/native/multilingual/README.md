# Text-to-Speech: multilingual (Python, native REST)

The same as [`multilingual`](../../sdk/multilingual), but calling the REST API
directly with `requests` instead of the `speechify-api` SDK — no SDK dependency,
and you see the raw wire protocol.

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

- Uses `model: "simba-3.0"` — the multilingual model (English + de-DE, es-ES,
  es-MX, fr-FR, it-IT, pt-BR). `simba-3.2` is **English-only**: a non-English
  voice on it returns `400`.
- `GET /v1/voices?locale=<locale>&model=simba-3.0` → `{ voices: [...] }`; takes
  `voices[0]["id"]`. Discovering the voice at runtime avoids hardcoding a
  non-English id you can't verify. Prints a message and exits if none match.
- `POST /v1/audio/speech` with JSON body `{ input, voice_id, model, language,
audio_format }`. The `language` field (BCP-47, e.g. `fr-FR`) selects the
  training; omit it and the voice's own locale decides. Response `audio_data`
  is base64 — decode it to disk.
- `LOCALE` env var overrides the target locale (default `fr-FR`). The sample
  text stays French — in a real app you'd match the text to `LOCALE`.
