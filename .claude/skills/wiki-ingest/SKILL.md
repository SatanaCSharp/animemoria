---
name: wiki-ingest
description: >
  Use this skill whenever the user wants to ingest, process, or integrate any source
  into the project wiki. Triggers on phrases like "ingest [source]", "add to wiki",
  "process this into the wiki", "update the wiki with", "file this in the wiki",
  "integrate into wiki", or when a new article, service, package, architectural
  approach, or any document needs to be reflected in wiki/. Works for both
  project-internal sources (services, packages, infra) and external sources
  (articles, blog posts, papers, approaches). Always use this skill before performing
  any wiki write operation — it defines the canonical ingest workflow.
---

# Wiki Ingest Skill

A unified workflow for ingesting any source into the project wiki — whether that's
a project service, a package, an infra component, or an external article or approach.

The wiki is a **compounding, LLM-maintained knowledge artifact**. Every ingest
enriches it. Sources inform the wiki; the wiki is not a mirror of sources.

---

## Source Types

Determine the source type before starting. It controls which steps apply.

| Type       | Examples                              | Has local CLAUDE.md? |
| ---------- | ------------------------------------- | -------------------- |
| `service`  | apps/users-service, apps/auth-service | Usually yes          |
| `frontend` | apps/web, apps/admin                  | Usually yes          |
| `package`  | packages/nest-shared, packages/grpc   | Sometimes            |
| `infra`    | infra/kubernetes, infra/aws-iac       | Rarely               |
| `article`  | blog post, paper, external approach   | Never                |
| `decision` | architectural choice, ADR             | Never                |

---

## Ingest Workflow

### Step 1 — Identify sources

Collect what's available for this ingest target. **Priority order:**

1. **Local CLAUDE.md** (if it exists for a service/package) — authoritative for
   conventions, patterns, constraints specific to that scope
2. **Source code / config files** — ground truth for anything not documented
3. **docs/wiki/raw/ reference file** — background context, supplementary only;
   never treat as authoritative over CLAUDE.md or code
4. **External content** (for articles/approaches) — the article itself

> Do not treat docs/wiki/raw/ files as the source of truth. They are reference
> material. If they conflict with a local CLAUDE.md or the actual code, note the
> conflict explicitly in the wiki page and defer to CLAUDE.md/code.

### Step 2 — Determine target wiki page(s)

Map the source to wiki locations. All pages live under `docs/wiki/`:

| Source type | Primary page                             | Possible secondary pages                                                                    |
| ----------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `service`   | `docs/wiki/services/<name>.md`           | `docs/wiki/service-entities/<name>/`, `docs/wiki/graphql-entities/`, `docs/wiki/decisions/` |
| `frontend`  | `docs/wiki/frontend/<name>.md`           | `docs/wiki/packages/` (shared UI packages), `docs/wiki/decisions/`                          |
| `package`   | `docs/wiki/packages/<name>.md`           | `docs/wiki/services/`, `docs/wiki/frontend/` (update consumers)                             |
| `infra`     | `docs/wiki/infra/<name>.md`              | `docs/wiki/overview.md`                                                                     |
| `article`   | `docs/wiki/references/<slug>.md`         | `docs/wiki/decisions/` if it informed a choice                                              |
| `decision`  | `docs/wiki/decisions/YYYY-MM-<title>.md` | relevant service/package pages                                                              |

**Entity sub-directories:**

- `docs/wiki/graphql-entities/<entity-name>.md` — describes a GraphQL entity
  (fields, type, federation directives, resolver contract). Documents the
  _schema shape_, not service business logic. One file per entity type.
- `docs/wiki/service-entities/<service-name>/<entity-name>.md` — describes a
  database/domain entity owned by a specific service (TypeORM entity, columns,
  relations, constraints). One file per entity per service.

Create entity pages as stubs if they don't exist yet; flesh them out during the
ingest of the owning service.

If a page already exists, update it. Never replace — integrate new information,
flag contradictions, mark superseded claims.

### Step 3 — Extract and synthesize

Read all collected sources. Extract:

- **For services**: purpose, ports/interfaces, dependencies, patterns used, known
  constraints, cross-service relationships. Additionally document architecture:
  - How source files are laid out (`src/modules/`, `src/shared/`, entrypoints)
  - What functionality is delegated to shared packages (e.g. `@packages/nest-shared`,
    `@packages/grpc`) vs. implemented locally
  - How the service implements its core features (gRPC transport, GraphQL transport,
    dual-transport split, federation entity resolvers, etc.)
  - Which TypeORM entities exist and how they relate
- **For packages**: purpose, public API surface, which services/apps consume it.
  Additionally document architecture:
  - File layout and barrel exports
  - What is intentionally shared vs. what is internal
  - How consumers are expected to extend or configure it
- **For frontend apps — SSR (Next.js / apps/web)**:
  - App Router structure, Server Component boundaries, `"use client"` usage
  - Server Actions for mutations
  - Data fetching pattern in RSC mode (Apollo Client RSC)
  - Shared UI packages consumed and Tailwind config inheritance
  - Key routes and pages, state management approach
- **For frontend apps — SPA (Vite / apps/admin)**:
  - TanStack Router file-based route structure
  - Apollo Client hooks via `@packages/graphql-generated` generated types
  - No SSR constraints — pure client rendering
  - Codegen workflow and how generated hooks are consumed
  - Shared UI packages consumed and Tailwind config inheritance
- **For infra**: how files are organized (chart templates vs. per-service values,
  global overrides), the templating approach (Helm chart reuse, Terraform modules),
  environment-specific configuration strategy, any notable conventions or gotchas
- **For articles/approaches**: core idea, key claims, applicability to this project,
  contradictions with existing wiki content

Do **not** copy-paste from sources. Synthesize into the wiki's voice. The wiki
page should be useful on its own, not a summary of the source.

### Step 4 — Write the wiki page

Use this frontmatter on every page:

```yaml
---
updated: YYYY-MM-DD
type: service | frontend | package | infra | reference | decision | graphql-entity | service-entity
sources:
  - apps/users-service/CLAUDE.md
  - docs/wiki/raw/apps-users-service.md # only if used as supplementary
tags: [graphql, grpc, nestjs]
---
```

**Wikilinks**: cross-reference related pages using `[[page-name]]` syntax.
Every page should link to at least one other page.

- GraphQL types referenced by a service → `docs/wiki/graphql-entities/<entity>.md`
  (create a stub if missing; include fields, federation directives, resolver contract)
- Database/domain entities owned by a service → `docs/wiki/service-entities/<service-name>/<entity>.md`
  (create a stub if missing; include columns, relations, constraints)

**Architecture section**: for `service`, `package`, and `infra` pages always
include an `## Architecture` section covering the points extracted in Step 3
(file layout, delegation to packages, transport approach for services;
file organization, templating strategy, environment config for infra).

**Contradictions**: if sources disagree, add a blockquote callout:

```
> ⚠️ **Conflict**: CLAUDE.md states X; docs/wiki/raw/ states Y.
> Verify against source code. Unresolved as of YYYY-MM-DD.
```

### Step 5 — Update index and log

**docs/wiki/index.md** — add or update the entry for this page:

```markdown
| [[services/users-service]] | User domain — GraphQL subgraph + gRPC | 2026-04-14 |
```

**docs/wiki/log.md** — append one line (grep-parseable):

```
## [YYYY-MM-DD] ingest | <source-name> → <wiki-page-path>
```

For articles, also record the URL or file path of the original source.

### Step 6 — Touch affected pages

If ingesting a package, check which services consume it and add a cross-reference
to their pages. If ingesting a service, check if any existing wiki pages mention
it and ensure links are accurate.

---

## Batch Ingest Order

When ingesting multiple sources at once, process them in dependency order:

1. Packages (no dependencies on services)
2. Infrastructure primitives (registry, database)
3. Domain services (users, auth)
4. Gateway / aggregation services
5. Frontend apps
6. External articles / decisions (any order)

---

## Filing query results back

If a question against the wiki produces a valuable synthesis, offer to file it:

```
## [YYYY-MM-DD] query-filed | <topic> → docs/wiki/references/<slug>.md
```

---

## Hard Rules

- **Never modify** anything under `docs/wiki/raw/` — read-only reference material
- **Never overwrite** existing wiki pages — integrate and flag conflicts
- **Never create** wiki pages outside the `docs/wiki/` directory
- **Never skip** the log entry — the log is the audit trail
