# auth-service

Authentication and session service. Dual-transport: GraphQL subgraph (:4303) + gRPC server (:4503).  
Database: PostgreSQL via TypeORM.

## Entrypoints

| File                  | Transport                  | Port |
| --------------------- | -------------------------- | ---- |
| `src/graphql.main.ts` | Apollo Federation subgraph | 4303 |
| `src/grpc.main.ts`    | gRPC server                | 4503 |

## Session / token conventions

- Access tokens: short-lived JWT signed with `AUTH_JWT_SECRET`.
- Refresh tokens: stored in the database (`RefreshToken` entity) and rotated on use.
- On rotation, invalidate the previous token immediately — do not leave a window.
- Never store raw tokens; store only hashed refresh tokens in the DB.

## TypeORM

- Entities: `src/modules/sessions/session.entity.ts`, `src/modules/tokens/refresh-token.entity.ts`.
- Migrations in `src/migrations/`. Use `DB_CONNECTION_URL` for the auth database (separate from users DB).

## gRPC contracts

- Implements `AuthService` RPC from `@packages/grpc`.
- `ValidateToken` is called by other services — keep the response payload minimal (userId, roles).

## What NOT to add here

- User profile data belongs in `users-service`.
- This service is auth/sessions only — no user CRUD.
