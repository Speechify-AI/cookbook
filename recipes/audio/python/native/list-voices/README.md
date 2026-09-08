# Text-to-Speech: list voices (Python, native REST)

The native counterpart to the [SDK recipe](../../sdk/list-voices) — `GET /v1/voices`
over `requests`, walking the cursor yourself.

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

- `GET https://api.speechify.ai/v1/voices?locale=en` with `Authorization: Bearer <key>`.
- Response JSON: `{ voices, next_cursor, has_more }`. Loop while `has_more`, passing
  `?cursor=<next_cursor>` (keep `locale=en`) to fetch the next page. Filters:
  `type`, `locale`, `gender`, `model`, `limit` (max 200), `cursor`.
- Each voice has `id`, `display_name`, `locale`, `gender`, `type`
  (`shared` = catalogue, `personal` = your clones), and `models` — the models it can
  be synthesized with, read via `voice["models"][i]["name"]`.

> Console output is capped at the first 25 voices; the loop still walks every page.
