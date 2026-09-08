# Text-to-Speech: version pinning & idempotency (Bash, native REST)

API version pinning and idempotency as plain HTTP headers, using `curl` + `jq`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`, `uuidgen`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x version-pinning-and-idempotency.sh
```

## Run

```bash
./version-pinning-and-idempotency.sh
```

## What it does

- **Version pinning** — sends `Speechify-Version: 2026-09-13` (`YYYY-MM-DD`) on the request.
  Server resolution order: request header → workspace default → oldest supported. A dated
  version is how you opt into breaking wire changes.
- **Idempotency** — sends `Idempotency-Key: $(uuidgen)` on the side-effect POST, generated once
  and reused for both calls. Replay within 24h returns the first response with
  `Idempotent-Replayed: true`; same key + different body → `409 idempotency_conflict`.
- Calls `POST /v1/voices/consent-challenges` twice with the same key. `curl -D -` dumps the
  response headers, so the script reads the `Idempotent-Replayed` header off the second call and
  compares both challenge `id`s — they match, proving the replay.

> consent-challenge creation is rate-limited (a few dozen/hour per workspace) — this recipe
> calls it only twice. On `429` honour `Retry-After`.
