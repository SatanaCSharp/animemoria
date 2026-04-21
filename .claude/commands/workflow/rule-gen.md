---
description: Analyse the codebase and generate (or update) project-specific rules in .claude/rules/
argument-hint: >
  [focus-area] — optional: service-structure | unit-tests | infra | graphql | grpc | nestjs |
  migrations | apps-admin | apps-web | front-end | turborepo | pnpm | testing | errors | database |
  auth | logging | security | ci-cd | all (default: all)
allowed-tools: Read, Glob, Grep, Bash(find:*), Bash(git log:*), Bash(git diff:*), Bash(cat:*), Write, Edit
---

# Generate Project Rules

You are a senior engineer tasked with deriving and writing **precise, actionable rules** for this
project so that every future Claude Code session follows consistent conventions without repeating
itself in CLAUDE.md.

Rules live in `.claude/rules/` and are loaded automatically (or on demand). Keep each rule file
short, human-readable, and scoped to one concern. Prefer many small files over one large catch-all.

---

## 1 — Understand the target scope

The user may have passed a focus area via `$ARGUMENTS`. Recognised values map to rule files:

| Argument            | Rule file                                       | Domain                                           |
| ------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `service-structure` | `.claude/rules/service-structure.md`            | NestJS app layout, DDD layers, class/file naming |
| `unit-tests`        | `.claude/rules/unit-tests-service-structure.md` | Test file layout, mock factories, test wiring    |
| `nestjs`            | `.claude/rules/nestjs.md`                       | Module structure, DI, dual-transport apps        |
| `graphql`           | `.claude/rules/graphql.md`                      | Apollo Federation, codegen, schema conventions   |
| `grpc`              | `.claude/rules/grpc.md`                         | Protobuf authoring, ts-proto, reflection         |
| `migrations`        | `.claude/rules/migrations.md`                   | TypeORM migrations, generation, running          |
| `apps-admin`        | `.claude/rules/apps-admin.md`                   | Vite/React SPA (TanStack Router, Apollo Client)  |
| `apps-web`          | `.claude/rules/apps-web.md`                     | Next.js 16 App Router, Server Components         |
| `front-end`         | `.claude/rules/front-end.md`                    | Shared UI across both apps (de-dup only)         |
| `infra`             | `.claude/rules/infra.md`                        | Terraform, Helm, Dockerfiles, Docker Compose     |
| `turborepo`         | `.claude/rules/turborepo.md`                    | Task pipelines, caching, workspace boundaries    |
| `pnpm`              | `.claude/rules/pnpm.md`                         | Catalog deps, workspace rules, hoisting          |
| `testing`           | `.claude/rules/testing.md`                      | Unit / integration / e2e strategy, coverage      |
| `errors`            | `.claude/rules/errors.md`                       | Exception hierarchy, HTTP/gRPC error mapping     |
| `database`          | `.claude/rules/database.md`                     | Schema naming, indexing, constraints             |
| `auth`              | `.claude/rules/auth.md`                         | JWT, sessions, RBAC across GraphQL/gRPC          |
| `logging`           | `.claude/rules/logging.md`                      | Structured logging, correlation IDs, metrics     |
| `security`          | `.claude/rules/security.md`                     | Secrets, input validation, OWASP                 |
| `ci-cd`             | `.claude/rules/ci-cd.md`                        | GitHub Actions, releases, versioning             |
| `all` / _(empty)_   | All of the above                                | Full coverage                                    |

If `$ARGUMENTS` is empty or `all`, analyse every domain and generate or update all applicable files.

---

## 2 — Gather evidence from the codebase

Run the following discovery steps **before writing a single rule**. Collect facts; do not guess.

### 2a — Project shape

```bash
find . -maxdepth 4 \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/.next/*' \
  -not -path '*/generated/*' \
  | head -150
```

### 2b — Package manifests & workspace config

Read the following (whichever exist):

- `package.json` (root) — scripts, workspaces
- `pnpm-workspace.yaml` — catalog entries, workspace globs
- `turbo.json` — task pipeline definitions, `dependsOn`, `outputs`, `cache`
- `tsconfig.json` (root and per-package)

Record: runtime version, package manager, lint/format/test/build commands, Turborepo task graph.

### 2c — Style signal from source files

```bash
git log --oneline -20
```

Read 4–6 representative source files across different layers:

- A NestJS service entry (`src/main.ts` or `graphql.main.ts`)
- A feature module (`src/modules/<feature>/<feature>.module.ts`)
- A use-case/command processor
- A TypeORM entity
- A GraphQL resolver or gRPC controller
- A test file (`*.spec.ts`)

Note: naming conventions, import style, error handling, constructor patterns, comment density.

### 2d — Existing config files

Glob for and read whichever exist:

- `.eslintrc*`, `eslint.config*` — lint rules, boundary enforcement
- `prettier.config*` — formatting
- `tsconfig.json` — strict flags, path aliases
- `jest.config*` — test runner, coverage thresholds, moduleNameMapper
- `Dockerfile*`, `docker-compose*` — multi-stage patterns, base images
- `infra/aws-iac/**/*.tf` — Terraform resource patterns
- `infra/deployment/kubernetes/charts/**/*.yaml` — Helm chart structure

Extract enforced rules from tooling — do not duplicate them in rule files.

### 2e — Read existing rules

Read **all files** in `.claude/rules/`. Note:

- What is already documented (do not duplicate)
- Inconsistencies in frontmatter field names (`paths:` vs `globs:`)
- Sections in need of expansion or correction
- Duplicate rules across files (especially `front-end.md` vs `apps-admin.md` / `apps-web.md`)

### 2f — Read CLAUDE.md

Read `CLAUDE.md` and `CLAUDE.local.md`. Note what is already documented — do not copy it into
rule files; reference it instead if needed.

---

## 3 — Derive rules (one per observation)

For each rule you write, it must satisfy **all three** of these tests:

1. **Actionable** — Claude can follow it without further clarification.
2. **Specific** — It names files, patterns, tools, or commands, not vague advice.
3. **Necessary** — Removing it would plausibly cause Claude to make a mistake on this project.

If a candidate rule fails any test, drop it.

### Enforcement emphasis

Use `MUST`, `NEVER`, `ALWAYS` only for rules where a violation would:

- Break the build or type-check
- Introduce a security vulnerability
- Contradict a team agreement documented in CLAUDE.md

Do not over-emphasise. Preference: `should` / `should not` for stylistic rules.

### De-duplication rule

Before adding any rule to a file, check if it already appears in:

1. The same file (obvious)
2. Another rule file that overlaps in scope
3. CLAUDE.md

If the content already exists, do not duplicate. If it belongs to a more specific scope, move it there.

**Specific de-dup target:** `front-end.md` duplicates sections from `apps-admin.md` and `apps-web.md`.
If the only content in `front-end.md` is a copy of those sections, remove the redundant sections from
`front-end.md` and leave only truly cross-app rules not covered by the individual files.

---

## 4 — Write the rule files

### Frontmatter

Every rule file MUST use a `paths:` field (not `globs:`) when the rule is file-scoped. Include
`updated` and `tags` for discoverability:

```yaml
---
paths: apps/*-service/src/**/*.ts # omit entirely for project-wide rules
updated: YYYY-MM-DD
tags: [service, architecture, nestjs]
---
```

Use the `paths:` field only when a rule is genuinely irrelevant outside those paths
(e.g. migration rules only apply to `apps/*-service/src/migrations/**`).

### Content structure

Target the depth of `service-structure.md` and `unit-tests-service-structure.md` as quality
benchmarks. Minimal bullet lists are insufficient for complex domains.

````markdown
---
paths: [scoped glob pattern] # omit if project-wide
updated: YYYY-MM-DD
tags: [domain, tags]
---

# <Domain> Rules

## <Category>

Brief context sentence if the category needs it.

| Column A | Column B | ← use tables for naming conventions |
| -------- | -------- | ----------------------------------- |
| Row      | Value    |

- Rule in imperative mood addressed to Claude.
- MUST use X when Y.
- NEVER edit Z after it is committed.

### Correct ✅

```ts
// concrete code example
```
````

### Incorrect ❌

```ts
// code example with inline comment explaining why it's wrong
```

## <Category>

...

```

### Quality bar per rule

- Include **code examples** (✅ / ❌) for any rule that involves a naming or structural convention.
- Include **tables** for naming matrices (e.g. Entity → ClassName → FileName).
- Include **exact commands** (not descriptions) for any CLI-related rule.
- Include a **Rationale** subsection for non-obvious rules.

---

## 5 — Mandatory sections per domain

Use these as minimum requirements. Add more sections if evidence supports it.

### service-structure.md
- Naming table (Entity, Repository, CommandProcessor, Controller, etc.)
- Canonical directory layout (`src/modules/<feature>/`, `src/shared/`)
- Layer responsibilities (Domain, Use-case, Delivery)
- Barrel file pattern

### unit-tests-service-structure.md
- Spec file location (colocated with source)
- Test helper location (`src/test/` mirroring source tree)
- Repository mock exports (naming regex)
- Command mock exports
- Test module wiring with `Test.createTestingModule()`
- Conditions: preconditions, exceptions, edge cases

### nestjs.md
- Feature module structure (`src/modules/<feature>/`)
- Dependency injection rules (constructor injection only)
- Dual-transport entrypoints (`graphql.main.ts` / `grpc.main.ts`)
- Cross-transport isolation (no GraphQL decorators in gRPC modules)
- Testing setup (`Test.createTestingModule()`)

### graphql.md
- Federation v2 directives (`@key`, `@external`, `@shareable`)
- `__resolveReference` requirement for entity types
- Gateway composition-only rule
- Codegen trigger (`pnpm codegen` after schema change)
- Schema conventions (dates, enum casing, no stitching)

### grpc.md
- One `.proto` file per service domain
- Field numbering and deprecation policy (never delete, use `[deprecated = true]`)
- Code generation steps (pnpm proto:generate → commit)
- ts-proto output location (never edit generated files)
- Reflection: disabled in production Helm values

### migrations.md
- Generation command with exact env var
- Never edit after commit+deploy rule
- Idempotency guards (`IF NOT EXISTS` / `IF EXISTS`)
- Class name must match filename timestamp
- Register in `TypeOrmModule.migrations` array
- No migrations for `registry-service` and `api-gateway-service`

### apps-admin.md
- Pure client SPA — no SSR, no Server Actions, no RSC
- Routing via TanStack Router, file-based convention in `src/routes/`
- Data via generated Apollo hooks only (`@packages/graphql-generated`)
- Run `pnpm codegen --watch` during active development
- Shared UI from `@packages/ui-shared` only

### apps-web.md
- App Router, Server Components as default
- `"use client"` opt-in only when necessary
- Server Actions allowed for form mutations
- Apollo Client in RSC mode (not hooks) for Server Components
- Shared UI from `@packages/ui-shared` only

### front-end.md
- Only truly cross-app rules that are NOT already in `apps-admin.md` or `apps-web.md`
- If the only content would duplicate those files, leave this file empty or delete it

### infra.md
- Local PostgreSQL: `docker compose -f infra/local/docker-compose.yml up -d`
- Terraform: always `terraform plan` before `apply`; no `terraform init` without backend config
- Helm charts: `infra/deployment/kubernetes/charts/frontend/` and `microservice/`; values in `values/<service-name>/`
- New service checklist (values dir, chart reference, turbo.json entry)
- Dockerfiles: multi-stage, `NODE_VERSION ≥ 24`, `COPY --chown=node:node`

### turborepo.md _(new)_
- Task definitions in `turbo.json` (pipeline names, `dependsOn`, `outputs`)
- Filtering syntax (`--filter=<pkg>`, `--filter=...<pkg>`)
- Cache key strategy (what to include/exclude in `inputs`)
- When to use `persistent: true` (dev servers only)
- Adding new services to the pipeline

### pnpm.md _(new)_
- Use `catalog:` references in individual `package.json` for shared devDependencies
- Update version only in `pnpm-workspace.yaml` `catalog:` block — never in individual `package.json`
- Never run `npm install` or `yarn add`; always use `pnpm`
- Hoisting rules if configured

### testing.md _(new)_
- Unit tests: colocated `*.spec.ts`, `Test.createTestingModule()`, no real DB
- Integration tests: separate `test/` directory, real DB via Docker Compose
- E2E tests: `test/*.e2e-spec.ts`, full service stack
- Coverage threshold if configured in `jest.config*`
- Fixture/seeding patterns

### errors.md _(new)_
- Exception base class hierarchy
- HTTP error codes and when to use each
- gRPC status code mapping
- Error response shape for GraphQL (`extensions.code`)

### database.md _(new)_
- Column naming convention (snake_case)
- Primary key strategy (UUID vs. auto-increment)
- Indexing strategy (when to add explicit indexes)
- Constraints (not-null defaults, unique, foreign keys)
- TypeORM entity base class

### security.md _(new)_
- Files Claude MUST NEVER write to: `.env`, `*.pem`, `secrets/`
- No hardcoded secrets — use environment variables
- Input validation at GraphQL layer (class-validator + class-transformer)
- Dependency pinning policy
- gRPC reflection disabled in production

---

## 6 — Update vs. overwrite

- If the target rule file **does not exist**: create it.
- If the target rule file **exists**: read it first, then **merge** new rules and update/remove
  stale rules. Preserve rules that are still valid. Do not blindly overwrite.
- If a rule in an existing file contradicts evidence from the codebase (step 2), remove or update
  the rule and note the change in the summary.

---

## 7 — Validate before finishing

After writing all files:

1. Re-read each file and confirm every rule passes the three tests from §3.
2. Check that no rule duplicates CLAUDE.md content.
3. Confirm `paths:` is used only where genuinely scope-limited and uses consistent field name (`paths:`, not `globs:`).
4. Confirm `updated:` field is set to today's date.
5. Confirm no sections are duplicated across files (especially `front-end.md` vs. `apps-admin.md`/`apps-web.md`).
6. Print a summary table to stdout:

```

Rules generated / updated
──────────────────────────────────────────────────────────
File Action Rules
.claude/rules/service-structure.md <updated> <N>
.claude/rules/unit-tests-service-structure <updated> <N>
.claude/rules/nestjs.md <updated> <N>
.claude/rules/graphql.md <updated> <N>
.claude/rules/grpc.md <updated> <N>
.claude/rules/migrations.md <updated> <N>
.claude/rules/apps-admin.md <updated> <N>
.claude/rules/apps-web.md <updated> <N>
.claude/rules/front-end.md <updated> <N>
.claude/rules/infra.md <updated> <N>
.claude/rules/turborepo.md <created> <N>
.claude/rules/pnpm.md <created> <N>
.claude/rules/testing.md <created> <N>
.claude/rules/errors.md <created> <N>
.claude/rules/database.md <created> <N>
.claude/rules/security.md <created> <N>
──────────────────────────────────────────────────────────
Total <N>

Skipped (no evidence found):
• <file> — reason

Conflicts resolved:
• <file>:<rule> — old value → new value

Next steps:
• Review each file and prune any rule that no longer applies.
• Fix any remaining inconsistencies (globs: → paths:, missing updated: field).
• Commit .claude/rules/ so the whole team benefits.

```

---

## Notes

- Do **not** touch `CLAUDE.md` — that file is for session-wide context, not scoped rules.
- Do **not** create rules that restate linter/formatter config already enforced by tooling.
- If a discovery step returns no results (e.g. no test config found), skip that section and
  note it in the summary so the developer can fill it in manually.
- Rules must be written in the **imperative mood** addressed to Claude, not to humans:
   - ✅ "Use `pnpm` as the package manager; NEVER run `npm install`."
   - ❌ "Developers should use pnpm."
- The quality bar is `service-structure.md` and `unit-tests-service-structure.md`. Simple bullet
  lists are only acceptable for trivially small domains.
```
