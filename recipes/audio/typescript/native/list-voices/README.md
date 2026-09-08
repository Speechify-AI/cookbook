# Text-to-Speech: list voices (TypeScript, native REST)

The native counterpart to the [SDK recipe](../../sdk/list-voices) — `GET /v1/voices`
over raw `fetch`, walking the cursor yourself.

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

- `GET https://api.speechify.ai/v1/voices?locale=en` with `Authorization: Bearer <key>`.
- Response JSON: `{ voices, next_cursor, has_more }`. Loop while `has_more`, passing
  `?cursor=<next_cursor>` (keep `&locale=en`) to fetch the next page. Filters:
  `type`, `locale`, `gender`, `model`, `limit` (max 200), `cursor`.
- Each voice has `id`, `display_name`, `locale`, `gender`, `type`
  (`shared` = catalogue, `personal` = your clones), and `models[]` — the models it
  can be synthesized with, read via `voice.models[].name`.

> Console output is capped at the first 25 voices; the loop still walks every page.
