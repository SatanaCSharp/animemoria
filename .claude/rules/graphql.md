---
globs: ['packages/graphql-*/**']
---

# GraphQL / Apollo Federation conventions

## Federation

- All subgraph schemas use Apollo Federation v2 directives (`@key`, `@external`, `@shareable`, etc.).
- Entity resolvers must implement `__resolveReference` when the type is a federation entity.
- The gateway (`api-gateway-service`) must never define business-logic resolvers — it composes only.

## Codegen (`@packages/graphql-generated`)

- Run `pnpm codegen` after any schema change in `@packages/graphql-definitions`.
- Generated files are committed — do not gitignore them; CI validates they are up to date.
- Use the generated typed hooks (`useQuery`, `useMutation`) in `admin`; do not hand-write Apollo Client calls.

## Schema conventions

- Scalar dates as `String` (ISO 8601) unless a custom `DateTime` scalar is already wired.
- Enum values in `SCREAMING_SNAKE_CASE` in the schema; map to TypeScript enums from `@packages/shared-types`.
- Avoid schema stitching — use federation entity references instead.
