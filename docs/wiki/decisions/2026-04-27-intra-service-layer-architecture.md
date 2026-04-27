---
updated: 2026-04-27
type: decision
status: accepted
tags:
  [nestjs, architecture, domain, use-case, transport, grpc, graphql, backend]
---

# 2026-04-27 — Intra-Service Layer Architecture

## Context

Every NestJS service in AniMemoria (currently [[services/users-service]] and [[services/auth-service]]) exposes the same domain over two transports: GraphQL (Apollo Federation subgraph) and gRPC. Without an explicit layer model, transport concerns bleed into business logic, business logic gets duplicated per transport, and domain types end up scattered. A repeatable three-layer pattern was needed that works for both single-transport and dual-transport services.

## Decision

Each service is structured in three distinct layers. A feature in `src/<module>/` owns the transport adapters and the use-case facade. Domain primitives shared across modules live in `src/shared/domain/`.

### Layer 1 — Domain (`src/shared/domain/`)

Holds **entities**, **repositories**, and **domain services** that encapsulate business operations reusable across multiple modules.

| Artefact       | Purpose                          | Example                               |
| -------------- | -------------------------------- | ------------------------------------- |
| Entity         | TypeORM-mapped domain object     | `Account`, `Session`, `User`          |
| Repository     | Typed DB access wrapper          | `AccountRepository`, `UserRepository` |
| Domain service | Multi-entity business operations | `AuthService` (token generation)      |

Rules:

- Entities MUST extend `BaseEntity`; constructor MUST accept `Partial<Entity>` and `Object.assign(this, data)`.
- Repositories MUST extend `BaseRepository<Entity>` and inject `DataSource`.
- Domain services MAY use repositories and external packages; MUST NOT reference transport types (gRPC `Metadata`, GraphQL `Context`).
- `SharedModule` wraps all domain providers and MUST be decorated `@Global()` so they are available everywhere without re-importing.

```
src/shared/
  shared.module.ts              # @Global(); exports all domain providers
  domain/
    entities/
      account.entity.ts
      session.entity.ts
    repositories/
      account.repository.ts
      session.repository.ts
      repositories.ts           # barrel array
    services/
      auth.service.ts           # token generation — reused by account + session modules
      services.ts               # barrel array
```

### Layer 2 — Use-case (`src/<module>/use-case/`)

A **transport-independent facade** that executes business logic. Each operation is a `CommandProcessor` (write) or a query class (read). The use-case layer is the only layer allowed to orchestrate domain services, repositories, and outbound client calls together.

Rules:

- Every command processor MUST implement `CommandProcessor<Command, Response>` and expose a single `async process()` method.
- MUST NOT contain any transport concern (no gRPC `Metadata`, no `@Req()`, no `GqlExecutionContext`).
- Barrel file `commands.ts` exports an array; `UseCaseModule` spreads it.

```
src/<module>/
  use-case/
    use-case.module.ts
    commands/
      commands.ts               # barrel array
      create-user.command.ts
      create-user.command.spec.ts
```

### Layer 3 — Transport (`src/<module>/graphql/` and `src/<module>/grpc/`)

Thin **adapter** classes that translate between the wire protocol and the use-case API. They contain no business logic.

| Transport | Class type                       | Responsibility                                 |
| --------- | -------------------------------- | ---------------------------------------------- |
| GraphQL   | Resolver (`@Query`, `@Mutation`) | Map GraphQL input → command → GraphQL response |
| gRPC      | Controller (`@GrpcMethod`)       | Map proto request → command → proto response   |

Rules:

- Delivery classes MUST delegate to `CommandProcessor` only — no inline business logic.
- gRPC controllers MUST implement the proto-generated interface AND carry `@{Entity}ServiceControllerMethods()`.
- GraphQL resolvers MUST extend interfaces from `@packages/graphql-definitions`.
- Barrel file `mutations.ts` / `queries.ts` / `controllers.ts` exports an array; the transport module spreads it.

```
src/<module>/
  <module>.graphql.module.ts
  <module>.grpc.module.ts
  graphql/
    mutations/
      mutations.ts              # barrel array
      account.mutation.ts
    queries/
      queries.ts                # barrel array
      account.query.ts
  grpc/
    controllers/
      controllers.ts            # barrel array
      auth.controller.ts
```

## Examples

### Canonical flow: `signUp` (auth-service)

```
AccountMutation (GraphQL transport)
  → SignUpCommandProcessor (use-case)
      → AccountRepository.create (domain)
      → AuthService.getTokens (domain service)
      → UsersClientService.createUser (client-services)
      → SessionRepository.create (domain)
```

No transport object crosses a layer boundary. `SignUpCommandProcessor` receives a plain `SignUpCommand` DTO and returns a plain result.

### Canonical flow: `createUser` (users-service)

```
UsersController (gRPC transport)
  → CreateUserCommandProcessor (use-case)
      → UserRepository.create (domain)
```

The same `CreateUserCommandProcessor` could be called from a GraphQL mutation resolver without any changes.

## Consequences

- Business logic is testable in isolation — unit tests for command processors require no transport mock.
- Adding a third transport (REST, WebSocket) touches only a new transport adapter; use-case and domain layers are unchanged.
- The barrel-array pattern keeps module declarations short and enforces the inventory of providers.
- Domain services placed in `src/shared/domain/services/` are available across all modules without re-importing.

## Cross-references

- [[services/auth-service]]
- [[services/users-service]]
- [[decisions/2026-04-27-scope-tiers-module-shared-package]]
- [[decisions/2026-04-27-grpc-client-services-pattern]]
- [[decisions/2026-04-27-predicate-placement-convention]]
- [[packages/nest-shared]]
