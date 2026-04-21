# Wiki Gaps

Findings from lint/ingest passes. Prioritized: **high** / **medium** / **low**.

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
