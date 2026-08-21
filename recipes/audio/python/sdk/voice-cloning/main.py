import base64
import json
import os

from dotenv import load_dotenv
from speechify import Speechify
from speechify.core.api_error import ApiError

# Bundled sample: ~26s of NASA ISS spacewalk audio (public domain).
SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "spacewalk.wav")


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    # 1. Clone a voice from an audio sample (10-30s of clean speech works well).
    #    `consent` is REQUIRED: a JSON string attesting you have the speaker's
    #    permission to clone their voice. Use the real consenting person's details.
    try:
        with open(SAMPLE_PATH, "rb") as sample:
            voice = client.voices.create(
                name="cookbook-cloned-voice",
                gender="male",
                sample=sample,
                consent=json.dumps({"fullName": "Jane Doe", "email": "jane@example.com"}),
            )
    except ApiError as err:
        # Voice cloning is gated by plan. A 402 means it isn't included in yours.
        if err.status_code == 402:
            raise SystemExit(
                "\nVoice cloning isn't included in your current Speechify plan.\n"
                "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n"
            )
        raise
    print(f"Cloned voice created: {voice.id} ({voice.display_name}, type={voice.type})")

    try:
        # 2. Synthesize speech using the cloned voice — pass its id as voice_id.
        speech = client.audio.speech(
            input="Hello from a voice cloned with the Speechify API.",
            voice_id=voice.id,
            audio_format="mp3",
            model="simba-3.0",
        )
        with open("output.mp3", "wb") as f:
            f.write(base64.b64decode(speech.audio_data))
        print("Wrote output.mp3")
    finally:
        # 3. Clean up so cloned voices don't accumulate on your account.
        #    Remove this to keep the voice and reuse it later via voice.id.
        client.voices.delete(voice.id)
        print(f"Deleted cloned voice {voice.id}")


if __name__ == "__main__":
    main()
