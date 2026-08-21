import base64
import json
import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the voice-cloning recipe: same lifecycle (create →
# use → delete), but calling the REST API directly with `requests` + multipart
# form-data instead of the speechify-api SDK.

BASE = "https://api.speechify.ai"

# Bundled sample: ~26s of NASA ISS spacewalk audio (public domain).
SAMPLE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "spacewalk.wav")


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    auth = {"Authorization": f"Bearer {token}"}

    # 1. Clone a voice from an audio sample (10-30s of clean speech works well).
    #    POST /v1/voices is multipart/form-data — pass `files=` to requests and it
    #    sets the Content-Type boundary automatically. `consent` is REQUIRED: a JSON
    #    string attesting you have the speaker's permission to clone their voice.
    with open(SAMPLE_PATH, "rb") as sample:
        create_resp = requests.post(
            f"{BASE}/v1/voices",
            headers=auth,
            data={
                "name": "cookbook-cloned-voice",
                "gender": "male",
                "consent": json.dumps({"fullName": "Jane Doe", "email": "jane@example.com"}),
            },
            files={"sample": ("spacewalk.wav", sample, "audio/wav")},
            timeout=120,
        )

    if create_resp.status_code == 402:
        raise SystemExit(
            "\nVoice cloning isn't included in your current Speechify plan.\n"
            "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n"
        )
    create_resp.raise_for_status()
    voice = create_resp.json()
    print(f"Cloned voice created: {voice['id']} ({voice['display_name']}, type={voice['type']})")

    try:
        # 2. Synthesize speech using the cloned voice — pass its id as voice_id.
        speech_resp = requests.post(
            f"{BASE}/v1/audio/speech",
            headers={**auth, "Content-Type": "application/json"},
            json={
                "input": "Hello from a voice cloned with the Speechify API.",
                "voice_id": voice["id"],
                "audio_format": "mp3",
                "model": "simba-3.0",
            },
            timeout=60,
        )
        speech_resp.raise_for_status()
        speech = speech_resp.json()
        with open("output.mp3", "wb") as f:
            f.write(base64.b64decode(speech["audio_data"]))
        print("Wrote output.mp3")
    finally:
        # 3. Clean up so cloned voices don't accumulate on your account.
        #    Remove this to keep the voice and reuse it later via voice.id.
        del_resp = requests.delete(f"{BASE}/v1/voices/{voice['id']}", headers=auth, timeout=30)
        if del_resp.ok:
            print(f"Deleted cloned voice {voice['id']}")
        else:
            print(
                f"DELETE /v1/voices/{voice['id']} → {del_resp.status_code} {del_resp.reason}: "
                f"{del_resp.text}"
            )


if __name__ == "__main__":
    main()
