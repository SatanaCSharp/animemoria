---
updated: 2026-04-27
type: decision
status: accepted
tags:
  [architecture, monorepo, shared, packages, types, utils, backend, frontend]
---

# 2026-04-27 — Scope Tiers: Module → Shared → Package

## Context

AniMemoria is a monorepo with multiple NestJS services and two frontend apps. Code naturally gravitates toward different reuse levels: some things are used only within one module of one service; others are shared across modules within a service; still others need to be available to every service and app in the monorepo. Without a formal scoping policy, code either gets duplicated or is incorrectly promoted to a shared package, polluting it with service-specific concerns.

## Decision

Apply a three-tier scoping rule to all code — utilities, types, helpers, predicates, and any other reusable artefact.

### Tier 1 — Module-scoped (`src/<module>/`)

A piece of code belongs in the module it serves if **no other module in the same service currently uses it**. Do not promote to `shared/` speculatively; promote only when a second consumer appears.

```
apps/auth-service/src/session/
  use-case/commands/
    refresh-tokens.command.ts     # only session module uses this
```

### Tier 2 — Service-shared (`src/shared/`)

Code that is **reused across two or more modules within the same service app** lives in `src/shared/`. This includes:

| Sub-directory             | Contents                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `shared/domain/`          | Entities, repositories, domain services                                                                 |
| `shared/client-services/` | Outbound gRPC client wrappers                                                                           |
| `shared/types/`           | Service-local enums, interfaces, and type aliases                                                       |
| `shared/utils/`           | Helper functions used across multiple modules                                                           |
| `shared/predicates/`      | Business predicates reused across modules (see [[decisions/2026-04-27-predicate-placement-convention]]) |

`src/shared/` is **app-specific**. Code here may import service entities, NestJS decorators, or env-specific config. It must not be imported by another service.

```
apps/auth-service/src/shared/
  types/
    app-type.enum.ts              # AppType enum used by account + session modules
  utils/
    extract-app-type-from-headers.ts  # used by both GraphQL and gRPC transport layers
  domain/          # see decisions/2026-04-27-intra-service-layer-architecture
  client-services/ # see decisions/2026-04-27-grpc-client-services-pattern
```

### Tier 3 — Package-scoped (`packages/<package-name>`)

Code that is **reused across multiple independent services or apps** becomes a workspace package. The package must be free of any single-service concerns. Examples:

| Package                  | What lives there                                       |
| ------------------------ | ------------------------------------------------------ |
| `@packages/shared-types` | Cross-service enums, typed error hierarchy, `Maybe<T>` |
| `@packages/utils`        | Universal predicates, assert functions, type guards    |
| `@packages/nest-shared`  | NestJS infra modules (logging, ORM, gRPC, health)      |
| `@packages/grpc`         | Proto-generated gRPC bindings for all services         |
| `@packages/ui-shared`    | Shared React component library                         |

A package MUST NOT import from any `apps/*` path. A package MAY import from other packages.

### Promotion path

The explicit promotion path prevents premature abstraction:

```
src/<module>/          →  second module needs it  →  src/shared/
src/shared/            →  second service needs it  →  packages/<name>
```

Never skip a tier. If something starts in a module and two services suddenly need it, promote it directly to a package — but only after confirming the second real use case exists.

### Summary table

| Code lives in     | Rule                                            |
| ----------------- | ----------------------------------------------- |
| `src/<module>/`   | Used only within this module                    |
| `src/shared/`     | Used by ≥ 2 modules within the same service app |
| `packages/<name>` | Used by ≥ 2 independent services or apps        |

### Types and utils specifically

**Types (`src/shared/types/`):** service-local enums and interfaces that don't belong in `@packages/shared-types` because they reference service-specific concepts (e.g., `AppType` in auth-service references `admin`/`web` app types meaningful only to that service's HTTP layer).

**Utils (`src/shared/utils/`):** helper functions that combine service-local types or NestJS/Express APIs with universal utilities from `@packages/utils`. Example: `extractAppTypeFromHeaders` wraps `@packages/utils/asserts` + `@packages/utils/type-guards` + service-local `AppType` — too service-specific for a package, needed in both GraphQL and gRPC transport layers.

## Consequences

- Packages stay lean and free of service-specific concerns.
- `src/shared/` gives each service a well-defined "inner commons" without cross-service pollution.
- The explicit promotion path discourages premature extraction into packages.
- New engineers have one rule to apply: "who uses this today?" — not "who might use this?"

## Cross-references

- [[decisions/2026-04-27-intra-service-layer-architecture]]
- [[decisions/2026-04-27-grpc-client-services-pattern]]
- [[decisions/2026-04-27-predicate-placement-convention]]
- [[decisions/2026-04-27-package-audience-scoping]]
- [[packages/utils]]
- [[packages/shared-types]]
