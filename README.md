# SpeechifyAI Cookbook

Focused, runnable recipes for the Speechify
[Text-to-Speech](https://docs.speechify.ai/tts) API.

Each recipe is small, self-contained, and does one thing — copy a folder, add your API
key, and run it.

## Quick start

```bash
# 1. Get an API key: https://platform.speechify.ai/api-keys
# 2. Pick a recipe below and follow its README.
```

The fastest path:

```bash
cd recipes/audio/typescript/sdk/quickstart
cp .env.example .env        # paste your SPEECHIFY_API_KEY
pnpm install && pnpm start  # writes output.mp3
```

## Recipes

Recipes are organized by **product → language → flavor → recipe**:

```
recipes/<product>/<language>/{sdk,native}/<recipe>/
```

- **SDK** — uses an official Speechify SDK for that language.
- **Native** — calls the REST API directly (no SDK), e.g. `fetch` in TS, `requests` in Python, `curl` in Bash.

### Audio — TypeScript

| Recipe                                                                                               | Flavor | Description                                                       |
| ---------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| [quickstart](./recipes/audio/typescript/sdk/quickstart)                                              | SDK    | Synthesize speech to an MP3 file.                                 |
| [quickstart](./recipes/audio/typescript/native/quickstart)                                           | Native | Same, calling the REST API directly with `fetch`.                 |
| [streaming](./recipes/audio/typescript/sdk/streaming)                                                | SDK    | Stream audio to disk as it is generated.                          |
| [streaming](./recipes/audio/typescript/native/streaming)                                             | Native | Streaming via raw `fetch` + `pipeline`.                           |
| [ssml-emotion](./recipes/audio/typescript/sdk/ssml-emotion)                                          | SDK    | Control emotion, pitch, rate, pauses & emphasis via SSML.         |
| [ssml-emotion](./recipes/audio/typescript/native/ssml-emotion)                                       | Native | Same SSML controls, via raw `fetch`.                              |
| [speech-marks](./recipes/audio/typescript/sdk/speech-marks)                                          | SDK    | Word-level timestamps → WebVTT captions.                          |
| [speech-marks](./recipes/audio/typescript/native/speech-marks)                                       | Native | Same captions, via raw `fetch`.                                   |
| [voice-cloning](./recipes/audio/typescript/sdk/voice-cloning)                                        | SDK    | Clone a voice from a sample, synthesize, then delete it.          |
| [voice-cloning](./recipes/audio/typescript/native/voice-cloning)                                     | Native | Same lifecycle, via raw `fetch` + multipart `FormData`.           |
| [multilingual](./recipes/audio/typescript/sdk/multilingual)                                          | SDK    | Non-English synthesis with `simba-3.0` + the `language` param.    |
| [multilingual](./recipes/audio/typescript/native/multilingual)                                       | Native | Same, via raw `fetch`.                                            |
| [output-formats](./recipes/audio/typescript/sdk/output-formats)                                      | SDK    | Pick codec/sample-rate/bitrate — telephony `ulaw_8000`, mp3, pcm. |
| [output-formats](./recipes/audio/typescript/native/output-formats)                                   | Native | Same, via raw `fetch`.                                            |
| [list-models](./recipes/audio/typescript/sdk/list-models)                                            | SDK    | List TTS models to drive a picker.                                |
| [list-models](./recipes/audio/typescript/native/list-models)                                         | Native | Same, via raw `fetch`.                                            |
| [list-voices](./recipes/audio/typescript/sdk/list-voices)                                            | SDK    | List available voices, with pagination.                           |
| [list-voices](./recipes/audio/typescript/native/list-voices)                                         | Native | Same, via raw `fetch`.                                            |
| [voice-language-model-support](./recipes/audio/typescript/sdk/voice-language-model-support)          | SDK    | Which model + language combos a voice supports.                   |
| [voice-language-model-support](./recipes/audio/typescript/native/voice-language-model-support)       | Native | Same, via raw `fetch`.                                            |
| [version-pinning-and-idempotency](./recipes/audio/typescript/sdk/version-pinning-and-idempotency)    | SDK    | Pin `Speechify-Version`; safe retries with `Idempotency-Key`.     |
| [version-pinning-and-idempotency](./recipes/audio/typescript/native/version-pinning-and-idempotency) | Native | Same, via raw `fetch`.                                            |
| [error-handling](./recipes/audio/typescript/sdk/error-handling)                                      | SDK    | Typed errors, error codes, `Retry-After`, request ids.            |
| [error-handling](./recipes/audio/typescript/native/error-handling)                                   | Native | Same, via raw `fetch`.                                            |
| [watermark](./recipes/audio/typescript/native/watermark)                                             | Native | Detect/verify the Speechify audio watermark (REST-only).          |

### Audio — Python

| Recipe                                                                                           | Flavor | Description                                                       |
| ------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------- |
| [quickstart](./recipes/audio/python/sdk/quickstart)                                              | SDK    | Synthesize speech to an MP3 file.                                 |
| [quickstart](./recipes/audio/python/native/quickstart)                                           | Native | Same, calling the REST API directly with `requests`.              |
| [streaming](./recipes/audio/python/sdk/streaming)                                                | SDK    | Stream audio to disk as it is generated.                          |
| [streaming](./recipes/audio/python/native/streaming)                                             | Native | Streaming via raw `requests` with `stream=True`.                  |
| [ssml-emotion](./recipes/audio/python/sdk/ssml-emotion)                                          | SDK    | Control emotion, pitch, rate, pauses & emphasis via SSML.         |
| [ssml-emotion](./recipes/audio/python/native/ssml-emotion)                                       | Native | Same SSML controls, via raw `requests`.                           |
| [speech-marks](./recipes/audio/python/sdk/speech-marks)                                          | SDK    | Word-level timestamps → WebVTT captions.                          |
| [speech-marks](./recipes/audio/python/native/speech-marks)                                       | Native | Same captions, via raw `requests`.                                |
| [voice-cloning](./recipes/audio/python/sdk/voice-cloning)                                        | SDK    | Clone a voice from a sample, synthesize, then delete it.          |
| [voice-cloning](./recipes/audio/python/native/voice-cloning)                                     | Native | Same lifecycle, via raw `requests` + multipart.                   |
| [multilingual](./recipes/audio/python/sdk/multilingual)                                          | SDK    | Non-English synthesis with `simba-3.0` + the `language` param.    |
| [multilingual](./recipes/audio/python/native/multilingual)                                       | Native | Same, via raw `requests`.                                         |
| [output-formats](./recipes/audio/python/sdk/output-formats)                                      | SDK    | Pick codec/sample-rate/bitrate — telephony `ulaw_8000`, mp3, pcm. |
| [output-formats](./recipes/audio/python/native/output-formats)                                   | Native | Same, via raw `requests`.                                         |
| [list-models](./recipes/audio/python/sdk/list-models)                                            | SDK    | List TTS models to drive a picker.                                |
| [list-models](./recipes/audio/python/native/list-models)                                         | Native | Same, via raw `requests`.                                         |
| [list-voices](./recipes/audio/python/sdk/list-voices)                                            | SDK    | List available voices, with pagination.                           |
| [list-voices](./recipes/audio/python/native/list-voices)                                         | Native | Same, via raw `requests`.                                         |
| [voice-language-model-support](./recipes/audio/python/sdk/voice-language-model-support)          | SDK    | Which model + language combos a voice supports.                   |
| [voice-language-model-support](./recipes/audio/python/native/voice-language-model-support)       | Native | Same, via raw `requests`.                                         |
| [version-pinning-and-idempotency](./recipes/audio/python/sdk/version-pinning-and-idempotency)    | SDK    | Pin `Speechify-Version`; safe retries with `Idempotency-Key`.     |
| [version-pinning-and-idempotency](./recipes/audio/python/native/version-pinning-and-idempotency) | Native | Same, via raw `requests`.                                         |
| [error-handling](./recipes/audio/python/sdk/error-handling)                                      | SDK    | Typed errors, error codes, `Retry-After`, request ids.            |
| [error-handling](./recipes/audio/python/native/error-handling)                                   | Native | Same, via raw `requests`.                                         |
| [watermark](./recipes/audio/python/native/watermark)                                             | Native | Detect/verify the Speechify audio watermark (REST-only).          |

### Audio — Bash (curl)

| Recipe                                                                                         | Flavor | Description                                                       |
| ---------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| [quickstart](./recipes/audio/bash/native/quickstart)                                           | Native | Synthesize speech to an MP3 file with `curl` + `jq`.              |
| [streaming](./recipes/audio/bash/native/streaming)                                             | Native | Stream raw audio bytes straight to disk with `curl --no-buffer`.  |
| [ssml-emotion](./recipes/audio/bash/native/ssml-emotion)                                       | Native | SSML emotion/prosody via a single `curl` call (`jq` builds JSON). |
| [speech-marks](./recipes/audio/bash/native/speech-marks)                                       | Native | Speech marks → WebVTT captions, formatted entirely in `jq`.       |
| [voice-cloning](./recipes/audio/bash/native/voice-cloning)                                     | Native | Multipart clone → speech → delete, with an `EXIT` trap cleanup.   |
| [multilingual](./recipes/audio/bash/native/multilingual)                                       | Native | Non-English synthesis with `simba-3.0` + the `language` param.    |
| [output-formats](./recipes/audio/bash/native/output-formats)                                   | Native | Pick codec/sample-rate/bitrate — telephony `ulaw_8000`, mp3, pcm. |
| [list-models](./recipes/audio/bash/native/list-models)                                         | Native | List TTS models to drive a picker.                                |
| [list-voices](./recipes/audio/bash/native/list-voices)                                         | Native | List available voices, with pagination.                           |
| [voice-language-model-support](./recipes/audio/bash/native/voice-language-model-support)       | Native | Which model + language combos a voice supports.                   |
| [version-pinning-and-idempotency](./recipes/audio/bash/native/version-pinning-and-idempotency) | Native | Pin `Speechify-Version`; safe retries with `Idempotency-Key`.     |
| [error-handling](./recipes/audio/bash/native/error-handling)                                   | Native | Error envelope, error codes, `Retry-After`, request ids.          |
| [watermark](./recipes/audio/bash/native/watermark)                                             | Native | Detect/verify the Speechify audio watermark.                      |

## Repository layout

```
recipes/audio/<language>/{sdk,native}/<recipe>/
```

- `audio/` — Text-to-Speech today; the audio platform will expand.
- `<language>` — `typescript`, `python`, and `bash` (curl-only, native flavor).
- `sdk` — uses the official Speechify SDK for that language.
- `native` — calls the REST API directly (no SDK).

This is a **pnpm workspace** monorepo. TypeScript/JavaScript recipes are workspace members
(shared dependency versions via the pnpm `catalog:`); Python recipes use **uv** and are
managed per-recipe.

| Path         | What                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| `recipes/`   | The recipes themselves.                                                   |
| `templates/` | Copy-to-start scaffolds for new recipes.                                  |
| `agents/`    | Modular maintenance/usage instructions, loaded on demand via `AGENTS.md`. |
| `AGENTS.md`  | Entry point for AI agents and contributors.                               |

## Tooling

- **Node 20+** and **pnpm** for JavaScript/TypeScript recipes.
- **Python 3.10+** and **[uv](https://docs.astral.sh/uv/)** for Python recipes.
- `pnpm install` at the root sets up all JS recipes.
- `pnpm format` formats the repo with Prettier.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and
[`agents/creating-a-recipe.md`](./agents/creating-a-recipe.md). New recipes start from
`templates/`.

## License

[MIT](./LICENSE)
