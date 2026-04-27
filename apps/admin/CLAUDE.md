# apps/admin

React 19 + Vite + TanStack Router. Admin SPA. Port: determined by Vite dev server config.

## Hard constraints — no exceptions

- **No SSR.** No `getServerSideProps`, no Server Actions, no RSC. This is a pure client SPA.
- **No raw GraphQL strings.** Always use colocated `.graphql` files and import the generated typed documents.

## Routing

TanStack Router with module-owned routes. Each module declares its own `route.tsx` using `createRoute(...)`.  
Routes are registered manually in `src/router.tsx` via `rootRoute.addChildren([...])`.  
Do not use `createFileRoute` or file-based routing conventions.

```ts
// src/modules/dashboard/route.tsx
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD,
  component: lazyRouteComponent(() => import('./page'), 'Dashboard'),
  beforeLoad: ({ context }) => requireAuth(context),
});

// src/router.tsx
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  usersRoute,
  signInRoute,
]);
```

## Data fetching

Use `useQuery` / `useMutation` from `@apollo/client/react` with colocated generated documents:

```ts
// Correct
import { useQuery } from '@apollo/client/react';
import { GetUsersDocument } from 'modules/users/gql/queries/get-users.graphql.generated';

const { data, loading, error } = useQuery(GetUsersDocument);
```

Place `.graphql` files under `modules/<module>/gql/queries/` or `gql/mutations/`. Regenerate and commit `*.graphql.generated.ts` files alongside them.

Run `pnpm codegen --watch` during active development so generated types stay in sync with schema changes.

## Styling

Tailwind v4 via `@packages/ui-shared`. Import components from `@packages/ui-shared` — do not install HeroUI directly into this app.
