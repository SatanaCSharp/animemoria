---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-graphql-definitions.md
  - packages/graphql/definitions/src/user/entities/user.ts
  - packages/graphql/definitions/src/account/entities/account.ts
  - packages/graphql/definitions/src/generate-gql-schema.ts
tags: [graphql, federation, nestjs, codegen]
---

# graphql-definitions

`@packages/graphql-definitions` is the **single source of truth for all GraphQL contracts** in the AniMemoria monorepo. It defines entities, input DTOs, and resolver interfaces using `@nestjs/graphql` decorators. Backend services implement these interfaces in their resolvers. A schema generation script compiles all definitions into a plain SDL (`schema.gql`) consumed by [[packages/graphql-generated]], keeping all NestJS dependencies out of frontend apps.

Path: `packages/graphql/definitions/`

## Architecture

```
packages/graphql/definitions/
├── src/
│   ├── user/
│   │   ├── entities/user.ts               # @ObjectType User (federated)
│   │   ├── dto/create-user.input.ts       # @InputType CreateUserInput
│   │   ├── mutations/user.mutation.interface.ts
│   │   ├── queries/user.query.interface.ts
│   │   ├── generate-schema-exports.ts     # exports userResolvers array
│   │   └── index.ts                       # barrel
│   ├── account/
│   │   ├── entities/account.ts            # @ObjectType Account (federated)
│   │   ├── dto/sign-up.input.ts
│   │   ├── dto/sign-in.input.ts
│   │   ├── dto/account.response.ts        # @ObjectType AccountResponse
│   │   ├── mutations/account.mutation.interface.ts
│   │   ├── queries/account.query.interface.ts
│   │   ├── generated-schema-exports.ts    # exports accountResolvers array
│   │   └── index.ts                       # barrel
│   └── generate-gql-schema.ts             # schema generation entry point
```

Each domain exposes a `*-schema-exports.ts` file that lists its resolver interface classes. The central `generate-gql-schema.ts` collects all of them via `collectResolvers()` and passes them to `GraphQLSchemaFactory.create()`.

### Contract-first workflow

All GraphQL API changes **start here**, not in individual services:

1. Add/update types in `src/<domain>/`.
2. Run `pnpm --filter @packages/graphql-definitions build:schema` — this boots a minimal headless NestJS `GraphQLSchemaBuilderModule`, calls `GraphQLSchemaFactory.create()`, and writes the SDL to `packages/graphql/generated/schema.gql`.
3. Implement the updated interface in the target service's resolver.
4. Run `pnpm --filter <app> codegen` to regenerate frontend TypeScript types.

## User domain

Consumed by [[services/users-service]].

| Export                  | Kind          | Description                                                                                                             |
| ----------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `User`                  | `@ObjectType` | Federated entity (`@key(fields: "id")`). Fields: `id: ID!`, `email: String! @shareable`, `nickname: String! @shareable` |
| `CreateUserInput`       | `@InputType`  | Input for user creation. Fields: `nickname`, `email`                                                                    |
| `UserMutationInterface` | `@Resolver`   | Contract — declares `createUser(input: CreateUserInput): User`                                                          |
| `UserQueryInterface`    | `@Resolver`   | Contract — declares `getUsers(): [User!]!`                                                                              |

Import from `@packages/graphql-definitions/user`.

## Account domain

Consumed by [[services/auth-service]].

| Export                     | Kind          | Description                                                                                 |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `Account`                  | `@ObjectType` | Federated entity (`@key(fields: "id")`). Fields: `id: ID!`, `email: String!`, `user: User!` |
| `AccountResponse`          | `@ObjectType` | Auth operation response. Fields: `accessToken: String!`                                     |
| `SignUpInput`              | `@InputType`  | Registration: `nickname` (min 1), `email` (valid email), `password` (min 8, max 32)         |
| `SignInInput`              | `@InputType`  | Login: `email` (valid email), `password` (min 8)                                            |
| `AccountMutationInterface` | `@Resolver`   | Contract — declares `signUp`, `signIn`, `blockAccount`, `unblockAccount`                    |
| `AccountQueryInterface`    | `@Resolver`   | Contract — declares `me(id: String!): Account!`                                             |

Import from `@packages/graphql-definitions/account`.

## Adding a new domain

1. Create `src/<domain>/` with entities, DTOs, and resolver interfaces.
2. Create `src/<domain>/generated-schema-exports.ts` exporting `export const <domain>Resolvers = [...]`.
3. Import and register the array in `src/generate-gql-schema.ts` via `collectResolvers(...)`.
4. Run `build:schema` to regenerate the SDL.

## Consumers

- [[packages/graphql-generated]] — receives the compiled `schema.gql`
- [[services/users-service]] — implements `UserMutationInterface`, `UserQueryInterface`
- [[services/auth-service]] — implements `AccountMutationInterface`, `AccountQueryInterface`
