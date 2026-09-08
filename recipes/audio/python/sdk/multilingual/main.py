import base64
import os

from dotenv import load_dotenv
from speechify import Speechify

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

    client = Speechify(token=token)

    # Discover a voice at runtime instead of hardcoding a non-English id we can't
    # verify: list voices filtered to the locale + model and take the first match.
    voice_id = None
    for voice in client.voices.list(locale=locale, model=MODEL):
        voice_id = voice.id  # first match wins
        break

    if not voice_id:
        print(f'No {MODEL} voice found for locale "{locale}". Try another LOCALE.')
        return  # exit 0 — nothing to synthesize

    # `language` (BCP-47) selects the training; omit it and the voice's own locale
    # decides. We pass it explicitly to lock the output language to `locale`.
    response = client.audio.speech(
        input=TEXT,
        voice_id=voice_id,
        model=MODEL,
        language=locale,
        audio_format="mp3",
    )

    # The SDK returns the audio as a base64-encoded string.
    with open("output.mp3", "wb") as f:
        f.write(base64.b64decode(response.audio_data))
    print(f"Wrote output.mp3 ({locale}, voice {voice_id})")


if __name__ == "__main__":
    main()
