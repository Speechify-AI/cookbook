import os
from pathlib import Path
from tempfile import NamedTemporaryFile

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
            "voice_id": "geffen_32",
            "model": "simba-3.2",
        },
        stream=True,
        timeout=60,
    ) as resp:
        resp.raise_for_status()

        out_file = Path("output.mp3")
        temp = NamedTemporaryFile(dir=out_file.parent, delete=False)
        try:
            with temp:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        temp.write(chunk)
            os.replace(temp.name, out_file)
        finally:
            Path(temp.name).unlink(missing_ok=True)
        print(f"Streamed audio to {out_file}")


if __name__ == "__main__":
    main()
