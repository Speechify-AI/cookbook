# Text-to-Speech: TypeScript streaming

Stream synthesized audio to disk as it is generated, instead of waiting for the whole clip.
Useful for long inputs and low-latency playback.

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

You'll get an `output.mp3` written chunk by chunk.

## What it does

- Calls `client.audio.stream(...)` with `Accept` (`audio/mpeg`, `audio/ogg`,
  `audio/aac`, or `audio/pcm`), `input`, `voice_id`, and `model`.
- Receives a `BinaryResponse`; calls `.stream()` for a Web `ReadableStream`, then pipes
  it through Node `stream/promises` `pipeline` (which handles backpressure).
- For prosody/emotion control, pass SSML in `input` (see the `ssml-emotion` recipe).
