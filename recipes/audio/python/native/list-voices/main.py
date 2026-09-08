import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the list-voices recipe: GET /v1/voices over `requests`
# instead of the speechify-api SDK. Unlike the SDK's auto-paging iterable, the REST
# endpoint hands you one page + a cursor and you loop it yourself.

# Cap console noise on large catalogs; we still walk every page.
MAX_PRINT = 25


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    headers = {"Authorization": f"Bearer {token}"}
    total = 0
    cursor = None

    # Real cursor pagination: keep fetching while `has_more`, feeding `next_cursor`
    # back as `?cursor=`. `limit` maxes at 200; `locale` is a BCP-47 prefix filter.
    while True:
        params = {"locale": "en"}
        if cursor:
            params["cursor"] = cursor

        resp = requests.get(
            "https://api.speechify.ai/v1/voices",
            headers=headers,
            params=params,
            timeout=30,
        )
        resp.raise_for_status()
        page = resp.json()

        for v in page["voices"]:
            total += 1
            if total <= MAX_PRINT:
                # `type` is "shared" (catalogue) or "personal" (your clones). Each entry
                # in `models` is a model this voice can be synthesized with.
                models = ", ".join(m["name"] for m in v["models"])
                print(f"{v['id']}  {v['display_name']}")
                print(f"  {v['locale']}  {v['gender']}  {v['type']}")
                print(f"  models: {models}\n")

        if not page.get("has_more"):
            break
        cursor = page.get("next_cursor")

    if total > MAX_PRINT:
        print(f"... and {total - MAX_PRINT} more")
    print(f"Total voices: {total}")


if __name__ == "__main__":
    main()
