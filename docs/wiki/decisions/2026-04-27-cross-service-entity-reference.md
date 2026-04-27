---
updated: 2026-04-27
type: decision
status: accepted
tags:
  [
    architecture,
    cross-service,
    entity-reference,
    grpc,
    users-service,
    auth-service,
  ]
---

# 2026-04-27 — Cross-Service Entity Reference Pattern

## Context

`users-service` and `auth-service` each own a separate PostgreSQL database. The `User` entity (users-service) needs to refer to the `Account` entity (auth-service) to express the relationship "this user profile belongs to that identity." A traditional foreign-key constraint is impossible across separate databases.

## Decision

Use a **logical (application-level) foreign key**:

- `users.accountId` stores the UUID of the corresponding `accounts.id` row in the auth-service database.
- No `REFERENCES` constraint is declared in the users-service migration — referential integrity is enforced at the application layer, not by the database engine.
- Cross-service data composition (e.g. "resolve User for a given Account") is done via **gRPC** calls between services, not via SQL joins.

```
users-service DB           auth-service DB
┌──────────────────┐       ┌─────────────────┐
│ users            │       │ accounts        │
│  id              │       │  id  ◄──────────┼── users.accountId (logical FK)
│  email           │       │  email          │
│  nickname        │       │  status         │
│  accountId  ─────┼──────►│  password       │
└──────────────────┘       └─────────────────┘
          cross-DB reference resolved via gRPC
```

## Consequences

- **No cascade deletes at DB level.** When an Account is deleted, the application layer (or a domain event) must delete or tombstone the corresponding User record.
- **Consistency is eventual.** If auth-service deletes an account and users-service cleanup fails, orphaned User rows can exist temporarily.
- **No JOIN across services.** Any query that needs both User and Account fields must make two calls (or one gRPC call that the called service resolves internally) and merge results in the caller.
- **Migrations are independent.** Each service's TypeORM migrations run against its own database; no shared migration tooling is needed.

## Enforcement

- Never add a `@ManyToOne(() => Account)` decorator in `User` entity — the Account type lives in a different service and codebase.
- `accountId` on the `User` entity is a plain `uuid` column with a `UNIQUE` constraint (one account → one profile).

## Cross-references

- [[service-entities/users-service/user]]
- [[service-entities/auth-service/account]]
- [[decisions/2026-04-27-auth-user-separation]]
- [[packages/grpc]]
