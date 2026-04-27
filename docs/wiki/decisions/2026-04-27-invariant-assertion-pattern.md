---
updated: 2026-04-27
type: decision
status: accepted
tags:
  [
    typescript,
    invariants,
    assertions,
    use-case,
    command-processor,
    frontend,
    react,
  ]
---

# 2026-04-27 — Invariant Assertion Pattern

## Context

Business-logic invariants must be enforced at runtime across the entire AniMemoria codebase — backend services, frontend apps, and shared packages alike. Without a consistent approach, null-checks and condition guards scatter across the call stack, and violations surface deep inside logic rather than at the point where a precondition was broken.

`@packages/utils/asserts` provides `assert`, `assertDefined`, and `assertFail` as TypeScript assertion functions. They both throw at runtime and narrow types at compile time, making them the single tool for establishing invariants regardless of application layer.

## Decision

This pattern applies to **any TypeScript code in the monorepo** — NestJS command processors, React hooks, context consumers, utility functions, or library code — wherever a precondition must hold before execution continues.

### Rule 1 — Assert at the entry point of the call, not deep inside it

Establish invariants as early as possible in the current execution unit (the `process()` method, the custom hook, the event handler) before passing values further down the call chain. Internal callers receive already-narrowed values and must not repeat checks.

| Boundary                                     | Correct tool                                             |
| -------------------------------------------- | -------------------------------------------------------- |
| `repo.findById()` → `T \| null` (backend)    | `assertDefined(result, new ApplicationError(...))`       |
| `useContext()` → `T \| undefined` (frontend) | `assertDefined(ctx, new SystemError(...))`               |
| Cross-entity ownership check                 | `assert(a.ownerId === b.id, new ApplicationError(...))`  |
| Field that may be null in DB or state        | `assertDefined(entity.field, new ApplicationError(...))` |
| Business-rule condition                      | `assert(condition, new ApplicationError(...))`           |
| Exhaustive switch default                    | `assertFail()`                                           |

### Rule 2 — Use typed errors, never plain strings

Always pass a typed error from `@packages/shared-types/errors` as the second argument. The correct type depends on the layer:

| Layer                         | Error type                                         |
| ----------------------------- | -------------------------------------------------- |
| Backend domain / use-case     | `ApplicationError`                                 |
| Frontend / React              | `SystemError`                                      |
| NestJS transport (gRPC, HTTP) | `NotFoundException`, `UnauthorizedException`, etc. |

Plain string messages produce untyped `AssertionError` instances that cannot be handled uniformly by error boundaries or transport layers.

```typescript
// ✅ correct — typed error, meaningful message
assertDefined(session, new ApplicationError('Session not found'));
assertDefined(
  ctx,
  new SystemError('useAuthContext must be used within AuthProvider'),
);

// ❌ wrong — untyped
assertDefined(session, 'Session not found');
```

### Rule 3 — Assertion ordering follows data dependency

Assert entities before asserting their relationships or fields:

1. Assert existence of primary value (`assertDefined`)
2. Assert cross-entity or cross-value relationships (`assert`)
3. Assert nullable fields on the now-guaranteed value (`assertDefined`)
4. Assert business-rule conditions (`assert`)

### Rule 4 — Trust the type after assertion; never re-check

Once `assertDefined(x)` returns, `x` is narrowed to `NonNullable<typeof x>`. Do not add an `if (!x)` guard anywhere downstream in the same execution unit.

---

## Examples

### Backend — `CommandProcessor` (auth-service)

`apps/auth-service/src/session/use-case/command/refresh-tokens.command.ts`:

```typescript
async process(command: Command): Promise<TokenPair> {
  const { accountId, oldRefreshToken, sessionId } = command;

  // 1. Assert entity exists (DB boundary)
  const session = await this.sessionRepository.findById(sessionId);
  assertDefined(session, new ApplicationError('Session not found'));

  // 2. Assert cross-entity ownership
  assert(session.accountId === accountId, new ApplicationError('Invalid session'));

  // 3. Assert nullable field on narrowed entity
  assertDefined(session.refreshTokenHash, new ApplicationError('Invalid refresh token'));

  // 4. Assert business-rule condition
  assert(oldRefreshToken === session.refreshTokenHash, new ApplicationError('Invalid refresh token'));

  // 5. Assert second entity (DB boundary)
  const account = await this.accountRepository.findById(accountId);
  assertDefined(account, new ApplicationError('Account not found'));

  // 6. Assert business-rule condition on second entity
  assert(account.status === AccountStatus.ACTIVE, new ApplicationError('Account is not active'));

  // All invariants established — domain logic proceeds with fully-typed values
  const tokens = await this.authService.getTokens(account.id, account.email, session.id);
  await this.sessionRepository.update(session.id, { refreshTokenHash: tokens.refreshToken });
  return tokens;
}
```

### Frontend — React context consumer hook (admin)

`apps/admin/src/context/auth.context.tsx`:

```typescript
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  // Assert the invariant: this hook must be called inside AuthProvider
  assertDefined(
    context,
    new SystemError('useAuthContext must be used within AuthProvider'),
  );

  return context;
};
```

`useContext` returns `T | undefined` when there is no matching provider. The assertion narrows `context` from `AuthContextValue | undefined` to `AuthContextValue` and surfaces a clear `SystemError` if the hook is misused — instead of letting `undefined` propagate silently and crash later.

---

## Consequences

- Violations surface at the point of misuse, not deep in the call stack.
- Type narrowing eliminates `!` non-null assertions and redundant `if` guards downstream.
- Backend transport layers receive typed domain errors (`ApplicationError`) and map them to correct gRPC/HTTP status codes without extra handling.
- Frontend error boundaries receive typed `SystemError` instances and can distinguish programming errors from network errors.
- The same mental model and the same import (`@packages/utils/asserts`) applies across every layer of the monorepo.

## Cross-references

- [[references/invariant]]
- [[references/assertion-functions-typescript]]
- [[packages/utils]]
- [[packages/shared-types]] — `ApplicationError` and `SystemError` live here
- [[services/auth-service]]
- [[frontend/admin]]
