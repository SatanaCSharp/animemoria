---
updated: 2026-04-27
type: service-entity
sources:
  - apps/auth-service/src/shared/domain/entities/account.entity.ts
  - apps/auth-service/CLAUDE.md
tags: [entity, typeorm, auth-service, postgresql]
---

# Account entity

DB table: `accounts`. Owned by [[services/auth-service]]. Corresponds to the federated GraphQL type [[graphql-entities/account]].

## Columns

| Column      | DB name      | Type                     | Nullable | Notes                                                                 |
| ----------- | ------------ | ------------------------ | -------- | --------------------------------------------------------------------- |
| `id`        | `id`         | `uuid` (PK)              | no       | `PrimaryGeneratedColumn('uuid')`                                      |
| `email`     | `email`      | `varchar`                | no       |                                                                       |
| `status`    | `status`     | `enum` (`AccountStatus`) | no       | Values: `active`, `invited`, `blocked`; from `@packages/shared-types` |
| `password`  | `password`   | `varchar`                | no       | Stores hashed password                                                |
| `createdAt` | `created_at` | `timestamp`              | no       | Inherited from `BaseEntity`; set on insert                            |
| `updatedAt` | `updated_at` | `timestamp`              | no       | Inherited from `BaseEntity`; updated on change                        |

## Relations

| Relation   | Type        | Target                                    | Notes                                                              |
| ---------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `sessions` | `OneToMany` | [[service-entities/auth-service/session]] | Cascade delete handled on the Session side (`onDelete: 'CASCADE'`) |

## Constraints / notes

- Extends `BaseEntity` from `@packages/nest-shared/orm`.
- `AccountStatus` enum is defined in `@packages/shared-types/enums` — do not duplicate values locally.
- `id` is referenced by `User.accountId` in [[service-entities/users-service/user]] as a cross-DB logical FK.
- User profile data (nickname, etc.) lives in [[services/users-service]], not here.
