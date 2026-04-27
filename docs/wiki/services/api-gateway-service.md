---
updated: 2026-04-21
type: service
sources:
  - apps/api-gateway-service/CLAUDE.md
  - apps/api-gateway-service/src/graphql.main.ts
  - apps/api-gateway-service/src/rest.main.ts
  - apps/api-gateway-service/src/gql/gql.module.ts
  - apps/api-gateway-service/src/shared/client-services/auth.client-service.ts
  - apps/api-gateway-service/src/shared/client-services/registry.client-service.ts
  - apps/api-gateway-service/src/rest/controllers/auth.controller.ts
tags: [graphql, apollo-federation, rest, gateway, nestjs]
---

# api-gateway-service

Apollo Federation gateway and REST façade. The single public entry point for all client traffic — it composes subgraphs into a unified supergraph and exposes a thin REST layer for operations that cannot go through GraphQL.

**No database. No business logic. No gRPC transport.**

## Ports

| Transport                | Port    | Env var            |
| ------------------------ | ------- | ------------------ |
| GraphQL (Apollo Gateway) | `:4301` | `APP_GRAPHQL_PORT` |
| REST façade              | `:4101` | `APP_REST_PORT`    |

## Entrypoints

The service has two independent NestJS applications started from separate entrypoints:

- `graphql.main.ts` → `GraphqlModule` (AppBaseModule + GqlModule)
- `rest.main.ts` → `RestModule` (AppBaseModule + RestEndpointsModule)

Both share `AppBaseModule`, which wires up config, structured logging (`AppLoggerModule`), health checks (`HealthModule`), and the `SharedModule` (client services).

> Start the REST transport first when both need to be running locally — the REST app handles token refresh which clients may need before GraphQL calls.

## Supergraph Composition

Uses `IntrospectAndCompose` from `@apollo/gateway`. At startup, `GetSubgraphServicesQueryProcessor` fetches the list of registered GraphQL subgraphs from [[services/registry-service]] via HTTP (`GET /registry/gql`). The gateway then introspects each subgraph URL and composes the supergraph SDL.

**Startup dependency**: if the gateway fails to compose, the usual causes are:

1. `registry-service` is not running (check `:4100`)
2. A subgraph hasn't registered itself yet — restart it, then restart the gateway
3. Gateway was started before subgraphs — `api-gateway-service` must start last

## Header Forwarding

`RemoteGraphQLDataSource` forwards the following headers from inbound client requests to every subgraph:

| Header                     | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `authorization`            | JWT access token for authenticated resolvers   |
| `cookie`                   | Session/refresh token cookie                   |
| `x-app-type`               | Client app discriminator (e.g. `admin`, `web`) |
| `apollo-require-preflight` | CSRF bypass for Apollo (always set to `true`)  |

> **TODO** (in source): refactor to `UniversalGraphQLDataSource` to support authorized, anonymous, and admin user strategies. Context building for auth data and role permissions is also noted as pending.

## REST Façade

Global prefix: `api/v1`. Health endpoints (`/health`, `/health/live`, `/health/ready`) are excluded from the prefix.

### Endpoints

| Method | Path                   | Guard        | Description                    |
| ------ | ---------------------- | ------------ | ------------------------------ |
| `POST` | `/api/v1/auth/refresh` | `JwtRtGuard` | Rotate refresh + access tokens |

`AuthController` validates the inbound refresh token JWT via `JwtRtGuard`, then delegates to `AuthClientService` which calls [[services/auth-service]] over gRPC (`refreshTokens` RPC). The new refresh token is written as an `HttpOnly` cookie; the access token is returned in the JSON body.

Cookie security follows `NODE_ENV`: `secure` flag is set only in production.

## Client Services

| Service                 | Transport                                         | Purpose                                              |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `RegistryClientService` | HTTP (`@nestjs/axios`)                            | Fetch subgraph URLs from registry at gateway startup |
| `AuthClientService`     | gRPC (`@InjectGrpcServiceClient('auth-service')`) | Call `refreshTokens` on auth-service                 |

`AuthClientService` implements `OnModuleInit` and resolves the gRPC stub in `onModuleInit` from the injected `ClientGrpc`.

## CORS

| Environment                               | Allowed origins                         |
| ----------------------------------------- | --------------------------------------- |
| Development (`NODE_ENV !== 'production'`) | `*` (all origins)                       |
| Production                                | `CORS_ORIGINS` env var, comma-separated |

Both transports support `credentials: true`. The GraphQL transport additionally accepts `x-app-type`, `Content-Type`, `Authorization`, and `Apollo-Require-Preflight` headers; the REST transport accepts `Content-Type`, `Authorization`, and `Apollo-Require-Preflight`.

## Apollo Server Configuration

- Version: `@apollo/server` v5 (pinned — do not downgrade)
- `introspection: true` (always enabled — review for production security)
- Legacy playground disabled; replaced by `ApolloServerPluginLandingPageLocalDefault` (Apollo Sandbox embedded)
- Peer-dep warnings from `@apollo/server-plugin-landing-page-graphql-playground` are expected and safe to ignore

## Package Dependencies

| Package                   | Used for                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[packages/nest-shared]]  | `AppLoggerModule`, `ConfigModule`, `HealthModule`, `JwtRtGuard`, `@CurrentUser`, `setRefreshTokenCookie`, `InjectGrpcServiceClient`, `GraphQLContext`, `AppType`, `QueryProcessor` |
| [[packages/grpc]]         | `AuthServiceClient`, `AUTH_SERVICE_NAME`, `RefreshTokensRequest/Response` types                                                                                                    |
| [[packages/shared-types]] | `ApplicationError`, `SystemError`                                                                                                                                                  |
| [[packages/utils]]        | `assertDefined`, `isProd`                                                                                                                                                          |

## What This Service Does NOT Do

- No TypeORM, no database, no migrations — see [[services/users-service]] or [[services/auth-service]] for data persistence
- No business logic — orchestration lives in downstream services
- No gRPC server transport — it is a gRPC _client_ (to auth-service) only
- No federation entity resolvers — the gateway composes only; see GraphQL conventions in project rules
