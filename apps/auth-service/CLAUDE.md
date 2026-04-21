# auth-service

Authentication and session service. Dual-transport: GraphQL subgraph (:4303) + gRPC server (:4503).  
Database: PostgreSQL via TypeORM.

## Entrypoints

| File                  | Transport                  | Port |
| --------------------- | -------------------------- | ---- |
| `src/graphql.main.ts` | Apollo Federation subgraph | 4303 |
| `src/grpc.main.ts`    | gRPC server                | 4503 |

## Session / token conventions

- Access tokens: short-lived JWT signed with `AT_SECRET`.
- Refresh tokens: signed with `RT_SECRET`, stored as-is in `Session.refreshTokenHash` (field name is misleading — value is not hashed), and rotated on every use.
- On rotation, the incoming cookie value is compared by equality against the stored field; the previous token is invalidated immediately — do not leave a window.

## TypeORM

- Entities: `src/shared/domain/entities/` (`Account`, `Session`).
- Migrations in `src/migrations/`. Use `DB_CONNECTION_URL` for the auth database (separate from users DB).

## gRPC contracts

- Implements `AuthService` RPC from `@packages/grpc`.
- `ValidateToken` is called by other services — keep the response payload minimal (userId, roles).

## What NOT to add here

- User profile data belongs in `users-service`.
- This service is auth/sessions only — no user CRUD.
