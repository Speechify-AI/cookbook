# Text-to-Speech: error handling (Bash, native REST)

Handle Speechify API errors correctly with `curl` + `jq`. Self-demonstrating: it
deliberately calls `POST /v1/audio/speech` with a bogus `voice_id` to trigger a real
`404 voice_not_found`, then handles the error envelope cleanly.

## Prerequisites

- A Speechify API key — https://platform.speechify.ai/api-keys
- `bash`, `curl`, `jq`

## Setup

```bash
cp .env.example .env   # then paste your SPEECHIFY_API_KEY
chmod +x error-handling.sh
```

## Run

```bash
./error-handling.sh
```

You'll see a friendly error report on stderr and a non-zero exit code (the failure is intentional).

## What it does

- Captures the HTTP status (`-w '%{http_code}'`) and response headers (`-D`) — no
  `--fail-with-body`, because we want to inspect the error body ourselves.
- On status `>= 400`, parses the error envelope `{ error: { code, message }, request_id }`
  with `jq`.
- Logs the `Speechify-Request-Id` response header (a.k.a. `request_id` in the body) on
  every error — quote it when reporting an issue.
- Branches on the error **code**, not the HTTP status: several distinct outcomes share a
  status (402 and 404 each map to two codes), so the code is what you `case` on.
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
