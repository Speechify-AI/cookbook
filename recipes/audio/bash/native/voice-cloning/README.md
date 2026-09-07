# Text-to-Speech: voice cloning (Bash, native REST)

Clone a voice from an audio sample, synthesize speech with the clone, then delete it
— same lifecycle as the [TypeScript](../../../typescript/native/voice-cloning) and
[Python](../../../python/native/voice-cloning) native recipes, but as a self-contained
shell script using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- **Voice cloning enabled on your plan** — otherwise the script exits with a message
  pointing to [Speechify pricing](https://speechify.ai/pricing) (the API returns
  `402 voice_cloning_not_included`).
- `bash`, `curl`, `jq`, and `base64`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x voice-cloning.sh
```

## Run

```bash
./voice-cloning.sh
```

Produces an `output.mp3` spoken in the cloned voice, then removes the cloned voice.

## What it does

- `POST /v1/voices` (**multipart/form-data**) via `curl -F`: fields `name`, `gender`,
  `consent`, and a `sample=@fixtures/spacewalk.wav` file part. `curl` sets the
  `Content-Type` boundary automatically.
- `POST /v1/audio/speech` with the returned `voice_id`. `jq -n` builds the JSON body
  safely.
- `DELETE /v1/voices/{id}` runs from an `EXIT` trap, so the cloned voice is removed
  even if step 2 fails.

## Consent

`consent` is a **required** JSON string attesting you have the speaker's permission to
clone their voice (`{"fullName": "...", "email": "..."}`). Only clone voices you are
authorized to. The bundled `fixtures/spacewalk.wav` is ~26s of NASA ISS spacewalk audio
(U.S. government work, public domain); replace it with your own consented sample for
real use.

> Voice cloning reference: https://docs.speechify.ai/tts/guides/voice-cloning
