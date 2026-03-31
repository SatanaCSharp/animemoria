# @packages/scripts

Shared shell scripts for TypeORM database migration management across all NestJS services.
Exposed as `bin` commands and invoked via `pnpm` scripts in each service.

---

## `create-migration`

Scaffolds a new empty TypeORM migration file under `db/migrations/` (default) using the `typeorm` CLI.

### Usage

```bash
# From a service root:
pnpm migration:create --name=AddUserAvatarColumn

# With a custom output path:
pnpm migration:create --name=AddUserAvatarColumn --path=db/migrations/users
```

---

## `run-migrations`

Runs all pending TypeORM migrations by delegating to `@packages/nest-shared`'s migration runner.
Supports dev mode (TypeScript via `ts-node`) and prod mode (compiled JS).

### Usage

```bash
# Development (default):
pnpm migration:run --env-file=.env

# Production:
pnpm migration:run --env-file=.env --mode=prod
```

---

## `undo-migration`

Reverts the most recently applied TypeORM migration.

### Usage

```bash
pnpm migration:undo --env-file=.env

# Production:
pnpm migration:undo --env-file=.env --mode=prod
```

---

## `undo-all-migrations`

Reverts **all** applied migrations in reverse order. Use with caution — destructive in production.

### Usage

```bash
pnpm migration:undo:all --env-file=.env

# Production:
pnpm migration:undo:all --env-file=.env --mode=prod
```

---

## Wiring in a service

Add the following to the service's `package.json` `scripts`:

```jsonc
{
  "scripts": {
    "migration:create": "create-migration",
    "migration:run": "run-migrations",
    "migration:undo": "undo-migration",
    "migration:undo:all": "undo-all-migrations",
  },
}
```
