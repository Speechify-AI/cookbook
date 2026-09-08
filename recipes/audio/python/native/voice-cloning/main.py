import base64
import json
import os
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv

# The "native" counterpart to the voice-cloning recipe: same lifecycle (create →
# use → delete), but calling the REST API directly with `requests` + multipart
# form-data instead of the speechify-api SDK.

BASE = "https://api.speechify.ai"
# The verified-consent flow ships on this API version — pin it explicitly.
VERSION = "2026-09-13"

# Cloning requires VERIFIED consent: the speaker records themselves reading a
# phrase the API returns, and that recording is kept as the consent record. It
# must be the SAME person as the voice sample, so this recipe is
# bring-your-own-audio — there is no sample that ships with valid consent.
HERE = os.path.dirname(__file__)
CONSENT_FULL_NAME = os.environ.get("CONSENT_FULL_NAME", "Jane Doe")
SAMPLE_PATH = os.environ.get("SAMPLE_PATH", os.path.join(HERE, "sample.wav"))
CONSENT_RECORDING_PATH = os.environ.get("CONSENT_RECORDING_PATH", os.path.join(HERE, "consent.wav"))
# The challenge is single-use and its phrase is dynamic, so we cache it between
# runs: run once to get the phrase, record it, run again to submit.
CHALLENGE_CACHE = os.path.join(HERE, ".consent-challenge.json")


def load_challenge():
    if not os.path.exists(CHALLENGE_CACHE):
        return None
    with open(CHALLENGE_CACHE) as f:
        c = json.load(f)
    # Python 3.10's fromisoformat doesn't accept a trailing "Z".
    if datetime.fromisoformat(c["expires_at"].replace("Z", "+00:00")) <= datetime.now(timezone.utc):
        return None  # expired -> make a fresh one
    return c


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    auth = {"Authorization": f"Bearer {token}", "Speechify-Version": VERSION}

    # 1. Get (or reuse) a consent challenge. Its `phrase` is what the speaker must
    #    read aloud; `id` ties the recording to this consent on the create.
    challenge = load_challenge()
    if challenge is None:
        resp = requests.post(
            f"{BASE}/v1/voices/consent-challenges",
            headers={**auth, "Content-Type": "application/json"},
            json={"full_name": CONSENT_FULL_NAME},
            timeout=30,
        )
        resp.raise_for_status()
        challenge = resp.json()
        with open(CHALLENGE_CACHE, "w") as f:
            json.dump(challenge, f, indent=2)

    # 2. Make sure we have both recordings before spending the (single-use) challenge.
    missing = []
    if not os.path.exists(SAMPLE_PATH):
        missing.append(f"  sample:  {SAMPLE_PATH}  ({CONSENT_FULL_NAME}'s voice, 10-30s of clean speech)")
    if not os.path.exists(CONSENT_RECORDING_PATH):
        missing.append(f"  consent: {CONSENT_RECORDING_PATH}  (the SAME person reading the phrase below)")
    if missing:
        raise SystemExit(
            f"\nConsent required. Have {CONSENT_FULL_NAME} record themselves reading this phrase, "
            "exactly as written:\n\n"
            f'  "{challenge["phrase"]}"\n\n'
            "Then provide these files and re-run (paths override via SAMPLE_PATH / CONSENT_RECORDING_PATH):\n"
            + "\n".join(missing)
            + f"\n\nChallenge expires {challenge['expires_at']}.\n"
        )

    # 3. Clone the voice. POST /v1/voices is multipart/form-data — pass `files=` to
    #    requests and it sets the Content-Type boundary automatically.
    with open(SAMPLE_PATH, "rb") as sample, open(CONSENT_RECORDING_PATH, "rb") as consent:
        create_resp = requests.post(
            f"{BASE}/v1/voices",
            headers=auth,
            data={
                "name": "cookbook-cloned-voice",
                "gender": "male",
                "consent_challenge_id": challenge["id"],
            },
            files={
                "sample": (os.path.basename(SAMPLE_PATH), sample),
                "consent_recording": (os.path.basename(CONSENT_RECORDING_PATH), consent),
            },
            timeout=120,
        )

    if create_resp.status_code == 402:
        raise SystemExit(
            "\nVoice cloning isn't included in your current Speechify plan.\n"
            "Upgrade to a plan that includes voice cloning: https://speechify.ai/pricing\n"
        )
    create_resp.raise_for_status()
    os.remove(CHALLENGE_CACHE)  # challenge is spent
    voice = create_resp.json()
    print(f"Cloned voice created: {voice['id']} ({voice['display_name']}, type={voice['type']})")

    try:
        # 4. Synthesize speech using the cloned voice — pass its id as voice_id.
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
        # 5. Clean up so cloned voices don't accumulate on your account.
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
