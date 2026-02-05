# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AniMemoria is an anime streaming platform built as a **pnpm monorepo** with **Turbo** for build orchestration. It uses a microservices architecture with NestJS backends, React frontends, and federated GraphQL with gRPC inter-service communication.

## Common Commands

```bash
pnpm install                          # Install all dependencies
pnpm build                            # Build everything (turbo)
pnpm lint                             # Lint all packages
pnpm test                             # Run all tests
pnpm format                           # Format with Prettier
pnpm format:check                     # Check formatting
pnpm migration:run                    # Run DB migrations (dev)
```

### Development Servers

```bash
# Frontend
turbo run dev --filter=admin           # Admin dashboard (Vite, port 3000)

# Backend services (each has graphql + grpc entrypoints)
pnpm api-gateway:graphql:dev           # API Gateway (Apollo Federation)
pnpm graphql:dev                       # All subgraph services (excludes gateway)
pnpm grpc:dev                          # All gRPC services
pnpm registry:rest:dev                 # Registry service (REST)
```

### Single Service

```bash
turbo run graphql:dev --filter=auth-service
turbo run grpc:dev --filter=users-service
turbo run build --filter=auth-service
```

### Testing a Single Service

```bash
cd apps/auth-service && pnpm test              # Run tests
cd apps/auth-service && pnpm test:watch        # Watch mode
cd apps/auth-service && pnpm test:cov          # With coverage
```

### Database Migrations (per service)

```bash
cd apps/auth-service
pnpm migration:create                 # Generate new migration
pnpm migration:run                    # Run pending (dev)
pnpm migration:undo                   # Rollback last (dev)
```

### Docker Builds

```bash
pnpm docker:build:admin               # Vite app via Nginx
pnpm docker:build:auth:graphql        # NestJS service (graphql entrypoint)
pnpm docker:build:auth:grpc           # NestJS service (grpc entrypoint)
pnpm docker:build:all                 # Everything
# Uses: ./infra/deployment/docker/build.sh <vite|nestjs> <app-name> [entrypoint]
```

### Local Database

```bash
cd infra/local && docker compose up -d   # Start PostgreSQL 16
# Requires .env.docker with POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
# init-db.sql creates per-service databases
```

## Architecture

### Monorepo Layout

- **`apps/`** — Deployable applications
  - `admin` — Vite + React 19 admin dashboard (HeroUI, TanStack Router, Apollo Client, i18next)
  - `web` — Next.js public-facing app
  - `storybook` — Component library docs (Storybook 10)
  - `api-gateway-service` — NestJS Apollo Gateway (federates subgraphs)
  - `auth-service` — NestJS auth (JWT access/refresh tokens, bcrypt, Passport)
  - `users-service` — NestJS user management
  - `registry-service` — NestJS service discovery (REST only)

- **`packages/`** — Shared workspace packages
  - `nest-shared` — Reusable NestJS modules: config, ORM setup, auth guards/strategies, GraphQL config, gRPC client, Pino logging, graceful shutdown
  - `shared-types` — Shared TypeScript types and enums
  - `utils` — Utility functions (assertions, type guards, predicates)
  - `ui-shared` — React component library (HeroUI-based buttons, inputs, dropdowns, icons)
  - `grpc` — Protobuf definitions (`packages/grpc/protobufs/`) and ts-proto generated code
  - `graphql/definitions` — GraphQL schema DTOs and entities
  - `graphql/generated` — Auto-generated GraphQL types (graphql-codegen)
  - `scripts` — DB migration shell scripts (create, run, undo)
  - `tsconfig`, `eslint-config-base`, `eslint-config-service`, `eslint-config-ui` — Shared configs

### NestJS Service Pattern

Each backend service has multiple entrypoints:

- `src/graphql.main.ts` + `src/graphql.module.ts` — GraphQL server
- `src/grpc.main.ts` + `src/grpc.module.ts` — gRPC server
- `src/rest.main.ts` (registry only) — REST server

Internal structure:

```
src/
├── shared/domain/           # Entities, repositories
├── shared/client-services/  # External service gRPC clients
├── [feature]/use-case/      # Business logic
├── [feature]/graphql/       # Resolvers
├── [feature]/rest/          # Controllers (if REST)
```

### Communication Flow

- **Frontends → API Gateway**: GraphQL (Apollo Client → Apollo Federation Gateway)
- **Gateway → Subgraphs**: Federated GraphQL (auth-service, users-service)
- **Service-to-service**: gRPC (via `@packages/grpc` proto definitions)
- **Service discovery**: Registry service (REST)

### Port Ranges

- REST: 4100-4199
- GraphQL: 4300-4399
- gRPC: 4500-4599

### Authentication

JWT dual-token pattern via `@packages/nest-shared/auth`:

- Access Token (AT) — short-lived, sent in headers
- Refresh Token (RT) — long-lived, stored in HTTP-only cookies
- Guards: `JwtGuard`, `JwtRtGuard`, `GqlAuthGuard`
- Environment secrets: `AT_SECRET`, `RT_SECRET`

## Code Conventions

### Commit Messages

Conventional commits enforced via commitlint + Husky:

```
feat(AM-XX): description
fix(scope): description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Pre-commit Hooks

Lint-staged runs ESLint (with `--fix` then `--max-warnings=0`) per package using the nearest ESLint config, then Prettier on all staged files. Commits fail on any remaining warnings or errors.

### Formatting

Prettier: 2-space indent, single quotes, trailing commas, semicolons.

### Dependency Management

Uses pnpm catalog (defined in `pnpm-workspace.yaml`) for centralized version management. Dependencies reference `catalog:` instead of version numbers.

### Tech Requirements

- Node.js >= 24.11.1
- pnpm 9.15.3
