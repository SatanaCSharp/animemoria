---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-ts-config.md
  - packages/tsconfig/tsconfig.base.json
  - packages/tsconfig/tsconfig.node.json
  - packages/tsconfig/package.json
tags: [typescript, config, tsconfig]
---

# @packages/tsconfig

Shared TypeScript compiler configuration for all AniMemoria monorepo packages and apps.
Provides two composable base configs that every workspace extends instead of duplicating
compiler options.

## Architecture

The package ships two JSON files and no compiled output. Consumed via TypeScript's `extends`
field — no build step required.

**File layout:**

```
packages/tsconfig/
  tsconfig.base.json   ← strict common settings; extended by everything
  tsconfig.node.json   ← extends base; adds NestJS/Node.js emission flags
  package.json         ← private; no main/exports field needed
```

## `tsconfig.base.json`

Foundation config inherited by all workspaces.

| Option                             | Value      | Notes                                     |
| ---------------------------------- | ---------- | ----------------------------------------- |
| `target`                           | `es2021`   |                                           |
| `module`                           | `NodeNext` | ESM-compatible module resolution          |
| `moduleResolution`                 | `NodeNext` | Required alongside `module: NodeNext`     |
| `strict`                           | `true`     | Full strict mode                          |
| `isolatedModules`                  | `true`     | Required for `ts-jest` and transpile-only |
| `incremental`                      | `true`     | Enables `.tsbuildinfo` caching            |
| `esModuleInterop`                  | `true`     |                                           |
| `forceConsistentCasingInFileNames` | `true`     |                                           |
| `allowSyntheticDefaultImports`     | `true`     |                                           |
| `skipLibCheck`                     | `true`     |                                           |
| `noImplicitOverride`               | `true`     |                                           |

### Usage

```jsonc
// tsconfig.json in any app or package
{
  "extends": "@packages/tsconfig/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
  },
  "include": ["src"],
}
```

## `tsconfig.node.json`

Extends `tsconfig.base.json` with flags required for NestJS services and Node.js packages that use
decorators.

Additional options over base:

| Option                   | Value                        | Notes                                              |
| ------------------------ | ---------------------------- | -------------------------------------------------- |
| `lib`                    | `["es2021", "ES2023.array"]` | Adds `Array.toSorted` / `toReversed` etc.          |
| `declaration`            | `true`                       | Generates `.d.ts` files for consumers              |
| `declarationMap`         | `true`                       | Source maps for `.d.ts` — enables Go-to-definition |
| `sourceMap`              | `true`                       | Runtime source maps for stack traces               |
| `emitDecoratorMetadata`  | `true`                       | Required by NestJS DI (reflect-metadata)           |
| `experimentalDecorators` | `true`                       | Required by NestJS decorators                      |
| `removeComments`         | `true`                       | Strips comments from emitted JS                    |

### Usage

```jsonc
// tsconfig.json in a NestJS app or package
{
  "extends": "@packages/tsconfig/tsconfig.node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
  },
  "include": ["src"],
}
```

## Consumers

All monorepo packages and apps extend one of these two configs:

**Extends `tsconfig.node.json`** (NestJS services and Node packages):

- [[services/users-service]]
- [[services/auth-service]]
- [[services/registry-service]]
- [[services/api-gateway-service]]
- [[packages/nest-shared]]
- [[packages/grpc]]
- `packages/graphql/definitions`, `packages/graphql/generated`
- `packages/utils`, `packages/shared-types`

**Extends `tsconfig.base.json`** (frontend / pure TS packages):

- [[frontend/admin]] and [[frontend/web]] (via their own tsconfig extensions)

## Relationship to other packages

- Pairs with [[packages/jest-config-preset]] — `ts-jest` in the preset relies on
  `emitDecoratorMetadata` and `experimentalDecorators` being enabled in the service's `tsconfig.json`,
  which is guaranteed when the service extends `tsconfig.node.json`.
