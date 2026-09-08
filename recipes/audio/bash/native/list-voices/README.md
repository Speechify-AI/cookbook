# Text-to-Speech: list voices (Bash, native REST)

`GET /v1/voices` as a self-contained shell script using `curl` + `jq`, walking the
cursor yourself.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x list-voices.sh
```

## Run

```bash
./list-voices.sh
```

## What it does

- `GET https://api.speechify.ai/v1/voices?locale=en` with `Authorization: Bearer <key>`.
- Response JSON: `{ voices, next_cursor, has_more }`. The script loops while `has_more`,
  passing `?cursor=<next_cursor>` (keeping `locale=en`) to fetch each next page.
  Filters: `type`, `locale`, `gender`, `model`, `limit` (max 200), `cursor`.
- `jq` prints each voice's `id`, `display_name`, `locale`, `gender`, `type`
  (`shared` = catalogue, `personal` = your clones), and its supported models
  (`.models | map(.name)`).

> Console output is capped at the first 25 voices; the loop still walks every page.
