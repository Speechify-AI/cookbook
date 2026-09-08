# Text-to-Speech: list models (TypeScript, SDK)

Read the text-to-speech model catalog at runtime — drive a model picker instead of
hardcoding model ids.

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

- `client.models.list()` → `{ models, dialogue_models }`.
- Each model carries `id`, `name`, `description`, `languages[]`, `endpoints[]`, and the
  flags `default` (used when a request omits `model`), `recommended` (suggested for new
  integrations), `deprecated` (legacy — de-emphasise), and `curated_voices`.
- `dialogue_models` (multi-speaker) are listed separately — valid only on
  `POST /v1/audio/dialogue`, not the single-utterance endpoints.

> These values reflect current support and change over time (models are added, defaults
> move, models retire). Read them at runtime rather than caching them.
