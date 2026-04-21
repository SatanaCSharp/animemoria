---
globs: ['apps/web/**', 'apps/admin/**']
---

# Frontend conventions

## Shared UI

- Component library: `@packages/ui-shared` (HeroUI + Tailwind v4).
- Do not install HeroUI or Tailwind directly into `apps/admin` or `apps/web` — consume from the package.
- Tailwind config extends from `@packages/ui-shared/tailwind.config.ts`.

## Both apps

- TypeScript strict mode. No `any` without an explanatory comment.
- Co-locate component tests (`*.spec.tsx`) alongside the component file.
