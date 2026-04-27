---
updated: 2026-04-27
type: service-entity
sources:
  - apps/users-service/src/shared/domain/entities/user.entity.ts
  - apps/users-service/CLAUDE.md
tags: [entity, typeorm, users-service, postgresql]
---

# User entity

DB table: `users`. Owned by [[services/users-service]]. Corresponds to the federated GraphQL type [[graphql-entities/user]].

## Columns

| Column      | DB name      | Type        | Nullable | Notes                                                                                           |
| ----------- | ------------ | ----------- | -------- | ----------------------------------------------------------------------------------------------- |
| `id`        | `id`         | `uuid` (PK) | no       | `PrimaryGeneratedColumn('uuid')`                                                                |
| `email`     | `email`      | `varchar`   | no       |                                                                                                 |
| `nickname`  | `nickname`   | `varchar`   | no       |                                                                                                 |
| `accountId` | `account_id` | `varchar`   | no       | Foreign key to `accounts.id` in auth-service's DB; cross-DB reference, no TypeORM FK constraint |
| `createdAt` | `created_at` | `timestamp` | no       | Inherited from `BaseEntity`; set on insert                                                      |
| `updatedAt` | `updated_at` | `timestamp` | no       | Inherited from `BaseEntity`; updated on change                                                  |

## Relations

- `accountId` references `Account.id` in [[service-entities/auth-service/account]]. Because each service has its own database, this is a logical reference only — no database-level foreign key or cascade is enforced at the TypeORM level.

## Constraints / notes

- Extends `BaseEntity` from `@packages/nest-shared/orm`, which adds `createdAt` / `updatedAt` via TypeORM lifecycle decorators.
- No unique constraint is declared on `email` in the entity; verify via migration if uniqueness is required.
- Profile data lives here; credential and session data live in [[services/auth-service]].
