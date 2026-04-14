# AniMemoria — Table of Contents

## Apps

### Admin App

Internal admin SPA for AniMemoria operators. Built with React 19 + Vite, TanStack Router, Apollo Client, and i18next.
(`apps/admin`) — [README](../../apps/admin/README.md)

### API Gateway Service

NestJS gateway that exposes both a REST API and a GraphQL Federation Gateway entrypoint, with shared core infrastructure modules.
(`apps/api-gateway-service`) — [README](../../apps/api-gateway-service/README.md)

### Auth Service

Authentication domain service that owns account credentials, session lifecycle, and token issuance across GraphQL and gRPC transports.
(`apps/auth-service`) — [README](../../apps/auth-service/README.md)

### Users Service

User domain service running two transports: GraphQL for user queries/mutations and gRPC for user creation with persistence.
(`apps/users-service`) — [README](../../apps/users-service/README.md)

### Registry Service

In-memory service registry providing runtime service discovery via REST API for services to register and discover each other's connection details.
(`apps/registry-service`) — [README](../../apps/registry-service/README.md)

### Web App

Public-facing Next.js app (bootstrapped with create-next-app).
(`apps/web`) — [README](../../apps/web/README.md)

### Storybook

Component documentation app (Next.js + Storybook).
(`apps/storybook`) — [README](../../apps/storybook/README.md)

---

## Packages

### @packages/nest-shared

Shared NestJS infrastructure library providing reusable modules for logging, auth, config, database, health checks, gRPC, service discovery, and graceful shutdown.
(`packages/nest-shared`) — [README](../../packages/nest-shared/README.md)

### @packages/grpc

Generated TypeScript bindings for all AniMemoria gRPC contracts compiled from `.proto` files via `ts-proto`. Do NOT edit manually — run `pnpm proto:generate`.
(`packages/grpc`) — [README](../../packages/grpc/README.md)

### @packages/shared-types

Cross-service enums, error classes, and utility types with a typed error hierarchy for domain and system failures.
(`packages/shared-types`) — [README](../../packages/shared-types/README.md)

### @packages/ui-shared

Reusable React UI components built on HeroUI and Tailwind CSS, consumed by admin, web, and storybook apps.
(`packages/ui-shared`) — [README](../../packages/ui-shared/README.md)

### @packages/utils

Runtime utilities shared across all services: assertion helpers, boolean predicates, type guards, and async primitives.
(`packages/utils`) — [README](../../packages/utils/README.md)

### @packages/tsconfig

Shared TypeScript compiler configuration providing composable base configs with strict type-checking options.
(`packages/tsconfig`) — [README](../../packages/tsconfig/README.md)

### @packages/scripts

Shared shell scripts for TypeORM database migration management across all NestJS services, exposed as bin commands.
(`packages/scripts`) — [README](../../packages/scripts/README.md)

### @packages/jest-config-preset

Zero-boilerplate shared Jest configuration preset extended by every workspace via `preset`.
(`packages/jest-config-preset`) — [README](../../packages/jest-config-preset/README.md)

### @packages/eslint-config-base

Foundation ESLint flat config bundling TypeScript-ESLint, Prettier, import sorting, and unused-import removal.
(`packages/eslint-config-base`) — [README](../../packages/eslint-config-base/README.md)

### @packages/eslint-config-service

ESLint flat config for NestJS backend services extending the base config with NestJS-aware overrides and relaxed spec-file rules.
(`packages/eslint-config-service`) — [README](../../packages/eslint-config-service/README.md)

### @packages/eslint-config-ui

ESLint flat config for React/Next.js frontend apps extending the base config with React Hooks, JSX a11y, and TypeScript-aware import rules.
(`packages/eslint-config-ui`) — [README](../../packages/eslint-config-ui/README.md)
