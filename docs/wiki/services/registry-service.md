---
updated: 2026-04-21
type: service
sources:
  - docs/raw/apps-registry-service.md
tags: [service, rest, nestjs, service-discovery]
---

# registry-service

In-memory service registry for the AniMemoria platform. Exposes a REST API that
other services use to register, discover, and deregister themselves at runtime.
No database — all state is process-local and lost on restart.

## Purpose

`registry-service` owns runtime service-discovery state for the platform.
Each running service calls into it on startup (register) and shutdown
(unregister). The registry is the single source of truth for where a service
can be reached. It stores `ServiceDescription` records (`serviceId`,
`serviceName`, `host`) keyed by `AppType` (`rest`, `gql`, `grpc`).

**Transport: REST only.** No gRPC, no GraphQL.

## Port

| Variable        | Default |
| --------------- | ------- |
| `APP_REST_PORT` | `4100`  |

## Module Structure

```
RestModule
├── ConfigModule (global)
├── AppLoggerModule (global)
├── HealthModule
├── SharedModule (global) → provides RegistryRepository
└── RegistryRestModule
    └── UseCaseModule (commands + query processors)
```

- `SharedModule` — provides `RegistryRepository` to the whole app
- `RegistryRestModule` — composes the REST controller with use-case layer
- `UseCaseModule` — registers all command and query processors as NestJS providers

Single entrypoint: `src/rest.main.ts`.

## Public REST API

Routes are defined in the REST controller under
`src/registry/rest/`. The companion client is
`ModuleInitializerClientService` in [[packages/nest-shared]] — keep them in sync.

| Operation          | Description                                        |
| ------------------ | -------------------------------------------------- |
| Register service   | `POST /:appType` — upsert a `ServiceDescription`   |
| Unregister service | `DELETE /:appType/:serviceId` — remove entry       |
| Get by app type    | `GET /:appType` — list all for that transport type |
| Get by service ID  | `GET /:appType/:serviceId` — single lookup         |
| Get by names       | `GET /:appType?names=…` — multi-name set lookup    |

## Request Flows

**Register** → controller → `RegisterServiceCommandProcessor` → `RegistryRepository.upsert`

**Unregister** → controller → `UnregisterServiceCommandProcessor` → `RegistryRepository.delete`

**Get by app type** → controller → `GetServiceDescriptionsByAppTypeQueryProcessor` → repository range scan

**Get by ID** → controller → `GetServiceDescriptionQueryProcessor` → repository point lookup; throws `SystemError` if missing

**Get by names** → controller → `GetServiceDescriptionByNamesQueryProcessor` → set-based lookup; asserts result count matches requested count; throws `SystemError` on mismatch

## Configuration

| Variable        | Required | Default       | Purpose                   |
| --------------- | -------- | ------------- | ------------------------- |
| `APP_REST_PORT` | Yes      | `4100`        | REST listen port          |
| `NODE_ENV`      | No       | `development` | Runtime environment label |
| `LOG_PRETTY`    | No       | `true`        | Pretty-print Pino logs    |
| `LOG_LEVEL`     | No       | `debug`       | Minimum log level         |

Full template: `apps/registry-service/.env.example`.

## Observability

- **Logging:** `nestjs-pino` via `AppLoggerModule`
- **Health:** `/health`, `/health/live`, `/health/ready`
- **Metrics:** none
- **Tracing:** none

## Error Handling

`SystemError` is thrown when a requested resource is not found.
**There is no global exception filter** mapping `SystemError` to HTTP 404 —
callers receive a `500` response. This is a known gap (see Known Constraints).

## Known Constraints

| Constraint                   | Impact                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| No persistence               | All registrations lost on process restart; every service must re-register on each startup            |
| No concurrent-write safety   | In-memory map has no locking; concurrent multi-instance registrations may produce inconsistent state |
| Missing HTTP error mapping   | `SystemError` from missing lookups yields HTTP 500, not 404                                          |
| No authentication            | Any process that can reach the REST port can register or deregister any service                      |
| No TTL / stale-entry cleanup | Crashed services that skip unregister leave stale entries indefinitely                               |

## Testing

All tests are unit-level using `@nestjs/testing` with mocked providers.
`ServiceRegistryController` has **no test coverage**.

| Test file                                            | Coverage                                        |
| ---------------------------------------------------- | ----------------------------------------------- |
| `register-service.command.spec.ts`                   | `RegisterServiceCommandProcessor`               |
| `unregister-service.command.spec.ts`                 | `UnregisterServiceCommandProcessor`             |
| `get-service-description.query.spec.ts`              | `GetServiceDescriptionQueryProcessor`           |
| `get-service-description-by-names.query.spec.ts`     | `GetServiceDescriptionByNamesQueryProcessor`    |
| `get-service-descriptions-by-app-type.query.spec.ts` | `GetServiceDescriptionsByAppTypeQueryProcessor` |

No integration or E2E tests exist.

## Related

- [[packages/nest-shared]] — provides `ModuleInitializerClientService` (registry client), health, config, and logger modules
- [[services/users-service]] — registers gRPC and GraphQL runtimes with this service on startup
- [[services/auth-service]] — registers gRPC and GraphQL runtimes with this service on startup
- `apps/api-gateway-service` — consumes this registry to resolve upstream service URLs at runtime
- `packages/shared-types` — provides `SystemError` used in error handling
- `packages/utils` — provides assertion utilities used in bootstrap and processors

## How to Extend

**New endpoint:** add a command/query processor in `src/registry/use-case/`, register in the barrel, add method to the REST controller, update `ModuleInitializerClientService` in [[packages/nest-shared]].

**New module:** create `src/<feature>/` with a use-case module and REST adapter module, import the adapter into `RestModule`.

**New integration client:** add an HTTP client adapter in `packages/nest-shared/src/registry-service/`, register as an injectable provider in the consuming service's module.
