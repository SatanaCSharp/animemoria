---
updated: 2026-04-21
type: frontend
sources:
  - apps/admin/CLAUDE.md
  - docs/raw/apps-admin.md
tags: [react, vite, tanstack-router, apollo-client, spa, admin]
---

# admin

Internal operator SPA for AniMemoria. Pure client-side React 19 + Vite app — no SSR, no Server Actions, no React Server Components, ever.

## Tech Stack

| Layer         | Choice                                                          |
| ------------- | --------------------------------------------------------------- |
| Framework     | React 19 + Vite                                                 |
| Routing       | TanStack Router (module-owned `route.tsx`, manual registration) |
| Data fetching | Apollo Client                                                   |
| UI library    | `@packages/ui-shared` (HeroUI + Tailwind v4)                    |
| i18n          | i18next + react-i18next + http-backend + language-detector      |
| Auth          | JWT in `localStorage["token"]`                                  |

## Source Layout

```
src/
  main.tsx          # entrypoint: Apollo setup, styles, i18n bootstrap
  App.tsx           # provider composition (UIProvider, ApolloProvider, AuthProvider, router)
  router.tsx        # route tree wiring — registers module routes via rootRoute.addChildren
  routes/
    __root.tsx      # root route + RootLayout
  modules/
    dashboard/
    sign-in/
    users/
  context/
    auth.context.tsx
    router.context.tsx
  guards/
    auth.guard.ts
    anonymous-user.guard.ts
  shared/           # layouts, components, route constants
  hooks/            # usePageTitle, etc.
  __generated__/    # graphql-shared.type.ts (shared generated types)
  __tests__/        # test utilities, test-id mocks
```

## Routing Model

Routes are **module-owned and manually registered** — not file-based. Each module declares its own `route.tsx`, and all routes are wired into `rootRoute.addChildren([...])` in `src/router.tsx`.

```ts
// src/router.tsx
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  usersRoute,
  signInRoute,
]);
```

Access control is enforced via `beforeLoad` guards:

- `requireAuth(context)` — protected pages (dashboard, users)
- `requireAnonymous(context)` — guest-only pages (sign-in)

Route constants are centralised in `src/shared/constants/routes.ts`; always use `ROUTES.<MODULE>` in navigation and guard code.

## Apollo Client Setup

Configured in `main.tsx`:

- `HttpLink` → `/graphql`
- Auth context link reads `localStorage["token"]` and injects `Authorization: Bearer <token>`
- `InMemoryCache`

GraphQL operations are colocated per module under `modules/*/gql/` (queries and mutations subdirectories). Generated typed documents are committed alongside at `modules/*/gql/**/*.graphql.generated.ts` and consumed via `useQuery`/`useMutation` from `@apollo/client/react`.

## Authentication

Single auth-state owner: `context/auth.context.tsx`.

| API                    | Behaviour                                |
| ---------------------- | ---------------------------------------- |
| `token`                | Current JWT or null                      |
| `setToken(token)`      | Persist token to `localStorage["token"]` |
| `clearToken()`         | Remove token from localStorage           |
| `getIsAuthenticated()` | Boolean derived from token presence      |

Router guards consume auth via `context/router.context.tsx`.

## Internationalization

Config in `src/i18n.ts`. Locales served from `/public/locales/<lang>/<namespace>.json`. Active languages: `en`, `uk`.

**Known gap**: The `i18n.ts` namespace list does not include `dashboard`, but dashboard translations are used in the module.

## Adding a New Module

Checklist for a new route-based module:

1. Create `src/modules/<module>/` with: `route.tsx`, `page.tsx`, `components/`, `gql/queries/`, `gql/mutations/`
2. In `route.tsx`: parent is `rootRoute`, use `lazyRouteComponent`, add `beforeLoad` guard
3. Keep `page.tsx` thin — compose from `components/`; use `usePageTitle` and `useTranslation`
4. Place `.graphql` files under `gql/`; regenerate and commit `*.graphql.generated.ts`
5. Register in `src/router.tsx` via `rootRoute.addChildren([...])`
6. Add route constant to `src/shared/constants/routes.ts`
7. Add colocated specs and stable test IDs in `src/__tests__/mocks/test-ids/modules/<module>.ts`

## Monorepo Dependencies

| Package                  | Role                                               |
| ------------------------ | -------------------------------------------------- |
| [[packages/ui-shared]]   | UI provider, HeroUI components, Tailwind v4 styles |
| `@packages/shared-types` | Shared error classes and TypeScript types          |
| `@packages/utils`        | Assertions and helpers                             |

> Do not install HeroUI or Tailwind directly into `apps/admin` — consume exclusively through `@packages/ui-shared`.

## Known Risks

- No global error boundary strategy around route/lazy loading failures
- Fragment import path `fragments/user-fields.graphql` in users module should be validated
- i18n `dashboard` namespace missing from `src/i18n.ts` namespace list
