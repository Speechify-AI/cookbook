# Text-to-Speech: version pinning & idempotency (TypeScript, native REST)

The native counterpart to the [SDK recipe](../../sdk/version-pinning-and-idempotency) —
API version pinning and idempotency as plain HTTP headers over raw `fetch`.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- Node 20+

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
pnpm install
```

## Run

```bash
pnpm start
```

## What it does

- **Version pinning** — send `Speechify-Version: 2026-09-13` (`YYYY-MM-DD`) on the request.
  Server resolution order: request header → workspace default → oldest supported. A dated
  version is how you opt into breaking wire changes.
- **Idempotency** — send `Idempotency-Key: <uuid>` on the side-effect POST. Generate the UUID
  once (`crypto.randomUUID()`) and reuse it for retries. Replay within 24h returns the first
  response with `Idempotent-Replayed: true`; same key + different body → `409 idempotency_conflict`.
- Calls `POST /v1/voices/consent-challenges` twice with the same key, reads the
  `Idempotent-Replayed` response header off the second call, and prints both challenge `id`s —
  they match, proving the replay.

> consent-challenge creation is rate-limited (a few dozen/hour per workspace) — this recipe
> calls it only twice. On `429` honour `Retry-After`.
