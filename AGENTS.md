# AGENTS.md

Guidance for AI coding agents (and humans) working in the **Speechify Cookbook** — a
collection of focused, runnable recipes for the Speechify
[Text-to-Speech](https://docs.speechify.ai/tts) API.

## How to use this file

This file is intentionally small. Detailed, task-specific instructions live in the
[`agents/`](./agents) folder and are **loaded on demand** — read the relevant file(s)
below for the task at hand instead of loading everything up front.

| When you are…                                                 | Read                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Understanding the repo layout, workspaces, or where things go | [`agents/monorepo.md`](./agents/monorepo.md)                     |
| Adding or editing a recipe (the canonical checklist)          | [`agents/creating-a-recipe.md`](./agents/creating-a-recipe.md)   |
| Writing a TypeScript/JavaScript recipe                        | [`agents/typescript-recipes.md`](./agents/typescript-recipes.md) |
| Writing a Python recipe                                       | [`agents/python-recipes.md`](./agents/python-recipes.md)         |
| Calling the Speechify TTS API or SDKs                         | [`agents/speechify-tts.md`](./agents/speechify-tts.md)           |
| Updating docs, the README index, or coverage tracking         | [`agents/maintenance.md`](./agents/maintenance.md)               |

> **Convention:** when you add a new instruction file under `agents/`, add a row to the
> table above so it gets discovered. Keep each file scoped to one concern.

## Non-negotiables

1. **Never commit secrets.** Every recipe reads `SPEECHIFY_API_KEY` from the environment
   (or a local `.env`). Ship a `.env.example`, never a real `.env`.
2. **Every recipe must run** with the exact commands in its `README.md`, from a clean
   checkout, against the real API.
3. **Recipes are self-contained.** A user should be able to copy one recipe folder out of
   the repo and have it work. Share versions via the pnpm `catalog:`, not via imports
   across recipes.
4. **One concern per recipe.** Prefer several small recipes over one kitchen-sink example.
5. **Match the house style.** Read a sibling recipe before writing a new one.

## Quick reference

- Get an API key: <https://platform.speechify.ai/api-keys>
- Docs: <https://docs.speechify.ai> · LLM index: <https://docs.speechify.ai/llms.txt>
- TS SDK: `@speechify/api` · Python SDK: `speechify-api`
- Package manager: **pnpm** (JS) and **uv** (Python). Node 20+.
