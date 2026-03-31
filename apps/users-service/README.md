# users-service

User domain service for AniMemoria. This service currently runs two transports:

- GraphQL runtime for user queries/mutations (currently mock-style handlers)
- gRPC runtime for user creation backed by persistence

## 1) Service purpose

`users-service` owns user profile persistence (`users` table) and exposes user operations over GraphQL and gRPC. At present, the production-like write path is implemented through gRPC `CreateUser`, while GraphQL resolvers are scaffolded but not yet wired to use-cases or repository reads/writes.

## 2) Responsibilities and boundaries

### In scope

- Own and persist user profile data (`id`, `accountId`, `email`, `nickname`)
- Provide gRPC `CreateUser` operation
- Expose GraphQL `getUsers` and `createUser` schema operations
- Register running service instances in registry service
- Expose health probes for HTTP and gRPC runtimes

### Out of scope

- Authentication credentials, sessions, token lifecycle (owned by `auth-service`)
- API edge routing/aggregation (owned by `api-gateway-service`)
- Business REST endpoints in this app (not found)
- Metrics/tracing pipelines specific to this service (not found)

## 3) High-level architecture

- **Runtime model:** two independent NestJS entrypoints in one app:
  - `src/graphql.main.ts` -> `GraphqlModule`
  - `src/grpc.main.ts` -> `GrpcModule`
- **Shared core (`AppBaseModule`):**
  - global config (`ConfigModule`)
  - structured logging (`AppLoggerModule` / `nestjs-pino`)
  - TypeORM/Postgres (`OrmDbModule`)
  - global shared providers (`SharedModule`)
- **Module split:**
  - GraphQL adapters in `src/users/graphql/*`
  - gRPC adapters in `src/users/grpc/*`
  - use-case processor(s) in `src/users/use-case/*`
  - domain entities/repositories in `src/shared/domain/*`

## 4) Runtime entrypoints and bootstrap flow

### GraphQL runtime (`src/graphql.main.ts`)

1. `NestFactory.create(GraphqlModule)`
2. Read `APP_GRAPHQL_PORT` (must be defined)
3. Listen on HTTP port
4. Enable shutdown hooks

### gRPC runtime (`src/grpc.main.ts`)

1. Read `APP_GRPC_PORT` (must be defined)
2. `NestFactory.createMicroservice(GrpcModule, getServerGrpcOption('users-service', '0.0.0.0:${port}'))`
3. Listen as gRPC microservice
4. Enable shutdown hooks

### Shared bootstrap pieces

- `ClientRegistrationModule` registers the running transport (`GQL` or `GRPC`) in registry service at module init
- `GracefulShutdownService` runs unregister callbacks before shutdown
- Health modules are enabled for both transports with DB readiness checks
-

## 5) App modules and responsibilities

- `AppBaseModule` (`src/app-base.module.ts`): runtime foundation (config, logger, ORM, shared providers).
- `GraphqlModule` (`src/graphql.module.ts`): GraphQL process composition (`UsersGraphqlModule`, Apollo GraphQL module, health, registry registration).
- `GrpcModule` (`src/grpc.module.ts`): gRPC process composition (`UsersGrpcModule`, health, registry registration).
- `SharedModule` (`src/shared/shared.module.ts`): global repository providers (`UserRepository`).
- `UsersGraphqlModule` (`src/users/users.graphql.module.ts`): GraphQL resolver providers (`UserQuery`, `UserMutation`).
- `UsersGrpcModule` (`src/users/users.grpc.module.ts`): gRPC controllers + use-case module.
- `UseCaseModule` (`src/users/use-case/use-case.module.ts`): use-case providers (`CreateUserCommandProcessor`).

## 6) Public interfaces

This section is maintained as an interface inventory (source-of-truth pointers) rather than duplicating all operation signatures.

### Interface inventory (maintain here)

- **GraphQL transport**
  - endpoints: `src/[module-name | entity-name]/graphql/[mutations | queries]/*`
  - contracts: `packages/graphql/definitions/src/[module-name]/*`
- **gRPC transport**
  - endpoints: `src/[module-name | entity-name]/grpc/controllers/*`
  - contracts: `packages/grpc/protobufs/[service_name].proto`

### Update policy

- Contract-first workflow:
  - GraphQL: update `packages/graphql/definitions/src/[entity-name]/*` first.
  - gRPC: update `packages/grpc/protobufs/[service_name].proto` first, then regenerate `@packages/grpc`.
- After contract updates, adapt transport handlers in `src/[entity-name]/graphql/*` or `src/[entity-name]/grpc/*`.
- Keep this README at inventory/flow level; do not list every resolver/controller method signature.

## 7) Internal request flows

### gRPC `CreateUser` (implemented persistence flow)

1. `UsersController.createUser(request)` receives `CreateUserRequest`.
2. Delegates to `CreateUserCommandProcessor.process(command)`.
3. Processor delegates to `UserRepository.create(command)`.
4. `BaseRepository.create()` creates and saves TypeORM entity.
5. Response returns persisted `id`, `accountId`, `email`, `nickname`.

### GraphQL `createUser` (currently not wired to persistence)

1. `UserMutation.createUser(input)` receives `CreateUserInput`.
2. Returns a mocked object (`id: '_create_uuid'`) built from input.
3. Use-case/repository path is not called (not found).

### GraphQL `getUsers` (currently not wired to persistence)

1. `UserQuery.getUsers()` executes.
2. Returns hard-coded user list.
3. Repository read path is not called (not found).

## 8) Data and persistence

### Entities

- `User`
- lives in `src/shared/domain/entities/*`

### Repositories

- `UserRepository`
- lives in `src/shared/domain/repositories/*`

## 9) Integrations

- **Registry service (HTTP):**
  - via `ClientRegistrationModule` and `ModuleInitializerClientService`
  - reads `INTERNAL_REGISTRY_SERVER_HOST`
  - registers to `/registry/{appType}/register`
  - unregisters from `/registry/{appType}/unregister/{serviceId}`
- **Postgres (TypeORM):**
  - via `OrmDbModule.forRoot()` and `DB_CONNECTION_URL`
- **gRPC transport infra:**
  - `getServerGrpcOption()` includes service proto + health proto + reflection
  - source: `packages/nest-shared/src/grpc/grpc.utils.ts`
- **Outbound service clients in this app source:**
  - not found in `apps/users-service/src`

## 10) Service specific peculiarities

- Transport/runtime split exists, but capability is asymmetric:
  - gRPC write path persists data.
  - GraphQL operations are currently mock-return implementations.
- GraphQL `CreateUserInput` (`nickname`, `email`) does not include `accountId`, while DB schema requires non-null unique `account_id`.
- gRPC path currently has minimal command-level validation and no local conflict mapping for DB unique-constraint errors.

## 11) Configuration and environment variables

| Variable                        | Required                      | Default/example                        | Purpose                                                                  |
| ------------------------------- | ----------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV`                      | No (in sample)                | `local`                                | Runtime mode. Affects environment-dependent behavior in shared modules.  |
| `APP_NAME`                      | Yes                           | `users-service`                        | Service identity used by DB config and registry payloads.                |
| `APP_GRAPHQL_PORT`              | Yes (GraphQL runtime)         | `4302`                                 | HTTP bind port for GraphQL app.                                          |
| `APP_GRPC_PORT`                 | Yes (gRPC runtime)            | `4502`                                 | gRPC bind port for microservice app.                                     |
| `USERS_SERVICE_GRAPHQL_URL`     | Yes (for GQL registration)    | `http://localhost:4302`                | Registry-advertised GraphQL host; registry client appends `/graphql`.    |
| `USERS_SERVICE_GRPC_URL`        | Yes (for gRPC registration)   | `0.0.0.0:4502`                         | Registry-advertised gRPC host.                                           |
| `INTERNAL_REGISTRY_SERVER_HOST` | Yes (if registration enabled) | `http://localhost:4100`                | Registry service base URL for register/unregister calls.                 |
| `DB_CONNECTION_URL`             | Yes                           | empty in sample (`DB_CONNECTION_URL=`) | Postgres connection URL consumed by TypeORM module.                      |
| `LOG_LEVEL`                     | Yes                           | `debug`                                | Log verbosity for `nestjs-pino`.                                         |
| `LOG_PRETTY`                    | No                            | `true`                                 | Pretty-print logs when `'true'`; defaults to `'false'` in logger module. |

Source template: `apps/users-service/.env.example`

## 12) Observability

- **Logging:** enabled via `AppLoggerModule` (`nestjs-pino`).
- **Health checks:**
  - HTTP: `/health`, `/health/live`, `/health/ready` for HTTP transport.
  - gRPC: `grpc.health.v1.Health` `check/watch`.
  - Readiness includes DB ping through `TypeOrmHealthcheckIndicator`.
- **Metrics:** service-local metrics instrumentation not found.
- **Tracing:** service-local tracing/OpenTelemetry instrumentation not found.

## 13) Error handling strategy

- Command processors use assertions (`assert`, `assertDefined`) and throw domain-level errors (`ApplicationError`, `SystemError`) for invalid credentials/session/account state.
- Integration failures (e.g., registry registration) are logged in some lifecycle hooks.

## 14) How to extend

### Add a new module

1. Create feature folder under `src/<feature>`.
2. Add use-case module and processor providers (`src/<feature>/use-case/*`).
3. Add transport adapters (`src/<feature>/graphql/*` and/or `src/<feature>/grpc/*`).
4. Register module in `GraphqlModule` and/or `GrpcModule`.
5. Export shared providers through `SharedModule` only when cross-feature reuse is required.

### Add a new endpoint/operation

- **GraphQL**
  1. Define/update DTO/contracts in `packages/graphql/definitions/src/<feature>/*`.
  2. Implement resolver method in `src/<feature>/graphql/...`.
  3. Wire use-case processor and call it from resolver (current user resolvers are not yet wired).
- **gRPC**
  1. Update proto in `packages/grpc/protobufs/*.proto`.
  2. Regenerate `@packages/grpc` generated artifacts.
  3. Implement controller method and processor.
  4. Register controller/providers in module.

### Add a new integration client

1. Add client adapter under `src/shared` (or feature-local integration folder).
2. Register provider in an appropriate module (`SharedModule` for cross-feature use).
3. Add required env vars to `.env.example`.
4. Add unit tests for failure paths and startup behavior.

## 15) Testing strategy

- **Current state:**
  - Unit tests exist for `CreateUserCommandProcessor`:
    - `src/users/use-case/commands/create-user.command.spec.ts`
  - Jest config:
    - `jest.config.cjs` (`rootDir: './src'`)

## 16) Known runtime constraints

- GraphQL user operations currently return mock data and are not persistence-backed.
- Contract mismatch risk: GraphQL `CreateUserInput` lacks `accountId`, but DB requires unique non-null `account_id`.
- Unique-constraint errors from DB are not mapped to stable domain/API error contracts in app-local code.
- `migrationsRun: false` requires explicit migration execution in deployment/runtime workflows.

## 17) Related packages/apps in monorepo

- `apps/auth-service` - creates users via gRPC `UsersService.CreateUser`.
- `apps/api-gateway-service` - federates GraphQL subgraphs and fronts internal services.
- `packages/grpc` - protobuf contracts and generated gRPC interfaces/types.
- `packages/graphql/definitions` - shared GraphQL object/input/interface contracts.
- `packages/nest-shared` - shared Nest modules (config, logger, ORM, health, registry, gRPC utils).
- `packages/shared-types` - shared error and utility types used by shared infrastructure.
