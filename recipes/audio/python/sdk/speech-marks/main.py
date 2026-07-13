import base64
import os

from dotenv import load_dotenv
from speechify import Speechify


def vtt_time(ms: int) -> str:
    """Format a time in milliseconds as a WebVTT timestamp: HH:MM:SS.mmm"""
    h, rem = divmod(int(ms), 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, millis = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{millis:03d}"


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    response = client.audio.speech(
        input="The quick brown fox jumps over the lazy dog.",
        voice_id="george",
        audio_format="mp3",
        model="simba-english",
    )

    with open("output.mp3", "wb") as f:
        f.write(base64.b64decode(response.audio_data))

    # `speech_marks.chunks` holds one entry per word, with start/end times in the audio.
    words = response.speech_marks.chunks

    # Build a WebVTT file with one cue per word — the basis for karaoke-style highlighting.
    lines = ["WEBVTT", ""]
    for w in words:
        lines.append(f"{vtt_time(w.start_time or 0)} --> {vtt_time(w.end_time or 0)}")
        lines.append(w.value or "")
        lines.append("")
    with open("captions.vtt", "w") as f:
        f.write("\n".join(lines))

    print(f"Wrote output.mp3 and captions.vtt ({len(words)} words).")
    print("First few word timings (ms):")
    for w in words[:5]:
        print(f"  {w.start_time}-{w.end_time}\t{w.value}")


if __name__ == "__main__":
    main()
