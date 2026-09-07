# Text-to-Speech: Python quickstart

Synthesize a sentence to an `output.mp3` file using the `speechify-api` SDK.

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

You'll get an `output.mp3` in this folder.

## What it does

- Creates a `Speechify` client with your API key.
- Calls `client.audio.speech(...)` with `input`, `voice_id`, `audio_format`, and `model`
  (`simba-3.2` for English; `simba-3.0` for multilingual — English plus German, Spanish, French, Italian, and Portuguese).
- Decodes the base64 `response.audio_data` and writes it to disk.
