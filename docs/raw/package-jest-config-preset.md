# @packages/jest-config-preset

Shared Jest configuration preset for all AniMemoria Node.js packages and services.
Provides a zero-boilerplate base that every workspace extends with `preset`.

---

## Configuration

| Option                 | Value                          |
| ---------------------- | ------------------------------ |
| `testRegex`            | `.*\.spec\.ts$`                |
| `rootDir`              | `src`                          |
| `transform`            | `ts-jest` for `.ts` and `.tsx` |
| `testEnvironment`      | `node`                         |
| `coverageDirectory`    | `../coverage`                  |
| `moduleFileExtensions` | `js`, `json`, `ts`, `tsx`      |

---

## Usage

```js
// jest.config.js (or jest.config.cjs) in any package/app
/** @type {import('jest').Config} */
module.exports = {
  preset: '@packages/jest-config-preset',
  // add service-specific overrides here
};
```

To collect coverage:

```bash
jest --coverage
```

Output lands in `<package-root>/coverage/`.
