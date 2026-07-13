# Speechify Text-to-Speech API

Reference for the TTS surface used across recipes. Authoritative docs:
<https://docs.speechify.ai/tts>.

## SDKs

| Language      | Package                                  | Install                   |
| ------------- | ---------------------------------------- | ------------------------- |
| TypeScript/JS | `@speechify/api`                         | `pnpm add @speechify/api` |
| Python        | `speechify-api` (imports as `speechify`) | `uv add speechify-api`    |

Both SDKs read `SPEECHIFY_API_KEY` from the environment. The deprecated
`@speechify/api-sdk` package should not be used.

## Synthesize speech

**TypeScript** (`@speechify/api` v3)

```ts
import { SpeechifyClient } from "@speechify/api";

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY! });

const response = await client.audio.speech({
  input: "Hello! This is the Speechify text-to-speech API.",
  voice_id: "george",
  audio_format: "mp3",
  model: "simba-english",
});

// response.audio_data is base64-encoded audio.
import fs from "node:fs";
fs.writeFileSync("output.mp3", Buffer.from(response.audio_data, "base64"));
```

**Python** (`speechify-api` v3)

```python
from speechify import Speechify

client = Speechify(token=token)

response = client.audio.speech(
    input="Hello! This is the Speechify text-to-speech API.",
    voice_id="george",
    audio_format="mp3",
    model="simba-english",
)

import base64
with open("output.mp3", "wb") as f:
    f.write(base64.b64decode(response.audio_data))
```

> Both SDKs now use snake_case for request and response fields (`voice_id`,
> `audio_format`, `audio_data`, `speech_marks`). `response.audio_data` is base64 — decode
> before writing bytes. If you observe a different response shape from the installed SDK
> version, trust the SDK and update recipes + this note.

## Parameters

| Param          | Notes                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| `input`        | Text (or SSML) to synthesize. Up to ~20,000 characters per request.                |
| `voice_id`     | A voice identifier, e.g. `george`.                                                 |
| `model`        | `simba-english` (English, lowest latency) or `simba-multilingual` (30+ languages). |
| `audio_format` | `mp3`, `wav`, `ogg`, `aac`, …                                                      |

## Capabilities to build recipes around

- **SSML controls** — pitch, rate, pauses, emphasis, and emotion presets.
- **Word-level timestamps / speech marks** — for caption/highlight sync.
- **Voice cloning** — clone a voice from a 10–30s sample
  (<https://docs.speechify.ai/tts/guides/voice-cloning>).
- **Streaming** — stream long inputs. Confirm the exact streaming method against the
  installed SDK before writing a streaming recipe; do not invent method names.

## REST fallback

`POST https://api.speechify.ai/v1/audio/speech` with `Authorization: Bearer <token>` —
useful for languages without an SDK yet.
