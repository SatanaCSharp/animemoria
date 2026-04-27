---
updated: 2026-04-27
type: decision
status: accepted
tags: [auth-service, users-service, architecture, domain-separation]
---

# 2026-04-27 — Auth/User Domain Separation

## Context

Two complementary but distinct concerns exist in the platform: **identity** (who you are, how you prove it, what you are allowed to do) and **profile** (the user as a business entity that other services reference). Merging them into one service creates a single point of failure and couples authentication logic to business logic.

## Decision

**auth-service** owns everything that concerns identity:

- `Account` — email + hashed password; the canonical identity record.
- `Session` — refresh-token hash, app-type, and expiry; one-to-many with Account (CASCADE delete).
- **Roles & permissions** — role assignments and permission checks live here; auth-service is the authority for authorization decisions.

**users-service** owns everything that concerns the user as a business participant:

- `User` — nickname, display preferences, and a logical reference (`accountId`) back to the auth-service `Account`.
- Cross-service queries (e.g. "get profile for this account") are resolved at the application layer via gRPC — there is no shared database and no foreign-key constraint across service boundaries.

**The key invariant:** a `User` record is created after an `Account` is created (signup flow), and `accountId` on the `User` table is a logical FK only — no `REFERENCES` constraint in the database.

## Consequences

- Auth and user databases can be scaled, migrated, and maintained independently.
- All authentication and authorisation gate decisions route through auth-service; users-service never validates tokens.
- Any feature that needs both profile data and identity data must compose them at the gateway or via a gRPC call between services.
- Deleting an account does not automatically cascade to the User record — the application layer must handle cleanup (or a domain event).

## Cross-references

- [[service-entities/auth-service/account]]
- [[service-entities/auth-service/session]]
- [[service-entities/users-service/user]]
- [[services/auth-service]]
- [[services/users-service]]
