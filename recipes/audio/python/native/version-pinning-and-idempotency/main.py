import os
import uuid

import requests
from dotenv import load_dotenv

# The "native" counterpart: POST /v1/voices/consent-challenges over `requests`,
# showing API version pinning and idempotency as plain HTTP headers.

URL = "https://api.speechify.ai/v1/voices/consent-challenges"


def mint(token: str, key: str) -> requests.Response:
    # `Speechify-Version` pins the dated wire contract (resolution: request header →
    # workspace default → oldest supported). `Idempotency-Key` makes this side-effect
    # POST safe to retry — same key within 24h replays the first response.
    return requests.post(
        URL,
        headers={
            "Authorization": f"Bearer {token}",
            "Speechify-Version": "2026-09-13",
            "Idempotency-Key": key,
        },
        json={"full_name": "Jane Doe"},
        timeout=30,
    )


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    # One key, reused across both calls (retries of the SAME logical request).
    key = str(uuid.uuid4())

    # consent-challenge creation is rate-limited (a few dozen/hour per workspace),
    # so call it exactly twice. On 429 honour `Retry-After`.
    resp1 = mint(token, key)
    resp1.raise_for_status()
    first = resp1.json()
    print(f"1st challenge id: {first['id']}")

    resp2 = mint(token, key)
    resp2.raise_for_status()
    second = resp2.json()
    print(f"2nd challenge id: {second['id']}")

    # The server flags a replay with this response header.
    print(f"Idempotent-Replayed: {resp2.headers.get('Idempotent-Replayed')}")
    print("✅ ids match — replay proven" if first["id"] == second["id"] else "❌ ids differ")


if __name__ == "__main__":
    main()
