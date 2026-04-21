---
updated: 2026-04-21
type: frontend
sources:
  - apps/web/CLAUDE.md
  - .claude/rules/apps-web.md
  - docs/raw/apps-web.md
tags: [nextjs, react, app-router, apollo-client, ssr, streaming, frontend]
---

# web

User-facing streaming frontend for AniMemoria. Next.js 16 with App Router. Port: **3000**.

Server Components are the default rendering model; the app leans heavily on RSC + streaming for performance. It is the only frontend app in the monorepo with SSR capabilities — [[frontend/admin]] is a pure client SPA with no overlap.

## Tech Stack

| Layer                  | Choice                                                    |
| ---------------------- | --------------------------------------------------------- |
| Framework              | Next.js 16 (App Router)                                   |
| Rendering              | Server Components by default; `"use client"` opt-in       |
| Mutations              | Server Actions                                            |
| Data fetching (server) | Apollo Client in RSC mode (direct client calls, no hooks) |
| Data fetching (client) | Apollo generated hooks from `@packages/graphql-generated` |
| UI library             | `@packages/ui-shared` (HeroUI + Tailwind v4)              |
| Streaming              | `<Suspense>` boundaries for async data                    |

## Rendering Model

Server Components are the default. Opt into `"use client"` **only** when:

- Browser APIs (`window`, `document`, `localStorage`) are required
- React hooks that cannot run on the server (`useState`, `useEffect`, etc.) are needed

Server Actions are the approved pattern for form mutations. Colocate them with the component or group them in `src/actions/<feature>.ts`.

### SSR Caveat

`window` and `document` are unavailable in Server Components. Guard with:

```ts
if (typeof window !== 'undefined') { ... }
```

Or move the logic into a Client Component (`"use client"`).

## Data Fetching

| Context                  | Pattern                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| Server Component         | Apollo Client called directly (RSC mode) — no `useQuery`                 |
| Client Component         | Generated hooks from `@packages/graphql-generated`                       |
| gRPC / internal services | **Never** call directly — route through [[services/api-gateway-service]] |

All GraphQL traffic goes through the `api-gateway-service`. Direct `fetch()` calls to gRPC endpoints from the frontend are forbidden.

## Source Layout

```
src/
  app/           # Next.js App Router pages, layouts, and route segments
  components/    # shared UI components (client + server)
  actions/       # Server Actions grouped by feature
  lib/           # Apollo client setup, utilities
```

## Styling

Tailwind v4 is consumed exclusively via `@packages/ui-shared`. Extend the theme in `tailwind.config.ts` — do not duplicate token definitions or install Tailwind directly into `apps/web`.

> Do not install HeroUI or Tailwind directly into `apps/web` — consume exclusively through [[packages/ui-shared]].

## Testing

- Unit/component tests: `*.spec.tsx` colocated alongside the component file.
- TypeScript strict mode throughout. No `any` without an explanatory comment.

## Monorepo Dependencies

| Package                       | Role                                               |
| ----------------------------- | -------------------------------------------------- |
| [[packages/ui-shared]]        | UI provider, HeroUI components, Tailwind v4 styles |
| `@packages/graphql-generated` | Generated Apollo hooks for Client Components       |

## Relationship to Other Apps

- [[frontend/admin]]: admin is a pure client SPA with no SSR. The two apps share `@packages/ui-shared` but diverge completely in routing strategy and rendering model.
- All data flows through [[services/api-gateway-service]] (Apollo Federation gateway at port 4000).

## Notes on docs/raw/apps-web.md

The raw file is the default Next.js `create-next-app` boilerplate README. It contains no project-specific information and should not be treated as documentation for this app. All authoritative details come from `apps/web/CLAUDE.md`.
