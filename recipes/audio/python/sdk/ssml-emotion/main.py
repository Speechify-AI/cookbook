import base64
import os

from dotenv import load_dotenv
from speechify import Speechify

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

    client = Speechify(token=token)

    response = client.audio.speech(
        input=SSML,
        voice_id="geffen_32",
        audio_format="mp3",
        model="simba-3.2",
    )

    out_file = "output.mp3"
    with open(out_file, "wb") as f:
        f.write(base64.b64decode(response.audio_data))
    print(f"Wrote {out_file} ({response.billable_characters_count} billable characters)")


if __name__ == "__main__":
    main()
