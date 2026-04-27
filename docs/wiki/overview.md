---
updated: 2026-04-27
type: reference
sources:
  - CLAUDE.md
  - docs/wiki/index.md
  - .claude/rules/nestjs.md
  - .claude/rules/graphql.md
  - .claude/rules/grpc.md
  - .claude/rules/infra.md
tags: [overview, architecture, monorepo]
---

# AniMemoria — Project Overview

AniMemoria is an anime streaming platform for watching anime and managing users and authentication sessions. It is built as a TypeScript monorepo using pnpm workspaces and Turborepo v2, targeting Node.js ≥ 24.

---

## Monorepo Layout

```
animemoria/
├── apps/
│   ├── api-gateway-service/   # Apollo Federation gateway + REST façade
│   ├── registry-service/      # Runtime service discovery
│   ├── users-service/         # User profile domain (GraphQL + gRPC)
│   ├── auth-service/          # Authentication & sessions (GraphQL + gRPC)
│   ├── admin/                 # Internal operator SPA (Vite + TanStack Router)
│   ├── web/                   # User-facing frontend (Next.js 16 App Router)
│   └── storybook/             # Component docs & visual testing
├── packages/
│   ├── ui-shared/             # Shared component library (HeroUI + Tailwind v4)
│   ├── nest-shared/           # Shared NestJS infra (logging, ORM, auth, gRPC)
│   ├── graphql-definitions/   # Canonical GraphQL contracts
│   ├── graphql-generated/     # Compiled schema + frontend codegen config
│   ├── grpc/                  # Generated ts-proto gRPC bindings
│   ├── shared-types/          # Cross-service enums, error hierarchy, utility types
│   ├── utils/                 # Runtime utility functions
│   ├── tsconfig/              # Shared TypeScript base configs
│   ├── jest-config-preset/    # Shared Jest preset
│   ├── eslint-config-base/    # Foundation ESLint flat config
│   ├── eslint-config-ui/      # React/Next.js ESLint config
│   └── eslint-config-service/ # NestJS ESLint config
├── infra/
│   ├── local/                 # docker-compose (postgres:16-alpine)
│   ├── aws-iac/               # Terraform (ECR, IAM OIDC)
│   └── deployment/kubernetes/ # Helm charts + per-service values
└── docs/wiki/                 # This knowledge base
```

---

## Architecture

### Service layer

The backend follows an **Apollo Federation v2** topology:

- [[services/registry-service]] — lightweight service registry; services register themselves at startup so the gateway knows where to route.
- [[services/api-gateway-service]] — composes all subgraph schemas into a unified GraphQL API (`:4301`) and exposes a REST façade (`:4101`). No business logic lives here.
- [[services/users-service]] — owns the user profile domain. Exposes a GraphQL subgraph (`:4302`) and a gRPC server (`:4502`). Backed by PostgreSQL via TypeORM.
- [[services/auth-service]] — owns authentication and session management. Exposes a GraphQL subgraph (`:4303`) and a gRPC server (`:4503`). Backed by PostgreSQL via TypeORM.

### Dual-transport pattern

`users-service` and `auth-service` each run two separate entrypoints (`graphql.main.ts`, `grpc.main.ts`). Shared business logic lives in `src/shared/`; transport-specific code (resolvers, controllers) is isolated per entrypoint. See [[packages/nest-shared]] for the infrastructure that both services share.

### GraphQL contract flow

```
packages/graphql-definitions  →  packages/graphql-generated  →  apps/admin (hooks)
                                                              →  apps/web (RSC client)
```

Schema changes must be followed by `pnpm codegen` and a commit of the generated output.

### gRPC contract flow

```
packages/grpc (proto sources + ts-proto output)  →  users-service
                                                 →  auth-service
                                                 →  api-gateway-service
```

After any `.proto` change run `pnpm proto:generate` and rebuild affected packages.

### Frontend

- [[frontend/admin]] — pure client SPA; React 19 + Vite. Uses Apollo Client hooks from `@packages/graphql-generated`. No SSR.
- [[frontend/web]] — Next.js 16 App Router; Server Components are the default. Uses Apollo Client in RSC mode for data fetching.
- [[frontend/storybook]] — Storybook 10 (`nextjs-vite` framework) for component development and visual regression.

All frontend apps consume [[packages/ui-shared]] for components and extend its Tailwind config — never install HeroUI or Tailwind directly into an app.

---

## Infrastructure

Local development uses `docker-compose` to run PostgreSQL (see [[infra/infra-deployment]]). Production targets AWS EKS via two Helm charts:

- `infra/deployment/kubernetes/charts/microservice/` — all NestJS services.
- `infra/deployment/kubernetes/charts/frontend/` — `apps/web` and `apps/admin`.

Per-service values live in `values/<service-name>/`; cluster-wide overrides in `values/cluster.yaml` and `values/aws.yaml`. Terraform in `infra/aws-iac/` manages ECR repositories and IAM OIDC for GitHub Actions.

---

## Key Cross-Cutting Packages

| Package                   | Role                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| [[packages/nest-shared]]  | NestJS infra: logging, TypeORM setup, JWT auth, gRPC reflection, health checks, graceful shutdown |
| [[packages/shared-types]] | Enums, typed error hierarchy, `Maybe<T>`; consumed by every service and package                   |
| [[packages/utils]]        | Runtime utilities: asserts, predicates, type-guards, async primitives                             |
| [[packages/grpc]]         | Generated gRPC bindings for `AuthService`, `UsersService`, and `Health` contracts                 |

---

## Domain Entities

| Entity                                    | Owner         | Storage                     |
| ----------------------------------------- | ------------- | --------------------------- |
| [[service-entities/users-service/user]]   | users-service | PostgreSQL `users` table    |
| [[service-entities/auth-service/account]] | auth-service  | PostgreSQL `accounts` table |
| [[service-entities/auth-service/session]] | auth-service  | PostgreSQL `sessions` table |

GraphQL representations: [[graphql-entities/user]], [[graphql-entities/account]], [[graphql-entities/account-response]].

---

## Toolchain Quick Reference

| Concern             | Tool                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| Build orchestration | Turborepo v2 (`turbo.json`)                                                     |
| Package manager     | pnpm workspaces; shared dep versions via `catalog:` in `pnpm-workspace.yaml`    |
| Language            | TypeScript strict (extends [[packages/tsconfig]])                               |
| Testing             | Jest via [[packages/jest-config-preset]]; unit tests colocated, e2e in `test/`  |
| Linting             | ESLint flat config via [[packages/eslint-config-base]] / ui / service variants  |
| DB migrations       | TypeORM CLI; never edit committed migrations; always run against a backup first |
| Proto generation    | `pnpm proto:generate` → [[packages/grpc]]                                       |
| GraphQL codegen     | `pnpm codegen` → [[packages/graphql-generated]]                                 |
