import base64
import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the multilingual recipe: GET /v1/voices to discover
# a voice, then POST /v1/audio/speech — with `requests` instead of the SDK.

# Target locale is overridable; default is French. simba-3.0 supports
# en, de-DE, es-ES, es-MX, fr-FR, it-IT, pt-BR — simba-3.2 is English-only
# (a non-English voice on it returns 400), so multilingual work uses simba-3.0.
MODEL = "simba-3.0"

# Keep the sample French; in a real app you'd match the text to LOCALE.
TEXT = "Bonjour ! Ceci est l'API de synthèse vocale de Speechify."


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    locale = os.environ.get("LOCALE", "fr-FR")
    headers = {"Authorization": f"Bearer {token}"}

    # Discover a voice at runtime instead of hardcoding a non-English id we can't
    # verify: list voices filtered to the locale + model and take the first match.
    list_resp = requests.get(
        "https://api.speechify.ai/v1/voices",
        headers=headers,
        params={"locale": locale, "model": MODEL},
        timeout=60,
    )
    list_resp.raise_for_status()
    voices = list_resp.json()["voices"]

    if not voices:
        print(f'No {MODEL} voice found for locale "{locale}". Try another LOCALE.')
        return  # exit 0 — nothing to synthesize
    voice_id = voices[0]["id"]

    # `language` (BCP-47) selects the training; omit it and the voice's own locale
    # decides. We pass it explicitly to lock the output language to `locale`.
    resp = requests.post(
        "https://api.speechify.ai/v1/audio/speech",
        headers={**headers, "Content-Type": "application/json"},
        json={
            "input": TEXT,
            "voice_id": voice_id,
            "model": MODEL,
            "language": locale,
            "audio_format": "mp3",
        },
        timeout=60,
    )
    resp.raise_for_status()

    # Response JSON (snake_case on the wire): audio_data (base64), audio_format,
    # billable_characters_count, speech_marks.
    data = resp.json()
    with open("output.mp3", "wb") as f:
        f.write(base64.b64decode(data["audio_data"]))
    print(f"Wrote output.mp3 ({locale}, voice {voice_id}, {data['billable_characters_count']} billable characters)")


if __name__ == "__main__":
    main()
