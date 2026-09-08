import os

import requests
from dotenv import load_dotenv

# The "native" counterpart: GET /v1/voices over `requests` instead of the speechify-api
# SDK. Answers which model + language combinations a voice supports.
LOCALE = "en"
MODEL = "simba-3.2"
VOICE_ID = "geffen_32"


def format_support(models) -> str:
    # A voice's own models[] is the authority on what your workspace can synthesize
    # with it (clones + enablement). Render it so a picker is driven by the voice.
    return "  |  ".join(
        f"{m['name']}: {', '.join(lang['locale'] for lang in m['languages'])}"
        for m in models
    )


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    headers = {"Authorization": f"Bearer {token}"}

    # Part 1 — voices advertising `model` in `locale`. The `model` query filter returns
    # voices claiming that model; each voice's models[] still holds the full truth.
    print(f'Voices for locale="{LOCALE}", model="{MODEL}":\n')
    resp = requests.get(
        "https://api.speechify.ai/v1/voices",
        headers=headers,
        params={"locale": LOCALE, "model": MODEL},
        timeout=30,
    )
    resp.raise_for_status()
    for voice in resp.json()["voices"]:
        print(f"{voice['id']}  {voice['display_name']}  ({voice['locale']})")
        print(f"  {format_support(voice['models'])}\n")

    # Part 2 — one voice by id. A missing id returns 404 voice_not_found; skip it so
    # the recipe still completes.
    print(f"Single voice lookup: {VOICE_ID}")
    one = requests.get(
        f"https://api.speechify.ai/v1/voices/{VOICE_ID}",
        headers=headers,
        timeout=30,
    )
    if one.status_code == 404:
        print(f"  {VOICE_ID} not found (list voices with GET /v1/voices).")
        return
    one.raise_for_status()
    voice = one.json()
    print(f"{voice['id']}  {voice['display_name']}  ({voice['locale']})")
    print(f"  {format_support(voice['models'])}")


if __name__ == "__main__":
    main()
