# Text-to-Speech: SSML & emotion (Python)

Drive emotion, pitch, rate, pauses, and emphasis by passing **SSML** as the `input`.

## Prerequisites

- A Speechify API key — https://console.speechify.ai/api-keys
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

You'll get an `output.mp3` that shifts emotion and prosody across the sentence.

## What it does

- Sends an SSML document (single `<speak>` root) as `input` to `client.audio.speech`.
- **Emotion:** `<speechify:style emotion="...">` — one of `angry`, `cheerful`, `sad`,
  `terrified`, `relaxed`, `fearful`, `surprised`, `calm`, `assertive`, `energetic`,
  `warm`, `direct`, `bright`.
- **Prosody:** `<prosody rate="..." pitch="..." volume="...">` (named steps or percentages).
- **Pauses:** `<break time="500ms" />`. **Emphasis:** `<emphasis level="strong">`.
- Uses `model="simba-3.2"`, which supports full SSML + emotion control.

> SSML reference: https://docs.speechify.ai/tts/guides/ssml
