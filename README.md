# AniMemoria

Anime streaming platform for watching anime and managing users and authentication sessions.

**Stack:** TypeScript · Node.js ≥ 24 · pnpm workspaces · Turborepo v2

---

## Architecture

### Apollo Federation Topology

```
Browser → api-gateway-service (:4301 GQL / :4101 REST)
               ├── users-service  :4302  (subgraph)
               └── auth-service   :4303  (subgraph)
```

Subgraph URLs are resolved at runtime via `registry-service` (:4100). Each service self-registers on startup.

### Apps

| App                   | Description                                     | Port                     |
| --------------------- | ----------------------------------------------- | ------------------------ |
| `api-gateway-service` | Apollo Federation Gateway + REST entry point    | 4301 (GQL) / 4101 (REST) |
| `users-service`       | User domain — GraphQL subgraph + gRPC transport | 4302 (GQL) / 4502 (gRPC) |
| `auth-service`        | Auth domain — credentials, sessions, tokens     | 4303 (GQL) / 4503 (gRPC) |
| `registry-service`    | In-memory service discovery via REST            | 4100                     |
| `web`                 | Public-facing Next.js app                       | 3000                     |
| `admin`               | Internal admin SPA (React 19 + Vite + TanStack) | 3000                     |
| `storybook`           | Component documentation                         | —                        |

### Packages

| Package                         | Description                                             |
| ------------------------------- | ------------------------------------------------------- |
| `@packages/nest-shared`         | Shared NestJS modules: logging, auth, ORM, gRPC, health |
| `@packages/graphql-definitions` | Apollo Federation schema                                |
| `@packages/graphql-generated`   | Codegen types + Apollo Client hooks                     |
| `@packages/grpc`                | Protobuf definitions + ts-proto generated types         |
| `@packages/shared-types`        | Cross-service enums and error types                     |
| `@packages/ui-shared`           | HeroUI + Tailwind v4 component library                  |
| `@packages/utils`               | Shared utility functions                                |
| `@packages/scripts`             | TypeORM CLI scripts                                     |
| `@packages/tsconfig`            | Base TypeScript config                                  |
| `@packages/jest-config-preset`  | Shared Jest configuration                               |
| `@packages/eslint-config-*`     | ESLint configs (base, service, ui)                      |

---

## Getting Started

### Prerequisites

- Node.js ≥ 24
- pnpm ≥ 10
- Docker (for local PostgreSQL)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
cd infra/local && docker-compose up -d db db-init
```

### 3. Run migrations

```bash
pnpm migration:run
```

### 4. Start all services

Open a separate terminal for each command. **Order matters** — start services top to bottom.

```bash
pnpm registry:rest:dev         # 1. Service discovery         :4100
pnpm grpc:dev                  # 2. users + auth gRPC         :4502, :4503
pnpm graphql:dev               # 3. users + auth GraphQL      :4302, :4303
pnpm api-gateway:graphql:dev   # 4. Federation Gateway        :4301
pnpm api-gateway:rest:dev      # 5. Gateway REST              :4101
```

### 5. Start the frontend apps (optional)

```bash
cd apps/admin && pnpm dev      # Admin SPA   :3000
cd apps/web   && pnpm dev      # Web app     :3000
```

---

## Common Commands

```bash
pnpm build                     # Build all workspaces
pnpm build:packages            # Build packages only
pnpm test                      # Run all tests
pnpm lint                      # Lint all workspaces
pnpm format                    # Format all files with Prettier
pnpm migration:run             # Run TypeORM migrations (dev)
pnpm proto:generate            # Regenerate gRPC types from .proto files
```

### Docker builds

```bash
pnpm docker:build:all          # Build all images
pnpm docker:build:services     # Build NestJS service images
pnpm docker:build:clients      # Build web + admin images
```

Single service example:

```bash
docker build \
  --build-arg APP_NAME=users-service \
  --build-arg APP_TYPE=grpc \
  --build-arg ENTRY_POINT=grpc.main \
  -f infra/deployment/docker/Dockerfile.nestjs .
```

---

## Infrastructure

- **Local:** `infra/local/docker-compose.yml` — PostgreSQL 16
- **AWS:** `infra/aws-iac/` — Terraform modules for ECR and IAM (GitHub Actions OIDC)
- **Kubernetes:** `infra/deployment/kubernetes/` — Helm charts (`charts/frontend/`, `charts/microservice/`) with per-service values under `values/<service-name>/`

---

## Documentation

Full table of contents with per-service and per-package READMEs:

[\_docs/TABLE_OF_CONTENTS.md](_docs/TABLE_OF_CONTENTS.md)
