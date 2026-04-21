---
globs: ['apps/admin/**']
---

# Frontend conventions

## apps/admin — hard constraints

- **Pure client SPA.** No SSR, no Server Actions, no React Server Components — ever.
- Routing: TanStack Router. Define routes in `src/routes/` using file-based routing conventions.
- Data fetching: Apollo Client via generated hooks from `@packages/graphql-generated`. No direct `fetch` calls to GraphQL.
- Run `pnpm codegen --watch` during active admin development to keep generated types in sync.

## Shared UI

- Component library: `@packages/ui-shared` (HeroUI + Tailwind v4).
- Do not install HeroUI or Tailwind directly into `apps/admin` or `apps/web` — consume from the package.
- Tailwind config extends from `@packages/ui-shared/tailwind.config.ts`.

## Both apps

- TypeScript strict mode. No `any` without an explanatory comment.
- Co-locate component tests (`*.spec.tsx`) alongside the component file.
