# Admin App (`apps/admin`)

Internal admin SPA for AniMemoria operators.

## Tech Stack

- React 19 + Vite
- TanStack Router
- Apollo Client
- i18next (`react-i18next` + backend + language detector)
- Tailwind CSS (v4-style setup)
- Shared UI primitives from `@packages/ui-shared`

## `src` Structure

- `main.tsx` - application entrypoint, Apollo client setup, global style/i18n imports
- `App.tsx` - provider composition (`UIProvider`, `ApolloProvider`, `AuthProvider`, router context provider)
- `router.tsx` - TanStack router creation and route tree wiring
- `routes/__root.tsx` - root route with `RootLayout`
- `context/` - app-level contexts (`auth.context.tsx`, `router.context.tsx`)
- `guards/` - route protection (`auth.guard.ts`, `anonymous-user.guard.ts`)
- `shared/` - layouts, reusable components, route constants
- `modules/` - module domains (`dashboard`, `sign-in`, `users`)
- `hooks/` - shared hooks (`usePageTitle`)
- `__generated__/` - generated GraphQL/shared types
- `__tests__/` + colocated `*.spec.ts(x)` - test utilities and module/component tests

## Bootstrap and Runtime Flow

1. `main.tsx` imports:
   - shared Hero UI styles (`@packages/ui-shared/hero-ui/styles.css`)
   - local app styles (`styles.css`)
   - i18n bootstrap (`i18n.ts`)
2. `getRouter()` creates the router instance.
3. Apollo Client is created with:
   - `HttpLink` to `/graphql`
   - auth context link that reads `token` from `localStorage` and sends `Authorization: Bearer <token>`
   - `InMemoryCache`
4. `App.tsx` mounts providers and renders the router via `RouterContextProvider`.

## Routing Model

- Root layout is provided by `routes/__root.tsx` and `shared/layouts/RootLayout.tsx`.
- Module routes are declared in module-level `route.tsx` files.
- Views are lazy loaded with `lazyRouteComponent` (view can be a page or reusable component).
- Access control is enforced through `beforeLoad` guards:
  - `requireAuth` for protected pages (dashboard/users)
  - `requireAnonymous` for guest-only page (sign-in)
- Route constants live in `shared/constants/routes.ts`.

### Router-to-Module Flow

Module wiring starts in `src/router.tsx`:

1. Import module route exports (for example, `signInRoute`, `usersRoute`).
2. Register them in `rootRoute.addChildren([...])`.
3. Each module route lazy-loads its `view.tsx`/`page.tsx` entry and applies guard logic in `beforeLoad`.

In practice, the app composes modules through:

- `src/router.tsx` -> route registration
- `src/modules/<module>/route.tsx` -> module route contract
- `src/modules/<module>/page.tsx` (or module view component) -> route view entrypoint
- `src/shared`, `src/context`, `src/guards` -> shared dependencies used by modules

## Data Layer (GraphQL/Apollo)

- GraphQL operations are colocated by module under `modules/*/gql`.
- Generated operation types/documents are committed under `modules/*/gql/**/*.generated.ts`.
- Runtime usage patterns:
  - sign-in: mutation-driven flow (`useMutation(SignInDocument)`)
  - users: query-driven list (`useQuery(GetUsersDocument)`)
- `src/__generated__/graphql-shared.type.ts` contains shared GraphQL-related generated types.

## Authentication

- `context/auth.context.tsx` is the single auth state owner in the app.
- Token persistence key: `localStorage["token"]`.
- Auth API exposed through context:
  - `token`
  - `setToken(token)`
  - `clearToken()`
  - `getIsAuthenticated()`
- Router guards consume auth through router context (`context/router.context.tsx`).

## Internationalization

- Config in `src/i18n.ts` using:
  - `i18next-http-backend`
  - `i18next-browser-languagedetector`
  - `initReactI18next`
- Locales are served from `/public/locales/<lang>/<namespace>.json`.
- Current languages in app assets: `en`, `uk`.

## Styling

- `src/styles.css` configures Tailwind and source scanning.
- Components are mostly utility-class styled.
- Shared design system styles come from `@packages/ui-shared/hero-ui/styles.css`.

## Testing Conventions

- Unit/component tests are colocated next to source files (`*.spec.ts(x)`).
- Shared test helpers:
  - `src/__tests__/utils/router-test-utils.tsx`
  - `src/__tests__/utils/apollo-test-utils.tsx`
  - `src/__tests__/utils/react-i18next.ts`
- Stable selectors are centralized in `src/__tests__/mocks/test-ids`.

## Create New Module

Use this checklist when adding a new route-based module.

### 1) Create module skeleton

Create `src/modules/<module>/` with this baseline:

```text
modules/<module>/
  route.tsx
  page.tsx
  components/
  gql/
    queries/
    mutations/
  schemas/            # optional (forms/validation)
  *.spec.tsx          # colocated tests
```

Suggested naming:

- route export: `<module>Route` (example: `animeRoute`)
- view export: `<ModuleView>` (example: `AnimeView`)
- If you keep page naming, `<ModulePage>` is also valid (example: `AnimePage`).

### 2) Implement `route.tsx`

- Parent must be `rootRoute`.
- Use a stable path (`'/<module-path>'`).
- Use `lazyRouteComponent(() => import('./page'), '<ModuleView|ModulePage>')`.
- Add guard in `beforeLoad`:
  - `requireAuth(context)` for protected admin routes
  - `requireAnonymous(context)` for guest-only routes

### 3) Implement module view (`page.tsx` or `view.tsx`)

- Keep the route view thin and compose UI from `components/`.
- Set document title with `usePageTitle(...)`.
- Use `useTranslation('<namespace>')` when module has dedicated i18n namespace.

### 4) Add GraphQL operations (if needed)

- Place `.graphql` files under module-local `gql/queries` or `gql/mutations`.
- Regenerate and commit `*.graphql.generated.ts` files alongside operations.
- Consume generated documents with Apollo hooks (`useQuery`, `useMutation`).

### 5) Register the module globally

- Import `<module>Route` into `src/router.tsx`.
- Add route to `rootRoute.addChildren([...])`.
- Add route constant to `src/shared/constants/routes.ts`.
- Use `ROUTES.<MODULE>` in `navigate(...)` and redirect/guard code.

### 6) Wire shared dependencies

Modules commonly integrate with:

- `src/shared/constants/routes.ts` for route targets
- `src/context/auth.context.tsx` through router context and auth APIs
- `src/guards/*` for access control
- `src/shared/layouts/RootLayout.tsx` (applied automatically via root route)

### 7) Add tests and test IDs

- Add colocated specs for page/components and key interactions.
- Add stable test IDs in `src/__tests__/mocks/test-ids/modules/<module>.ts`.
- For query/list components, cover loading, success, empty, and error states.

## Monorepo Dependencies Used by `src`

- `@packages/ui-shared` - UI provider/components/styles
- `@packages/shared-types` - shared error classes
- `@packages/utils` - assertions/helpers

## Known Risks / Follow-ups

- `i18n.ts` namespace list does not include `dashboard`, while dashboard translations are used.
- Users GraphQL files reference fragment imports that should be validated (`fragments/user-fields.graphql` path).
- No explicit global error boundary strategy around route/lazy loading failures.
