# Wiki Index

See [[overview]] for a full project description, architecture diagram, monorepo layout, and toolchain reference.

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

## Service Entities

- [[service-entities/users-service/user]] — `users` table; `id`, `email`, `nickname`, `accountId` (cross-DB logical FK to auth-service)
- [[service-entities/auth-service/account]] — `accounts` table; `id`, `email`, `status` (AccountStatus), `password`; one-to-many sessions
- [[service-entities/auth-service/session]] — `sessions` table; `id`, `refreshTokenHash`, `appType` (AppType), `accountId`; many-to-one account with CASCADE delete

## GraphQL Entities

- [[graphql-entities/user]] — federated `User` type; `id @key`, `email @shareable`, `nickname @shareable`; owned by users-service
- [[graphql-entities/account]] — federated `Account` type; `id @key`, `email`, `user: User`; owned by auth-service
- [[graphql-entities/account-response]] — auth mutation response; carries `accessToken`; returned by signUp/signIn

## Infrastructure

- [[infra/infra-deployment]] — Docker builds, Helm charts (microservice + frontend), Kustomize overlays for minikube and AWS EKS

## References

- [[references/assertion-functions-typescript]] — TypeScript `asserts` return type, narrowing patterns, vs. type guards; maps to `@packages/utils/asserts`
- [[references/invariant]] — what invariants are, boundary-check rule, how assertion functions encode invariants into the type system

## Decisions

- [[decisions/2026-04-27-auth-user-separation]] — auth-service owns identity (Account, Session, roles, permissions); users-service owns profile with a logical FK to Account
- [[decisions/2026-04-27-package-audience-scoping]] — nest-shared for NestJS services only; ui-shared for React apps only; all other packages are universal
- [[decisions/2026-04-27-cross-service-entity-reference]] — User.accountId is a logical (application-level) FK; cross-service composition resolved via gRPC, no DB-level constraint
- [[decisions/2026-04-27-invariant-assertion-pattern]] — assert at system boundaries only, use typed errors, order by data dependency; `refresh-tokens.command.ts` is the canonical example
- [[decisions/2026-04-27-predicate-placement-convention]] — universal predicates in `@packages/utils`; domain predicates in `shared/predicates/` (multi-module) or `<module>/predicates/` (single-module)
- [[decisions/2026-04-27-intra-service-layer-architecture]] — three-layer model: domain (`shared/domain`), use-case (transport-independent commands), transport (GraphQL/gRPC adapters)
- [[decisions/2026-04-27-scope-tiers-module-shared-package]] — code goes in `src/<module>/` (one module), `src/shared/` (≥2 modules in same app), or `packages/` (≥2 apps/services)
- [[decisions/2026-04-27-grpc-client-services-pattern]] — outbound gRPC dependencies wrapped in `shared/client-services/`; keeps command processors transport-agnostic and mockable
