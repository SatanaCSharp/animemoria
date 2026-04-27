---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-utils.md
  - packages/utils/package.json
  - packages/utils/src/
tags: [package, utils, typescript, shared]
---

# @packages/utils

Runtime utility functions shared across all AniMemoria services and apps. Provides assertion helpers, boolean predicates, type guards, and async primitives. No business logic — pure TypeScript with no runtime dependencies beyond `@packages/shared-types`.

**Consumed by:** [[services/users-service]], [[services/auth-service]], [[services/registry-service]], [[services/api-gateway-service]], [[packages/nest-shared]], [[packages/graphql-definitions]], [[frontend/admin]]

---

## Architecture

### File layout

```
packages/utils/src/
├── asserts/
│   ├── assert.ts             # core assertion
│   ├── assert-defined.ts     # null/undefined narrowing
│   ├── assert-fail.ts        # unreachable-branch marker
│   └── index.ts              # barrel
├── predicates/
│   ├── is-defined.ts
│   ├── is-empty.ts
│   ├── is-null.ts
│   ├── is-undefined.ts
│   ├── is-prod.ts
│   └── index.ts
├── type-guards/
│   ├── string-to-enum-value.ts
│   └── index.ts
└── async/
    ├── sleep.ts
    └── index.ts
```

### Exports

The package uses **sub-path exports** — no single barrel root. Consumers import from one of four named entry points:

| Entry point                   | Contents                                                  |
| ----------------------------- | --------------------------------------------------------- |
| `@packages/utils/asserts`     | `assert`, `assertDefined`, `assertFail`                   |
| `@packages/utils/predicates`  | `isDefined`, `isEmpty`, `isNull`, `isUndefined`, `isProd` |
| `@packages/utils/type-guards` | `stringToEnumValue`                                       |
| `@packages/utils/async`       | `sleep`                                                   |

### Build

Compiled with `tsc` + `tsc-alias` to `dist/`. `type: "commonjs"` in package.json. No ESM output. Node ≥ 24 required.

All utility functions ship with co-located unit tests (`*.spec.ts`).

---

## API Reference

### `@packages/utils/asserts`

Invariant-checking functions that **throw on violated conditions**. Used to enforce preconditions and exhaustiveness at runtime.

- **`assert(condition, message?)`** — throws `AssertionError` (or a custom error passed as `message`) when `condition` is `false`.
- **`assertDefined(value, message?)`** — narrows `T | null | undefined` → `T`; throws if value is `null` or `undefined`.
- **`assertFail(error?)`** — unconditionally throws; signals unreachable branches to the TypeScript compiler (`never`).

```typescript
import { assert, assertDefined, assertFail } from '@packages/utils/asserts';

assert(user.age >= 0, 'Age must be non-negative');

const user = await repo.findOne(id);
assertDefined(user, new NotFoundException(`User ${id} not found`));
// user is now typed as User (never null | undefined)

switch (role) {
  case Role.Admin:
    return handleAdmin();
  case Role.User:
    return handleUser();
  default:
    assertFail(); // compile-time exhaustiveness + runtime safety
}
```

### `@packages/utils/predicates`

Boolean narrowing predicates for null-safety and environment detection.

- **`isDefined(value)`** — `true` if not `null` and not `undefined`; narrows to `NonNullable<T>`. Safe as an array `.filter()` callback.
- **`isEmpty(value)`** — `true` if `value.length === 0` (arrays, strings).
- **`isNull(value)`** — narrows to `null`.
- **`isUndefined(value)`** — narrows to `undefined`.
- **`isProd(value)`** — `true` if the string equals `'production'`. Intended for `process.env.NODE_ENV` checks.

```typescript
import { isDefined, isEmpty, isProd } from '@packages/utils/predicates';

const users = rawUsers.filter(isDefined); // removes null/undefined
if (isEmpty(results)) throw new NotFoundException('No results');
if (isProd(process.env.NODE_ENV)) enableProdFeature();
```

### `@packages/utils/type-guards`

Runtime coercion with TypeScript narrowing.

- **`stringToEnumValue(value, enumObj)`** — asserts that a raw string is a valid member of `enumObj` and returns it typed as `TEnum[keyof TEnum]`. Throws `TypeError` (via `assert`) if value is not in the enum. Useful for coercing untyped inputs (HTTP headers, env vars, config values).

```typescript
import { stringToEnumValue } from '@packages/utils/type-guards';
import { UserRole } from '@packages/shared-types/enums';

const role = stringToEnumValue(rawRoleHeader, UserRole);
// role: UserRole — throws TypeError if rawRoleHeader is not a valid member
```

> **Implementation note:** `stringToEnumValue` uses `assert` internally (from `asserts/assert`), so the thrown error is a `TypeError` wrapped in `assert`'s path — not a standalone `TypeError`.

### `@packages/utils/async`

- **`sleep(ms)`** — returns a `Promise<void>` that resolves after `ms` milliseconds. Utility for delays in retry loops and test helpers.

```typescript
import { sleep } from '@packages/utils/async';
await sleep(500);
```

---

## Dependencies

- **Runtime:** `@packages/shared-types` (for enum types used with type guards)
- **Dev:** `@packages/jest-config-preset`, `@packages/tsconfig`, `@packages/eslint-config-base`, standard Jest/TS toolchain
