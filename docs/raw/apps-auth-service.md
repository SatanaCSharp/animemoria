# auth-service

Authentication domain service for AniMemoria. This service owns account credentials, session lifecycle, and token issuance across two transports:

- GraphQL runtime for sign-up/sign-in flows
- gRPC runtime for token refresh flow

## 1) Service purpose

`auth-service` authenticates accounts and issues JWT access/refresh tokens. It persists account credentials and per-device/per-app sessions, and coordinates user-profile creation in `users-service` during sign-up.

## 2) Responsibilities and boundaries

### In scope

- Manage auth account credentials (`email`, hashed password, status)
- Create and persist sessions (`sessionId`, `appType`, refresh token storage field)
- Issue JWT tokens (access + refresh)
- Validate refresh-token flow through gRPC
- Register service endpoints in the registry service

### Out of scope

- User profile/domain data (delegated to `users-service` via gRPC)
- API gateway routing and public edge concerns
- Role/permission policy management

## 3) High-level architecture

- **Runtime model:** two independent NestJS apps in one package:
  - `src/graphql.main.ts` -> `GraphqlModule`
  - `src/grpc.main.ts` -> `GrpcModule`
- **Shared core (`AppBaseModule`):**
  - global config (`ConfigModule`)
  - structured logging (`AppLoggerModule` / `nestjs-pino`)
  - TypeORM/Postgres (`OrmDbModule`)
  - global shared providers (`SharedModule`)
- **Module split:**
  - `account/*` and `session/*` are domain/use-case modules, not transport-bound cores.
  - Current adapters are GraphQL (`account/graphql/*`) and gRPC (`session/grpc/*`).
  - The same feature modules can be extended with additional adapters later (for example Kafka handlers or BullMQ processors) without changing core command processors.
- **Cross-service integration:** `UsersClientService` (gRPC client to `users-service`)

## 4) Runtime entrypoints and bootstrap flow

### GraphQL runtime (`src/graphql.main.ts`)

1. `NestFactory.create(GraphqlModule)`
2. Read `APP_GRAPHQL_PORT` (must be defined)
3. Listen on HTTP port
4. Enable shutdown hooks

### gRPC runtime (`src/grpc.main.ts`)

1. Read `APP_GRPC_PORT` (must be defined)
2. `NestFactory.createMicroservice(GrpcModule, getServerGrpcOption('auth-service', ...))`
3. Listen as gRPC microservice
4. Enable shutdown hooks

### Shared bootstrap pieces

- `ClientRegistrationModule` registers the running transport (`GQL` or `GRPC`) in registry service at module init
- `GracefulShutdownService` runs unregister callbacks before shutdown
- Health modules are enabled for both transports with DB readiness checks

## 5) App modules and responsibilities

- `AppBaseModule` (`src/app-base.module.ts`): shared runtime foundation for both app processes (configuration, logging, DB wiring, shared providers).
- `GraphqlModule` (`src/graphql.module.ts`): GraphQL process composition for auth account operations and GraphQL-facing bootstrap concerns.
- `GrpcModule` (`src/grpc.module.ts`): gRPC process composition for session token refresh operations and gRPC-facing bootstrap concerns.
- `SharedModule` (`src/shared/shared.module.ts`): domain repositories/services and internal integration clients reused across transports.
- `AccountGraphqlModule` (`src/account/account.graphql.module.ts`): GraphQL adapter layer for account-related use-cases.
- `SessionGrpcModule` (`src/session/session.grpc.module.ts`): gRPC adapter layer for session-related use-cases.

## 6) Public interfaces

This section is intentionally source-of-truth oriented (paths, not duplicated operation catalogs) to reduce staleness.

### Interface inventory (maintain here)

- **GraphQL transport**
  - endpoints: `src/[module-name | entity-name]/graphql/[mutations | queries]/*`
  - contracts: `packages/graphql/definitions/src/[module-name]/*`
- **gRPC transport**
  - endpoints: `src/[module-name | entity-name]/grpc/controllers/*`
  - contracts: `packages/grpc/protobufs/[service_name].proto`

### Update policy

- When adding/changing operations, update the contract files first (`packages/graphql/definitions` or `packages/grpc/protobufs`), then transport adapters in this service.
- Keep this README at the interface-source level; avoid listing every operation signature here.

## 7) Internal request flows

### GraphQL `signUp`

1. `AccountMutation.signUp` receives `SignUpInput`
2. `SignUpCommandProcessor` checks email uniqueness
3. Password hashed with bcrypt (`saltRounds=10`)
4. Account persisted (`accounts`)
5. Calls `UsersClientService.createUser(...)` on `users-service` (gRPC)
6. Creates `sessions` row with `appType=WEB`
7. Generates JWT pair via `AuthService.getTokens(...)`
8. Updates session `refreshTokenHash` field
9. Sets `refreshToken` HTTP-only cookie and returns access token

### GraphQL `signIn`

1. `AccountMutation.signIn` reads `x-app-type` header via `extractAppTypeFromRequest`
2. `SignInCommandProcessor` validates account + password + status
3. Creates new session with requested app type
4. Generates token pair and updates session token storage field
5. Sets refresh cookie and returns access token

### gRPC `RefreshTokens`

1. `AuthController.refreshTokens` maps request to command
2. `RefreshTokensCommandProcessor` validates:
   - session exists
   - session belongs to `accountId`
   - stored refresh token value exists
   - incoming refresh token matches stored value
   - account exists and is active
3. Generates new token pair and updates stored refresh token value
4. Returns both access + refresh tokens

## 8) Data and persistence

### Entities

- `Account`
- `Session`
- lives in `src/shared/domain/entities/*`

### Repositories

- `AccountRepository`
- `SessionRepository`
- lives in `src/shared/domain/repositories/*`

## 9) Integrations

- **`users-service` (gRPC):** used during sign-up to create a user profile linked to the new account (`src/shared/client-services/users.client-service.ts`, contract in `packages/grpc/protobufs/users_service.proto`).
- **Registry service (HTTP):** used for transport registration on startup and unregistration on shutdown through shared registry module wiring.
- **Operational behavior:** database connection retry/timeout settings are configured in OrmDbModule; integration failures are logged by service lifecycle modules.

## 10) Service specific peculiarities

- Passwords are hashed with bcrypt before persistence.
- JWT access/refresh tokens signed using `AT_SECRET` and `RT_SECRET`; expiry via `AT_EXPIRES_IN` / `RT_EXPIRES_IN`.
- Refresh token cookie:
  - `httpOnly: true`
  - `sameSite: 'strict'`
  - `secure` depends on `NODE_ENV` (`prod` only)
  - `path: '/auth/refresh'`
- GraphQL sign-in requires `x-app-type` header (`admin` or `web`).
- `AuthModule` provides JWT guards/strategies, but no resolver/controller `@UseGuards(...)` usage in this service code.

## 11) Configuration and environment variables

| Variable                         | Required            | Default/example          | Purpose                                    |
| -------------------------------- | ------------------- | ------------------------ | ------------------------------------------ |
| `APP_NAME`                       | Yes                 | `auth-service`           | Service identity (registry + DB app name). |
| `APP_GRAPHQL_PORT`               | Yes (GraphQL)       | `4303`                   | GraphQL HTTP bind port.                    |
| `APP_GRPC_PORT`                  | Yes (gRPC)          | `4503`                   | gRPC bind port.                            |
| `AUTH_SERVICE_GRAPHQL_URL`       | Yes (registry/GQL)  | `http://localhost:4303`  | Registry host for GraphQL endpoint.        |
| `AUTH_SERVICE_GRPC_URL`          | Yes (registry/gRPC) | `0.0.0.0:4503`           | Registry host for gRPC endpoint.           |
| `INTERNAL_REGISTRY_SERVER_HOST`  | Yes                 | `http://localhost:4100`  | Registry service base URL.                 |
| `DB_CONNECTION_URL`              | Yes                 | _empty in sample_        | Postgres connection string.                |
| `AT_SECRET`, `RT_SECRET`         | Yes                 | `at_secret`, `rt_secret` | JWT signing secrets.                       |
| `AT_EXPIRES_IN`, `RT_EXPIRES_IN` | Yes                 | environment-defined      | Access/refresh token TTL values.           |
| `COOKIES_MAX_AGE`                | Yes                 | `604800000`              | Refresh-cookie max age (ms).               |
| `LOG_LEVEL`                      | Yes                 | `debug`                  | Log verbosity.                             |
| `LOG_PRETTY`                     | Optional            | `true`                   | Pretty logging toggle (`false` fallback).  |

For a complete template, see `apps/auth-service/.env.example`.

## 12) Observability

- **Logging:** `nestjs-pino` via `AppLoggerModule`; contextual logs in DB/registry modules.
- **Health checks:**
  - HTTP: `/health`, `/health/live`, `/health/ready`
  - gRPC: standard `grpc.health.v1.Health` (`check`, `watch`)
  - readiness includes DB check through `TypeOrmHealthcheckIndicator`
- **Metrics:** no dedicated metrics exporter/instrumentation found.
- **Tracing:** no tracing instrumentation found.

## 13) Error handling strategy

- Command processors use assertions (`assert`, `assertDefined`) and throw domain-level errors (`ApplicationError`, `SystemError`) for invalid credentials/session/account state.
- Integration failures (e.g., registry registration) are logged in some lifecycle hooks.

## 14) How to extend

### Add a new module

1. Create feature folder under `src/<feature>`
2. Add use-case module and processors
3. Add transport adapter module (GraphQL resolver or gRPC controller)
4. Import feature module in `GraphqlModule` and/or `GrpcModule`
5. Register shared providers in `SharedModule` if cross-feature reuse is needed

### Add a new endpoint/operation

- **GraphQL**
  1. Add DTO/interface definitions in `packages/graphql/definitions`
  2. Implement resolver method under `src/account/graphql/*` (or new feature module)
  3. Wire processor provider in corresponding `use-case.module.ts`
- **gRPC**
  1. Update proto in `packages/grpc/protobufs/*.proto`
  2. Regenerate grpc package artifacts
  3. Implement controller method and processor
  4. Register controller/provider in feature module

### Add a new integration client

1. Create adapter in `src/shared/client-services`
2. Register it in `client-services.ts` and export through `SharedModule`
3. For gRPC clients, add service name to `GrpcClientModule.forRoot([...])`
4. Add resilience policies (timeouts/retries/circuit breaker) if required by reliability goals

## 15) Testing strategy

- Current automated tests are unit-focused command processor specs:
  - `sign-up.command.spec.ts`
  - `sign-in.command.spec.ts`
  - `refresh-tokens.command.spec.ts`

## 16) Known runtime constraints

- `refreshTokenHash` field name implies hashing, but current implementation stores raw refresh token and compares by equality.
- Sign-up flow lacks explicit transaction/compensation around account creation + users-service call + session creation.

## 17) Related packages/apps in monorepo

- `apps/api-gateway-service` - federated gateway and transport aggregation
- `apps/users-service` - user profile domain, called during sign-up
- `packages/grpc` - protobuf contracts and generated gRPC types
- `packages/graphql/definitions` - shared GraphQL DTOs/interfaces/types
- `packages/nest-shared` - shared NestJS modules (config, auth, ORM, health, registry, grpc)
- `packages/shared-types` - shared enums/errors/types used in command flows
