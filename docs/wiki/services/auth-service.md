---
updated: 2026-04-21
type: service
sources:
  - apps/auth-service/CLAUDE.md
  - docs/raw/apps-auth-service.md
  - apps/auth-service/src/session/use-case/command/refresh-tokens.command.ts
tags: [service, graphql, grpc, postgres, auth, jwt]
---

# auth-service

Authentication and session service. Dual-transport: GraphQL subgraph + gRPC server.
Database: PostgreSQL via TypeORM.

## Ports

| Transport                            | Port |
| ------------------------------------ | ---- |
| GraphQL (Apollo Federation subgraph) | 4303 |
| gRPC                                 | 4503 |

Entrypoints: `src/graphql.main.ts` (GraphQL) and `src/grpc.main.ts` (gRPC).

## Responsibilities

**In scope:**

- Own account credentials (`email`, hashed password, status)
- Create and persist sessions (`sessionId`, `appType`, refresh token storage)
- Issue JWT access + refresh token pairs
- Validate token refresh via gRPC (`ValidateToken` → `userId`, `roles`)
- Register service transports in [[registry-service]]
- Health probes for both transports
- Coordinate user profile creation in [[users-service]] during sign-up (gRPC)

**Out of scope:**

- User profile/domain data → [[users-service]]
- API edge routing / aggregation → [[api-gateway-service]]
- Role/permission policy management

## Architecture

Two independent NestJS apps sharing a base module:

```
src/graphql.main.ts  →  GraphqlModule
src/grpc.main.ts     →  GrpcModule
                            ↕
                       AppBaseModule
          (config, logger, ORM, SharedModule)
```

### Module layout

Per `docs/raw/apps-auth-service.md §5`:

```
src/
  app-base.module.ts         # shared runtime foundation
  graphql.module.ts          # GraphQL process composition
  grpc.module.ts             # gRPC process composition
  account/
    account.graphql.module.ts  # GraphQL adapter layer for account use-cases
  session/
    session.grpc.module.ts     # gRPC adapter layer for session use-cases
  shared/
    shared.module.ts           # domain repos, services, integration clients
    domain/
      entities/               # Account, Session entities
      repositories/           # AccountRepository, SessionRepository
    client-services/
      users.client-service.ts # gRPC client to users-service
```

## Public interfaces

### GraphQL

- Schema contracts: `packages/graphql-definitions/src/account/*`
- Transport adapters: `src/account/graphql/mutations/*`
- Operations: `signUp`, `signIn` mutations

### gRPC

- Proto: `packages/grpc/protobufs/auth_service.proto` — implements `AuthService`
- Endpoints: `src/session/grpc/controllers/*`
- Key operation: `RefreshTokens` — called by other services to refresh JWT pairs
- Keep `ValidateToken` response payload minimal: `userId` and `roles` only

## Key request flows

### `signUp` (GraphQL)

1. `AccountMutation.signUp` receives `SignUpInput`
2. `SignUpCommandProcessor` checks email uniqueness
3. Password hashed with bcrypt (`saltRounds=10`)
4. `Account` row persisted
5. `UsersClientService.createUser(...)` called on [[users-service]] via gRPC
6. `Session` row created with `appType=WEB`
7. JWT pair generated via `AuthService.getTokens(...)`
8. Session `refreshTokenHash` updated
9. `refreshToken` set as HTTP-only cookie; access token returned

### `signIn` (GraphQL)

1. `x-app-type` header extracted (`admin` or `web`)
2. `SignInCommandProcessor` validates account, password, and status
3. New session created for the requested app type
4. Token pair generated; session token storage updated
5. Refresh cookie set; access token returned

### `RefreshTokens` (gRPC)

1. `AuthController.refreshTokens` maps request to command
2. `RefreshTokensCommandProcessor` validates session exists, belongs to `accountId`, stored token matches, account is active
3. New token pair generated; stored refresh token updated
4. Returns both access + refresh tokens

## Token and session conventions

- **Access tokens:** short-lived JWT, signed with `AT_SECRET`
- **Refresh tokens:** signed with `RT_SECRET`, sent to the client as an HTTP-only cookie; rotated on every use — previous token invalidated immediately
- `Session.refreshTokenHash` stores the raw refresh token value (field name is misleading — no hash). On token rotation, the incoming cookie value is compared by equality against the stored field (`oldRefreshToken === session.refreshTokenHash`)

**Refresh token cookie settings:**

- `httpOnly: true`, `sameSite: strict`
- `secure` only when `NODE_ENV=prod`
- `path: /auth/refresh`

## Data & persistence

| Entity    | Location                      |
| --------- | ----------------------------- |
| `Account` | `src/shared/domain/entities/` |
| `Session` | `src/shared/domain/entities/` |

Repositories: `AccountRepository`, `SessionRepository` in `src/shared/domain/repositories/`.

Migrations: `src/migrations/` — separate PostgreSQL database from [[users-service]].
Use `DB_CONNECTION_URL` pointed at the auth database. See project migrations rules.

## Configuration

| Variable                         | Required | Default/Example         | Purpose                                |
| -------------------------------- | -------- | ----------------------- | -------------------------------------- |
| `APP_NAME`                       | Yes      | `auth-service`          | Service identity                       |
| `APP_GRAPHQL_PORT`               | Yes      | `4303`                  | GraphQL HTTP bind port                 |
| `APP_GRPC_PORT`                  | Yes      | `4503`                  | gRPC bind port                         |
| `AUTH_SERVICE_GRAPHQL_URL`       | Yes      | `http://localhost:4303` | Registry-advertised GraphQL host       |
| `AUTH_SERVICE_GRPC_URL`          | Yes      | `0.0.0.0:4503`          | Registry-advertised gRPC host          |
| `INTERNAL_REGISTRY_SERVER_HOST`  | Yes      | `http://localhost:4100` | Registry service base URL              |
| `DB_CONNECTION_URL`              | Yes      | —                       | Postgres connection string (auth DB)   |
| `AT_SECRET`, `RT_SECRET`         | Yes      | —                       | JWT signing secrets (access / refresh) |
| `AT_EXPIRES_IN`, `RT_EXPIRES_IN` | Yes      | —                       | Token TTL values                       |
| `COOKIES_MAX_AGE`                | Yes      | `604800000`             | Refresh-cookie max age (ms)            |
| `LOG_LEVEL`                      | Yes      | `debug`                 | nestjs-pino verbosity                  |
| `LOG_PRETTY`                     | No       | `true`                  | Pretty-print logs                      |

Template: `apps/auth-service/.env.example`

## Observability

- **Logging:** `nestjs-pino` via `AppLoggerModule`
- **Health:** `/health`, `/health/live`, `/health/ready` (HTTP); `grpc.health.v1.Health` (gRPC); readiness includes DB check via `TypeOrmHealthcheckIndicator`
- **Metrics / Tracing:** not instrumented

## Testing

- Unit tests colocated with source (`*.spec.ts`)
- Covered: `sign-up.command.spec.ts`, `sign-in.command.spec.ts`, `refresh-tokens.command.spec.ts`

## Known issues

- `Session.refreshTokenHash` field name is misleading — stores the raw token, not a hash
- Sign-up flow lacks explicit transaction/compensation: account creation + users-service call + session creation are not atomic

## Related

- [[users-service]] — user profile domain; called during sign-up via gRPC `CreateUser`
- [[api-gateway-service]] — federates GraphQL subgraphs; consumes this service's subgraph
- [[packages/nest-shared]] — shared NestJS modules (config, logger, ORM, health, registry, gRPC utils)
- [[packages/grpc]] — protobuf contracts and generated gRPC types
- [[packages/graphql-definitions]] — shared GraphQL DTOs / schema contracts
- [[packages/shared-types]] — shared enums, error types used in command flows
