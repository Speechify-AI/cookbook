# Text-to-Speech: error handling (TypeScript, SDK)

Handle Speechify API errors correctly with the `@speechify/api` SDK. This recipe is
self-demonstrating: it deliberately calls `client.audio.speech(...)` with a bogus
`voice_id` to trigger a real `404 voice_not_found`, then handles it cleanly.

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

You'll see a friendly error report and a non-zero exit code (the failure is intentional).

## What it does

- Wraps the call in `try/catch` and catches `SpeechifyError` (imported from `@speechify/api`)
  specifically, so real bugs still surface.
- Reads `err.statusCode` (HTTP status) and the machine-readable code at
  `err.body?.error?.code`; the message is at `err.body?.error?.message`.
- Always logs `err.body?.request_id` — quote it when reporting an issue.
- Branches on the error **code**, not the HTTP status: several distinct outcomes share a
  status (402 and 404 each map to two different codes), so the code is what you switch on.

## Error codes to branch on

The error envelope is always `{ error: { code, message }, request_id }`.

| HTTP | code                       | Meaning                                                    | What to do                                |
| ---- | -------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| 404  | `voice_not_found`          | Unknown `voice_id`                                         | List voices with `client.voices.list()`   |
| 404  | `not_found`                | Unknown model                                              | List models with `client.models.list()`   |
| 400  | `content_policy_violation` | Text screened before synthesis. Persistent, **not billed** | Do **not** retry the same text — edit it  |
| 429  | `rate_limited`             | Too many requests/second                                   | Back off; honour the `Retry-After` header |
| 429  | `concurrency_limited`      | Too many in-flight requests                                | Reduce concurrency; honour `Retry-After`  |
| 402  | `payment_required`         | Workspace balance exhausted                                | Top up the workspace                      |
| 402  | `spend_cap_exceeded`       | This key hit its monthly USD cap                           | Raise the cap or use another key          |

- On `429`, the SDK surfaces the `Retry-After` header; the error envelope also carries a
  `docs_url`. Always wait `Retry-After` before retrying.
- Log the `Speechify-Request-Id` response header (a.k.a. `request_id` in the body) on
  every error report.
