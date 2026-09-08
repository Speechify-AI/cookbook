# Text-to-Speech: voice language + model support (Python, SDK)

Answer "which model + language combinations does a voice support, and which voices
support model X in locale Y" — so you can drive a voice/model picker off real data.

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
```

## What it does

- `client.voices.list(locale="en", model="simba-3.2")` → voices advertising that model in
  that locale. Iterate and print each voice's `id`, `display_name`, `locale`, and its full
  model→locales map from `voice.models` (each entry has `.name` and `.languages[].locale`),
  e.g. `simba-3.2: en-US, en-GB`.
- `client.voices.get(voice_id=...)` → one voice's supported models + languages. A missing
  id raises `ApiError` with `status_code` 404 (`voice_not_found`) — caught and skipped so
  the recipe still completes.

> A voice's own `models[]` array is the authority on what your workspace may actually
> synthesize with it — it reflects clones and per-workspace enablement. Drive pickers off
> it rather than assuming a model works. The `model` filter returns the voices that
> advertise that model.
