# Text-to-Speech: list models (Bash, native REST)

`GET /v1/audio/models` as a self-contained shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x list-models.sh
```

## Run

```bash
./list-models.sh
```

## What it does

- `GET https://api.speechify.ai/v1/audio/models` with `Authorization: Bearer <key>`.
- `jq` prints each model's `id`, flags (`default`, `recommended`, `deprecated`,
  `curated_voices`), `languages`, and `endpoints`, then the `dialogue_models` ids.

> Read the catalog at runtime — the model set and defaults change over time.
