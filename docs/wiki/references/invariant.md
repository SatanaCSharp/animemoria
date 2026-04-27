---
updated: 2026-04-27
type: reference
sources:
  - docs/raw/invariant.md
tags: [typescript, invariants, assertions, correctness]
---

# Invariants

An **invariant** is a condition that is provably true throughout the execution of a piece of code. Establishing invariants lets downstream code skip redundant checks — the property is guaranteed once, then assumed everywhere else.

**Project usage:** [[packages/utils]] `asserts` sub-path (`assert`, `assertDefined`, `assertFail`) is the primary mechanism for establishing invariants at runtime boundaries in AniMemoria.

---

## How Invariants Are Established

### By construction

When a variable's type or initialization guarantees a property, no runtime check is needed:

```typescript
let count = 0;
while (hasMessages()) {
  count++; // count is always a non-negative integer — no check required
  processMessage();
}
```

The TypeScript compiler enforces many invariants by construction (strict null checks, readonly, const enums). Prefer this over runtime assertions when possible.

### By explicit assertion at the boundary

When data crosses a system boundary (HTTP request, gRPC call, environment variable, database result), the invariant must be established with an explicit check:

```typescript
function processInput(input: unknown): void {
  assert(
    typeof input === 'number' && input >= 0,
    'Input must be a non-negative integer',
  );
  // input is now known to be a non-negative number for the rest of this scope
}
```

After the boundary check passes, the rest of the call chain can assume the property without re-checking.

---

## The Boundary Rule

**Validate at system boundaries; trust internal code.**

| Boundary               | Example                                | Tool                          |
| ---------------------- | -------------------------------------- | ----------------------------- |
| HTTP / GraphQL input   | resolver argument, request body        | `assert`, `assertDefined`     |
| gRPC inbound           | proto message fields                   | `assert`, `assertDefined`     |
| Database result        | `repo.findOne()` returning `T \| null` | `assertDefined`               |
| Env vars / config      | `process.env.PORT`                     | `assert`, `stringToEnumValue` |
| Internal function call | service-to-service within same process | trust TypeScript types        |

This aligns with the [[packages/utils]] design: assertions are used at entry points (resolvers, controllers, gRPC handlers) rather than scattered throughout business logic.

---

## Invariants and TypeScript Assertion Functions

TypeScript assertion functions (see [[references/assertion-functions-typescript]]) surface invariants into the type system. When `assertDefined(user)` returns, TypeScript narrows `user` from `User | null` to `User` — the non-nullability invariant is now encoded in the type flow, not just enforced at runtime.

```typescript
// Boundary: establish the invariant
const user = await this.usersRepository.findOne({ where: { id } });
assertDefined(user, new NotFoundException(`User ${id} not found`));

// Interior: invariant held — user is User, no null check needed
return { id: user.id, email: user.email };
```

---

## Invariants in Complex Systems

In a microservice architecture like AniMemoria, invariants matter most at inter-service handoffs:

- **gRPC transport** — proto fields are typed but not required; assert required fields are present before passing to domain logic.
- **Federation resolvers** — `__resolveReference` receives an entity reference from the gateway; assert the key field is defined.
- **TypeORM relations** — eagerly loaded relations may be `undefined` if not joined; assert before accessing nested fields.

Establishing invariants at these seams keeps business logic clean and makes violations easy to locate — they surface at the boundary, not deep in the call stack.
