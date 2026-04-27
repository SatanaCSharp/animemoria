---
updated: 2026-04-24
type: graphql-entity
sources:
  - packages/graphql/definitions/src/user/entities/user.ts
  - docs/wiki/raw/package-graphql-definitions.md
  - packages/graphql/generated/schema.gql
tags: [graphql, federation, user]
---

# User (GraphQL entity)

Federated GraphQL object type representing a user profile. Owned and resolved by [[services/users-service]]. Referenced by [[graphql-entities/account]] via the `user` field.

Defined in: `packages/graphql/definitions/src/user/entities/user.ts` (part of [[packages/graphql-definitions]])

## SDL

```graphql
type User {
  id: ID!
  email: String!
  nickname: String!
}
```

## Federation directives

| Directive    | Value                  | Meaning                                                                            |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------- |
| `@key`       | `fields: "id"`         | `id` is the federation join key — other subgraphs can reference `User` by its `id` |
| `@shareable` | on `email`, `nickname` | These fields may be resolved by more than one subgraph                             |

## Fields

| Field      | Type      | Notes                                             |
| ---------- | --------- | ------------------------------------------------- |
| `id`       | `ID!`     | Primary key; federation join key                  |
| `email`    | `String!` | `@shareable` — may be returned by other subgraphs |
| `nickname` | `String!` | `@shareable` — may be returned by other subgraphs |

## Operations

| Operation    | Kind     | Signature                                    | Resolver interface      |
| ------------ | -------- | -------------------------------------------- | ----------------------- |
| `getUsers`   | Query    | `getUsers: [User!]!`                         | `UserQueryInterface`    |
| `createUser` | Mutation | `createUser(input: CreateUserInput!): User!` | `UserMutationInterface` |

### Input: `CreateUserInput`

```graphql
input CreateUserInput {
  nickname: String!
  email: String!
}
```

## Resolver contract

Resolver interfaces are defined in [[packages/graphql-definitions]] and implemented by [[services/users-service]]:

```typescript
// UserQueryInterface
getUsers(): Promise<User[]>

// UserMutationInterface
createUser(input: CreateUserInput): Promise<User>
```

> ⚠️ **Known issue**: As of 2026-04-21, `createUser` returns a mock id and `getUsers` returns a hard-coded list — neither is persistence-backed yet. See [[services/users-service]] for details.

## Related

- [[services/users-service]] — owning service
- [[graphql-entities/account]] — `Account.user` references this type
- [[packages/graphql-definitions]] — defines the contract
- [[packages/graphql-generated]] — schema consumed by frontend codegen
