# Text-to-Speech: list voices (Python, SDK)

List the voices a key can use — Speechify's shared catalogue plus your workspace
clones — and the models each one supports, so you can drive a voice picker instead
of hardcoding voice ids.

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

- `client.voices.list(locale="en")` → an iterable pager. `locale` is a BCP-47 prefix
  filter; other filters are `type`, `gender`, `model`, `limit`, `cursor`.
- The pager auto-pages: `for v in ...` walks every page transparently — no cursor
  handling required.
- Each voice carries `id`, `display_name`, `locale`, `gender`, `type`
  (`shared` = catalogue, `personal` = your clones), and `models` — the models it can
  be synthesized with, read via `[m.name for m in v.models]`.

> Console output is capped at the first 25 voices; the pager still counts them all.
