# Wiki Gaps

Findings from lint/ingest passes. Prioritized: **high** / **medium** / **low**.

---

## [2026-04-24] lint

| Priority   | Gap                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~high~~   | ~~`docs/wiki/packages/shared-types.md` does not exist.~~ **Resolved 2026-04-24** — page created, broken wikilinks fixed.                                                                                                                                                            |
| high       | `docs/wiki/service-entities/` directory does not exist. `users-service` owns a `User` DB entity; `auth-service` owns `Account` and `Session` DB entities. Wiki conventions require `docs/wiki/service-entities/<service>/<entity>.md` stubs for each.                               |
| medium     | `docs/wiki/overview.md` contains only an H1 heading — no content. No inbound wikilinks point to it; it is effectively an orphan stub.                                                                                                                                               |
| ~~medium~~ | ~~Broken wikilink `[[packages/graphql/definitions]]` in `docs/wiki/packages/utils.md` (line 15). No page exists at that path. Correct target is `[[packages/graphql-definitions]]`.~~ **Resolved 2026-04-24** — wikilink already corrected in current file.                         |
| ~~medium~~ | ~~Broken wikilink `[[migrations]]` in `docs/wiki/services/users-service.md` (line 88). No `docs/wiki/migrations.md` exists; this references a project rules file, not a wiki page.~~ **Resolved 2026-04-24** — replaced with plain-text reference to `.claude/rules/migrations.md`. |
| ~~low~~    | ~~backtick notation for `@packages/shared-types`, `@packages/grpc`, `@packages/utils` in api-gateway, registry, admin pages.~~ **Resolved 2026-04-24** — converted to wikilinks.                                                                                                    |
| ~~low~~    | ~~`docs/wiki/packages/eslint-config-ui.md` lists `packages/ui-shared` as a consumer in plain text, not as `[[packages/ui-shared]]`.~~ **Resolved 2026-04-24** — converted to wikilink.                                                                                              |
| ~~low~~    | ~~`docs/wiki/packages/nest-shared.md` Cross-References section refers to `@packages/shared-types` in backtick notation.~~ **Resolved 2026-04-24** — converted to wikilink.                                                                                                          |

---

## [2026-04-21] storybook

| Priority | Gap                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| medium   | `apps/storybook` has no stories for `@packages/ui-shared` components — only boilerplate examples exist. No CLAUDE.md for this app.   |
| low      | `docs/wiki/raw/apps-storybook.md` is generic `create-next-app` boilerplate — should be replaced with actual Storybook documentation. |

---

## [2026-04-21] registry-service

| Priority | Gap                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| high     | `SystemError` thrown on missing lookups is not mapped to HTTP 404 — callers receive HTTP 500. Needs a global exception filter in `registry-service`. |
| high     | No authentication on the REST port — any process that can reach `:4100` can register or deregister any service.                                      |
| medium   | No TTL or stale-entry cleanup — crashed services that skip unregister leave stale entries indefinitely.                                              |
| medium   | `ServiceRegistryController` has zero test coverage.                                                                                                  |
| low      | No concurrent-write safety on the in-memory map — concurrent registrations from multiple instances may produce inconsistent state.                   |
