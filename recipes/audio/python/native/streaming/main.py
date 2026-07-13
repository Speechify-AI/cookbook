import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the streaming recipe: same result, but calling the
# REST API directly with `requests` instead of the speechify-api SDK.


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    # POST /v1/audio/stream returns raw audio bytes (HTTP chunked) instead of
    # JSON + base64. The `Accept` header selects the container/codec:
    #   audio/mpeg | audio/ogg | audio/aac | audio/pcm (returns audio/L16, 24 kHz mono).
    with requests.post(
        "https://api.speechify.ai/v1/audio/stream",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        json={
            "input": (
                "Streaming lets you start playing audio before the whole clip is ready. "
                "This sentence is being synthesized and written to disk chunk by chunk."
            ),
            "voice_id": "george",
            "model": "simba-english",
        },
        stream=True,
        timeout=60,
    ) as resp:
        resp.raise_for_status()

        out_file = "output.mp3"
        with open(out_file, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print(f"Streamed audio to {out_file}")


if __name__ == "__main__":
    main()
