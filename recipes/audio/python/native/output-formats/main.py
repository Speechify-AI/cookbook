import base64
import os

import requests
from dotenv import load_dotenv

# The "native" counterpart to the output-formats recipe: same result, but calling
# the REST API directly with `requests`. `output_format` in the JSON body controls
# the exact codec / sample rate / bitrate and takes PRECEDENCE over `audio_format`.

# output_format uses the `codec_sampleRate_bitrate` shape. Telephony wants ulaw_8000
# / pcm_16000; media wants the mp3 bitrate variants. Valid values include: pcm_16000,
# pcm_24000, ulaw_8000, mp3_24000_64, mp3_24000_128, mp3_22050_160, mp3_24000_160,
# wav_48000. An invalid value returns 400 listing the supported set.
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

    for output_format, filename in OUTPUTS:
        resp = requests.post(
            "https://api.speechify.ai/v1/audio/speech",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={
                "input": "Speechify converts text to speech in whatever audio format your pipeline needs.",
                "voice_id": "geffen_32",
                "model": "simba-3.2",
                "output_format": output_format,  # wins over audio_format — don't set both
            },
            timeout=60,
        )
        resp.raise_for_status()

        # audio_data is base64 regardless of codec; the response echoes the resolved
        # output_format so you can confirm what the server actually produced.
        data = resp.json()
        with open(filename, "wb") as f:
            f.write(base64.b64decode(data["audio_data"]))
        resolved = data.get("output_format") or output_format
        print(f"Wrote {filename} (output_format: {resolved})")


if __name__ == "__main__":
    main()
