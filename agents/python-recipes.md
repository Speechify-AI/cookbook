# Python recipes

Python recipes use **uv** and are managed independently of the pnpm workspace.

## Layout of a Python recipe

```
recipes/audio/python/{sdk,native}/<recipe>/
├── README.md
├── .env.example
├── pyproject.toml
├── .python-version      # optional, pins the interpreter for uv
└── main.py
```

## pyproject.toml conventions

```toml
[project]
name = "audio-python-quickstart"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "speechify-api>=4.0.0",
    "python-dotenv>=1.0.0",
]
```

- Install + run with uv (no manual venv needed):

```bash
uv run main.py
```

`uv run` creates/refreshes the environment from `pyproject.toml` automatically.

## Loading the API key

```python
import os
from dotenv import load_dotenv
from speechify import Speechify

load_dotenv()

token = os.environ.get("SPEECHIFY_API_KEY")
if not token:
    raise SystemExit("Set SPEECHIFY_API_KEY (see .env.example).")

client = Speechify(token=token)
```

An async variant is available as `AsyncSpeechify` with identical method signatures.

## Style

- Target Python 3.10+ and keep `main.py` a readable script with a `main()` entry guarded by
  `if __name__ == "__main__":`.
- Prefer the standard library plus the SDK; add dependencies only when they earn their
  place.
- See [`speechify-tts.md`](./speechify-tts.md) for the exact API surface (note Python uses
  `snake_case`: `voice_id`, `audio_format`, `audio_data`).
