---
updated: 2026-04-27
type: decision
status: accepted
tags: [packages, nest-shared, ui-shared, monorepo, scoping]
---

# 2026-04-27 — Package Audience Scoping

## Context

The monorepo has packages that are conceptually "shared" but differ in their valid consumers. Without explicit scoping rules, a NestJS service could accidentally import a React package (pulling in browser globals) or a frontend app could import a server-only NestJS module (pulling in Node.js internals and heavy DI machinery).

## Decision

Packages are grouped by intended consumer audience:

### NestJS-only

| Package                  | Notes                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [[packages/nest-shared]] | Logging, TypeORM setup, JWT auth, gRPC reflection, health checks, graceful shutdown. **Only `apps/users-service` and `apps/auth-service` may import this.** Never import into frontend apps or universal packages. |

### React-only

| Package                | Notes                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[packages/ui-shared]] | HeroUI + Tailwind v4 component library. **Only `apps/admin`, `apps/web`, and `apps/storybook` may import this.** Never import into NestJS services or universal packages. |

### Universal (all workspaces)

| Package                            | Notes                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [[packages/shared-types]]          | Enums, typed error hierarchy, `Maybe<T>`. Safe in any context.                                                                              |
| [[packages/utils]]                 | Runtime utilities (asserts, predicates, async primitives). No framework dependencies.                                                       |
| [[packages/grpc]]                  | Generated ts-proto bindings. Consumed by NestJS services and the gateway; may also be imported by universal packages that need proto types. |
| [[packages/tsconfig]]              | TypeScript base configs. Build-time only.                                                                                                   |
| [[packages/jest-config-preset]]    | Jest preset. Dev/test only.                                                                                                                 |
| [[packages/eslint-config-base]]    | ESLint foundation. Dev/test only.                                                                                                           |
| [[packages/eslint-config-ui]]      | ESLint for React apps. Dev/test only.                                                                                                       |
| [[packages/eslint-config-service]] | ESLint for NestJS services. Dev/test only.                                                                                                  |
| [[packages/graphql-definitions]]   | GraphQL contracts (backend-facing). Used by services that expose a subgraph and by codegen.                                                 |
| [[packages/graphql-generated]]     | Compiled schema + frontend codegen config. Consumed by frontend apps only in practice.                                                      |

## Enforcement

- ESLint import rules (see [[packages/eslint-config-service]] and [[packages/eslint-config-ui]]) catch cross-boundary imports at lint time.
- CI runs `pnpm lint` across all workspaces — a NestJS service importing `@packages/ui-shared` will fail the lint step.

## Consequences

- Clear dependency boundaries prevent accidental bundling of server-only or browser-only code.
- New packages must declare their audience in their `README.md` and wiki page before being merged.
- The `apps/api-gateway-service` and `apps/registry-service` are NestJS apps but do **not** use `@packages/nest-shared` (they have no DB, no JWT validation); they rely only on universal packages.

## Cross-references

- [[packages/nest-shared]]
- [[packages/ui-shared]]
- [[packages/shared-types]]
- [[packages/utils]]
