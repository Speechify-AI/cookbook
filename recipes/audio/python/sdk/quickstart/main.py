import base64
import os

from dotenv import load_dotenv
from speechify import Speechify


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    response = client.audio.speech(
        input="Hello! This is the Speechify text-to-speech API.",
        voice_id="george",
        audio_format="mp3",
        model="simba-english",
    )

    # The SDK returns the audio as a base64-encoded string.
    out_file = "output.mp3"
    with open(out_file, "wb") as f:
        f.write(base64.b64decode(response.audio_data))
    print(f"Wrote {out_file}")


if __name__ == "__main__":
    main()
