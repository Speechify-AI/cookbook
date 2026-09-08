# Text-to-Speech: version pinning & idempotency (Python, SDK)

Two cross-cutting API concepts in one recipe: pin the dated API version your client
speaks, and make a side-effect POST safe to retry with an idempotency key.

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

## What it does

- **Version pinning** — `Speechify(token=token, version="2026-09-13")` fixes the dated wire
  contract. Server resolution order: request header → workspace default → oldest supported.
  SDKs auto-send their build-date version; pass `version` to override it. A dated version
  (`YYYY-MM-DD`) is how you opt into breaking wire changes.
- **Idempotency** — `client.voices.consent_challenges.create(idempotency_key=key, ...)`.
  Generate the UUID once (`uuid.uuid4()`) and reuse it for retries of the same request. Replay
  within 24h returns the first response (server sets `Idempotent-Replayed: true`); same key +
  different body → `409 idempotency_conflict`.
- Calls `POST /v1/voices/consent-challenges` twice with the same key and prints both challenge
  `id`s — the second matches the first, proving the replay.

> consent-challenge creation is rate-limited (a few dozen/hour per workspace) — this recipe
> calls it only twice. On `429` honour `Retry-After`.
