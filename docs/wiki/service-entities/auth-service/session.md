---
updated: 2026-04-27
type: service-entity
sources:
  - apps/auth-service/src/shared/domain/entities/session.entity.ts
  - apps/auth-service/CLAUDE.md
tags: [entity, typeorm, auth-service, postgresql, sessions]
---

# Session entity

DB table: `sessions`. Owned by [[services/auth-service]].

## Columns

| Column             | DB name              | Type               | Nullable | Notes                                                                                   |
| ------------------ | -------------------- | ------------------ | -------- | --------------------------------------------------------------------------------------- |
| `id`               | `id`                 | `uuid` (PK)        | no       | `PrimaryGeneratedColumn('uuid')`                                                        |
| `refreshTokenHash` | `refresh_token_hash` | `varchar`          | yes      | Despite the name, stores the raw refresh token value (not a hash); rotated on every use |
| `appType`          | `app_type`           | `enum` (`AppType`) | no       | Values: `admin`, `web`; identifies which frontend client owns the session               |
| `accountId`        | `account_id`         | `varchar`          | no       | FK to `accounts.id`                                                                     |
| `createdAt`        | `created_at`         | `timestamp`        | no       | Inherited from `BaseEntity`; set on insert                                              |
| `updatedAt`        | `updated_at`         | `timestamp`        | no       | Inherited from `BaseEntity`; updated on change                                          |

## Relations

| Relation  | Type        | Target                                    | FK column    | Notes                 |
| --------- | ----------- | ----------------------------------------- | ------------ | --------------------- |
| `account` | `ManyToOne` | [[service-entities/auth-service/account]] | `account_id` | `onDelete: 'CASCADE'` |

## Constraints / notes

- Extends `BaseEntity` from `@packages/nest-shared/orm`.
- `AppType` enum is local to `auth-service` (`src/shared/types/app-type.enum.ts`) — not in `@packages/shared-types`.
- **Field name misleads:** `refreshTokenHash` stores the plaintext refresh token, not a hash. See `auth-service` CLAUDE.md: "field name is misleading — value is not hashed".
- Token rotation: on refresh, the stored value is compared by equality against the incoming cookie; the old token is invalidated immediately with no overlap window.
- `refreshTokenHash` is nullable to support sessions where no refresh token has been issued yet.
