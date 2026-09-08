# Text-to-Speech: voice language + model support (Bash, native REST)

`GET /v1/voices` as a self-contained shell script using `curl` + `jq`. Answers which
model + language combinations a voice supports, and which voices support model X in
locale Y.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x voice-language-model-support.sh
```

## Run

```bash
./voice-language-model-support.sh
```

## What it does

- `GET https://api.speechify.ai/v1/voices?locale=en&model=simba-3.2` with
  `Authorization: Bearer <key>`. `jq` prints each voice's `id`, `display_name`, `locale`,
  and its full model→locales map from `.models[]` (each entry has `name` and
  `languages[].locale`), e.g. `simba-3.2: en-US, en-GB`.
- `GET /v1/voices/{voice_id}` → one voice's supported models + languages. The HTTP status
  is captured so a `404 voice_not_found` is skipped and the recipe still completes.

> A voice's own `.models[]` array is the authority on what your workspace may actually
> synthesize with it — it reflects clones and per-workspace enablement. Drive pickers off
> it rather than assuming a model works. The `model` query filter returns the voices that
> advertise that model.
