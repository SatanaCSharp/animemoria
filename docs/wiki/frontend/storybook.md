---
updated: 2026-04-21
type: frontend
sources:
  - apps/storybook/package.json
  - apps/storybook/.storybook/main.ts
  - apps/storybook/.storybook/preview.ts
  - apps/storybook/src/stories/Button.stories.ts
  - docs/wiki/raw/apps-storybook.md
tags: [storybook, frontend, component-docs, testing, chromatic]
---

# storybook

> ⚠️ **Note**: `docs/wiki/raw/apps-storybook.md` is a generic `create-next-app` README with no Storybook-specific content. All claims below are derived from source code.

## Purpose

`apps/storybook` is the monorepo's component documentation and visual testing hub. It hosts a Storybook instance for developing, documenting, and testing UI components — primarily intended to document [[packages/ui-shared]].

## Runtime

| Item         | Value                                        |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (Pages Router)                    |
| Storybook    | v10.x via `@storybook/nextjs-vite`           |
| Dev port     | `:6006` (`pnpm storybook`)                   |
| Build output | `storybook-static/` (`pnpm build-storybook`) |

## Scripts

```bash
pnpm --filter storybook storybook          # dev server on :6006
pnpm --filter storybook build-storybook    # static export
pnpm --filter storybook dev                # Next.js dev server (not the SB server)
```

## Storybook Config

Config lives in `apps/storybook/.storybook/`:

**`main.ts`** — framework and addon registration:

- Framework: `@storybook/nextjs-vite` (Vite-backed, not webpack)
- Stories glob: `../src/**/*.mdx` and `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- Static dir: `../public`

**`preview.ts`** — global story parameters:

- Color/date control matchers enabled
- a11y addon mode: `'todo'` (violations surfaced in UI but do not fail CI)

## Addons

| Addon                         | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `@chromatic-com/storybook`    | Chromatic visual regression testing integration              |
| `@storybook/addon-vitest`     | Run story-based component tests via Vitest                   |
| `@storybook/addon-a11y`       | Accessibility auditing per story                             |
| `@storybook/addon-docs`       | Auto-generated component documentation from TypeScript types |
| `@storybook/addon-onboarding` | Onboarding tour (safe to ignore in CI)                       |

## Testing Setup

- **Vitest** (`vitest.config.ts`) with `@storybook/addon-vitest` — stories double as component tests
- **Playwright** + `@vitest/browser-playwright` — browser-mode testing for interaction stories
- **Chromatic** — visual regression diffing on CI (requires `CHROMATIC_PROJECT_TOKEN`)

## Current State

`src/stories/` contains boilerplate example components only (`Button`, `Header`, `Page`). No [[packages/ui-shared]] components have been documented here yet. This is a known gap — see [[../gaps.md]].

## Relationship to ui-shared

Storybook is the intended documentation surface for [[packages/ui-shared]] (HeroUI + Tailwind v4 component library). Components should have co-located `.stories.ts(x)` files or stories added here. As of 2026-04-21, this connection is not yet established.

## File Layout

```
apps/storybook/
├── .storybook/
│   ├── main.ts          # framework, addons, stories glob
│   ├── preview.ts       # global parameters (a11y, controls)
│   └── vitest.setup.ts
├── src/
│   ├── pages/           # Next.js pages (app shell)
│   └── stories/         # example components + stories
├── public/
├── next.config.ts
└── vitest.config.ts
```

## Notes

- The app uses Pages Router (`src/pages/`), not App Router — contrast with [[web]] which uses App Router.
- No `@packages/ui-shared` or `@packages/graphql-generated` dependencies — purely a dev tool.
- Tailwind v4 and PostCSS are installed directly (not via `@packages/ui-shared`) since this app is a dev tool, not a user-facing app.
