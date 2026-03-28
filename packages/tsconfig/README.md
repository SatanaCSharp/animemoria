# @packages/tsconfig

Shared TypeScript compiler configuration for all AniMemoria monorepo packages and apps.
Provides two composable base configs — one for strict common settings, one for Node.js emission.

---

## `tsconfig.base.json`

Foundation config with strict type-checking options shared by every workspace.
Sets `target: es2021`, `module: NodeNext`, `strict`, `isolatedModules`, and `incremental` compilation.

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

---

## `tsconfig.node.json`

Extends `tsconfig.base.json` with Node.js service emission settings: `declaration`, `declarationMap`,
`sourceMap`, `emitDecoratorMetadata`, and `experimentalDecorators` (required by NestJS).
Use this as the base for all NestJS apps and packages.

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
