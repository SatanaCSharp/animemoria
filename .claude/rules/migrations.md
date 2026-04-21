---
globs: ['apps/*-service/src/migrations/**']
---

# TypeORM migrations

## Generating a migration

```bash
DB_CONNECTION_URL=<url> pnpm --filter <service> migration:generate src/migrations/<MigrationName>
```

`<url>` must point to the correct database for that service (users or auth).

## Rules

- Never edit a migration file after it has been committed and run in any shared environment (staging, production).
- Each migration must be idempotent where possible — use `IF NOT EXISTS` / `IF EXISTS` guards.
- Migration class name must match the filename timestamp prefix exactly (TypeORM requirement).
- Add the migration to the `migrations` array in the service's `TypeOrmModule` options — do not rely on `migrationsRun: true` in production without explicit review.
- `registry-service` and `api-gateway-service` have no database — never create migrations for them.

## Running migrations

```bash
DB_CONNECTION_URL=<url> pnpm --filter <service> migration:run
```

Always run against a backup or staging DB first.
