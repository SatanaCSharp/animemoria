# registry-service

In-memory service registry for the AniMemoria platform. Exposes a REST API that other services use to register, deregister, and discover each other's connection details at runtime.

## 1) Service purpose

`registry-service` owns the runtime service discovery state for the platform. Each running service registers its host address on startup and removes it on shutdown; the registry acts as the single source of truth for where each service can be reached. The service exposes a REST API only — there is no GraphQL or gRPC interface. All state is held in a process-level in-memory map, so there is no database and all registrations are lost on restart.

## 2) Responsibilities and boundaries

### In scope

- Storing and managing `ServiceDescription` records (`serviceId`, `serviceName`, `host`) keyed by `AppType` (`rest`, `gql`, `grpc`)
- Serving lookup queries: by app type, by service ID, and by one or more service names
- Registering and unregistering services via REST

### Out of scope

- Persistence across restarts (no database; purely in-process)
- Health-checking or liveness monitoring of registered services
- Authentication or authorization of registration requests
- Service configuration beyond host address

## 3) High-level architecture

`registry-service` runs a single NestJS REST application. There is no dual-runtime model — gRPC and GraphQL transports are absent.

Module composition:

- `ConfigModule` and `AppLoggerModule` are loaded as global modules
- `SharedModule` is a global module that provides `RegistryRepository` to the entire application
- `RegistryRestModule` composes the REST transport adapter with the use-case layer
- `UseCaseModule` registers all command and query processors as NestJS providers
- `HealthModule` is mounted for readiness and liveness probes

Other services interact with this service through `ModuleInitializerClientService` from `packages/nest-shared`.

## 4) Runtime entrypoints and bootstrap flow

### REST runtime (`src/rest.main.ts`)

1. `NestFactory.create(RestModule)` initializes the application
2. `APP_REST_PORT` environment variable is read and asserted to be defined
3. `app.listen(port)` starts accepting connections

## 5) App modules and responsibilities

- `RestModule` (`src/rest.module.ts`): root application module; imports global config, logger, health, `SharedModule`, and `RegistryRestModule`.
- `SharedModule` (`src/shared/shared.module.ts`): global module that provides and exports all repository providers.
- `RegistryRestModule` (`src/registry/registry.rest.module.ts`): composes the REST controller with the use-case module.
- `UseCaseModule` (`src/registry/use-case/use-case.module.ts`): registers and exports all command and query processor providers.

## 6) Public interfaces

This section is maintained as an interface inventory (source-of-truth pointers) rather than duplicating all operation signatures.

### Interface inventory (maintain here)

- **REST transport**
  - endpoints: `src/[module-name]/rest/[controllers]/*`
  - no gRPC contract — this service exposes no proto definition
  - no GraphQL contract — this service exposes no GraphQL schema

### Update policy

- REST route paths are defined directly in the REST controller and must be kept in sync with `ModuleInitializerClientService` in `packages/nest-shared`.

## 7) Internal request flows

### Register service

1. Controller receives `appType` path param and `ServiceDescription` body
2. Delegates to `RegisterServiceCommandProcessor.process`
3. `RegistryRepository` upserts the record into the in-memory map keyed by `serviceId`
4. Returns `void`

### Unregister service

1. Controller receives `appType` and `serviceId` path params
2. Delegates to `UnregisterServiceCommandProcessor.process`
3. `RegistryRepository` removes the entry from the map
4. Returns `void`

### Get services by app type

1. Controller receives `appType` path param
2. Delegates to `GetServiceDescriptionsByAppTypeQueryProcessor.process`
3. `RegistryRepository` returns all entries for that app type
4. Returns service descriptions list

### Get service by ID

1. Controller receives `appType` and `serviceId`
2. Delegates to `GetServiceDescriptionQueryProcessor.process`
3. `RegistryRepository` looks up by service ID; throws `SystemError` if not found
4. Returns service description

### Get services by names

1. Controller receives `appType` and a comma-separated list of service names
2. Delegates to `GetServiceDescriptionByNamesQueryProcessor.process`
3. `RegistryRepository` performs a set-based name lookup
4. Asserts result count matches requested name count; throws `SystemError` on mismatch
5. Returns service descriptions list

## 8) Data and persistence

### Entities

- No TypeORM entities — state is managed entirely in process memory

### Repositories

- `RegistryRepository`
- lives in `src/shared/domain/repositories/*`

## 9) Integrations

- **Other AniMemoria services (REST, inbound):** Services register on startup and unregister on shutdown via `ModuleInitializerClientService` from `packages/nest-shared`. The registry itself makes no outbound calls.

## 10) Service specific peculiarities

- No input validation guards or DTOs are applied on registration requests
- Queries that cannot find a requested resource throw `SystemError`, not mapped to HTTP 404 — callers receive a 500 response

## 11) Configuration and environment variables

| Variable        | Required | Default/example | Purpose                         |
| --------------- | -------- | --------------- | ------------------------------- |
| `APP_REST_PORT` | Yes      | `4100`          | Port the REST server listens on |
| `NODE_ENV`      | Optional | `development`   | Runtime environment label       |
| `LOG_PRETTY`    | Optional | `true`          | Enable pretty-printed Pino logs |
| `LOG_LEVEL`     | Optional | `debug`         | Minimum log level               |

For a complete template, see `apps/registry-service/.env.example`.

## 12) Observability

- **Logging:** `nestjs-pino` via `AppLoggerModule`.
- **Health checks:**
  - HTTP: `/health`, `/health/live`, `/health/ready`
  - Readiness indicates in-process state availability
- **Metrics:** no dedicated metrics exporter found.
- **Tracing:** no tracing instrumentation found.

## 13) Error handling strategy

- `SystemError` is thrown by repository and query processors when a requested resource does not exist
- No global exception filter mapping `SystemError` to HTTP status codes — unhandled `SystemError` results in a 500 response
- No `ApplicationError` hierarchy is used in this service

## 14) How to extend

### Add a new module

1. Create a feature folder under `src/` (e.g., `src/my-feature/`)
2. Add a use-case module with command and query processors
3. Add a REST adapter module with a controller
4. Import the REST adapter module into `RestModule`

### Add a new endpoint/operation

- Define the query or command processor in `src/registry/use-case/queries/` or `src/registry/use-case/commands/`
- Register the processor in the corresponding barrel
- Add the method to the REST controller
- Update `ModuleInitializerClientService` in `packages/nest-shared` if callers need the new operation

### Add a new integration client

1. Create an HTTP client adapter in `packages/nest-shared/src/registry-service/`
2. Register it as an injectable provider in the consuming service's module
3. Add the required environment variable to `.env.example`

## 15) Testing strategy

- `src/registry/use-case/commands/register-service.command.spec.ts` — unit test for `RegisterServiceCommandProcessor`
- `src/registry/use-case/commands/unregister-service.command.spec.ts` — unit test for `UnregisterServiceCommandProcessor`
- `src/registry/use-case/queries/get-service-description.query.spec.ts` — unit test for `GetServiceDescriptionQueryProcessor`
- `src/registry/use-case/queries/get-service-description-by-names.query.spec.ts` — unit test for `GetServiceDescriptionByNamesQueryProcessor`
- `src/registry/use-case/queries/get-service-descriptions-by-app-type.query.spec.ts` — unit test for `GetServiceDescriptionsByAppTypeQueryProcessor`

All tests are unit-level, using `@nestjs/testing` with mocked providers. No integration or E2E tests exist. `ServiceRegistryController` has no test coverage.

## 16) Known runtime constraints

- **No persistence** — all registrations are lost on process restart; services must re-register on every startup
- **No concurrent-write safety** — the in-memory map has no locking; concurrent registrations from multiple service instances may produce inconsistent state
- **Missing HTTP error mapping** — `SystemError` thrown on missing records is not mapped to HTTP 404; callers receive a 500 response
- **No authentication** — any process that can reach the REST port can register or unregister any service
- **No TTL or stale-entry cleanup** — services that crash without calling unregister leave stale entries indefinitely

## 17) Related packages/apps in monorepo

- `apps/api-gateway-service` - consumes this registry to resolve upstream service URLs at runtime
- `apps/auth-service` - registers its gRPC and GraphQL runtimes with this service on startup
- `apps/users-service` - registers its gRPC and GraphQL runtimes with this service on startup
- `packages/nest-shared` - provides registry client (`ModuleInitializerClientService`), health, config, and logger modules
- `packages/shared-types` - provides `SystemError` used in error handling
- `packages/utils` - provides assertion utilities used in bootstrap and processors
