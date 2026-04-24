---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-eslint-config-base.md
tags: [eslint, typescript, linting, package]
---

# @packages/eslint-config-base

Foundation ESLint flat config shared by every AniMemoria workspace that needs TypeScript linting.
All other ESLint config packages (`@packages/eslint-config-ui`, `@packages/eslint-config-service`) extend this one.

## Purpose

Provides a single, opinionated ESLint baseline covering TypeScript type-checking, Prettier formatting, import hygiene, and code complexity limits. Consumers extend it rather than assembling their own plugin stacks.

## Architecture

The package exports a flat config array (`index.js`) that consumers spread into their own `eslint.config.mjs`:

```
packages/eslint-config-base/
  index.js        ← flat config array, the public API
  index.d.ts      ← type declarations
  package.json    ← type: "module", devDependencies contain all bundled plugins
```

All plugin dependencies are declared as `devDependencies` inside the package itself; consumers do not need to install them directly.

## Included plugins

| Plugin                                   | Purpose                                                           |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `typescript-eslint`                      | TypeScript-aware rules (`recommended` + `recommendedTypeChecked`) |
| `eslint-config-prettier`                 | Disables ESLint rules that conflict with Prettier                 |
| `eslint-plugin-prettier`                 | Runs Prettier as an ESLint rule                                   |
| `eslint-plugin-simple-import-sort`       | Auto-sorts imports and exports                                    |
| `eslint-plugin-unused-imports`           | Warns on unused imports                                           |
| `eslint-plugin-no-relative-import-paths` | Enforces absolute imports rooted at `src/`                        |

## Key rules

- `@typescript-eslint/explicit-function-return-type` — required; call expressions exempt
- `@typescript-eslint/explicit-member-accessibility` — no redundant `public`
- `no-relative-import-paths` — all imports must use absolute paths from `src/`
- `simple-import-sort` — imports and exports auto-sorted (overridden by `eslint-config-ui`)
- `max-lines` — 1 000 lines per file
- `max-lines-per-function` — 200 lines
- `complexity` — max cyclomatic complexity 20

## Usage

```js
// eslint.config.mjs
import baseConfig from '@packages/eslint-config-base';

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    // workspace-specific overrides
  },
];
```

Requires a `tsconfig.json` at the workspace root (`parserOptions.projectService: true` is already set in base).

## Consumers

### Direct consumers (use base without extension)

- `packages/shared-types` — pure TS library with no framework specifics
- `packages/utils` — utility helpers, no React or NestJS

### Indirect consumers (via extending packages)

- All React/Next.js workspaces via [[packages/eslint-config-ui]]
- All NestJS service workspaces via [[packages/eslint-config-service]]
