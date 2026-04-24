---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-eslint-config-ui.md
tags: [eslint, react, nextjs, linting, package]
---

# @packages/eslint-config-ui

ESLint flat config for all AniMemoria React and Next.js frontend workspaces.
Extends [[packages/eslint-config-base]] with React, React Hooks, JSX accessibility, and TypeScript-aware import resolution.

## Purpose

Adds React-specific linting on top of the shared base so all frontend apps share consistent component patterns, hook discipline, and accessibility rules without duplicating plugin configuration.

## Architecture

```
packages/eslint-config-ui/
  index.js        ← flat config array, spreads base then adds React layers
  index.d.ts
  package.json    ← devDependencies include all React plugins + eslint-config-base
```

The package declares `@packages/eslint-config-base` as a `devDependency` (`workspace:*`), so its rules are merged at the point of export. Consumers only install `eslint-config-ui`.

## Included plugins (beyond base)

| Plugin                      | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `eslint-plugin-react`       | React-specific rules (React 17+ JSX transform)           |
| `eslint-plugin-react-hooks` | Enforces Rules of Hooks and exhaustive deps              |
| `eslint-plugin-jsx-a11y`    | Accessibility linting for JSX elements                   |
| `eslint-plugin-import`      | Import order, cycles, and path resolution via TypeScript |

## Key rules

- `react/function-component-definition` — arrow functions only for components
- `react-hooks/rules-of-hooks` — error
- `react-hooks/exhaustive-deps` — warn
- `import/order` — groups: builtin → external → internal → parent → sibling → index → type; newlines between each
- `simple-import-sort` **disabled** in favour of `import/order` (overrides base)
- `@typescript-eslint/no-misused-promises` — `checksVoidReturn` relaxed for JSX attributes and arguments

**Ignored paths:** `.next/`, `out/`, `dist/`, `build/`, `.output/`, `*.config.js/ts`, `.storybook/`

## Usage

```js
// eslint.config.mjs in a React app
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

## Consumers

- [[frontend/admin]] (`apps/admin`) — Vite SPA
- [[frontend/web]] (`apps/web`) — Next.js 16 App Router
- [[packages/ui-shared]] — shared HeroUI + Tailwind component library
