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

- [[packages/nest-shared]] — shared NestJS infra (logging, ORM, auth, gRPC, health, graceful shutdown); consumed by users-service and auth-service only

## Entities

<!-- one link per entity page -->

## Infrastructure

- [[infra/infra-deployment]] — Docker builds, Helm charts (microservice + frontend), Kustomize overlays for minikube and AWS EKS

## Decisions

<!-- date-prefixed decision records -->
