---
globs: ['apps/web/**']
---

# Frontend conventions

## apps/web — Next.js 16

- App Router. Server Components are the default; opt into `"use client"` only when necessary.
- Server Actions are allowed for form mutations.
- Data fetching in Server Components uses Apollo Client in RSC mode (not hooks).

## Shared UI

- Component library: `@packages/ui-shared` (HeroUI + Tailwind v4).
- Do not install HeroUI or Tailwind directly into `apps/admin` or `apps/web` — consume from the package.
- Tailwind config extends from `@packages/ui-shared/tailwind.config.ts`.

## Both apps

- TypeScript strict mode. No `any` without an explanatory comment.
- Co-locate component tests (`*.spec.tsx`) alongside the component file.
