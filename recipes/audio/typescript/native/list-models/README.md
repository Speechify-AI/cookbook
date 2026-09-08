# Text-to-Speech: list models (TypeScript, native REST)

The native counterpart to the [SDK recipe](../../sdk/list-models) — `GET /v1/audio/models`
over raw `fetch`.

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

## What it does

- `GET https://api.speechify.ai/v1/audio/models` with `Authorization: Bearer <key>`.
- Response JSON: `{ models, dialogue_models }`. Each model has `id`, `name`, `description`,
  `languages[]`, `endpoints[]`, and the flags `default`, `recommended`, `deprecated`,
  `curated_voices`.
- `dialogue_models` (multi-speaker) are valid only on `POST /v1/audio/dialogue`.

> Read the catalog at runtime — the model set, the default, and each model's languages
> change over time.
