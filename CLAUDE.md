## Project

AniMemoria — anime streaming platform (watch anime, manage users, authenticate sessions).
Monorepo: pnpm workspaces + Turborepo v2.
Language: TypeScript throughout (Node.js ≥ 24).

**Claude's role in this repo:** implement features, fix bugs, write migrations, scaffold new NestJS modules/services, maintain Helm/Terraform config, and review code across all workspaces. When in doubt about a task's scope, read the relevant README first (see Documentation Navigation).

## Documentation Navigation

**BEFORE starting any task**, consult the table of contents to find relevant docs:

```
@_docs/TABLE_OF_CONTENTS.md
```

Read **only** the README files listed there that are relevant to the current task.
README locations: `apps/*/README.md`, `packages/*/README.md`

---

## Architecture

**Apps:** `web` (Next.js 16), `admin` (React 19 + Vite + TanStack), `storybook`, `api-gateway-service` (Gateway + REST, 4301/4101), `users-service` (GQL 4302 + gRPC 4502), `auth-service` (GQL 4303 + gRPC 4503), `registry-service` (REST 4100).

**Packages:** `nest-shared` (logging, auth, ORM, gRPC, health), `graphql-definitions` (Federation schema), `graphql-generated` (codegen + Apollo Client types), `grpc` (protobufs + ts-proto), `shared-types` (errors, enums), `ui-shared` (HeroUI + Tailwind v4), `utils`, `scripts` (TypeORM CLI), `tsconfig`, `jest-config-preset`, `eslint-config-{base,service,ui}`.

### Apollo Federation Topology

```
Browser → api-gateway-service (:4301 GQL / :4101 REST)
               ├── users-service :4302  (subgraph)
               └── auth-service  :4303  (subgraph)
```

Subgraph URLs resolved at runtime via `registry-service` (:4100). Each service self-registers on startup.

### Dual-Transport NestJS Services

`users-service` and `auth-service` each have two entry points (`graphql.main.ts`, `grpc.main.ts`) sharing one codebase. Start them independently.

---

## Development Setup

### Prerequisites

```bash
pnpm install                           # install all workspace deps
cd infra/local && docker-compose up -d db db-init  # start PostgreSQL
pnpm migration:run                     # run TypeORM migrations
```

### Start All Services (separate terminals)

```bash
pnpm registry:rest:dev                 # service discovery   :4100
pnpm grpc:dev                          # users + auth gRPC   :4502, :4503
pnpm graphql:dev                       # users + auth GQL    :4302, :4303
pnpm api-gateway:graphql:dev           # federation gateway  :4301
pnpm api-gateway:rest:dev              # gateway REST        :4101
cd apps/admin && pnpm dev              # admin SPA           :3000
cd apps/web   && pnpm dev              # web app             :3000
```

**Startup order matters:** registry → gRPC services → GraphQL subgraphs → gateway.

### Common Commands

All scripts are defined in the root `package.json`. Key groups:

- **Dev:** `build`, `build:packages`, `test`, `lint`, `format`, `format:check`
- **Migrations:** `migration:run`, `migration:run:prod`
- **Docker:** `docker:build:<service>` per service, `docker:build:all`, `docker:build:clients`, `docker:build:services`
- **gRPC codegen:** `pnpm proto:generate` (per-service, regenerates `src/generated/`)

---

## Apollo Federation Subgraph Guide

- Subgraph schemas live in `@packages/graphql-definitions`.
- The gateway (`api-gateway-service`) discovers subgraph URLs from the registry service at runtime — it does **not** use static URLs.
- When deploying a new subgraph version, ensure the registry is healthy and the subgraph has registered itself before the gateway starts.
- Apollo Client codegen for `admin` app: `cd apps/admin && pnpm codegen` (or `pnpm codegen:watch`).

---

## Infrastructure

### Local

`infra/local/docker-compose.yml` — PostgreSQL 16-alpine + db-init service.

### AWS (Terraform)

`infra/aws-iac/` — Terraform modules:

- **ECR** — private container image repositories
- **IAM** — GitHub Actions OIDC role + ECR push policy

Entry point: `infra/aws-iac/environments/dev/main.tf`

### Kubernetes / Helm

`infra/deployment/kubernetes/`

Two reusable Helm charts:

- `charts/frontend/` — used by `web` and `admin` (ConfigMap, Deployment, Ingress, Nginx)
- `charts/microservice/` — used by all NestJS services (HPA, NetworkPolicy, PDB, migration Job)

Per-service Helm values live in `values/<service-name>/`.
Global overrides: `values/cluster.yaml`, `values/aws.yaml`.

K8s manifests: `manifests/base/` (common), `manifests/minikube/` (local dev), `manifests/aws/` (prod).

### Docker

Single `Dockerfile.nestjs` covers all NestJS services via build args:

```bash
docker build \
  --build-arg APP_NAME=users-service \
  --build-arg APP_TYPE=grpc \
  --build-arg ENTRY_POINT=grpc.main \
  -f infra/deployment/docker/Dockerfile.nestjs .
```

---

## Code Conventions

### TypeScript

- All packages extend `@packages/tsconfig` with strict type-checking enabled.
- Use `catalog:` references in `package.json` for shared devDependencies — update versions in root `pnpm-workspace.yaml`, not in individual `package.json` files.

### ESLint Config Hierarchy

```
@packages/eslint-config-base       # TS-ESLint + Prettier + import sorting
  └── @packages/eslint-config-service  # NestJS overrides
  └── @packages/eslint-config-ui       # React/Next.js + JSX a11y + hooks
```

### NestJS

- Inject dependencies via constructor, not service locator.
- Use `@packages/nest-shared` subpath exports for shared infrastructure (logging, ORM, auth, gRPC, health).
- Database services (users, auth) use TypeORM via `@packages/nest-shared/orm`.
- registry-service and api-gateway-service REST do **not** use ORM.
- Module naming: `<Domain><Transport>Module` (e.g. `UsersGraphqlModule`, `SessionGrpcModule`).
- Feature modules live under `src/modules/<domain>/`; shared cross-module code goes in `src/shared/`.

### Testing

- All workspaces extend `@packages/jest-config-preset` — no per-project Jest boilerplate needed.
- Unit tests colocate with source (`*.spec.ts`); e2e tests live in `test/` at app root.
- Run a single workspace's tests: `pnpm --filter <workspace> test`.
- NestJS service tests use `Test.createTestingModule()`; mock external transports (gRPC clients, HTTP) at the module boundary.

### GraphQL / gRPC

- Proto files live in `@packages/grpc/protobufs/`. Run `pnpm proto:generate` after any `.proto` change.
- Keep GraphQL schema types and gRPC proto message types consistent — they serve the same domain.

---

## Common Workflows & Gotchas

### Running Migrations

```bash
# Dev
pnpm migration:run

# Create a new migration (inside service directory)
npx typeorm migration:create src/migrations/MigrationName
```

Each service has its own TypeORM config. `DB_CONNECTION_URL` must be set before running.

### Adding a New NestJS Service

1. Create app under `apps/<service-name>/`.
2. Add entry points (`graphql.main.ts`, `grpc.main.ts`, or `rest.main.ts`).
3. Register corresponding `turbo` tasks in `turbo.json`.
4. Add Docker build script in root `package.json`.
5. Add Helm values file under `infra/deployment/kubernetes/values/<service-name>/`.

### Gotchas

- **Service startup order:** Gateway depends on registry + subgraphs being up. Start registry first.
- **Proto changes:** Always run `pnpm proto:generate` and rebuild packages after `.proto` edits.
- **Catalog deps:** Never bump shared devDep versions in individual `package.json` — update `catalog:` entries in the workspace root only.
- **Apollo version:** `@apollo/server` is pinned to v5 in pnpm `allowedVersions`. Peer dep warnings for `@apollo/server-plugin-landing-page-graphql-playground` are expected and safe to ignore.
- **Vite admin vs Next.js web:** Admin is a pure client SPA (no SSR). Do not use Next.js server features (Server Actions, RSC) in the admin app.
- **gRPC reflection:** Enabled by default via `@packages/nest-shared`. Review whether to disable in production for security-sensitive deployments.
