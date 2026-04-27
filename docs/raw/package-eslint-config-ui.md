# @packages/eslint-config-ui

ESLint flat config for all AniMemoria React/Next.js frontend apps.
Extends `@packages/eslint-config-base` with React, React Hooks, JSX accessibility,
and TypeScript-aware import resolution rules.

---

## Included plugins

| Plugin                      | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `eslint-plugin-react`       | React-specific rules (React 17+ JSX transform)           |
| `eslint-plugin-react-hooks` | Enforces Rules of Hooks and exhaustive deps              |
| `eslint-plugin-jsx-a11y`    | Accessibility linting for JSX elements                   |
| `eslint-plugin-import`      | Import order, cycles, and path resolution via TypeScript |

---

## Key rule highlights

- `react/function-component-definition` — arrow functions only for components
- `react-hooks/rules-of-hooks` — error
- `react-hooks/exhaustive-deps` — warn
- `import/order` — groups: builtin → external → internal → parent → sibling → index → type, newlines between each
- `simple-import-sort` disabled in favour of `import/order`
- `@typescript-eslint/no-misused-promises` — `checksVoidReturn` relaxed for JSX attributes and arguments

Ignored paths: `.next/`, `out/`, `dist/`, `build/`, `.output/`, `*.config.js/ts`, `.storybook/`.

---

## Usage

```js
// eslint.config.mjs in a React app (apps/admin, apps/web)
import uiConfig from '@packages/eslint-config-ui';

export default [
  ...uiConfig,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
    // app-specific overrides
  },
];
```
