# Text-to-Speech: output formats (Python, SDK)

Control the exact codec, sample rate, and bitrate of synthesized audio via
`output_format`, synthesizing the same sentence into MP3, μ-law, raw PCM, and WAV.

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

You'll get four files in this folder: `output_mp3_128.mp3`, `output_ulaw_8000.ulaw`,
`output_pcm_16000.pcm`, and `output_wav_48000.wav`.

## What it does

- Loops over a small list of `(output_format, filename)` and calls
  `client.audio.speech(input=, voice_id=, model=, output_format=)` for each.
- `output_format` uses the `codec_sampleRate_bitrate` shape and takes **precedence**
  over `audio_format` on `/v1/audio/speech` (and over the `Accept` header on
  `/v1/audio/stream`) — set one, not both.
- Valid values include: `pcm_16000`, `pcm_24000`, `ulaw_8000`, `mp3_24000_64`,
  `mp3_24000_128`, `mp3_22050_160`, `mp3_24000_160`, `wav_48000`. An invalid value
  returns `400` listing the supported formats.
- Telephony pipelines want `ulaw_8000` or `pcm_16000`; media pipelines want the mp3
  bitrate variants.
- The response echoes the resolved `output_format` (printed per file), and
  `audio_data` is base64 regardless of codec — decode and write the bytes.

> The `.ulaw` and `.pcm` outputs are **raw** — no container header, so you can't just
> double-click them to play. Feed them into a pipeline that knows the codec and sample
> rate (e.g. an 8kHz μ-law telephony leg), or wrap them in a container first.
