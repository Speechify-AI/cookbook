# TypeScript / JavaScript recipes

## Layout of a TS recipe

```
recipes/<product>/typescript/{sdk,native}/<recipe>/
├── README.md
├── .env.example
├── package.json
├── tsconfig.json        # extends ../../../../../tsconfig.base.json
└── src/
    └── index.ts
```

## package.json conventions

- `"private": true` and a descriptive `name` like `tts-typescript-quickstart`.
- Reference shared deps from the catalog so versions stay aligned across the repo:

```jsonc
{
  "dependencies": {
    "@speechify/api": "catalog:",
    "dotenv": "catalog:",
  },
  "devDependencies": {
    "tsx": "catalog:",
    "typescript": "catalog:",
    "@types/node": "catalog:",
  },
  "scripts": {
    "start": "tsx src/index.ts",
    "typecheck": "tsc --noEmit",
  },
}
```

- Run TypeScript directly with **tsx** — no build step for recipes.
- Add a new shared version to the `catalog:` block in `pnpm-workspace.yaml`; don't pin
  versions inside individual recipes.

## tsconfig.json

Each recipe extends the shared base:

```json
{
  "extends": "../../../../../tsconfig.base.json",
  "include": ["src"]
}
```

(Adjust the number of `../` to reach the repo root.)

## Loading the API key

Use `dotenv` so the recipe works with a local `.env`, then let the SDK read the env var:

```ts
import "dotenv/config";
import { SpeechifyClient } from "@speechify/api";

if (!process.env.SPEECHIFY_API_KEY) {
  throw new Error("Set SPEECHIFY_API_KEY (see .env.example).");
}

const client = new SpeechifyClient({ token: process.env.SPEECHIFY_API_KEY });
```

## Style

- Modern ESM (`"type": "module"` is implied by NodeNext + tsx). Use top-level `import`.
- `async/await`, no floating promises. Fail loudly with a clear message if the key is
  missing.
- Keep `index.ts` linear and readable top-to-bottom — recipes are teaching material.
- See [`speechify-tts.md`](./speechify-tts.md) for the exact API surface.
