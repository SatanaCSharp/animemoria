---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-ui-shared.md
tags: [react, ui, heroui, tailwind, frontend]
---

# @packages/ui-shared

Shared React component library for AniMemoria frontend apps. Provides pre-built, HeroUI-backed UI primitives consumed by [[frontend/admin]], [[frontend/web]], and [[frontend/storybook]]. Do **not** install HeroUI or Tailwind directly into consuming apps — import exclusively from this package.

## Purpose

Centralises component code, HeroUI configuration, and icon primitives so that `apps/admin`, `apps/web`, and `apps/storybook` share a consistent look-and-feel without duplicating dependencies or CSS.

## Architecture

### File layout

```
packages/ui-shared/
├── src/
│   ├── buttons/        # Button component + barrel
│   ├── inputs/         # EmailInput, PasswordInput + barrel
│   ├── dropdowns/      # SingleSelect + barrel
│   ├── icons/
│   │   └── common/     # IconWrapper base + SVG icon components
│   └── hero-ui/        # UIProvider, HeroUI re-exports, styles.css
├── dist/               # Built ESM output (tsup)
├── tsup.config.ts
└── package.json
```

Each category (`buttons`, `inputs`, `dropdowns`, `icons`, `hero-ui`) is its own tsup entrypoint and its own package export — no single monolithic barrel.

### Build

Built with `tsup` in ESM-only format. `react` is externalized (peer dep). Every entrypoint emits `.js`, `.js.map`, and `.d.ts` files under `dist/`. Source maps are included for debuggability.

```ts
// tsup.config.ts — all entrypoints built independently, no code splitting
entry: ['src/buttons/index.ts', 'src/inputs/index.ts', ...]
format: ['esm'], dts: true, sourcemap: true, external: ['react']
```

### Consumer setup

Every consuming app must:

1. Wrap the application root with `UIProvider` (supplies HeroUI's theme context).
2. Import `@packages/ui-shared/hero-ui/styles.css` once at the app entry point.

```tsx
import { UIProvider } from '@packages/ui-shared/hero-ui';
import '@packages/ui-shared/hero-ui/styles.css';

export default function App({ children }) {
  return <UIProvider>{children}</UIProvider>;
}
```

> ⚠️ **Gap**: CLAUDE.md rules state "Tailwind config extends from `@packages/ui-shared/tailwind.config.ts`" but no such file exists in the package as of 2026-04-24. Consuming apps may be extending a non-existent config. Verify against source code.

## Public API

### `@packages/ui-shared/hero-ui`

| Export       | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `UIProvider` | Thin wrapper around `HeroUIProvider`. Must wrap the app root. |

### `@packages/ui-shared/buttons`

| Export   | Description                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| `Button` | Forwards all `ButtonProps` from `@heroui/button` (`color`, `variant`, `size`, `isLoading`, `isDisabled`, …). |

### `@packages/ui-shared/inputs`

| Export          | Description                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `EmailInput`    | HeroUI `Input` pre-typed for email; accepts all `InputProps`.                                                                          |
| `PasswordInput` | HeroUI `Input` with built-in show/hide toggle (internal `isVisible` state); `variant="bordered"` by default; accepts all `InputProps`. |

### `@packages/ui-shared/dropdowns`

| Export         | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `SingleSelect` | Controlled single-selection dropdown built on `@heroui/dropdown`. |

`SingleSelect` props:

| Prop             | Type                                        | Description                                  |
| ---------------- | ------------------------------------------- | -------------------------------------------- |
| `items`          | `{ key: string; element: ReactElement }[]`  | Options list                                 |
| `selectedValue`  | `string`                                    | Currently selected key (controlled)          |
| `onChange`       | `(value: string) => void`                   | Fires with the new key on selection change   |
| `renderTrigger`  | `(el: ReactElement \| string) => ReactNode` | Custom trigger content renderer              |
| `TriggerWrapper` | `ComponentType<{ children: ReactNode }>`    | Alternative: wrapper component for trigger   |
| `renderItem`     | `(item: SelectItem) => ReactNode`           | Custom item renderer                         |
| `ItemWrapper`    | `ComponentType<{ children: ReactNode }>`    | Alternative: wrapper component for each item |
| `data-testid`    | `string`                                    | Test ID on root `<div>`                      |

Internally converts HeroUI's `Selection` type to a plain `string` before calling `onChange`. Falls back to `'--'` if `selectedValue` does not match any item key.

### `@packages/ui-shared/icons`

All icons are built on `IconWrapper`, which renders an `<svg>` that accepts `React.SVGProps<SVGSVGElement>` plus a custom `size` prop (default `24`). Color is controlled via Tailwind `text-*` classes (fill defaults to `currentColor`).

| Export               | Description                                   |
| -------------------- | --------------------------------------------- |
| `DownArrow`          | Chevron/arrow-down icon                       |
| `EyeFilledIcon`      | Eye (password visible) indicator              |
| `EyeSlashFilledIcon` | Eye-slash (password hidden) indicator         |
| `SpinnerIcon`        | Loading spinner — animate with `animate-spin` |

## Consumers

| App / Package          | How it consumes this package                                       |
| ---------------------- | ------------------------------------------------------------------ |
| [[frontend/admin]]     | Imports all component categories; must not install HeroUI directly |
| [[frontend/web]]       | Imports components for client-side rendering (RSC boundary)        |
| [[frontend/storybook]] | Visual testing of all exported components                          |

## Key constraints

- **No direct HeroUI / Tailwind installs** in `apps/admin` or `apps/web` — always import from this package.
- `react` is a peer dep (externalized in the build) — consuming apps supply their own React runtime.
- TypeScript strict mode; no `any` without an explanatory comment.
- Component tests co-located as `*.spec.tsx` alongside the component file.
