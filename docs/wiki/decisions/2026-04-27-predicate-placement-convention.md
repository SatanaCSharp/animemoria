---
updated: 2026-04-27
type: decision
status: accepted
tags: [typescript, predicates, utils, shared, convention, backend, frontend]
---

# 2026-04-27 — Predicate Placement Convention

## Context

A predicate is a boolean-returning function that checks a condition — it is the building block of conditional logic across all layers of the codebase. AniMemoria services and apps write condition checks in many places: null-safety guards, business-rule validations, environment detection. Without a consistent placement policy, identical checks get duplicated, and project-wide predicates end up scattered across services rather than being reused from a shared location.

`@packages/utils/predicates` already ships universal predicates (`isDefined`, `isEmpty`, `isNull`, `isUndefined`, `isProd`) consumed by every service and both frontend apps. Business-domain predicates are a separate concern and must not land in `@packages/utils`, which is explicitly free of business logic.

## Decision

### Rule 1 — Common predicates live in `@packages/utils/predicates`

Any predicate that is **not tied to business logic** and is reusable across services and apps belongs in `@packages/utils/predicates`. These are the universal predicates already exported from that package. Do not re-implement them locally.

```typescript
import { isDefined, isEmpty } from '@packages/utils/predicates';

const active = users.filter(isDefined);
if (isEmpty(results)) throw new NotFoundException('No results');
```

### Rule 2 — Business predicates shared across modules go in `<service>/src/shared/predicates/`

When a predicate encodes **business logic** and is consumed by more than one module inside the same service, it lives in the service's shared predicates directory.

```
apps/users-service/src/shared/predicates/
├── is-active-account.ts
├── is-email-verified.ts
└── index.ts
```

### Rule 3 — Business predicates used by a single module go in `<service>/src/<module>/predicates/`

When a predicate is needed only within one module, co-locate it with that module. Do not promote it to `shared/` unless a second module needs it.

```
apps/auth-service/src/session/predicates/
├── is-session-expired.ts
└── index.ts
```

### Rule 4 — Predicates apply on both backend and frontend

The placement rules above apply equally to NestJS services and to `apps/admin` / `apps/web`. Frontend predicates that are module-scoped live under `src/<feature>/predicates/`; those shared across features live under `src/shared/predicates/`.

### Rule 5 — Never add business logic to `@packages/utils`

`@packages/utils` has no runtime dependencies beyond `@packages/shared-types` and must remain free of domain concepts. If a predicate needs to import a domain type, an entity, or a service-specific enum, it does **not** belong in `@packages/utils`.

### Decision table

| Predicate type                        | Scope                | Location                             |
| ------------------------------------- | -------------------- | ------------------------------------ |
| Null / type narrowing, env detection  | Cross-repo           | `@packages/utils/predicates`         |
| Domain logic, reused across modules   | Single service / app | `<service>/src/shared/predicates/`   |
| Domain logic, used by one module only | Single module        | `<service>/src/<module>/predicates/` |

---

## Examples

### Shared business predicate (users-service)

`apps/users-service/src/shared/predicates/is-active-account.ts`:

```typescript
import { Account } from '../entities/account.entity';
import { AccountStatus } from '@packages/shared-types/enums';

export const isActiveAccount = (account: Account): boolean =>
  account.status === AccountStatus.ACTIVE;
```

Used by both the `profile` module and the `admin` module inside `users-service`.

### Module-scoped business predicate (auth-service)

`apps/auth-service/src/session/predicates/is-session-expired.ts`:

```typescript
import { Session } from '../entities/session.entity';

export const isSessionExpired = (session: Session): boolean =>
  session.expiresAt < new Date();
```

Used only inside the `session` module — stays co-located, not promoted to `shared/`.

### Universal predicate from `@packages/utils`

```typescript
import { isDefined } from '@packages/utils/predicates';

const validTokens = rawTokens.filter(isDefined);
```

No duplication of `isDefined` anywhere in the monorepo.

---

## Consequences

- Eliminates duplicated null-safety checks scattered across services.
- Business predicates are discoverable at predictable paths; no service-wide search needed.
- `@packages/utils` stays dependency-free of business concepts, keeping the package universally consumable.
- Promotion path is explicit: single-module → `shared/` when a second consumer appears.

## Cross-references

- [[packages/utils]]
- [[decisions/2026-04-27-invariant-assertion-pattern]]
