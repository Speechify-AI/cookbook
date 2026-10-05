import base64
import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the ssml-emotion recipe: same result, but calling the
# REST API directly with `requests` instead of the speechify-api SDK.

# SSML input must have a single <speak> root. simba-3.2 and simba-3.0 apply <break>,
# <prosody rate> and <sub alias>. They accept <prosody pitch>, <prosody volume>,
# <emphasis> and <speechify:style emotion> but do not apply them.
SSML = """<speak>
  Great news, the build passed!
  <break time="500ms" />
  <prosody rate="slow">But read the next part carefully.</prosody>
  <break time="300ms" />
  Do not deploy on a Friday.
  <break time="400ms" />
  Check the <sub alias="continuous integration">CI</sub> dashboard before you merge.
</speak>"""


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    resp = requests.post(
        "https://api.speechify.ai/v1/audio/speech",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "input": SSML,
            "voice_id": "geffen_32",
            "audio_format": "mp3",
            "model": "simba-3.2",
        },
        timeout=60,
    )
    resp.raise_for_status()

    data = resp.json()
    out_file = "output.mp3"
    with open(out_file, "wb") as f:
        f.write(base64.b64decode(data["audio_data"]))
    print(f"Wrote {out_file} ({data['billable_characters_count']} billable characters)")


if __name__ == "__main__":
    main()
