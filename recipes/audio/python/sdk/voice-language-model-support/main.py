import os

from dotenv import load_dotenv
from speechify import Speechify
from speechify.core.api_error import ApiError

# Which model + language combinations does a voice support? Two questions:
#  1. Which voices advertise model X in locale Y? (filtered list)
#  2. What does one specific voice support? (single lookup)
LOCALE = "en"
MODEL = "simba-3.2"
VOICE_ID = "geffen_32"


def format_support(models) -> str:
    # A voice's own models[] is the authority on what your workspace can synthesize
    # with it (clones + enablement). Render it so a picker is driven by the voice.
    return "  |  ".join(
        f"{m.name}: {', '.join(lang.locale for lang in m.languages)}" for m in models
    )


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    # Part 1 — voices advertising `model` in `locale`. The `model` filter returns voices
    # claiming that model; each voice's models[] still holds the full truth.
    print(f'Voices for locale="{LOCALE}", model="{MODEL}":\n')
    for voice in client.voices.list(locale=LOCALE, model=MODEL):
        print(f"{voice.id}  {voice.display_name}  ({voice.locale})")
        print(f"  {format_support(voice.models)}\n")

    # Part 2 — one voice by id. Handle a retired/unknown id gracefully so the recipe
    # still completes.
    print(f"Single voice lookup: {VOICE_ID}")
    try:
        voice = client.voices.get(voice_id=VOICE_ID)
        print(f"{voice.id}  {voice.display_name}  ({voice.locale})")
        print(f"  {format_support(voice.models)}")
    except ApiError as err:
        # 404 voice_not_found → the id is gone from this workspace; keep going.
        if err.status_code == 404:
            print(f"  {VOICE_ID} not found (list voices with client.voices.list).")
        else:
            raise


if __name__ == "__main__":
    main()
