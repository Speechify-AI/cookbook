import base64
import os

from dotenv import load_dotenv
from speechify import Speechify

# Synthesize the SAME sentence into several encodings by varying `output_format`.
# `output_format` uses the `codec_sampleRate_bitrate` shape and takes PRECEDENCE
# over `audio_format` on /v1/audio/speech. Telephony pipelines want ulaw_8000 /
# pcm_16000; media pipelines want the mp3 bitrate variants. Valid values include:
# pcm_16000, pcm_24000, ulaw_8000, mp3_24000_64, mp3_24000_128, mp3_22050_160,
# mp3_24000_160, wav_48000. An invalid value returns 400 listing the supported set.
OUTPUTS = [
    ("mp3_24000_128", "output_mp3_128.mp3"),  # media / default quality
    ("ulaw_8000", "output_ulaw_8000.ulaw"),  # telephony: 8kHz μ-law (RAW, no header)
    ("pcm_16000", "output_pcm_16000.pcm"),  # telephony: raw 16-bit PCM (RAW, no header)
    ("wav_48000", "output_wav_48000.wav"),
]


def main() -> None:
    load_dotenv()

    token = os.environ.get("SPEECHIFY_API_KEY")
    if not token:
        raise SystemExit("Set SPEECHIFY_API_KEY (copy .env.example to .env).")

    client = Speechify(token=token)

    for output_format, filename in OUTPUTS:
        response = client.audio.speech(
            input="Speechify converts text to speech in whatever audio format your pipeline needs.",
            voice_id="geffen_32",
            model="simba-3.2",
            output_format=output_format,  # wins over audio_format — don't set both
        )

        # audio_data is base64 regardless of codec. The response echoes the resolved
        # output_format, so you can confirm what the server actually produced.
        with open(filename, "wb") as f:
            f.write(base64.b64decode(response.audio_data))
        resolved = getattr(response, "output_format", None) or output_format
        print(f"Wrote {filename} (output_format: {resolved})")


if __name__ == "__main__":
    main()
