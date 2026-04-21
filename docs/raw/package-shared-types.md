# @packages/shared-types

Cross-service enums, error classes, and utility types shared across all AniMemoria apps and packages.

---

## `@packages/shared-types/errors`

Typed error hierarchy for domain and system failures. Provides `ApplicationError`, `AssertionError`, `NotImplementedError`, and `SystemError`.

### Usage

```typescript
import {
  ApplicationError,
  AssertionError,
  NotImplementedError,
  SystemError,
} from '@packages/shared-types/errors';

// Domain-level error (business rule violation)
throw new ApplicationError('User already exists');

// Precondition failure (failed runtime assertion)
throw new AssertionError('Expected value to be defined');

// Stub placeholder
throw new NotImplementedError('sendEmail', { userId });

// Infrastructure-level failure
throw new SystemError('Database connection lost');
```

**Error classes:**

| Class                        | Extends | Typical use                                                              |
| ---------------------------- | ------- | ------------------------------------------------------------------------ |
| `ApplicationError`           | `Error` | Business rule / domain violations                                        |
| `AssertionError`             | `Error` | Failed runtime preconditions                                             |
| `NotImplementedError<TArgs>` | `Error` | Unimplemented stubs; accepts optional `args` serialized into the message |
| `SystemError`                | `Error` | Infrastructure / unexpected failures                                     |

---

## `@packages/shared-types/enums`

Shared enumerations consumed by multiple services. Provides `AccountStatus` and `ErrorType`.

### Usage

```typescript
import { AccountStatus, ErrorType } from '@packages/shared-types/enums';

// AccountStatus — lifecycle state of a user account
const status: AccountStatus = AccountStatus.ACTIVE;
// Values: ACTIVE | INVITED | BLOCKED

// ErrorType — discriminant for error categorization in responses
const type: ErrorType = ErrorType.VALIDATION;
// Values: APPLICATION | VALIDATION
```

---

## `@packages/shared-types/utils`

Generic TypeScript utility types. Provides `Maybe<T>`.

### Usage

```typescript
import type { Maybe } from '@packages/shared-types/utils';

// Maybe<T> = T | null | undefined
function findUser(id: string): Maybe<User> {
  return db.users.find((u) => u.id === id) ?? null;
}
```
