# Coverage

What exists today and where the gaps are. Update this table whenever you add a recipe.

Legend: ✅ available · ⬜ planned / wanted

Recipes come in two flavors:

- **SDK** — uses an official Speechify SDK for that language.
- **Native** — calls the REST API directly (no SDK), e.g. `fetch` (TS), `requests` (Python), `curl` (Bash).

Each cell points at `recipes/audio/<language>/<flavor>/<recipe>/`.

Legend also: — not applicable.

## Audio — synthesis

|                                        | TypeScript<br>SDK | TypeScript<br>Native | Python<br>SDK | Python<br>Native | Bash<br>Native |
| -------------------------------------- | :---------------: | :------------------: | :-----------: | :--------------: | :------------: |
| quickstart (synthesize to file)        |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| streaming                              |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| SSML controls (pitch / rate / emotion) |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| word-level timestamps (caption sync)   |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| multilingual (language param)          |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| output formats (telephony / bitrate)   |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| voice cloning (verified consent)       |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |

## Audio — voices & models

|                              | TypeScript<br>SDK | TypeScript<br>Native | Python<br>SDK | Python<br>Native | Bash<br>Native |
| ---------------------------- | :---------------: | :------------------: | :-----------: | :--------------: | :------------: |
| list models                  |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| list voices (pagination)     |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| voice language/model support |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |

## API essentials

|                                      | TypeScript<br>SDK | TypeScript<br>Native | Python<br>SDK | Python<br>Native | Bash<br>Native |
| ------------------------------------ | :---------------: | :------------------: | :-----------: | :--------------: | :------------: |
| version pinning + idempotency        |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| error handling (codes / Retry-After) |        ✅         |          ✅          |      ✅       |        ✅        |       ✅       |
| watermark detect / verify            |         —         |          ✅          |       —       |        ✅        |       ✅       |

Notes:

- Bash has no SDK column — it's curl-only by design.
- **Watermark** (`POST /v1/audio/watermark/{detect,verify}`) is not exposed in the SDKs, so it ships as native REST only.
- Multi-speaker **dialogue** (`POST /v1/audio/dialogue`, model `simba-dialogue-1.0`) is a known gap — not yet in the SDKs, so no recipe yet.
