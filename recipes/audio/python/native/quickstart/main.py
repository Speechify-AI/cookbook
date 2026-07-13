import base64
import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the quickstart recipe: same result, but calling the
# REST API directly with `requests` instead of the speechify-api SDK. Useful when you
# can't (or don't want to) add the SDK, or to see the raw wire protocol.


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
            "input": "Hello! This is the Speechify text-to-speech REST API.",
            "voice_id": "george",
            "audio_format": "mp3",
            "model": "simba-english",
        },
        timeout=60,
    )
    resp.raise_for_status()

    # Response JSON (snake_case on the wire): audio_data (base64), audio_format,
    # billable_characters_count, speech_marks.
    data = resp.json()
    with open("output.mp3", "wb") as f:
        f.write(base64.b64decode(data["audio_data"]))
    print(f"Wrote output.mp3 ({data['billable_characters_count']} billable characters)")


if __name__ == "__main__":
    main()
