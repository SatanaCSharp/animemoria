# @packages/nest-shared

Shared NestJS infrastructure package. Consumed by `*-service` only.  
**Do not import this package into any frontend app.**

## What's in here

- `LoggingModule` — structured Pino logger, preconfigured.
- `TypeOrmModule` wrappers — base entity, repository helpers.
- `AuthModule` — JWT strategy, guards reusable across services.
- `GrpcModule` — gRPC client factory, reflection setup.
- `HealthModule` — Terminus health check endpoints.

## Adding to this package

- Changes here affect **both** services simultaneously — test in both before merging.
- Do not add service-specific business logic. This is infrastructure only.
- After changes: `pnpm --filter @packages/nest-shared build` then rebuild consuming services.

## gRPC reflection

`GrpcModule` enables gRPC server reflection by default (useful for tools like `grpcurl` in dev).  
**Disable reflection in production** by passing `reflection: false` to `GrpcModule.forRoot(...)`, and verify in Helm values before deploying.
