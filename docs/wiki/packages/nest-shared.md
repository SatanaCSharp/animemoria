---
updated: 2026-04-21
sources: [packages/nest-shared/CLAUDE.md]
tags: [package, nestjs, grpc, graphql, auth, orm, health]
---

# @packages/nest-shared

Shared NestJS infrastructure package. Consumed by [[users-service]] and [[auth-service]] only.

> **Hard constraint:** Do not import into `api-gateway-service`, `registry-service`, or any frontend app.

## Purpose

Centralises cross-cutting infrastructure concerns (logging, DB, auth, gRPC, health, graceful shutdown, service registration) so consuming services stay focused on business logic. Changes here affect **both** `users-service` and `auth-service` simultaneously — always test in both before merging.

---

## Modules

### `AppLoggerModule`

- Source: `src/app-logger/app-logger.module.ts`
- Wraps `nestjs-pino` / `pino-pretty`.
- Global module. Register once with `AppLoggerModule.forRoot()`.
- Config env vars: `LOG_LEVEL` (required), `LOG_PRETTY` (`true`/`false`, default `false`).
- HTTP auto-logging is disabled (`autoLogging: false`); services log explicitly.

### `AuthModule`

- Source: `src/auth/auth.module.ts`
- Provides JWT access-token and (optionally) refresh-token strategies, guards, and the `@CurrentUser()` decorator.
- Register with `AuthModule.forRoot(options?)`.
  - `enableRefreshToken?: boolean` — default `true`; set `false` to skip `JwtRtStrategy`/`JwtRtGuard`.
- Reads `AT_SECRET` (always required) and `RT_SECRET` (required when refresh token enabled) from `ConfigService`.
- Exports: `JwtGuard`, `GqlAuthGuard`, `JwtRtGuard` (when enabled), strategies.

### `OrmDbModule`

- Source: `src/orm/orm-db.module.ts`
- Global TypeORM wrapper for PostgreSQL.
- Register with `OrmDbModule.forRoot()` — reads `DB_CONNECTION_URL` from `ConfigService`.
- Fixed settings: snake_case naming strategy, UTC timestamps, `migrationsRun: false`, pool size 800, lock timeout 100 ms, statement timeout 5 000 ms, migration table `_migrations`.
- Entity glob: `dist/**/*.entity.js`; migration glob: `dist/db/migrations/*.js`.

### `GrpcClientModule`

- Source: `src/grpc/grpc-client.module.ts`
- Factory for NestJS `ClientsModule` gRPC clients.
- `GrpcClientModule.register(serviceNames[])` — scoped.
- `GrpcClientModule.forRoot(serviceNames[])` — global.
- Package name derived via `snakeCase(serviceName)`; proto path resolved by `getProtoPath(serviceName)`.
- Service URLs resolved at runtime via `GrpcServiceUrlMapModule`.

### `ApolloGqlGraphQLModule`

- Source: `src/graphql/apollo-graphq.module.ts`
- Apollo Federation v2 subgraph driver wrapper.
- `ApolloGqlGraphQLModule.forRoot({ orphanedTypes? })`.
- GraphQL path: `/graphql`; introspection always on (required for gateway schema composition); old Playground disabled, Apollo Sandbox enabled.

### `HealthModule`

- Source: `src/health/health.module.ts`
- Unified health module; controller selection is driven by `AppType`.
  - `AppType.REST` / `AppType.GQL` → HTTP controller, endpoints `/health`, `/health/live`, `/health/ready`.
  - `AppType.GRPC` → gRPC controller implementing `grpc.health.v1.Health`.
- `HealthModule.forRoot({ appType, healthcheckIndicators? })`.
- Built-in indicator: `TypeOrmHealthcheckIndicator` (opt-in).

### `GracefulShutdownModule`

- Source: `src/graceful-shutdown/graceful-shutdown.module.ts`
- Implements `BeforeApplicationShutdown`; runs registered callbacks in order before the process exits.
- Services register shutdown hooks via `GracefulShutdownService.registerShutdownCallback(fn)`.

### `ClientRegistrationModule`

- Source: `src/registry-service/client-registration.module.ts`
- Registers and deregisters the service with `registry-service` over HTTP on startup / shutdown.
- `ClientRegistrationModule.forRoot(options: ServiceInitializationOptions)` — global.
- Uses `ModuleInitializerClientService`; deregistration is wired via `GracefulShutdownService`.

### `ConfigModule`

- Source: `src/config/config.module.ts`
- Thin wrapper around `@nestjs/config` — re-exported so services don't import NestJS config directly.

---

## ORM Utilities

| File                               | Purpose                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/orm/base.entity.ts`           | Base TypeORM entity with shared columns (id, createdAt, updatedAt)                            |
| `src/orm/base.repository.ts`       | Base repository with typed helpers                                                            |
| `src/orm/snake-naming.strategy.ts` | Converts camelCase entity field names to snake_case DB columns                                |
| `src/orm/migration/`               | CLI helpers: `run-migrations`, `undo-migration`, `undo-all-migrations`, `migration.config.ts` |

---

## Auth Utilities

| Export                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `JwtStrategy`           | Validates access tokens (`AT_SECRET`)                    |
| `JwtRtStrategy`         | Validates refresh tokens (`RT_SECRET`)                   |
| `JwtGuard`              | REST route guard                                         |
| `GqlAuthGuard`          | GraphQL resolver guard                                   |
| `JwtRtGuard`            | Refresh-token route guard                                |
| `@CurrentUser()`        | Parameter decorator — extracts user from JWT payload     |
| `setRefreshTokenCookie` | Utility to write the refresh token as an HttpOnly cookie |

---

## gRPC Utilities

| Export                               | Purpose                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `@GrpcClient(name)`                  | Decorator to inject a registered gRPC client            |
| `GrpcRegistryClientService`          | Client stub for `registry-service` gRPC calls           |
| `getGrpcServiceInjectionToken(name)` | Returns the NestJS injection token for a service client |
| `getProtoPath(name)`                 | Resolves `.proto` file path for a service name          |

---

## Environment Variables

| Variable            | Required by       | Notes                                                      |
| ------------------- | ----------------- | ---------------------------------------------------------- |
| `LOG_LEVEL`         | `AppLoggerModule` | e.g. `info`, `debug`                                       |
| `LOG_PRETTY`        | `AppLoggerModule` | `true` for pino-pretty output                              |
| `AT_SECRET`         | `AuthModule`      | JWT access-token secret                                    |
| `RT_SECRET`         | `AuthModule`      | JWT refresh-token secret (when `enableRefreshToken: true`) |
| `DB_CONNECTION_URL` | `OrmDbModule`     | PostgreSQL connection URL                                  |
| `APP_NAME`          | `OrmDbModule`     | Set as `applicationName` in Postgres                       |

---

## Adding to This Package

1. Infrastructure only — no service-specific business logic.
2. After changes: `pnpm --filter @packages/nest-shared build`, then rebuild all consuming services.
3. Test in both `users-service` and `auth-service` before merging.

---

## Cross-References

- [[users-service]] — primary consumer
- [[auth-service]] — primary consumer
- `@packages/grpc` — generated proto stubs imported by gRPC utilities here
- `@packages/shared-types` — `SystemError`, enums shared across packages
