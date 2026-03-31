# @packages/utils

Runtime utility functions shared across all AniMemoria services and apps — assertion helpers, boolean predicates, type guards, and async primitives.

---

## `@packages/utils/asserts`

Invariant-checking functions that throw on violated conditions. Used to enforce preconditions and unreachable states at runtime.

**Exported functions:**

- `assert(condition, message)` — throws `AssertionError` (or a custom error) when `condition` is `false`
- `assertDefined(value, message?)` — narrows `T | null | undefined` to `T`; throws if the value is `null` or `undefined`
- `assertFail(error?)` — unconditionally throws; marks unreachable branches for the TypeScript compiler (`never`)

### Usage

```typescript
import { assert, assertDefined, assertFail } from '@packages/utils/asserts';

// Invariant check
assert(user.age >= 0, 'Age must be non-negative');

// Narrow nullable value
const user = await repo.findOne(id);
assertDefined(user, new NotFoundException(`User ${id} not found`));
// user is now User (not User | null | undefined)

// Exhaustive switch guard
switch (role) {
  case Role.Admin:
    return handleAdmin();
  case Role.User:
    return handleUser();
  default:
    assertFail(); // compile-time exhaustiveness + runtime safety
}
```

---

## `@packages/utils/predicates`

Boolean predicate functions for null-safety checks and environment detection.

**Exported functions:**

- `isDefined(value)` — returns `true` if value is not `null` and not `undefined`; narrows to `NonNullable<T>`
- `isEmpty(value)` — returns `true` if `value.length === 0` (arrays, strings, etc.)
- `isNull(value)` — returns `true` if value is `null`; narrows to `null`
- `isUndefined(value)` — returns `true` if value is `undefined`; narrows to `undefined`
- `isProd(value)` — returns `true` if the string equals `'production'`

### Usage

```typescript
import { isDefined, isEmpty, isProd } from '@packages/utils/predicates';

// Filter nullables from an array
const users = rawUsers.filter(isDefined);

// Guard empty collections
if (isEmpty(results)) {
  throw new NotFoundException('No results found');
}

// Environment check
if (isProd(process.env.NODE_ENV)) {
  enableProductionOnlyFeature();
}
```

---

## `@packages/utils/type-guards`

Type-safe coercion helpers that validate values at runtime before narrowing their TypeScript type.

**Exported functions:**

- `stringToEnumValue(value, enumObj)` — asserts that a raw string is a valid member of `enumObj` and returns it typed as `TEnum[keyof TEnum]`; throws `TypeError` if the value is not in the enum

### Usage

```typescript
import { stringToEnumValue } from '@packages/utils/type-guards';
import { UserRole } from '@packages/shared-types/enums';

// Safe coercion from an external/untyped string (e.g. HTTP header, env var)
const role = stringToEnumValue(rawRoleHeader, UserRole);
// role: UserRole — throws TypeError if rawRoleHeader is not a valid UserRole value
```

---

## `@packages/utils/async`

Async timing helpers.

**Exported functions:**

- `sleep(ms)` — returns a `Promise<void>` that resolves after `ms` milliseconds

### Usage

```typescript
import { sleep } from '@packages/utils/async';

// Delay between retry attempts
await sleep(500);
```
