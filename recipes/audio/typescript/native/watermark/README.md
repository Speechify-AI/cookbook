# Text-to-Speech: detect the watermark (TypeScript, native REST)

Speechify embeds an inaudible watermark in generated audio. This recipe synthesizes a
short clip (its own output carries the mark), then detects that mark two ways over raw
`fetch` — the keyed `detect` endpoint and the public, credential-free `verify` endpoint.

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

- `POST /v1/audio/speech` (`voice_id: geffen_32`, `model: simba-3.2`, `audio_format: wav`)
  synthesizes ~4s of speech and writes `sample.wav`. The detector needs **≥3s of clear
  speech**.
- `POST /v1/audio/watermark/detect` — multipart `audio=@sample.wav` (≤25MB), **needs your
  API key**. Returns `{ watermarked, confidence }` (confidence in `[0,1]`). Capped ~20/hour
  per workspace.
- `POST /v1/audio/watermark/verify` — same multipart body, **no `Authorization` header at
  all**. Returns a bare `{ watermarked }` — no confidence. This is the public, credential-free
  check mandated by the CA AI Transparency Act; it is rate-limited per client IP.
- Multipart: build a `FormData` with a `Blob` field named `audio` and let `fetch` set the
  boundary — do **not** set `Content-Type` yourself.

> **Read the answer in one direction only.** `watermarked: true` is positive evidence the
> audio is Speechify-generated. `watermarked: false` is the **absence** of evidence, not
> proof of the negative — only models redeployed since the watermark shipped mark their
> output, the check needs ≥3s of clear speech, and re-encoding or speed changes degrade the
> mark.

> Error codes: `422 watermark_audio_unusable` means the audio was undecodable or too short
> (not a negative verdict); `502 watermark_detection_unavailable` is transient — retry.
