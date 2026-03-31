# @packages/eslint-config-service

ESLint flat config for all AniMemoria NestJS backend services.
Extends `@packages/eslint-config-base` with NestJS-aware overrides and relaxed spec-file rules.

---

## Overrides vs base

| Rule                                                | Base    | Service override                            |
| --------------------------------------------------- | ------- | ------------------------------------------- |
| `@typescript-eslint/no-explicit-any`                | default | `off` — common in DI decorators             |
| `@typescript-eslint/no-floating-promises`           | default | `warn`                                      |
| `@typescript-eslint/explicit-function-return-type`  | `error` | `off` — NestJS decorators make this verbose |
| `@typescript-eslint/explicit-module-boundary-types` | default | `off`                                       |
| `no-undef`                                          | default | `off` — TypeScript handles this             |

Spec files (`src/**/*.spec.ts`) additionally disable `no-unsafe-assignment`,
`no-unsafe-member-access`, `no-unsafe-call`, and `unbound-method`.

---

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
