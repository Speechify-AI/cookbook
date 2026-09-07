# Text-to-Speech: speech marks → captions (Bash, native REST)

Generate an `output.mp3` plus a synced `captions.vtt` from word-level speech marks —
same as the [TypeScript](../../../typescript/native/speech-marks) and
[Python](../../../python/native/speech-marks) native recipes, but as a self-contained
shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x speech-marks.sh
```

## Run

```bash
./speech-marks.sh
```

You'll get `output.mp3` and a `captions.vtt` with one cue per word.

## What it does

- `POST https://api.speechify.ai/v1/audio/speech`. JSON response includes `audio_data`
  (base64) and `speech_marks.chunks` — one entry per word with `start_time` /
  `end_time` (milliseconds) and `value`.
- A `jq` program formats each chunk as a WebVTT timestamp pair (`HH:MM:SS.mmm`).
- Group words into phrases for sentence-level captions, or use the times to highlight
  words during playback.

> Speech marks reference: https://docs.speechify.ai/tts/guides/speech-marks
