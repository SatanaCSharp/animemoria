---
name: package-docs
description: Use when writing or updating a README.md for any package inside the `packages/` directory of the AniMemoria monorepo.
---

Write technical README documentation for a shared package in the AniMemoria monorepo.

## Your task

1. **Determine the package type** — see the decision table below.
2. **Explore before writing** — read `package.json` (exports map), all source files, and any existing README.
3. **Apply the correct template** — canonical (nest-shared) or a variant.
4. **Place the file** at `packages/<name>/README.md`.

---

## Package type decision

| Signal                                                     | Template to use                   |
| ---------------------------------------------------------- | --------------------------------- |
| Exports NestJS modules (`forRoot`, `forFeature`, `Module`) | **Canonical** (nest-shared style) |
| Exports generated TypeScript from `.proto` files           | **Generated-gRPC**                |
| Exports GraphQL DTOs / entities / resolver interfaces      | **Domain-types**                  |
| Exports a codegen config or `.gql` schema artifact         | **Tooling-artifact**              |
| Exports plain utility functions, enums, or TS types        | **Domain-types**                  |

For full variant templates and examples see `references/package-variants.md`.

---

## Canonical template (nest-shared style)

Use for NestJS module packages (`@packages/nest-shared`, etc.).

```
# @packages/<name>

<1-2 sentence description: what infrastructure/domain this package provides and who consumes it.>

---

## `@packages/<name>/<export-path>`

<What this export provides. State key classes/modules/decorators exported.>
<If env vars are required, list them on a single line: **Env vars:** `VAR_ONE`, `VAR_TWO`>

### Usage

\`\`\`typescript
// minimal but complete example showing the most common import and wiring
\`\`\`

---

## `@packages/<name>/<next-export-path>`
...
```

**Rules for the canonical template:**

- One `##` section per entry in `package.json` `"exports"`.
- Export path as the heading: `` ## `@packages/nest-shared/orm` ``.
- Description: purpose + key exports (classes, guards, decorators). No internal implementation detail.
- Env vars inline, not in a table.
- Usage block: shortest complete snippet that shows real wiring (module import + inject/use).
- `---` horizontal rule between every export section.

---

## Checklist before writing

- [ ] Read `package.json` — note `"name"`, `"description"`, and all `"exports"` entries
- [ ] Read every `src/*/index.ts` (or `src/index.ts`) matching an export entry
- [ ] For NestJS modules: read the `*.module.ts` and key service files
- [ ] Check whether env vars are consumed (`ConfigService.getOrThrow`)
- [ ] Read existing `README.md` if updating (preserve content not covered by re-read)
- [ ] Identify package type and confirm template choice
