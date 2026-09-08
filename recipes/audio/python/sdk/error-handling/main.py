import os

from dotenv import load_dotenv
from speechify import Speechify
from speechify.core.api_error import ApiError  # base error: has .status_code and .body


# Map an error CODE (not the HTTP status) to friendly, actionable guidance. Several
# distinct outcomes share a status — 402 is balance vs spend-cap, 404 is unknown voice
# vs unknown model — so the code is what you branch on.
def guidance_for(code: str | None) -> str:
    return {
        "voice_not_found": "Unknown voice_id. List voices with client.voices.list().",
        "not_found": "Unknown model. List models with client.models.list().",
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

    client = Speechify(token=token)

    try:
        # Deliberately trigger a 404 voice_not_found by passing a bogus voice_id.
        client.audio.speech(
            input="This request is designed to fail so we can handle the error.",
            voice_id="this-voice-does-not-exist",
            audio_format="mp3",
            model="simba-3.2",
        )
        print("Unexpected success — the voice_id above should not exist.")
    except ApiError as err:
        # status_code = HTTP status; the machine-readable code lives in the body envelope
        # {"error": {"code", "message"}, "request_id"}. Always log request_id when reporting.
        body = err.body if isinstance(err.body, dict) else {}
        error = body.get("error", {}) if isinstance(body, dict) else {}
        code = error.get("code")
        message = error.get("message")
        request_id = body.get("request_id")

        print(f"Speechify API error (HTTP {err.status_code}, code {code or 'unknown'})")
        print(f"  {message or 'no message'}")
        print(f"  {guidance_for(code)}")
        print(f"  request_id: {request_id or 'unknown'}")

        # Exit non-zero so callers/CI see this as a failure.
        raise SystemExit(1)


if __name__ == "__main__":
    main()
