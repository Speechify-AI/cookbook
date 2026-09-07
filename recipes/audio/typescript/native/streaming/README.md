# Text-to-Speech: TypeScript streaming (native REST)

The same as [`streaming`](../../sdk/streaming), but calling the REST API directly with
`fetch` instead of the `@speechify/api` SDK — no SDK dependency, and you see the raw
wire protocol.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- Node 20+ (for built-in `fetch` and `Readable.fromWeb`)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
pnpm install
```

## Run

```bash
pnpm start
```

You'll get an `output.mp3` written chunk by chunk.

## What it does

- `POST https://api.speechify.ai/v1/audio/stream` with `Authorization: Bearer <key>`
  and `Accept: audio/mpeg` (or `audio/ogg`, `audio/aac`, `audio/pcm`).
- JSON body (snake_case on the wire): `input`, `voice_id`, `model`.
- Unlike `/v1/audio/speech`, the response is **raw audio bytes** (HTTP chunked) — not
  base64 JSON. Convert `res.body` (a Web `ReadableStream`) to a Node `Readable` and
  pipe it to disk with `stream/promises` `pipeline` for backpressure handling.

> Prefer the SDK ([`streaming`](../../sdk/streaming)) for typed options and helpers.
> Reach for raw REST when you're on a language/runtime without an SDK.
