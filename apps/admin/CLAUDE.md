# apps/admin

React 19 + Vite + TanStack Router. Admin SPA. Port: determined by Vite dev server config.

## Hard constraints — no exceptions

- **No SSR.** No `getServerSideProps`, no Server Actions, no RSC. This is a pure client SPA.
- **No direct GraphQL string queries.** Use only the generated typed hooks from `@packages/graphql-generated`.

## Routing

TanStack Router with file-based routes under `src/routes/`. Route files export `createFileRoute(...)`.  
Add new pages by creating a new file in `src/routes/` — do not register routes manually in a central file.

## Data fetching

```ts
// Correct
import { useGetUsersQuery } from '@packages/graphql-generated';

// Wrong — never hand-write Apollo Client calls
import { useQuery, gql } from '@apollo/client';
```

Run `pnpm codegen --watch` during active development so generated hooks stay in sync with schema changes.

## Styling

Tailwind v4 via `@packages/ui-shared`. Import components from `@packages/ui-shared` — do not install HeroUI directly into this app.
