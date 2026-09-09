# Maintenance

Keeping the cookbook consistent as it grows.

## When you add or change a recipe

1. Update the recipe index table in the repo [`README.md`](../README.md).
2. Update the matrix in [`COVERAGE.md`](../COVERAGE.md) (mark the cell ✅ or note the gap).
3. Run `pnpm format` from the root.
4. Confirm `pnpm install` still succeeds and the recipe runs from its README commands.

## Keeping instructions modular

- `AGENTS.md` is the only "always read" file and stays short. Everything else lives in
  `agents/` and is referenced from the table in `AGENTS.md`.
- One concern per file. If a file grows past a screen or two, split it and add the new file
  to the `AGENTS.md` table.
- When you add a file under `agents/`, **add its row to the `AGENTS.md` table** so it is
  discoverable.

## Dependency versions

- Shared JS versions live in the `catalog:` in `pnpm-workspace.yaml`. Bump there, not in
  individual recipes.
- Python versions are pinned per-recipe in `pyproject.toml`.

## Verifying the API surface

The Speechify API evolves. Before trusting a method name or response field, check the
installed SDK or the live docs (`https://docs.speechify.ai/llms.txt` is a good index). If
reality differs from the notes in `agents/speechify-tts.md`,
trust the API and update those files in the same change.
