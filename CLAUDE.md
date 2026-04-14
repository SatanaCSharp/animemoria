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

This project uses an LLM-maintained wiki in `/wiki/`. Rules:

### Layers

- `raw/` — immutable source documents. Never modify.
- `wiki/` — you own this entirely. Create, update, cross-reference.
- `CLAUDE.md` — schema and conventions (this file).

### Conventions

- Every wiki page uses wikilinks: [[users-service]], [[user-entity]]
- Entity pages live in wiki/entities/, service pages in wiki/services/
- Decisions go in wiki/decisions/ with date prefix: YYYY-MM-decision-title.md
- Add YAML frontmatter to every page:

```yaml
  ---
  updated: 2026-04-14
  sources: [apps/users-service/README.md]
  tags: [service, graphql, grpc]
  ---
```

### Operations

**Ingest** — when I say "ingest [file/feature]":

1. Read the source
2. Write/update the relevant wiki pages (service, entity, packages touched)
3. Update wiki/index.md
4. Append entry to wiki/log.md: `## [YYYY-MM-DD] ingest | <title>`
5. Note contradictions with existing pages explicitly

**Query** — answer from wiki pages, cite them. If a good answer
emerges, offer to file it as a new wiki page.

**Lint** — check for: orphan pages, stale claims, missing cross-refs,
concepts mentioned but lacking their own page, gaps to investigate.
Add findings to wiki/gaps.md.
