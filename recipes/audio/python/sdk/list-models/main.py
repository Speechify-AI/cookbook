import os

from dotenv import load_dotenv
from speechify import Speechify


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    # Read the model catalog at runtime instead of hardcoding model ids — the set,
    # the default, and each model's languages change over time.
    catalog = client.models.list()

    for m in catalog.models:
        # `default` = used when a request omits `model`; `recommended` = what to reach
        # for on a new integration. `endpoints` lists the routes the model is valid on.
        flags = ", ".join(
            f
            for f, on in (
                ("default", m.default),
                ("recommended", m.recommended),
                ("deprecated", m.deprecated),
                ("curated-voices", m.curated_voices),
            )
            if on
        )
        print(f"{m.id}{f'  [{flags}]' if flags else ''}")
        print(f"  {m.description}")
        print(f"  languages: {', '.join(m.languages)}")
        print(f"  endpoints: {', '.join(m.endpoints)}\n")

    # Multi-speaker models are returned separately: valid only on POST /v1/audio/dialogue.
    if catalog.dialogue_models:
        print(f"Dialogue (multi-speaker) models: {', '.join(m.id for m in catalog.dialogue_models)}")


if __name__ == "__main__":
    main()
