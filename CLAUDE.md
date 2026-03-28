## Project

AniMemoria — platform where you can watch anime.
Monorepo: pnpm workspaces + Turborepo.
Language: TypeScript throughout (Node.js runtime).

## Apps

- `apps/admin` — internal SPA (React 19 + Vite + Apollo Client + TanStack Router + HeroUI)
- `apps/web` — public app (Next.js)
- `apps/storybook` — component docs
- `apps/api-gateway-service` — NestJS Apollo Federation gateway + REST entrypoint
- `apps/auth-service` — auth domain: accounts/sessions/tokens (GraphQL + gRPC)
- `apps/users-service` — user domain (GraphQL + gRPC)
- `apps/registry-service` — service registry/discovery (REST + query/command)

## Packages

- `packages/nest-shared` — shared NestJS modules (config, guards, ORM, gRPC wiring, health)
- `packages/grpc` — protobuf contracts + generated TS (source of truth for gRPC contracts)
- `packages/graphql/definitions` — shared GraphQL DTOs/entities/interfaces
- `packages/graphql/generated` — generated types, do NOT edit manually
- `packages/shared-types` — cross-service enums, errors, TS types
- `packages/ui-shared` — reusable React components (HeroUI-based)
- `packages/utils` — assertions, predicates, type-guards, async helpers
