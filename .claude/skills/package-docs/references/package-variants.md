# Package variant templates

Use this reference when the canonical (nest-shared) template does not apply.

---

## Generated-gRPC variant

**Applies to:** `@packages/grpc`

Characteristics:

- Single root export (`.` → `dist/index`)
- Source is **machine-generated** from `.proto` files via `ts-proto`
- Exports: gRPC service client interfaces, request/response message types, health types
- No NestJS modules — consumers wire clients manually via `@packages/nest-shared/grpc`

```
# @packages/grpc

Generated TypeScript bindings for all AniMemoria gRPC contracts.
Compiled from `.proto` files in `protobufs/` using `ts-proto`.
Do NOT edit files under `src/generated/` manually — run `pnpm proto:generate` to regenerate.

## Regenerating

\`\`\`bash
pnpm --filter @packages/grpc proto:generate   # compile .proto → TypeScript
pnpm --filter @packages/grpc build             # tsc
\`\`\`

## Exported services

One subsection per `.proto` file:

### `<ServiceName>` (`protobufs/<service_name>.proto`)

<What domain this service covers.>

**Client interface:** `<ServiceName>Client`
**Key message types:** list the most-used request/response types

### Usage

\`\`\`typescript
// Inject via @packages/nest-shared/grpc — do not instantiate directly.
// Type-annotate the client:
import type { UsersServiceClient } from '@packages/grpc';

@InjectGrpcServiceClient('users-service')
private readonly client: ClientGrpc;

onModuleInit() {
  this.usersService = this.client.getService<UsersServiceClient>('UsersService');
}
\`\`\`
```

**Formatting rules specific to this variant:**

- Open with a "Do NOT edit generated files" warning.
- Include the `pnpm proto:generate` command.
- Group by proto file, not by individual message type.
- No env vars section (connection config lives in `@packages/nest-shared/grpc`).

---

## Domain-types variant

**Applies to:** `@packages/graphql-definitions`, `@packages/shared-types`, `@packages/utils`

Characteristics:

- Exports plain TypeScript: enums, interfaces, DTOs, entities, GraphQL-decorated classes
- No NestJS module wiring
- Exports grouped by domain/feature (e.g., `./user`, `./account`) or a single root

```
# @packages/<name>

<1-2 sentence description: what domain contracts/types this package owns.>

---

## `@packages/<name>/<domain-export>`

<What types/interfaces/classes this domain export contains.>

**Exported types:**
- `<ClassName>` — <one-line description>
- `<InterfaceName>` — <one-line description>

### Usage

\`\`\`typescript
import { UserEntity, CreateUserInput } from '@packages/graphql-definitions/user';

// implement the resolver interface for contract-first development:
export class UsersResolver implements UserMutationInterface {
  ...
}
\`\`\`
```

**Additional section for `@packages/graphql-definitions`:**

```
## Contract-first workflow

1. Add or update types in `packages/graphql/definitions/src/<domain>/`.
2. Run `pnpm --filter @packages/graphql-definitions build:schema` to regenerate `schema.gql`.
3. Implement the updated interface in the target service resolver/controller.
```

**Formatting rules specific to this variant:**

- List exported types with one-line descriptions instead of showing module wiring.
- Include a "contract-first workflow" section if the package is the source of truth for API contracts.
- No env vars section.

---

## Tooling-artifact variant

**Applies to:** `@packages/graphql-generated`

Characteristics:

- Not imported as a library — consumed by build tooling and frontend codegen
- Exports: compiled `schema.gql` and `codegen.config.ts`
- Consumers are frontend apps (`apps/admin`, `apps/web`) not backend services

```
# @packages/graphql-generated

Aggregated GraphQL schema and codegen configuration for frontend consumers.
The schema is compiled from all subgraph SDL files. Do NOT edit `schema.gql` manually.

## Regenerating

\`\`\`bash
pnpm --filter @packages/graphql-generated codegen
\`\`\`

## Exports

| Export path | File | Purpose |
|---|---|---|
| `./schema` | `schema.gql` | Full federated schema used by frontend codegen |
| `./codegen.config` | `codegen.config.ts` | GraphQL Code Generator config for typed operations |

## Frontend usage

\`\`\`typescript
// apps/admin or apps/web — vite/codegen config
import config from '@packages/graphql-generated/codegen.config';
export default config;
\`\`\`

## What gets generated

Describe what the codegen produces: typed React hooks, document nodes, TypeScript operation types, etc.
Point to output directories inside the consuming app.
```

**Formatting rules specific to this variant:**

- Use a table for the exports (few entries, tabular comparison makes sense here).
- No "Usage" code block showing NestJS injection.
- Include a "What gets generated" section describing codegen output.
- Note who the consumers are (frontend apps, not backend services).
