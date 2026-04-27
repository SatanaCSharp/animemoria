---
updated: 2026-04-27
type: reference
sources:
  - docs/raw/assertion-function-in-typescript.md
tags: [typescript, assertions, type-narrowing, type-guards]
---

# Assertion Functions in TypeScript

TypeScript assertion functions (introduced in TS 3.7) encode runtime invariant checks directly into the type system. When an assertion function returns normally, the compiler narrows the type of the checked value for all subsequent code — eliminating the need for redundant null-checks or casts.

**Project usage:** [[packages/utils]] implements `assert`, `assertDefined`, and `assertFail` as assertion functions consumed across every service and app.

---

## The `asserts` Signature

An assertion function uses `asserts` in its return type to communicate the narrowing to the compiler:

```typescript
// asserts value is T — compiler narrows `value` to `T` after a successful call
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('Not a string');
}

// asserts condition — compiler treats `condition` as definitely true after the call
function assert(condition: unknown, msg?: string): asserts condition {
  if (condition === false) throw new Error(msg);
}
```

If the function throws, control never reaches the code after the call. If it returns, the compiler knows the assertion held.

---

## Common Patterns

### Non-nullability narrowing

```typescript
function assertDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`);
  }
}

const user = await repo.findOne(id); // User | null
assertDefined(user);
user.email; // User — null branch eliminated
```

This is exactly how `assertDefined` in `@packages/utils/asserts` works.

### Union / literal narrowing

```typescript
type AccessLevel = 'r' | 'w' | 'rw';

function assertAllowsRead(level: AccessLevel): asserts level is 'r' | 'rw' {
  if (!level.includes('r')) throw new Error('Read not allowed');
}
```

### Exhaustiveness marker

```typescript
function assertFail(error?: unknown): never {
  throw error ?? new Error('Unreachable branch');
}

switch (status) {
  case 'active':
    return handleActive();
  case 'banned':
    return handleBanned();
  default:
    assertFail(); // compile-time: default case is `never`
}
```

`assertFail` in `@packages/utils/asserts` uses this pattern to signal unreachable branches.

---

## Assertion Functions vs. Type Guards

|                    | Type guard             | Assertion function                  |
| ------------------ | ---------------------- | ----------------------------------- |
| Return type        | `value is T` (boolean) | `asserts value is T` (void / never) |
| On failure         | returns `false`        | throws an error                     |
| Arrow function     | supported              | requires a named type alias         |
| Use in `.filter()` | yes                    | no                                  |

Type guards (`isDefined`, `isNull`, …) live in `@packages/utils/predicates` and are the right choice when you need a boolean result (e.g., `.filter(isDefined)`). Assertion functions are the right choice when a failing check must abort execution.

### Arrow function workaround

The `asserts` return type cannot appear inline on an arrow function. Use a type alias:

```typescript
type AssertIsNumber = (value: unknown) => asserts value is number;
const assertIsNumber: AssertIsNumber = (value) => {
  if (typeof value !== 'number') throw new Error('Not a number');
};
```

---

## When to Use in This Project

- **Service boundaries** — assert that request payloads or gRPC input fields are valid before processing them (pairs with [[references/invariant]]).
- **After optional DB lookups** — `assertDefined(entity, new NotFoundException(...))` to narrow `Entity | null` to `Entity`.
- **Exhaustive switch statements** — `assertFail()` in the `default` branch to catch missed enum cases at compile time and runtime.
- **Avoid inside `.filter()` or `.map()` callbacks** — use predicates (`isDefined`) there instead.
