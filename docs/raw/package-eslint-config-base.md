    # @packages/eslint-config-base

Foundation ESLint flat config shared by all AniMemoria workspaces.
Bundles TypeScript-ESLint (strict + type-checked), Prettier, import sorting, unused-import removal,
and a comprehensive rule set enforcing code quality and style conventions.

---

## Included plugins

| Plugin                                   | Purpose                                                           |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `typescript-eslint`                      | TypeScript-aware rules (`recommended` + `recommendedTypeChecked`) |
| `eslint-config-prettier`                 | Disables ESLint rules that conflict with Prettier                 |
| `eslint-plugin-prettier`                 | Runs Prettier as an ESLint rule                                   |
| `eslint-plugin-simple-import-sort`       | Auto-sorts imports and exports                                    |
| `eslint-plugin-unused-imports`           | Warns on unused imports                                           |
| `eslint-plugin-no-relative-import-paths` | Enforces absolute imports rooted at `src/`                        |

---

## Key rule highlights

- `@typescript-eslint/explicit-function-return-type` — required, expressions exempt
- `@typescript-eslint/explicit-member-accessibility` — no redundant `public`
- `no-relative-import-paths` — all imports must be absolute from `src/`
- `simple-import-sort` — imports and exports auto-sorted
- `max-lines` — 1000 lines per file, `max-lines-per-function` — 200 lines
- `complexity` — max cyclomatic complexity of 20

---

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

Requires `parserOptions.projectService: true` (already set in base) — ensure a `tsconfig.json`
is present in the workspace root.
