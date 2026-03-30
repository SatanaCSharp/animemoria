---
paths:
  - 'apps/*-service/src/**/*.spec.ts'
  - 'apps/*-service/src/test/**/*.ts'
---

# Structure Unit Tests for NestJS Services Using Colocated Specs and Mirrored Test Helpers

## Purpose

Ensure unit tests in AniMemoria NestJS services follow a consistent file layout, mock-factory naming, and wiring convention. Prevents test drift caused by inline mocks, misplaced helper files, or inconsistent factory naming that makes tests hard to reuse across specs.

## Scope

**In scope:**

- All `*.spec.ts` files inside `apps/*-service/src/`
- All test helper files inside `apps/*-service/src/test/`
- Repository mock factories and command mock factories

**Out of scope:**

- Integration or e2e tests (different directory, different tooling)
- Frontend apps (`apps/admin`, `apps/web`, `apps/storybook`)
- Package-level tests outside `apps/`
- Test utilities inside `packages/` (governed separately)

## Rule Statement

**Spec file location:**

- Spec files MUST be colocated with their source file: `src/{feature}/use-case/commands/{action}-{entity}.command.spec.ts` alongside `{action}-{entity}.command.ts`.
- Spec files MUST NOT be placed in a top-level `__tests__/` directory or outside `src/`.

**Test helper location:**

- Repository mock helpers MUST live at `src/test/shared/domain/repositories/create-{entity}-provider.ts`.
- Command mock helpers MUST live at `src/test/{module}/mocks/use-case/{action}-{entity}.command.mock.ts`.
- Test helpers MUST NOT be defined inline inside spec files.

**Repository mock exports:**

- Each provider file MUST export a `{Entity}RepositoryMock` type defined as `jest.Mocked<{Entity}Repository>`.
- Each provider file MUST export `create{Entity}RepositoryMock(overrides?: Partial<{Entity}RepositoryMock>): {Entity}RepositoryMock`.
- Each provider file MUST export `create{Entity}RepositoryProvider(mock: {Entity}RepositoryMock)` returning `{ provide: {Entity}Repository, useValue: mock }`.

**Command mock exports:**

- Each mock file MUST export `create{Action}CommandMock(overrides?: Partial<Command>)` returning command input data.
- Each mock file MUST export `get{PastTense}{Entity}Mock(overrides?: Partial<Response>)` returning expected response data.
- All factory functions MUST accept an optional `overrides` partial and spread it last.

**Test module wiring:**

- Specs MUST bootstrap via `Test.createTestingModule({ providers: [ProcessorClass, repositoryProvider] }).compile()`.
- Specs MUST NOT instantiate processors with `new` or use `jest.mock()` at the module level.
- The repository mock MUST be created before `beforeEach` and passed into both `createTestingModule` and the assertion block.

**Naming patterns (objectively verifiable):**

- Type: `/^[A-Z][a-zA-Z]+RepositoryMock$/`
- Mock factory: `/^create[A-Z][a-zA-Z]+RepositoryMock$/`
- Provider factory: `/^create[A-Z][a-zA-Z]+RepositoryProvider$/`
- Command mock: `/^create[A-Z][a-zA-Z]+CommandMock$/`
- Result mock: `/^get[A-Z][a-zA-Z]+Mock$/`

## Conditions

**Preconditions:** Rule activates whenever a new `*.spec.ts` file or `src/test/**/*.ts` file is created or modified in any `apps/*-service`.

**Exceptions:** No exceptions. There is no approved bypass for these structural rules.

**Edge cases:**

- When a processor has multiple commands (e.g., `create` and `update`), each command gets its own spec file and its own mock file. They MUST NOT share a single combined mock file.
- When a repository has no methods beyond inherited ones, `create{Entity}RepositoryMock` MUST still be exported as an empty `jest.Mocked<{Entity}Repository>` object, not omitted.

## Examples

### Compliant

**File layout:**

```
src/
├── users/use-case/commands/
│   ├── create-user.command.ts
│   └── create-user.command.spec.ts       ← colocated spec
└── test/
    ├── shared/domain/repositories/
    │   └── create-user-provider.ts        ← repository mock helpers
    └── users/mocks/use-case/
        └── create-user.command.mock.ts    ← command data factories
```

**`src/test/shared/domain/repositories/create-user-provider.ts`:**

```ts
import { UserRepository } from 'shared/domain/repositories/user.repository';

export type UserRepositoryMock = jest.Mocked<UserRepository>;

export const createUserRepositoryMock = (
  overrides?: Partial<UserRepositoryMock>,
): UserRepositoryMock =>
  ({ create: jest.fn(), ...overrides }) as UserRepositoryMock;

export const createUserRepositoryProvider = (mock: UserRepositoryMock) => ({
  provide: UserRepository,
  useValue: mock,
});
```

**`src/test/users/mocks/use-case/create-user.command.mock.ts`:**

```ts
export const createCommandMock = (
  overrides?: Partial<{ email: string; nickname: string; accountId: string }>,
) => ({
  email: 'user@example.com',
  nickname: 'test-user',
  accountId: 'account-123',
  ...overrides,
});

export const getCreatedUserMock = (
  overrides?: Partial<{
    id: string;
    email: string;
    nickname: string;
    accountId: string;
  }>,
) => ({
  id: 'user-1',
  email: 'user@example.com',
  nickname: 'test-user',
  accountId: 'account-123',
  ...overrides,
});
```

**`src/users/use-case/commands/create-user.command.spec.ts`:**

```ts
import { Test } from '@nestjs/testing';
import {
  createUserRepositoryMock,
  createUserRepositoryProvider,
  UserRepositoryMock,
} from 'test/shared/domain/repositories/create-user-provider';
import {
  createCommandMock,
  getCreatedUserMock,
} from 'test/users/mocks/use-case/create-user.command.mock';
import { CreateUserCommandProcessor } from 'users/use-case/commands/create-user.command';

describe('CreateUserCommandProcessor', () => {
  let processor: CreateUserCommandProcessor;
  let userRepository: UserRepositoryMock;

  beforeEach(async () => {
    userRepository = createUserRepositoryMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateUserCommandProcessor,
        createUserRepositoryProvider(userRepository),
      ],
    }).compile();
    processor = moduleRef.get(CreateUserCommandProcessor);
  });

  describe('process', () => {
    it('delegates to repository with the command and returns created user', async () => {
      const command = createCommandMock();
      const created = getCreatedUserMock();
      userRepository.create.mockResolvedValue(created);

      const result = await processor.process(command);

      expect(userRepository.create).toHaveBeenCalledWith(command);
      expect(result).toEqual({
        id: created.id,
        accountId: created.accountId,
        email: created.email,
        nickname: created.nickname,
      });
    });

    it('propagates repository errors', async () => {
      userRepository.create.mockRejectedValue(new Error('DB unavailable'));
      await expect(processor.process(createCommandMock())).rejects.toThrow(
        'DB unavailable',
      );
    });
  });
});
```

### Non-Compliant

**Violation 1 — Inline mock (no factory):**

```ts
// ❌ mock defined inline in the spec file, not in src/test/
const userRepository = { create: jest.fn() };
```

Why wrong: mock cannot be reused across specs; `overrides` pattern unavailable; type is `any`, not `jest.Mocked<UserRepository>`.

**Violation 2 — Wrong file location for helper:**

```ts
// ❌ helper defined inside the spec file instead of src/test/shared/domain/repositories/
const createUserRepositoryProvider = (mock) => ({
  provide: UserRepository,
  useValue: mock,
});
```

Why wrong: unreachable from other specs; breaks the mirrored `test/` tree convention.

**Violation 3 — Using `jest.mock()` at module level:**

```ts
// ❌ bypasses NestJS DI; processor not resolved through testing module
jest.mock('shared/domain/repositories/user.repository');
```

Why wrong: `Test.createTestingModule` with an explicit provider is required; `jest.mock` circumvents the DI container and hides constructor injection errors.

## Rationale

Colocated specs make the unit under test obvious. The separate `test/` tree keeps non-production helpers out of source directories while remaining importable via the `moduleDirectories: ['<rootDir>']` Jest alias (`rootDir = src/`).

Factory functions with `overrides` prevent fixture duplication: a single field rename on a command updates one factory, not N inline objects across spec files. Alternatives considered: `jest.mock()` at module level (rejected — bypasses NestJS DI), class-based mock objects (rejected — verbose, no overrides pattern), shared `beforeAll` setup (rejected — side-effects bleed between tests).

**Consequence of non-compliance:** Inline mocks duplicate fixture data; a single type change cascades across all specs that hard-coded the old shape. `jest.mock()` mocks can mask provider misconfiguration that would surface at runtime.

## Related Rules / References

- `service-structure.md` — canonical source/directory layout this test tree mirrors
- `@packages/jest-config-preset` — shared Jest config (`testRegex: .*\.spec\.ts$`, `rootDir: src`, `moduleDirectories: ['<rootDir>']`)
- `@nestjs/testing` `Test.createTestingModule` API
- Enforcement: **code review MUST verify** file placement, export names match naming regexes, and no `jest.mock()` at module level before merge. `eslint-plugin-jest` rules (`jest/consistent-test-it`, `jest/require-top-level-describe`) enforce describe/it structure.
