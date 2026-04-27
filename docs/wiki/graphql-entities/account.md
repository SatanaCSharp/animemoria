---
updated: 2026-04-24
type: graphql-entity
sources:
  - packages/graphql/definitions/src/account/entities/account.ts
  - packages/graphql/definitions/src/account/dto/sign-up.input.ts
  - packages/graphql/definitions/src/account/dto/sign-in.input.ts
  - docs/wiki/raw/package-graphql-definitions.md
  - packages/graphql/generated/schema.gql
tags: [graphql, federation, auth, account]
---

# Account (GraphQL entity)

Federated GraphQL object type representing an authentication account. Owned and resolved by [[services/auth-service]]. References [[graphql-entities/user]] for the associated user profile.

Defined in: `packages/graphql/definitions/src/account/entities/account.ts` (part of [[packages/graphql-definitions]])

## SDL

```graphql
type Account {
  id: ID!
  email: String!
  user: User!
}
```

## Federation directives

| Directive | Value          | Meaning                                                                               |
| --------- | -------------- | ------------------------------------------------------------------------------------- |
| `@key`    | `fields: "id"` | `id` is the federation join key — other subgraphs can reference `Account` by its `id` |

## Fields

| Field   | Type      | Notes                                                                           |
| ------- | --------- | ------------------------------------------------------------------------------- |
| `id`    | `ID!`     | Primary key; federation join key                                                |
| `email` | `String!` | Account's email address                                                         |
| `user`  | `User!`   | Associated user profile — cross-subgraph reference to [[graphql-entities/user]] |

## Operations

| Operation        | Kind     | Signature                                       | Resolver interface         |
| ---------------- | -------- | ----------------------------------------------- | -------------------------- |
| `me`             | Query    | `me(id: String!): Account!`                     | `AccountQueryInterface`    |
| `signUp`         | Mutation | `signUp(input: SignUpInput!): AccountResponse!` | `AccountMutationInterface` |
| `signIn`         | Mutation | `signIn(input: SignInInput!): AccountResponse!` | `AccountMutationInterface` |
| `blockAccount`   | Mutation | `blockAccount(id: String!): Account!`           | `AccountMutationInterface` |
| `unblockAccount` | Mutation | `unblockAccount(id: String!): Account!`         | `AccountMutationInterface` |

### Input: `SignUpInput`

```graphql
input SignUpInput {
  nickname: String! # min 1 character
  email: String! # valid email format
  password: String! # min 8, max 32 characters
}
```

### Input: `SignInInput`

```graphql
input SignInInput {
  email: String! # valid email format
  password: String! # min 8 characters
}
```

Auth operations return [[graphql-entities/account-response]], not `Account` directly — `AccountResponse` carries the `accessToken`.

## Resolver contract

Resolver interfaces are defined in [[packages/graphql-definitions]] and implemented by [[services/auth-service]]:

```typescript
// AccountQueryInterface
me(id: string): Promise<Account>

// AccountMutationInterface
signUp(input: SignUpInput, context: GraphQLContext): Promise<AccountResponse>
signIn(input: SignInInput, context: GraphQLContext): Promise<AccountResponse>
blockAccount(id: string): Promise<Account>
unblockAccount(id: string): Promise<Account>
```

## Related

- [[services/auth-service]] — owning service
- [[graphql-entities/user]] — `Account.user` field references this type
- [[graphql-entities/account-response]] — return type for sign-up and sign-in
- [[packages/graphql-definitions]] — defines the contract
- [[packages/graphql-generated]] — schema consumed by frontend codegen
