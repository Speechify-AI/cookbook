# Text-to-Speech: output formats (Bash, native REST)

The same as the [TypeScript](../../../typescript/native/output-formats) and
[Python](../../../python/native/output-formats) native output-formats recipes, but as a
self-contained shell script using `curl` + `jq`. Control the codec, sample rate, and
bitrate via the `output_format` body field.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64` (preinstalled on macOS and most Linux distros)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x output-formats.sh
```

## Run

```bash
./output-formats.sh
```

You'll get four files in this folder: `output_mp3_128.mp3`, `output_ulaw_8000.ulaw`,
`output_pcm_16000.pcm`, and `output_wav_48000.wav`.

## What it does

- Loops over `format:filename` pairs and `POST`s to
  `https://api.speechify.ai/v1/audio/speech` with `output_format` in the JSON body.
- `output_format` uses the `codec_sampleRate_bitrate` shape and takes **precedence**
  over `audio_format` on `/v1/audio/speech` (and over the `Accept` header on
  `/v1/audio/stream`) — set one, not both.
- Valid values include: `pcm_16000`, `pcm_24000`, `ulaw_8000`, `mp3_24000_64`,
  `mp3_24000_128`, `mp3_22050_160`, `mp3_24000_160`, `wav_48000`. An invalid value
  returns `400` listing the supported formats.
- Telephony pipelines want `ulaw_8000` or `pcm_16000`; media pipelines want the mp3
  bitrate variants.
- Response JSON: `audio_data` (base64) plus the resolved `output_format` echoed back.
  `jq -r '.audio_data' | base64 -d` writes the bytes to disk.

> The `.ulaw` and `.pcm` outputs are **raw** — no container header, so you can't just
> double-click them to play. Feed them into a pipeline that knows the codec and sample
> rate (e.g. an 8kHz μ-law telephony leg), or wrap them in a container first.
