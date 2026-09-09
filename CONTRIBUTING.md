# Contributing

Thanks for adding to the Speechify Cookbook! The full, authoritative checklist lives in
[`agents/creating-a-recipe.md`](./agents/creating-a-recipe.md) — this is the short version.

## Principles

- **One concern per recipe.** Small and focused beats one big example.
- **Self-contained.** A recipe folder should run after being copied out of the repo.
- **It must actually run** from its README commands against the live API.
- **Never commit secrets.** Ship `.env.example`, never `.env`.

## Add a recipe

1. Choose a path: `recipes/<product>/<language>/<recipe-name>/` (kebab-case).
2. Copy the matching scaffold from [`templates/`](./templates).
3. Read the language guide:
   [`typescript-recipes.md`](./agents/typescript-recipes.md) or
   [`python-recipes.md`](./agents/python-recipes.md), and the API reference
   [`speechify-tts.md`](./agents/speechify-tts.md).
4. Write the recipe + a README following the fixed template.
5. Update [`README.md`](./README.md) and [`COVERAGE.md`](./COVERAGE.md).
6. Run `pnpm format`, then verify the recipe runs from a clean state.

## Local setup

```bash
pnpm install          # JavaScript/TypeScript recipes
# Python recipes use uv per-recipe: `uv run main.py`
```
