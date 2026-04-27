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

This project maintains a compounding knowledge base in `docs/wiki/`.
Claude owns the wiki layer entirely. You read it; Claude writes it.

### Wiki-first: reducing token consumption

**Before reading any source file, CLAUDE.md, or raw doc**, always check the wiki:

1. Open `docs/wiki/index.md` — if a page exists for the service/package/area you need, read **that specific wiki page** (not just the index) before touching any raw source. The index alone does not satisfy the wiki-first requirement.
2. Only fall back to `apps/*/CLAUDE.md` or source code when the wiki page is missing, explicitly marked stale, or contains an unresolved conflict notice. When falling back, state the reason in your response before reading. **Never read `docs/wiki/raw/`** — that directory is for wiki generation only, not for answering queries. Reading source code is last priority and only when wiki and CLAUDE.md files are insufficient.
3. When new knowledge is synthesized from raw sources, update the wiki page immediately so future queries are served from it. Every wiki write must include YAML frontmatter with `updated: YYYY-MM-DD` (today's date) and `sources:` listing every file read during the synthesis.
4. Once you have read a wiki page for a topic, do **not** also read `docs/wiki/raw/*` in the same session — it is for wiki generation only, never for answering questions. Reading `apps/<service>/CLAUDE.md` is allowed when the wiki page is stale or missing. Read `docs/wiki/index.md` at most once per session; re-read only when switching to a clearly different topic.
5. When you encounter knowledge gaps or lack context to answer confidently, use the **interviewer pattern**: ask the user targeted questions to fill the gap before proceeding, rather than guessing or reading unnecessary files.

One wiki page instead of multiple raw files keeps context windows small and answers fast.

### Operations

- **Ingest** a service/package/infra area → use the `wiki-ingest` skill.
- **Query** — answer from wiki pages with citations; file valuable synthesis back as new wiki pages.
- **Lint** — audit for orphan pages, stale claims, missing cross-refs → use the `wiki-lint` skill.
