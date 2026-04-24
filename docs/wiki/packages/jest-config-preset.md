---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-jest-config-preset.md
  - packages/jest-config-preset/jest-config-preset.cjs
  - packages/jest-config-preset/package.json
tags: [jest, testing, config, preset]
---

# @packages/jest-config-preset

Shared Jest configuration preset for the AniMemoria monorepo. Provides zero-boilerplate defaults
so every workspace extends rather than duplicates testing configuration.

## Architecture

The package is a single CommonJS file (`jest-config-preset.cjs`) exported as `main`. No build step,
no TypeScript compilation — consumed directly by Jest's `preset` loader. The package type is
`"commonjs"` to ensure Jest can require it without ESM interop.

**File layout:**

```
packages/jest-config-preset/
  jest-config-preset.cjs   ← the preset itself (CommonJS)
  package.json             ← main: "jest-config-preset.cjs"
```

No barrel exports, no TypeScript source. Consumers reference via Jest's `preset` field, not via
TypeScript imports.

## Configuration defaults

| Option                 | Value                                 |
| ---------------------- | ------------------------------------- |
| `rootDir`              | `src`                                 |
| `testRegex`            | `.*\.spec\.ts$`                       |
| `transform`            | `ts-jest` for `.ts` / `.tsx`          |
| `testEnvironment`      | `node`                                |
| `collectCoverageFrom`  | `**/*.(t\|j)s`                        |
| `coverageDirectory`    | `../coverage` (relative to `rootDir`) |
| `moduleFileExtensions` | `js`, `json`, `ts`, `tsx`             |

Coverage output lands in `<package-root>/coverage/` because `rootDir` is `src` and
`coverageDirectory` is `../coverage`.

## Usage

```js
// jest.config.js (or jest.config.cjs) in any package or app
/** @type {import('jest').Config} */
module.exports = {
  preset: '@packages/jest-config-preset',
  // workspace-specific overrides here
};
```

Run with coverage:

```bash
jest --coverage
```

## Consumers

The preset is used by:

- [[services/users-service]]
- [[services/auth-service]]
- [[services/registry-service]]
- [[frontend/admin]]
- `packages/utils` (internal utility package)

> NestJS services that use `ts-jest` depend on this preset so decorators are transpiled
> consistently with `tsconfig.node.json` settings from [[packages/tsconfig]].

## Relationship to other packages

- Pairs with [[packages/tsconfig]] — services extend `tsconfig.node.json` for the same
  `emitDecoratorMetadata` / `experimentalDecorators` flags that `ts-jest` needs at runtime.
- No runtime dependency on any other `@packages/*` package.
