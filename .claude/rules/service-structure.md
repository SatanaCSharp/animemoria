---
paths: apps/*-service/src/**/*.ts
---

---

description: Service structure conventions for naming, directory layout, layer responsibilities, and barrel pattern
globs: src/\*_/_.ts
alwaysApply: true

---

# Service Structure Conventions

## Naming

Use these class and file name patterns. Placeholders: `{Entity}` = PascalCase, `{entity}` = camelCase, `{action}` = camelCase verb, `{functionality-module}` = kebab-case.

| Artifact          | Class name                         | File name                                   |
| ----------------- | ---------------------------------- | ------------------------------------------- |
| Entity            | `{Entity}`                         | `{entity}.entity.ts`                        |
| Repository        | `{Entity}Repository`               | `{entity}.repository.ts`                    |
| Command processor | `{Action}{Entity}CommandProcessor` | `{action}-{entity}.command.ts`              |
| gRPC controller   | `{Entity}Controller`               | `{functionality-module}.controller.ts`      |
| GraphQL query     | `{Entity}Query`                    | `{entity}.query.ts`                         |
| GraphQL mutation  | `{Entity}Mutation`                 | `{entity}.mutation.ts`                      |
| Transport module  | `{Entity}{Transport}Module`        | e.g. `users-graphql.module.ts`              |
| Use-case module   | `UseCaseModule`                    | `use-case.module.ts`                        |
| Barrel file       | (array export)                     | `commands.ts`, `queries.ts`, `mutations.ts` |

## Directory Layout

Place every file in its canonical location:

```
src/
├── app-base.module.ts
├── graphql.{main,module}.ts
├── grpc.{main,module}.ts
├── shared/
│   ├── shared.module.ts                   # @Global(); exports all repositories
│   └── domain/
│       ├── entities/
│       └── repositories/
│           ├── repositories.ts            # barrel array
│           └── *.repository.ts
└── {functionality-module}/
    ├── {functionality-module}.graphql.module.ts
    ├── {functionality-module}.grpc.module.ts
    ├── graphql/
    │   ├── mutations/
    │   │   ├── mutations.ts               # barrel array
    │   │   └── *.mutation.ts
    │   └── queries/
    │       ├── queries.ts                 # barrel array
    │       └── *.query.ts
    ├── grpc/controllers/
    │   ├── controllers.ts                 # barrel array
    │   └── *.controller.ts
    └── use-case/
        ├── use-case.module.ts
        └── commands/
            ├── commands.ts                # barrel array
            ├── *.command.ts
            └── *.command.spec.ts
```

## Layer Responsibilities

**Domain** (`shared/domain/`):

- Entities MUST extend `BaseEntity`.
- Entity constructor MUST accept `Partial<{Entity}>` and use `Object.assign(this, data)`.
- Repositories MUST extend `BaseRepository<{Entity}>` and inject `DataSource`.

```ts
// ✅ correct
export class User extends BaseEntity {
  constructor(data: Partial<User>) {
    super();
    Object.assign(this, data);
  }
}
```

**Use-case** (`{functionality-module}/use-case/commands/`):

- Every command processor MUST implement `CommandProcessor<Command, Response>`.
- MUST expose a single `async process()` method.
- MUST NOT contain any transport logic (no gRPC metadata, no GraphQL context).

```ts
// ✅ correct
export class CreateUserCommandProcessor implements CommandProcessor<CreateUserCommand, User> {
  async process(command: CreateUserCommand): Promise<User> { ... }
}

// ❌ wrong — transport concern in use-case layer
async process(command: CreateUserCommand, metadata: Metadata): Promise<User> { ... }
```

**Delivery** (`graphql/`, `grpc/`):

- Delivery classes MUST delegate to `CommandProcessor` only — no business logic inline.
- gRPC controllers MUST implement the proto-generated service interface AND be decorated with `@{Entity}ServiceControllerMethods()`.
- GraphQL resolvers MUST extend interfaces from `@packages/graphql-definitions/{functionality-module}`.

```ts
// ✅ correct gRPC controller
@{Entity}ServiceControllerMethods()
export class UserController implements UserServiceController {
  constructor(private readonly createUser: CreateUserCommandProcessor) {}
  async createUser(data: CreateUserRequest): Promise<User> {
    return this.createUser.process(data);
  }
}
```

## Barrel Pattern

Every artifact folder MUST have a barrel file that exports an array of providers, and the parent module MUST spread that array.

```ts
// commands.ts
export const commands = [
  CreateUserCommandProcessor,
  UpdateUserCommandProcessor,
];

// use-case.module.ts
@Module({ providers: [...commands], exports: [...commands] })
export class UseCaseModule {}
```

Apply the same pattern for `queries`, `mutations`, `controllers`, and `repositories`.

`SharedModule` MUST be decorated with `@Global()` so repositories are available everywhere without explicit imports in feature modules.
