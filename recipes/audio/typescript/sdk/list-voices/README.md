# Text-to-Speech: list voices (TypeScript, SDK)

List the voices a key can use — Speechify's shared catalogue plus your workspace
clones — and the models each one supports, so you can drive a voice picker instead
of hardcoding voice ids.

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

- `client.voices.list({ locale: "en" })` → a paginated `Page`. `locale` is a BCP-47
  prefix filter; other filters are `type`, `gender`, `model`, `limit`, `cursor`.
- The `Page` is async-iterable and auto-pages: `for await (const v of page)` walks
  every page transparently. To page manually, loop with `page.hasNextPage()` /
  `page.getNextPage()` (server caps `limit` at 200; pass `cursor` to resume).
- Each voice carries `id`, `display_name`, `locale`, `gender`, `type`
  (`shared` = catalogue, `personal` = your clones), and `models[]` — the models it
  can be synthesized with, read via `v.models.map((m) => m.name)`.

> Console output is capped at the first 25 voices; the pager still counts them all.
