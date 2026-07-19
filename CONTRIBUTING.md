# Contributing to Auto Deck

This project welcomes contributions from the community. Please read this guide before opening issues or pull requests.

## Issues

Use [GitHub Issues](https://github.com/t28hub/auto-deck/issues) for bugs and feature requests.
Please search existing issues before filing a new one.

## Pull Requests

Please follow these steps:

1. Fork and clone the repository

```sh
git clone git@github.com:<your-username>/auto-deck.git
cd auto-deck
```

2. Install dependencies

This project is a [pnpm](https://pnpm.io/) workspace and requires the Node.js version declared in the `engines` field of `package.json`.  
The pnpm version is pinned by the `packageManager` field in `package.json`.  
Installing also sets up the git hooks via [lefthook](https://github.com/evilmartians/lefthook).

```sh
pnpm install
```

3. Create a feature branch

```sh
git checkout -b feat/short-description
```

4. Make changes and write tests

```sh
pnpm dev    # Start the playground dev server
```

5. Format, lint, typecheck, and test

```sh
pnpm lint:fix   # Format and lint the source files with Biome
pnpm typecheck  # Typecheck all workspaces
pnpm test       # Run all tests
```

6. Open a pull request

- Fill in the pull request template.
- Make sure the CI checks pass.

## Commit Convention

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by [commitlint](https://commitlint.js.org/) via a git hook. Keep each message to a single lowercase line.

- e.g. `feat(playground): edit text elements in place`

## Code Style

TypeScript, JavaScript, and JSON are formatted and linted with [Biome](https://biomejs.dev/) using the repo config (`.biome.json`).  
The pre-commit hook and CI enforce it, so running `pnpm lint:fix` before committing is usually enough.

## License

By contributing, you agree that your contributions are licensed under the repository [LICENSE](LICENSE).
