# Text-to-Speech: error handling (TypeScript, native REST)

The native counterpart to the [SDK recipe](../../sdk/error-handling) — handle the raw
REST error envelope over `fetch`. Self-demonstrating: it deliberately calls
`POST /v1/audio/speech` with a bogus `voice_id` to trigger a real `404 voice_not_found`.

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

- Checks `res.ok` / `res.status`; on failure parses the error envelope
  `{ error: { code, message }, request_id }`.
- Logs the `Speechify-Request-Id` response header (a.k.a. `request_id` in the body) on
  every error — quote it when reporting an issue.
- Branches on the error **code**, not the HTTP status: several distinct outcomes share a
  status (402 and 404 each map to two codes), so the code is what you switch on.
- On `429`, reads the `Retry-After` response header and waits that many seconds before retrying.

## Error codes to branch on

| HTTP | code                       | Meaning                                                    | What to do                                |
| ---- | -------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| 404  | `voice_not_found`          | Unknown `voice_id`                                         | List voices with `GET /v1/voices`         |
| 404  | `not_found`                | Unknown model                                              | List models with `GET /v1/audio/models`   |
| 400  | `content_policy_violation` | Text screened before synthesis. Persistent, **not billed** | Do **not** retry the same text — edit it  |
| 429  | `rate_limited`             | Too many requests/second                                   | Back off; honour the `Retry-After` header |
| 429  | `concurrency_limited`      | Too many in-flight requests                                | Reduce concurrency; honour `Retry-After`  |
| 402  | `payment_required`         | Workspace balance exhausted                                | Top up the workspace                      |
| 402  | `spend_cap_exceeded`       | This key hit its monthly USD cap                           | Raise the cap or use another key          |

- On `429`, the error envelope also carries a `docs_url`. Always wait `Retry-After` before retrying.
