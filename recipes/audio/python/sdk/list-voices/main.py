import os

from dotenv import load_dotenv
from speechify import Speechify

# Cap console noise on large catalogs; the pager still walks every page.
MAX_PRINT = 25


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    # `locale` is a BCP-47 prefix filter ("en" matches en-US, en-GB, ...). Drop it
    # to list everything the key can see: the shared catalogue + your workspace clones.
    # The returned pager is iterable and auto-pages — `for v in ...` transparently
    # fetches each subsequent page, so you never touch a cursor.
    total = 0
    for v in client.voices.list(locale="en"):
        total += 1
        if total <= MAX_PRINT:
            # `type` is "shared" (Speechify's catalogue) or "personal" (your clones).
            # Each entry in `models` is a model this voice can be synthesized with.
            models = ", ".join(m.name for m in v.models)
            print(f"{v.id}  {v.display_name}")
            print(f"  {v.locale}  {v.gender}  {v.type}")
            print(f"  models: {models}\n")

    if total > MAX_PRINT:
        print(f"... and {total - MAX_PRINT} more")
    print(f"Total voices: {total}")


if __name__ == "__main__":
    main()
