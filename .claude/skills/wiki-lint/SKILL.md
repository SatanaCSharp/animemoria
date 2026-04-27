---
name: wiki-lint
description: >
  Use this skill to audit the project wiki for structural and content issues.
  Triggers on phrases like "lint the wiki", "check the wiki", "audit wiki health",
  "find wiki gaps", "check for stale wiki pages", or after a batch ingest when
  the wiki may have grown out of sync. Always run after any batch ingest operation.
  Writes findings to docs/wiki/gaps.md.
---

# Wiki Lint Skill

A structured audit of the project wiki (`docs/wiki/`) that surfaces structural
gaps, stale content, and missing cross-references. Findings are written to
`docs/wiki/gaps.md` — never silently discarded.

---

## Checks

Run all checks below. For each finding, record it in `docs/wiki/gaps.md` with a
priority tag: **high**, **medium**, or **low**.

### 1 — Orphan pages

A page with no inbound wikilinks is invisible to navigation.

- Scan all `docs/wiki/**/*.md` files for `[[<link>]]` occurrences.
- Build an inbound-link map.
- Flag any page that appears in the map as a target zero times.

Priority: **medium** (unless it's an index or log page — those are exempt).

### 2 — Stale claims

Wiki pages may describe ports, patterns, or dependencies that have since changed
in the authoritative source (CLAUDE.md or source code).

- For each service/package page, compare the `sources:` frontmatter list against
  current CLAUDE.md content for key facts: ports, transport types, database
  presence, package dependencies.
- Flag divergences as stale claims.

Priority: **high** if a port or transport type changed; **medium** otherwise.

### 3 — Missing GraphQL entity pages

A service page that mentions a GraphQL type (e.g. `User`, `Anime`) should have a
corresponding `docs/wiki/graphql-entities/<entity>.md`.

- Scan service and frontend pages for references to GraphQL types.
- Check that a page exists under `docs/wiki/graphql-entities/` for each.
- Flag missing pages.

Priority: **medium**.

### 4 — Missing service-entity pages

A service page that mentions a TypeORM or domain entity should have a
corresponding `docs/wiki/service-entities/<service>/<entity>.md`.

- Scan service pages for entity mentions.
- Check that a page exists under `docs/wiki/service-entities/<service>/`.
- Flag missing pages.

Priority: **medium**.

### 5 — Package consumer cross-references

If a service consumes a package, the package's wiki page should link back to
that service in a "Consumers" section (or equivalent).

- For each package page, check that all known consuming services are linked.
- Cross-reference against `package.json` dependency lists in app directories.

Priority: **low**.

### 6 — Uncovered raw docs

Every file under `docs/wiki/raw/` should eventually have a corresponding wiki
page. Files with no wiki page are ingest backlog.

- List all files under `docs/wiki/raw/`.
- For each, check whether a corresponding page exists anywhere under `docs/wiki/`
  (match by service/package name, not exact filename).
- Flag those without a wiki page.

Priority: **low** (these are ingest backlog, not errors).

---

## Output Format

Append findings to `docs/wiki/gaps.md`. Use this structure:

```markdown
## [YYYY-MM-DD] lint

### High priority

- **Stale claim** `docs/wiki/services/users-service.md`: port listed as 3001 but CLAUDE.md says 4001.

### Medium priority

- **Missing GraphQL entity page**: `User` referenced in users-service but no `docs/wiki/graphql-entities/user.md`.
- **Orphan page**: `docs/wiki/packages/tsconfig.md` has no inbound wikilinks.

### Low priority

- **Uncovered raw doc**: `docs/wiki/raw/package-utils.md` has no wiki page yet.
```

If there are no findings in a priority tier, omit that section.

If there are zero findings total, append:

```markdown
## [YYYY-MM-DD] lint

No issues found.
```

---

## Hard Rules

- **Never modify** source files — read only. Findings go to `gaps.md` only.
- **Never overwrite** `docs/wiki/gaps.md` — append to it.
- **Never skip** the date header — it makes the log grep-parseable.
- Exempt from orphan check: `index.md`, `log.md`, `gaps.md`.
