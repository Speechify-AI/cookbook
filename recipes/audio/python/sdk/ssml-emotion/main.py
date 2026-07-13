import base64
import os

from dotenv import load_dotenv
from speechify import Speechify

# SSML input must have a single <speak> root. Speechify supports standard SSML
# (prosody / break / emphasis) plus the <speechify:style emotion="..."> tag.
# Emotions: angry, cheerful, sad, terrified, relaxed, fearful, surprised, calm,
#           assertive, energetic, warm, direct, bright.
SSML = """<speak>
  <speechify:style emotion="cheerful">Great news — the build passed!</speechify:style>
  <break time="500ms" />
  <prosody rate="slow" pitch="low">But read the next part carefully.</prosody>
  <break time="300ms" />
  <speechify:style emotion="assertive">Do not deploy on a Friday.</speechify:style>
  <break time="400ms" />
  This is <emphasis level="strong">critical</emphasis>.
</speak>"""


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    response = client.audio.speech(
        input=SSML,
        voice_id="george",
        audio_format="mp3",
        model="simba-english",  # simba-english supports full SSML + emotion control
    )

    out_file = "output.mp3"
    with open(out_file, "wb") as f:
        f.write(base64.b64decode(response.audio_data))
    print(f"Wrote {out_file} ({response.billable_characters_count} billable characters)")


if __name__ == "__main__":
    main()
