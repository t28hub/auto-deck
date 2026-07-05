# @auto-deck/tsconfig

Shared TypeScript config presets for the Auto Deck monorepo.
All presets extend [`@tsconfig/strictest`][strictest].

[strictest]: https://github.com/tsconfig/bases/blob/main/bases/strictest.json

## Installation

From a workspace package directory:

```sh
pnpm add -D @auto-deck/tsconfig --workspace
```

## Presets

| Preset       | Use case                                                |
|:-------------|:--------------------------------------------------------|
| `base.json`  | Plain TypeScript packages (no DOM, no JSX)              |
| `react.json` | React packages; adds DOM libs and the `react-jsx` transform |

## Usage

Extend the preset that matches the package. `include` / `exclude` are owned by the consumer, since their paths resolve relative to the file that declares them.

```jsonc
// packages/schema/tsconfig.json
{
  "extends": "@auto-deck/tsconfig/base.json",
  "include": ["src"]
}
```

```jsonc
// packages/renderer-svg/tsconfig.json
{
  "extends": "@auto-deck/tsconfig/react.json",
  "include": ["src", "test"]
}
```
