# Text-to-Speech: multilingual (Bash, native REST)

The same as the [TypeScript](../../../typescript/native/multilingual) and
[Python](../../../python/native/multilingual) native multilingual recipes, but as
a self-contained shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64` (preinstalled on macOS and most Linux distros)

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x multilingual.sh
```

## Run

```bash
./multilingual.sh
# override the target locale (de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR):
LOCALE=de-DE ./multilingual.sh
```

You'll get an `output.mp3` in this folder.

## What it does

- Uses `model: "simba-3.0"` — the multilingual model (English + de-DE, es-ES,
  es-MX, fr-FR, it-IT, pt-BR). `simba-3.2` is **English-only**: a non-English
  voice on it returns `400`.
- `GET /v1/voices?locale=<locale>&model=simba-3.0`, then `jq -r '.voices[0].id'`
  takes the first match. Discovering the voice at runtime avoids hardcoding a
  non-English id you can't verify. Prints a message and exits if none match.
- `POST /v1/audio/speech` with JSON body `{ input, voice_id, model, language,
audio_format }`. The `language` field (BCP-47, e.g. `fr-FR`) selects the
  training; omit it and the voice's own locale decides. `jq -r '.audio_data' |
base64 -d` writes the bytes to disk.
- `LOCALE` env var overrides the target locale (default `fr-FR`). The sample
  text stays French — in a real app you'd match the text to `LOCALE`.
