# api-gateway-service

Apollo Federation gateway + REST façade. Ports: `:4301` (GraphQL) / `:4101` (REST).

## What this service does NOT do

- No TypeORM, no database, no migrations.
- No business logic — gateway composes subgraphs and proxies REST only.
- No gRPC transport.

## Supergraph composition

Subgraph URLs are fetched at runtime from `registry-service` (:4100). If the gateway fails to compose, check:

1. Is `registry-service` running?
2. Did both subgraphs register themselves successfully?
3. Run `pnpm --filter api-gateway-service dev` last in the startup sequence.

## REST façade

REST routes in `src/rest/` map to internal GraphQL or gRPC calls. Keep REST handlers thin — orchestration logic belongs in the downstream service.

## Apollo Server v5

`@apollo/server` is pinned to v5. Playground plugin peer-dep warnings are expected — do not attempt to resolve them by downgrading.
