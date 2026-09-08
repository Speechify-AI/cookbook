# Text-to-Speech: list models (Python, native REST)

The native counterpart to the [SDK recipe](../../sdk/list-models) — `GET /v1/audio/models`
over `requests`.

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

- `GET https://api.speechify.ai/v1/audio/models` with `Authorization: Bearer <key>`.
- Response JSON: `{ models, dialogue_models }`. Each model has `id`, `name`, `description`,
  `languages`, `endpoints`, and the flags `default`, `recommended`, `deprecated`, `curated_voices`.
- `dialogue_models` (multi-speaker) are valid only on `POST /v1/audio/dialogue`.

> Read the catalog at runtime — the model set and defaults change over time.
