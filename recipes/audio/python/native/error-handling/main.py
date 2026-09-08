import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the error-handling recipe: handle the raw REST error
# envelope from POST /v1/audio/speech instead of catching the SDK's ApiError.


# Map an error CODE (not the HTTP status) to friendly, actionable guidance. Several
# distinct outcomes share a status — 402 is balance vs spend-cap, 404 is unknown voice
# vs unknown model — so the code is what you branch on.
def guidance_for(code: str | None) -> str:
    return {
        "voice_not_found": "Unknown voice_id. List voices with GET /v1/voices.",
        "not_found": "Unknown model. List models with GET /v1/audio/models.",
        # Persistent: text screened before synthesis, not billed. Do not retry same text.
        "content_policy_violation": "Text failed content screening. Do not retry the same text; edit it.",
        "rate_limited": "Too many requests per second. Back off and honour the Retry-After header.",
        "concurrency_limited": "Too many in-flight requests. Reduce concurrency; honour Retry-After.",
        "payment_required": "Workspace balance exhausted. Top up the workspace.",
        "spend_cap_exceeded": "This API key hit its monthly USD spend cap. Raise the cap or use another key.",
    }.get(code or "", "Unhandled error code — see message above.")


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    resp = requests.post(
        "https://api.speechify.ai/v1/audio/speech",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            # Deliberately bogus voice_id → 404 voice_not_found, so we can handle it.
            "input": "This request is designed to fail so we can handle the error.",
            "voice_id": "this-voice-does-not-exist",
            "audio_format": "mp3",
            "model": "simba-3.2",
        },
        timeout=60,
    )

    if not resp.ok:
        # Prefer request_id from the header; the body carries it too. Log it on every error.
        request_id = resp.headers.get("Speechify-Request-Id")
        envelope = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
        error = envelope.get("error", {}) if isinstance(envelope, dict) else {}
        code = error.get("code")
        message = error.get("message")

        print(f"Speechify API error (HTTP {resp.status_code}, code {code or 'unknown'})")
        print(f"  {message or 'no message'}")
        print(f"  {guidance_for(code)}")

        # On 429, always wait the Retry-After header (seconds) before retrying.
        if resp.status_code == 429:
            print(f"  Retry-After: {resp.headers.get('Retry-After', 'unknown')} seconds")

        print(f"  request_id: {request_id or envelope.get('request_id') or 'unknown'}")
        raise SystemExit(1)

    print("Unexpected success — the voice_id above should not exist.")


if __name__ == "__main__":
    main()
