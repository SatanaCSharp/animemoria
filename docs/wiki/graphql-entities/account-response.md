---
updated: 2026-04-24
type: graphql-entity
sources:
  - packages/graphql/definitions/src/account/dto/account.response.ts
  - docs/wiki/raw/package-graphql-definitions.md
  - packages/graphql/generated/schema.gql
tags: [graphql, auth, account]
---

# AccountResponse (GraphQL type)

Non-federated GraphQL object type returned by authentication mutations (`signUp`, `signIn`). Carries the JWT access token issued by [[services/auth-service]] after a successful authentication operation.

Defined in: `packages/graphql/definitions/src/account/dto/account.response.ts` (part of [[packages/graphql-definitions]])

## SDL

```graphql
type AccountResponse {
  accessToken: String!
}
```

## Fields

| Field         | Type      | Notes                                                    |
| ------------- | --------- | -------------------------------------------------------- |
| `accessToken` | `String!` | JWT access token issued on successful sign-up or sign-in |

## Operations that return this type

| Operation | Kind     | Signature                                       |
| --------- | -------- | ----------------------------------------------- |
| `signUp`  | Mutation | `signUp(input: SignUpInput!): AccountResponse!` |
| `signIn`  | Mutation | `signIn(input: SignInInput!): AccountResponse!` |

Both operations are resolved by `AccountMutationInterface` in [[services/auth-service]].

## Related

- [[services/auth-service]] — owning service that produces this response
- [[graphql-entities/account]] — the full account entity; use `me` query to fetch account details after auth
- [[packages/graphql-definitions]] — defines the contract
