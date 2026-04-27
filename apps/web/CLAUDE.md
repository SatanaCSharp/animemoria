# apps/web

Next.js 16 — App Router. User-facing streaming frontend. Port: 3000.

## Rendering model

- Server Components by default. Add `"use client"` only when browser APIs or hooks are required.
- Server Actions for form mutations — colocate them with the component or in `src/actions/<feature>.ts`.
- Streaming with `<Suspense>` for async data boundaries.

## Data fetching

- Server Components: Apollo Client in RSC mode — no hooks, call the client directly.
- Client Components: Apollo generated hooks from `@packages/graphql-generated`.
- Never `fetch()` internal gRPC endpoints directly from the frontend — go through `api-gateway-service`.

## File structure

```
src/
  app/           # Next.js App Router pages and layouts
  components/    # shared UI components (client + server)
  actions/       # Server Actions
  lib/           # Apollo client setup, utilities
```

## Styling

Tailwind v4 via `@packages/ui-shared`. Extend theme in `tailwind.config.ts` — do not duplicate token definitions.

## SSR caveat

`window` / `document` are unavailable in Server Components. Guard with `typeof window !== 'undefined'` or move code to a Client Component.
