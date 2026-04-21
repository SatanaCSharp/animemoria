---
globs: ['apps/*-service/src/**/*.ts']
---

# NestJS conventions

## Module structure

- Feature modules: `src/modules/<feature>/` — one directory per domain slice.
- Shared cross-module utilities: `src/shared/` only.
- Module class name: `<Feature>Module`. Provider class names: `<Feature>Service`, `<Feature>Resolver`, `<Feature>Controller`.

## Dependency injection

- Constructor injection **only**. Never use `ModuleRef` as a service locator outside app bootstrap.
- Providers must be explicitly declared in their owning module's `providers` array — no global-scope shortcuts unless intentional and documented.

## Dual-transport apps (users-service, auth-service)

- Each transport has its own entrypoint: `graphql.main.ts` and `grpc.main.ts`.
- Modules shared across transports live in `src/shared/`. Do not import GraphQL-specific decorators (`@Resolver`, `@Query`) into a module loaded by the gRPC transport, and vice versa.

## Testing

- Unit tests: `*.spec.ts` colocated with source file.
- e2e tests: `test/` at the app root.
- Use `@nestjs/testing` `Test.createTestingModule()` — no direct instantiation of services.
- Mock dependencies with `jest.fn()` or manual provider overrides; never import real DB connections in unit tests.
