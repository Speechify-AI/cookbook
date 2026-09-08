import os
import uuid

from dotenv import load_dotenv
from speechify import Speechify


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    # API VERSION PINNING. `version` fixes the dated wire contract this client speaks.
    # Server resolution order: request header → workspace default → oldest supported.
    # The SDK auto-sends its build-date version; pass `version` to override and opt into
    # a specific dated contract (YYYY-MM-DD). Breaking wire changes ship under new dates.
    client = Speechify(token=token, version="2026-09-13")

    # IDEMPOTENCY. Generate the key ONCE and reuse it across retries of the SAME logical
    # request. Replay within 24h returns the first response (server sets
    # `Idempotent-Replayed: true`). Same key + different body → 409 idempotency_conflict.
    key = str(uuid.uuid4())

    # consent-challenge creation is rate-limited (a few dozen/hour per workspace),
    # so this recipe calls it exactly twice. On 429 honour `Retry-After`.
    first = client.voices.consent_challenges.create(idempotency_key=key, full_name="Jane Doe")
    print(f"1st challenge id: {first.id}")
    print(f"  phrase: {first.phrase}")

    # Same key, same body → server replays the first result instead of minting a new one.
    second = client.voices.consent_challenges.create(idempotency_key=key, full_name="Jane Doe")
    print(f"2nd challenge id: {second.id}")

    # Self-proving: replayed call returns the SAME challenge id.
    print("✅ ids match — replay proven" if first.id == second.id else "❌ ids differ")


if __name__ == "__main__":
    main()
