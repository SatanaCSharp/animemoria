---
updated: 2026-04-21
sources: [apps/users-service/CLAUDE.md, docs/raw/apps-users-service.md]
tags: [service, graphql, grpc, postgres]
---

# users-service

User profile domain service. Dual-transport: GraphQL subgraph + gRPC server.
Database: PostgreSQL via TypeORM.

## Ports

| Transport                            | Port |
| ------------------------------------ | ---- |
| GraphQL (Apollo Federation subgraph) | 4302 |
| gRPC                                 | 4502 |

Start both in dev: `pnpm --filter users-service dev` (runs both via `concurrently`).

## Responsibilities

**In scope:**

- Own and persist user profile data (`id`, `accountId`, `email`, `nickname`)
- gRPC `CreateUser` operation (persistence-backed)
- GraphQL `getUsers` / `createUser` schema operations (currently mock — see [[#Known issues]])
- Service registration in [[registry-service]]
- Health probes for both transports

**Out of scope:**

- Auth credentials / sessions / tokens → [[auth-service]]
- API edge routing / aggregation → [[api-gateway-service]]

## Architecture

Two independent NestJS entrypoints sharing a base module:

```
src/graphql.main.ts  →  GraphqlModule
src/grpc.main.ts     →  GrpcModule
                            ↕
                       AppBaseModule
                  (config, logger, ORM, shared providers)
```

Source: `docs/raw/apps-users-service.md §3`

### Module layout

Per `apps/users-service/CLAUDE.md` (primary):

```
src/
  modules/
    users/     # CRUD, entity, resolver, gRPC controller
    profile/   # profile-specific domain logic
  shared/      # guards, interceptors, shared DTOs
  migrations/
```

> **Contradiction flagged:** `docs/raw/apps-users-service.md` describes a different layout —
> `src/users/graphql/*`, `src/users/grpc/*`, `src/users/use-case/*`, `src/shared/domain/*`.
> The raw doc may reflect an older snapshot. Treat `apps/users-service/CLAUDE.md` as authoritative;
> verify against source code before acting on either.

## Public interfaces

### gRPC

- Proto: `packages/grpc/protobufs/users.proto` — implements `UsersService`
- Endpoints: `src/modules/users/` (gRPC controller)
- Implemented flow: `UsersController.createUser` → `CreateUserCommandProcessor` → `UserRepository.create` → persisted response

### GraphQL

- Schema contracts: [[packages/graphql-definitions]] (`src/user/`)
- GraphQL entity: [[graphql-entities/user]] — `User` type (`id @key`, `email @shareable`, `nickname @shareable`)
- Endpoints: `src/modules/users/` (resolver)
- **Not yet wired to persistence** — `createUser` returns a mock id; `getUsers` returns hard-coded list

## Data & persistence

- **Entity:** `User` (`id`, `accountId`, `email`, `nickname`)
- **Repository:** `UserRepository`
- Location: `src/shared/domain/` (per raw doc; verify against source)
- Migrations: `src/migrations/` — see project migrations rules (`.claude/rules/migrations.md`) for CLI commands
- `migrationsRun: false` — migrations must be run explicitly in deployment workflows

## Configuration

| Variable                        | Required | Default                 | Purpose                           |
| ------------------------------- | -------- | ----------------------- | --------------------------------- |
| `APP_GRAPHQL_PORT`              | Yes      | `4302`                  | HTTP bind port for GraphQL app    |
| `APP_GRPC_PORT`                 | Yes      | `4502`                  | gRPC bind port                    |
| `DB_CONNECTION_URL`             | Yes      | —                       | Postgres connection URL (TypeORM) |
| `INTERNAL_REGISTRY_SERVER_HOST` | Yes      | `http://localhost:4100` | Registry service base URL         |
| `USERS_SERVICE_GRAPHQL_URL`     | Yes      | `http://localhost:4302` | Registry-advertised GraphQL host  |
| `USERS_SERVICE_GRPC_URL`        | Yes      | `0.0.0.0:4502`          | Registry-advertised gRPC host     |
| `LOG_LEVEL`                     | Yes      | `debug`                 | nestjs-pino verbosity             |
| `LOG_PRETTY`                    | No       | `true`                  | Pretty-print logs                 |

Template: `apps/users-service/.env.example`

## Observability

- **Logging:** `nestjs-pino` via `AppLoggerModule`
- **Health:** `/health`, `/health/live`, `/health/ready` (HTTP); `grpc.health.v1.Health` (gRPC); readiness includes DB ping
- **Metrics / Tracing:** not instrumented

## Testing

- Unit tests colocated with source (`*.spec.ts`)
- Covered: `CreateUserCommandProcessor` (`src/users/use-case/commands/create-user.command.spec.ts`)
- Jest config: `jest.config.cjs` (`rootDir: ./src`)

## Known issues

- GraphQL `createUser` and `getUsers` return mock data — not persistence-backed
- `CreateUserInput` (GraphQL) omits `accountId`, but DB schema requires unique non-null `account_id`
- DB unique-constraint errors are not mapped to stable domain/API error contracts

## Related

- [[auth-service]] — creates users via gRPC `UsersService.CreateUser`
- [[api-gateway-service]] — federates GraphQL subgraphs
- [[packages/grpc]] — protobuf contracts and generated interfaces
- [[packages/graphql-definitions]] — shared GraphQL contracts
- [[packages/nest-shared]] — shared NestJS modules (config, logger, ORM, health, registry, gRPC utils)
- [[packages/shared-types]] — shared error and utility types
