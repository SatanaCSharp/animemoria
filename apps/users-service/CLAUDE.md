# users-service

User domain service. Dual-transport: GraphQL subgraph (:4302) + gRPC server (:4502).  
Database: PostgreSQL via TypeORM.

## Entrypoints

| File                  | Transport                  | Port |
| --------------------- | -------------------------- | ---- |
| `src/graphql.main.ts` | Apollo Federation subgraph | 4302 |
| `src/grpc.main.ts`    | gRPC server                | 4502 |

Start both transports in dev: `pnpm --filter users-service dev` (starts both via `concurrently`).

## TypeORM

- Entities in `src/modules/<feature>/<feature>.entity.ts`.
- Migrations in `src/migrations/` — see `.claude/rules/migrations.md` for CLI commands.
- `DB_CONNECTION_URL` must be set; defaults in `.env.local` (see `CLAUDE.local.md` at repo root).

## gRPC contracts

- Proto definitions in `@packages/grpc`. This service implements the `UsersService` RPC.
- After proto changes: `pnpm proto:generate` → rebuild `@packages/grpc` → rebuild this service.

## Module layout

```
src/
  modules/
    users/        # CRUD, entity, resolver, gRPC controller
    profile/      # profile-specific domain logic
  shared/         # cross-module: guards, interceptors, shared DTOs
  migrations/
```
