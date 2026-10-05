# Text-to-Speech: SSML pauses, pacing & pronunciation (Bash, native REST)

Shape pauses, speaking rate, and pronunciation by passing **SSML** as the `input`, the
same as the [TypeScript](../../../typescript/native/ssml-emotion) and
[Python](../../../python/native/ssml-emotion) native SSML recipes, but as a
self-contained shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, and `base64`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x speech.sh
```

## Run

```bash
./speech.sh
```

You'll get an `output.mp3` with timed pauses, one slower sentence, and `CI` spoken as
"continuous integration".

## What it does

- Builds the request body with `jq -n --arg input "$SSML" ...` so the SSML string is
  JSON-escaped safely (newlines, quotes, angle brackets).
- `POST https://api.speechify.ai/v1/audio/speech` with `model: "simba-3.2"`.
- **Pauses:** `<break time="500ms" />`. **Pacing:** `<prosody rate="...">` (named steps or
  percentages). **Pronunciation:** `<sub alias="...">` speaks the alias in place of the text.
- Emotion (`<speechify:style emotion>`), pitch, volume, and emphasis tags are accepted and
  not applied on current models (`simba-3.2`, `simba-3.0`).

> SSML reference: https://docs.speechify.ai/build/guides/text-to-speech/ssml
