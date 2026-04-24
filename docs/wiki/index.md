# Wiki Index

## Services

- [[services/api-gateway-service]] — Apollo Federation gateway + REST façade; GraphQL :4301 + REST :4101; no database; composes subgraphs from registry
- [[services/registry-service]] — runtime service discovery; REST :4100; in-memory only, no database
- [[services/users-service]] — user profile domain; dual-transport GraphQL :4302 + gRPC :4502; PostgreSQL via TypeORM
- [[services/auth-service]] — authentication and sessions; dual-transport GraphQL :4303 + gRPC :4503; PostgreSQL via TypeORM

## Frontend

- [[frontend/admin]] — internal operator SPA; React 19 + Vite + TanStack Router + Apollo Client; pure client-side
- [[frontend/web]] — user-facing streaming frontend; Next.js 16 App Router; SSR + Server Actions + Apollo RSC mode
- [[frontend/storybook]] — component documentation and visual testing hub; Storybook 10 + nextjs-vite; dev port :6006

## Packages

- [[packages/ui-shared]] — shared React component library (HeroUI + Tailwind); Button, inputs, dropdowns, icons, UIProvider; consumed by admin, web, storybook
- [[packages/nest-shared]] — shared NestJS infra (logging, ORM, auth, gRPC, health, graceful shutdown); consumed by users-service and auth-service only
- [[packages/graphql-definitions]] — single source of truth for all GraphQL contracts; defines entities, DTOs, resolver interfaces, and generates schema.gql
- [[packages/graphql-generated]] — compiled schema.gql + shared codegen config for frontend apps; bridge between backend contracts and frontend types
- [[packages/eslint-config-base]] — foundation ESLint flat config (TS strict + Prettier + import hygiene); extended by all other ESLint config packages
- [[packages/eslint-config-ui]] — ESLint config for React/Next.js frontends; extends base + React, Hooks, a11y, import/order
- [[packages/eslint-config-service]] — ESLint config for NestJS services; extends base with relaxed DI/decorator rules
- [[packages/grpc]] — generated TypeScript gRPC bindings (ts-proto); AuthService, UsersService, Health contracts for all NestJS services
- [[packages/jest-config-preset]] — shared Jest preset (ts-jest, node env, spec.ts pattern); extended by all services and packages
- [[packages/tsconfig]] — shared TypeScript base configs (`tsconfig.base.json` + `tsconfig.node.json`); extended by all workspaces
- [[packages/shared-types]] — cross-service enums, typed error hierarchy, and utility types (`Maybe<T>`); sub-path exports; consumed by every service and package
- [[packages/utils]] — runtime utility functions (asserts, predicates, type-guards, async primitives); sub-path exports; consumed by all services and apps

## GraphQL Entities

- [[graphql-entities/user]] — federated `User` type; `id @key`, `email @shareable`, `nickname @shareable`; owned by users-service
- [[graphql-entities/account]] — federated `Account` type; `id @key`, `email`, `user: User`; owned by auth-service
- [[graphql-entities/account-response]] — auth mutation response; carries `accessToken`; returned by signUp/signIn

## Infrastructure

- [[infra/infra-deployment]] — Docker builds, Helm charts (microservice + frontend), Kustomize overlays for minikube and AWS EKS

## Decisions

<!-- date-prefixed decision records -->
