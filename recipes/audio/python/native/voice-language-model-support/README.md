# Text-to-Speech: voice language + model support (Python, native REST)

The native counterpart to the [SDK recipe](../../sdk/voice-language-model-support) —
`GET /v1/voices` over `requests`. Answers which model + language combinations a voice
supports, and which voices support model X in locale Y.

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

- `GET https://api.speechify.ai/v1/voices?locale=en&model=simba-3.2` with
  `Authorization: Bearer <key>` → `{ voices }`. For each voice print `id`, `display_name`,
  `locale`, and its full model→locales map from `voice["models"]` (each entry has `name`
  and `languages[].locale`), e.g. `simba-3.2: en-US, en-GB`.
- `GET /v1/voices/{voice_id}` → one voice's supported models + languages. A missing id
  returns `404 voice_not_found` — handled and skipped so the recipe still completes.

> A voice's own `models[]` array is the authority on what your workspace may actually
> synthesize with it — it reflects clones and per-workspace enablement. Drive pickers off
> it rather than assuming a model works. The `model` query filter returns the voices that
> advertise that model.
