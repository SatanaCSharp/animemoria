# API Gateway Service

`apps/api-gateway-service` is a NestJS gateway app that exposes:

- a REST API entrypoint
- a GraphQL Federation Gateway entrypoint

Both entrypoints share core infrastructure modules and client services, then diverge by transport-specific modules.

## Source Structure

```text
src/
  app-base.module.ts
  rest.main.ts
  rest.module.ts
  graphql.main.ts
  graphql.module.ts
  rest/
    rest-endpoints.module.ts
    controllers/
      auth.controller.ts
      controllers.ts
  gql/
    gql.module.ts
    subgraph.module.ts
    use-case/
      queries/
        get-subgraph-services.query.ts
  shared/
    shared.module.ts
    client-services/
      auth.client-service.ts
      registry.client-service.ts
      client-services.ts
```

## Runtime Architecture

The app has two independent bootstrap files:

- `src/rest.main.ts` starts REST (`RestModule`) on `APP_REST_PORT`
- `src/graphql.main.ts` starts GraphQL gateway (`GraphqlModule`) on `APP_GRAPHQL_PORT`

Common behavior in both bootstraps:

- validate required port env var
- configure CORS (`*` in non-production, `CORS_ORIGINS` in production)
- enable cookies via `cookie-parser`
- enable graceful shutdown hooks

Shared module composition:

- `src/app-base.module.ts` imports shared infra:
  - `ConfigModule.forRoot()`
  - `AppLoggerModule.forRoot()`
  - `HealthModule.forRoot(...)`
  - `SharedModule`
- `src/shared/shared.module.ts` provides reusable downstream clients:
  - gRPC auth client (`AuthClientService`)
  - HTTP registry client (`RegistryClientService`)

## REST Layer Organization (`src/rest`)

REST is organized as endpoint modules + controller registry:

- `src/rest/rest-endpoints.module.ts` collects and mounts REST controllers
- `src/rest/controllers/controllers.ts` exports `restControllers` array
- `src/rest/controllers/auth.controller.ts` contains the concrete handlers

Current endpoint:

- `POST /api/v1/auth/refresh`

How current REST request flow works (`auth/refresh`):

1. `JwtRtGuard` validates refresh token.
2. `@CurrentUser()` provides JWT refresh payload.
3. Controller calls `AuthClientService.refreshTokensRequest(...)` (gRPC to auth-service).
4. Response refresh token is written to cookie via `setRefreshTokenCookie(...)`.
5. Endpoint returns `{ accessToken }`.

REST auth helpers/guards come from `@packages/nest-shared/auth`.

## GraphQL Layer Organization (`src/gql`)

GraphQL is an Apollo Federation Gateway, not a local resolver schema.

Main GraphQL files:

- `src/gql/gql.module.ts` configures `GraphQLModule.forRootAsync` with `ApolloGatewayDriver`
- `src/gql/subgraph.module.ts` provides subgraph discovery use-case
- `src/gql/use-case/queries/get-subgraph-services.query.ts` fetches subgraph list from registry service

Subgraph discovery flow:

1. `GetSubgraphServicesQueryProcessor` calls `RegistryClientService`.
2. `RegistryClientService` requests `INTERNAL_REGISTRY_SERVER_HOST/registry/gql`.
3. Gateway composes runtime schema via `IntrospectAndCompose({ subgraphs })`.

Header forwarding from gateway to subgraphs (`willSendRequest`):

- always sets `apollo-require-preflight: true`
- forwards `x-app-type` when present
- forwards `authorization` when present
- forwards `cookie` when present

GraphQL context currently passes through `{ req, res }`.

## How To Add A New REST Endpoint

Use this workflow for new REST endpoints under `src/rest`:

1. Create or update a controller in `src/rest/controllers/` (for example `users.controller.ts`).
2. Add route handlers with Nest decorators (`@Get`, `@Post`, `@Patch`, etc.).
3. Apply auth when needed using `@packages/nest-shared/auth` guards/decorators.
4. If downstream communication is needed:
   - add/extend gRPC or HTTP client service in `src/shared/client-services/`
   - register it in `src/shared/client-services/client-services.ts` if new
5. Register the controller in `src/rest/controllers/controllers.ts` by adding it to `restControllers`.
6. Ensure endpoint behavior (cookies, headers, return shape, errors) follows existing controller conventions.
7. Test endpoint under REST prefix: `/api/v1/<controller>/<route>`.

Notes:

- Health routes are excluded from global prefix (`/health`, `/health/live`, `/health/ready`).
- Keep controllers thin; delegate downstream calls to client services.

## How To Add A New GraphQL Endpoint/Operation

In this project, most GraphQL operations are added in downstream subgraphs (not in this gateway).

Recommended workflow:

1. Implement schema + resolver in the target subgraph service (for example users-service/auth-service).
2. Register/update that subgraph in registry-service so it is discoverable as `AppType.GQL`.
3. Ensure gateway can reach the subgraph URL and introspect schema.
4. Restart gateway if needed so composed schema refreshes from `IntrospectAndCompose`.
5. If operation needs extra metadata, update forwarded headers in `src/gql/gql.module.ts`.
6. If operation needs gateway-level auth/context processing, extend `server.context` in `src/gql/gql.module.ts`.

Important: this gateway currently does not define local `@Resolver`/`@Query`/`@Mutation` endpoints. It composes and proxies subgraph operations.

## Key Files And Responsibilities

- `src/rest.main.ts`: REST bootstrap, CORS, cookies, global prefix
- `src/rest.module.ts`: REST application composition
- `src/rest/rest-endpoints.module.ts`: REST controllers module
- `src/rest/controllers/auth.controller.ts`: refresh token endpoint implementation
- `src/graphql.main.ts`: GraphQL bootstrap, CORS, cookies
- `src/graphql.module.ts`: top-level GraphQL app module
- `src/gql/gql.module.ts`: Apollo Gateway setup and request forwarding
- `src/gql/use-case/queries/get-subgraph-services.query.ts`: subgraph discovery use-case
- `src/shared/shared.module.ts`: globally shared clients
- `src/shared/client-services/auth.client-service.ts`: auth gRPC client
- `src/shared/client-services/registry.client-service.ts`: registry HTTP client
