## Project

AniMemoria — anime streaming platform (watch anime, manage users, authenticate sessions).
Monorepo: pnpm workspaces + Turborepo v2.
Language: TypeScript throughout (Node.js ≥ 24).

**Claude's role in this repo:** implement features, fix bugs, write migrations, scaffold new NestJS modules/services, maintain Helm/Terraform config, and review code across all workspaces. When in doubt about a task's scope, read the relevant README first (see Documentation Navigation).

## Development Setup

### Common Commands

All scripts are defined in the root `@package.json`

## Code Conventions

### TypeScript

- All packages extend `@packages/tsconfig` with strict type-checking enabled.
- Use `catalog:` references in `package.json` for shared devDependencies — update versions in root `pnpm-workspace.yaml`, not in individual `package.json` files.

---

## Common Workflows & Gotchas

### Commit Message Format

Use commitlint-style scopes with the ticket number from the current branch (e.g. branch `feat/AM-45-gh-actions` → ticket `AM-45`):

```
feat(AM-45): add github actions
fix(AM-45): fix github actions workflow
refactor(AM-45): extract composite actions
```

Format: `<type>(AM-<number>): <message>`
Types: `feat`, `core`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`

### Gotchas

- **Service startup order:** Gateway depends on registry + subgraphs being up. Start registry first.
- **Proto changes:** Always run `pnpm proto:generate` and rebuild packages after `.proto` edits.
- **Catalog deps:** Never bump shared devDep versions in individual `package.json` — update `catalog:` entries in the workspace root only.
- **Apollo version:** `@apollo/server` is pinned to v5 in pnpm `allowedVersions`. Peer dep warnings for `@apollo/server-plugin-landing-page-graphql-playground` are expected and safe to ignore.
- **Vite admin vs Next.js web:** Admin is a pure client SPA (no SSR). Do not use Next.js server features (Server Actions, RSC) in the admin app.
- **gRPC reflection:** Enabled by default via `@packages/nest-shared`. Review whether to disable in production for security-sensitive deployments.

## Wiki

This project maintains a compounding knowledge base in `/wiki/`.
Claude owns the wiki layer entirely. You read it; Claude writes it.

### Source hierarchy (for ingest)

1. **Local CLAUDE.md** (apps/_/CLAUDE.md, packages/_/CLAUDE.md) —
   authoritative for service/package conventions, patterns, constraints.
   Treat as the primary source when ingesting a service or package.
2. **docs/wiki/raw/** — background reference docs (apps-_, package-_,
   infra-\* files). Secondary: use to fill in context not covered by CLAUDE.md.
3. **Source code itself** — ground truth for anything not documented.

Never treat docs/wiki/raw/ as authoritative over a local CLAUDE.md.

### Conventions

- Wikilinks: [[users-service]], [[user-entity]]
- services/ → one page per app; packages/ → one page per package
- decisions/ → date-prefixed: YYYY-MM-decision-title.md
- YAML frontmatter on every page:

```yaml
  ---
  updated: YYYY-MM-DD
  sources: [apps/users-service/CLAUDE.md, docs/wiki/raw/apps-users-service.md]
  tags: [service, graphql, grpc]
  ---
```

### Operations

**Ingest** `ingest [service/package/infra area]`:

1. Read the local CLAUDE.md first (if it exists)
2. Read the corresponding docs/wiki/raw/ file for additional context
3. Write/update wiki page, noting which source each claim came from
4. Update wiki/index.md and append to wiki/log.md:
   `## [YYYY-MM-DD] ingest | <name>`
5. Flag contradictions between CLAUDE.md and raw docs explicitly in the page

**Query** — answer from wiki pages with citations. File valuable
answers back as new wiki pages.

**Lint** — check for: orphan pages, stale claims, missing cross-refs,
gaps between what CLAUDE.md documents and what the wiki reflects.
Add findings to wiki/gaps.md.
