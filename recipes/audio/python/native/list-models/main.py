import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the list-models recipe: GET /v1/audio/models over
# `requests` instead of the speechify-api SDK.


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    resp = requests.get(
        "https://api.speechify.ai/v1/audio/models",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    resp.raise_for_status()
    catalog = resp.json()

    for m in catalog["models"]:
        flags = ", ".join(
            f
            for f, on in (
                ("default", m.get("default")),
                ("recommended", m.get("recommended")),
                ("deprecated", m.get("deprecated")),
                ("curated-voices", m.get("curated_voices")),
            )
            if on
        )
        print(f"{m['id']}{f'  [{flags}]' if flags else ''}")
        print(f"  {m['description']}")
        print(f"  languages: {', '.join(m['languages'])}")
        print(f"  endpoints: {', '.join(m['endpoints'])}\n")

    dialogue = catalog.get("dialogue_models") or []
    if dialogue:
        print(f"Dialogue (multi-speaker) models: {', '.join(m['id'] for m in dialogue)}")


if __name__ == "__main__":
    main()
