# Text-to-Speech: list models (Python, SDK)

Read the text-to-speech model catalog at runtime — drive a model picker instead of
hardcoding model ids.

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

- `client.models.list()` → `.models` and `.dialogue_models`.
- Each model carries `id`, `name`, `description`, `languages`, `endpoints`, and the flags
  `default` (used when a request omits `model`), `recommended`, `deprecated`, `curated_voices`.
- `dialogue_models` (multi-speaker) are valid only on `POST /v1/audio/dialogue`.

> These values reflect current support and change over time. Read them at runtime.
