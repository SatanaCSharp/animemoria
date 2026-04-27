# @packages/graphql-generated

Aggregated GraphQL schema and codegen configuration for frontend consumers.
The schema is compiled from all subgraph SDL definitions by `@packages/graphql-definitions`. Do NOT edit `schema.gql` manually — run the command below to regenerate it.

---

## Regenerating

**Schema** (backend → SDL, run after changing contracts in `@packages/graphql-definitions`):

```bash
pnpm --filter @packages/graphql-definitions build:schema
```

**Frontend types** (SDL → TypeScript, run after the schema changes):

```bash
pnpm --filter <app-name> codegen
```

---

## Exports

| Export path        | File                | Purpose                                            |
| ------------------ | ------------------- | -------------------------------------------------- |
| `./schema`         | `schema.gql`        | Full federated schema used by frontend codegen     |
| `./codegen.config` | `codegen.config.ts` | GraphQL Code Generator config for typed operations |

---

## `./schema`

The compiled SDL produced by the schema generation script in `@packages/graphql-definitions`. It describes all types, queries, mutations, and inputs across every backend subgraph.

Current schema covers: `User`, `Account`, `AccountResponse` types; `getUsers`, `me` queries; `createUser`, `signUp`, `signIn`, `blockAccount`, `unblockAccount` mutations.

---

## `./codegen.config`

A ready-to-use [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) configuration for React applications. Re-export it from the consuming app's own `codegen.config.ts` — no need to configure plugins or the schema path manually.

### Frontend usage

```typescript
// apps/admin/codegen.config.ts  (or apps/web)
export { default } from '@packages/graphql-generated/codegen.config';
```

Add the codegen script to the app's `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config node_modules/@packages/graphql-generated/codegen.config.ts"
  }
}
```

### What gets generated

Running `pnpm codegen` inside a consuming app produces two kinds of output:

| Output            | Location                                                                | Contents                                                                      |
| ----------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Base schema types | `src/__generated__/graphql-shared.type.ts`                              | TypeScript types for every GraphQL type, input, and scalar in the schema      |
| Operation types   | Next to each `.gql` / `.graphql` file, as `<name>.graphql.generated.ts` | Typed `DocumentNode` for the specific query/mutation, plus input/result types |

Key codegen behaviours:

- Uses the [`near-operation-file` preset](https://the-guild.dev/graphql/codegen/plugins/presets/near-operation-file-preset) — generated files live alongside their `.graphql` sources.
- Emits `TypedDocumentNode` exports — import precompiled document nodes directly instead of using the `gql` template literal.
- Nullable object fields use `null` (not `undefined`) to match Apollo Client v4 conventions.
- `__typename` is always present on selection sets (`nonOptionalTypename: true`, `addTypename: true`).
- After generation, ESLint (`--fix`) and Prettier (`--write`) are applied automatically.

---

## Related packages

- `@packages/graphql-definitions` — source of truth for all GraphQL contracts; generates `schema.gql`
- `apps/admin` — primary frontend consumer; uses Apollo Client 4 with the typed document nodes
- `apps/web` — public Next.js app; also a codegen consumer
