import os

from dotenv import load_dotenv
from speechify import Speechify


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    # `audio.stream` yields audio chunks (bytes) as they are synthesized — useful for
    # long inputs and low time-to-first-byte playback.
    stream = client.audio.stream(
        accept="audio/mpeg",
        input=(
            "Streaming lets you start playing audio before the whole clip is ready. "
            "This sentence is being synthesized and written to disk chunk by chunk."
        ),
        voice_id="george",
        model="simba-english",
    )

    out_file = "output.mp3"
    with open(out_file, "wb") as f:
        for chunk in stream:
            f.write(chunk)
    print(f"Streamed audio to {out_file}")


if __name__ == "__main__":
    main()
