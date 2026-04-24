---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-shared-types.md
  - packages/shared-types/package.json
  - packages/shared-types/src/
tags: [package, typescript, shared, errors, enums, types]
---

# @packages/shared-types

Cross-service enums, typed error hierarchy, and generic utility types shared across all AniMemoria services and apps. This package has no runtime dependencies and no business logic — it is the base vocabulary layer that every other package and service imports from.

**Consumed by:** [[packages/utils]], [[packages/nest-shared]], [[packages/graphql-definitions]], [[services/users-service]], [[services/auth-service]], [[services/registry-service]], [[services/api-gateway-service]], [[frontend/admin]]

---

## Architecture

### File layout

```
packages/shared-types/src/
├── errors/
│   ├── application.error.ts    # ApplicationError
│   ├── assertion.error.ts      # AssertionError
│   ├── not-implemented.error.ts # NotImplementedError<TArgs>
│   ├── system.error.ts         # SystemError
│   └── index.ts                # barrel
├── enums/
│   ├── account-status.ts       # AccountStatus
│   ├── error-type.ts           # ErrorType
│   └── index.ts                # barrel
└── utils/
    ├── maybe.ts                # Maybe<T>
    └── index.ts                # barrel
```

### Exports

The package uses **sub-path exports only** — there is no root barrel. Consumers must import from one of three named entry points:

| Entry point                     | Contents                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- |
| `@packages/shared-types/errors` | `ApplicationError`, `AssertionError`, `NotImplementedError`, `SystemError` |
| `@packages/shared-types/enums`  | `AccountStatus`, `ErrorType`                                               |
| `@packages/shared-types/utils`  | `Maybe<T>`                                                                 |

### Build

Compiled with `tsc` + `tsc-alias` to `dist/`. `type: "commonjs"` in `package.json`. Node ≥ 24 required. No runtime dependencies — devDependencies only (`@packages/tsconfig`, `@packages/eslint-config-base`, `tsc-alias`, `typescript`).

> **Note:** The `dist/` directory contains a stale `enums/user-status.*` artifact (not present in `src/`). This is a build remnant from a prior iteration; the canonical enum list is `AccountStatus` and `ErrorType` only.

---

## API Reference

### `@packages/shared-types/errors`

Typed error hierarchy for domain and infrastructure failures. All four classes extend `Error` directly — no custom base class is shared between them.

| Class                        | Typical use                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `ApplicationError`           | Business rule / domain violations (e.g. "User already exists")         |
| `AssertionError`             | Failed runtime preconditions (e.g. "Expected value to be defined")     |
| `NotImplementedError<TArgs>` | Unimplemented stubs; optional `args` are serialized into the message   |
| `SystemError`                | Infrastructure / unexpected failures (e.g. "Database connection lost") |

**`NotImplementedError`** accepts an optional generic `TArgs`. When `args` is an object it is `JSON.stringify`-ed; when it is a primitive it is coerced via `String()`. This makes stub error messages self-documenting in logs.

```typescript
import {
  ApplicationError,
  AssertionError,
  NotImplementedError,
  SystemError,
} from '@packages/shared-types/errors';

throw new ApplicationError('User already exists');
throw new AssertionError('Expected value to be defined');
throw new NotImplementedError('sendEmail', { userId: '123' });
// message: "sendEmail args: {"userId":"123"} "
throw new SystemError('Database connection lost');
```

### `@packages/shared-types/enums`

Shared enumerations used across multiple services. Enum values are lowercase strings, matching the GraphQL schema convention for `SCREAMING_SNAKE_CASE`-named variants mapped to string literals.

**`AccountStatus`** — lifecycle state of a user account:

| Variant   | Value       |
| --------- | ----------- |
| `ACTIVE`  | `'active'`  |
| `INVITED` | `'invited'` |
| `BLOCKED` | `'blocked'` |

**`ErrorType`** — discriminant for error categorization in API responses:

| Variant       | Value           |
| ------------- | --------------- |
| `APPLICATION` | `'application'` |
| `VALIDATION`  | `'validation'`  |

```typescript
import { AccountStatus, ErrorType } from '@packages/shared-types/enums';

const status: AccountStatus = AccountStatus.ACTIVE;
const type: ErrorType = ErrorType.VALIDATION;
```

### `@packages/shared-types/utils`

Generic TypeScript utility types.

**`Maybe<T>`** — `T | null | undefined`. Use as a return type for lookups that may produce no result, avoiding the overloaded `T | null` vs `T | undefined` ambiguity.

```typescript
import type { Maybe } from '@packages/shared-types/utils';

function findUser(id: string): Maybe<User> {
  return db.users.find((u) => u.id === id) ?? null;
}
```

---

## Cross-references

- Error classes are thrown by [[packages/utils]] (`assertFail`, `assert`) and [[packages/nest-shared]] exception filters
- `AccountStatus` is used as a TypeORM column type in [[services/users-service]] and [[services/auth-service]]
- `ErrorType` is used in GraphQL error response shaping — see [[graphql-entities/account-response]]
- `Maybe<T>` is referenced in [[packages/utils]] type guards (`stringToEnumValue` return type)
