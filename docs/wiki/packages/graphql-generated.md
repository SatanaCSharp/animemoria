---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-graphql-generated.md
  - packages/graphql/generated/codegen.config.ts
  - packages/graphql/generated/schema.gql
tags: [graphql, codegen, frontend, apollo]
---

# graphql-generated

`@packages/graphql-generated` aggregates the compiled GraphQL schema and provides a shared codegen configuration for all frontend consumers. It is the bridge between the backend contract layer ([[packages/graphql-definitions]]) and the frontend type layer (`apps/admin`, `apps/web`).

Path: `packages/graphql/generated/`

Do **not** edit `schema.gql` manually — it is owned by the schema generation script in `@packages/graphql-definitions`.

## Architecture

```
packages/graphql/generated/
├── schema.gql          # compiled SDL (auto-generated, committed)
└── codegen.config.ts   # GraphQL Code Generator config (re-exported by apps)
```

### Exports

| Export path        | File                | Purpose                                         |
| ------------------ | ------------------- | ----------------------------------------------- |
| `./schema`         | `schema.gql`        | Full federated SDL consumed by frontend codegen |
| `./codegen.config` | `codegen.config.ts` | Shared GraphQL Code Generator configuration     |

## schema.gql

The SDL produced by `@packages/graphql-definitions`'s `build:schema` script. It is committed to the repo — CI validates it is in sync with the contract definitions.

Current schema covers:

- **Types**: `User`, `Account`, `AccountResponse`
- **Queries**: `getUsers`, `me`
- **Mutations**: `createUser`, `signUp`, `signIn`, `blockAccount`, `unblockAccount`
- **Inputs**: `CreateUserInput`, `SignUpInput`, `SignInInput`

## codegen.config.ts

A ready-to-use [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) configuration. Apps re-export it verbatim — no manual plugin or schema configuration required.

### Consuming app setup

```typescript
// apps/admin/codegen.config.ts  (or apps/web)
export { default } from '@packages/graphql-generated/codegen.config';
```

```json
// package.json
{
  "scripts": {
    "codegen": "graphql-codegen --config node_modules/@packages/graphql-generated/codegen.config.ts"
  }
}
```

### What gets generated

Running `pnpm codegen` inside a consuming app produces:

| Output            | Location                                             | Contents                                                   |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Base schema types | `src/__generated__/graphql-shared.type.ts`           | TypeScript types for every GraphQL type, input, and scalar |
| Operation types   | `<same dir as .graphql>/<name>.graphql.generated.ts` | Typed `DocumentNode` + input/result types per operation    |

### Key codegen behaviours

- **`near-operation-file` preset** — generated files live alongside their `.graphql` sources.
- **`TypedDocumentNode` exports** — import precompiled document nodes directly; no `gql` template literals needed.
- **Nullable fields use `null`** (not `undefined`) — matches Apollo Client v4 conventions (`avoidOptionals.field: true`).
- **`__typename` always present** — `nonOptionalTypename: true`, `addTypename: true`.
- **Post-generation formatting** — ESLint (`--fix`) and Prettier (`--write`) run automatically via codegen hooks.
- **Scalar fallback** — unconfigured scalars type as `unknown` (not `any`).

## Regeneration workflow

```bash
# 1. After changing contracts in @packages/graphql-definitions:
pnpm --filter @packages/graphql-definitions build:schema

# 2. After schema.gql is updated:
pnpm --filter <app-name> codegen
```

Both outputs are committed. CI will fail if either is out of sync.

## Consumers

- [[frontend/admin]] — primary consumer; Apollo Client 4 with typed document nodes
- [[frontend/web]] — Next.js consumer; codegen for RSC-mode Apollo queries
- [[packages/graphql-definitions]] — upstream source; generates `schema.gql`
