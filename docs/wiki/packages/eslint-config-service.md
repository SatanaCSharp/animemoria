---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-eslint-config-service.md
tags: [eslint, nestjs, linting, package]
---

# @packages/eslint-config-service

ESLint flat config for all AniMemoria NestJS backend services.
Extends [[packages/eslint-config-base]] with NestJS-aware overrides and relaxed spec-file rules.

## Purpose

Inherits the shared TypeScript baseline from `eslint-config-base` and loosens rules that are impractical or noisy in a NestJS / DI-heavy codebase (e.g. `no-explicit-any` and explicit return types), while adding spec-file leniency so tests can use unsafe matchers without suppression comments.

## Architecture

```
packages/eslint-config-service/
  index.js        ← flat config array, spreads base then applies NestJS overrides
  index.d.ts
  package.json    ← no devDependencies beyond the base (plugins come from base)
```

Unlike `eslint-config-ui`, this package does not add new plugin dependencies — it only overrides rules already provided by `eslint-config-base`.

## Overrides vs base

| Rule                                                | Base                 | Service override | Reason                              |
| --------------------------------------------------- | -------------------- | ---------------- | ----------------------------------- |
| `@typescript-eslint/no-explicit-any`                | default (warn/error) | `off`            | Common in DI decorators             |
| `@typescript-eslint/no-floating-promises`           | default              | `warn`           | Relaxed for async NestJS patterns   |
| `@typescript-eslint/explicit-function-return-type`  | `error`              | `off`            | NestJS decorators make this verbose |
| `@typescript-eslint/explicit-module-boundary-types` | default              | `off`            | Implicit in NestJS module patterns  |
| `no-undef`                                          | default              | `off`            | TypeScript handles undefined checks |

## Spec-file overrides

Files matching `src/**/*.spec.ts` additionally disable:

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/unbound-method`

## Usage

```js
// eslint.config.mjs in a NestJS service
import serviceConfig from '@packages/eslint-config-service';

export default [
  ...serviceConfig,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
    },
  },
];
```

## Consumers

- [[services/users-service]] (`apps/users-service`)
- [[services/auth-service]] (`apps/auth-service`)
- [[services/registry-service]] (`apps/registry-service`)
- [[services/api-gateway-service]] (`apps/api-gateway-service`)
- [[packages/nest-shared]] — shared NestJS infrastructure package
