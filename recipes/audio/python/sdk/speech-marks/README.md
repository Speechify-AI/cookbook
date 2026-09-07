# Text-to-Speech: speech marks → captions (Python)

Generate an `output.mp3` plus a synced `captions.vtt` from word-level speech marks — the
basis for caption sync and karaoke-style highlighting.

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

You'll get `output.mp3` and a `captions.vtt` with one cue per word.

## What it does

- Calls `client.audio.speech(...)` and reads `response.speech_marks.chunks` — one entry
  per word with `start_time` / `end_time` (milliseconds) and `value`.
- Formats those into a WebVTT file (one cue per word). Group words into phrases for
  sentence-level captions, or use the times to highlight words during playback.

> Speech marks reference: https://docs.speechify.ai/tts/guides/speech-marks
