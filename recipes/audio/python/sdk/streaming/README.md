# Text-to-Speech: Python streaming

Stream synthesized audio to disk as it is generated, instead of waiting for the whole clip.
Useful for long inputs and low-latency playback.

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

You'll get an `output.mp3` written chunk by chunk.

## What it does

- Calls `client.audio.stream(...)` with `accept` (`audio/mpeg`, `audio/ogg`, `audio/aac`,
  or `audio/pcm`), `input`, `voice_id`, and `model`.
- Iterates the returned `Iterator[bytes]` and writes each chunk straight to disk — the
  same iterator could instead feed an audio player or HTTP response.
- For prosody/emotion control, pass SSML in `input` (see the `ssml-emotion` recipe).
