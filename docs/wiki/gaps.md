# Wiki Gaps

Findings from lint/ingest passes. Prioritized: **high** / **medium** / **low**.

---

## [2026-04-24] lint

| Priority   | Gap                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~high~~   | ~~`docs/wiki/packages/shared-types.md` does not exist.~~ **Resolved 2026-04-24** — page created, broken wikilinks fixed.                                                                                                                                                                                                                                                                                                      |
| ~~high~~   | ~~`docs/wiki/service-entities/` directory does not exist. `users-service` owns a `User` DB entity; `auth-service` owns `Account` and `Session` DB entities. Wiki conventions require `docs/wiki/service-entities/<service>/<entity>.md` stubs for each.~~ **Resolved 2026-04-27** — created `service-entities/users-service/user.md`, `service-entities/auth-service/account.md`, `service-entities/auth-service/session.md`. |
| ~~medium~~ | ~~`docs/wiki/overview.md` contains only an H1 heading — no content. No inbound wikilinks point to it; it is effectively an orphan stub.~~ **Resolved 2026-04-27** — full overview page written; inbound wikilink added from `index.md`.                                                                                                                                                                                       |
| ~~medium~~ | ~~Broken wikilink `[[packages/graphql/definitions]]` in `docs/wiki/packages/utils.md` (line 15). No page exists at that path. Correct target is `[[packages/graphql-definitions]]`.~~ **Resolved 2026-04-24** — wikilink already corrected in current file.                                                                                                                                                                   |
| ~~medium~~ | ~~Broken wikilink `[[migrations]]` in `docs/wiki/services/users-service.md` (line 88). No `docs/wiki/migrations.md` exists; this references a project rules file, not a wiki page.~~ **Resolved 2026-04-24** — replaced with plain-text reference to `.claude/rules/migrations.md`.                                                                                                                                           |
| ~~low~~    | ~~backtick notation for `@packages/shared-types`, `@packages/grpc`, `@packages/utils` in api-gateway, registry, admin pages.~~ **Resolved 2026-04-24** — converted to wikilinks.                                                                                                                                                                                                                                              |
| ~~low~~    | ~~`docs/wiki/packages/eslint-config-ui.md` lists `packages/ui-shared` as a consumer in plain text, not as `[[packages/ui-shared]]`.~~ **Resolved 2026-04-24** — converted to wikilink.                                                                                                                                                                                                                                        |
| ~~low~~    | ~~`docs/wiki/packages/nest-shared.md` Cross-References section refers to `@packages/shared-types` in backtick notation.~~ **Resolved 2026-04-24** — converted to wikilink.                                                                                                                                                                                                                                                    |

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

---

## [2026-04-27] lint

### High priority

- **Stale claim / contradiction** `docs/wiki/packages/nest-shared.md` and `docs/wiki/decisions/2026-04-27-package-audience-scoping.md`: both state that `@packages/nest-shared` is consumed by `users-service` and `auth-service` only, and that `api-gateway-service` must not import it. However, `docs/wiki/services/api-gateway-service.md` (sourced from actual code files) explicitly documents `@packages/nest-shared` as a package dependency, listing `AppLoggerModule`, `JwtRtGuard`, `InjectGrpcServiceClient`, and others. One of these claims is stale — verify against `apps/api-gateway-service/package.json` and update either the constraint or the api-gateway-service wiki page.

### Medium priority

- **Stale port claim** `docs/wiki/frontend/web.md` (bottom "Relationship to Other Apps" section): says "All data flows through [[services/api-gateway-service]] (Apollo Federation gateway at port 4000)." The api-gateway-service wiki page documents GraphQL at `:4301` and REST at `:4101`. Port 4000 is incorrect.
- **Broken wikilink** `docs/wiki/frontend/storybook.md` line 95: references `[[web]]` — no wiki page exists at that path. The correct target is `[[frontend/web]]`.

### Low priority

- **Package consumer cross-reference gap** `docs/wiki/packages/nest-shared.md`: the Cross-References section lists only `users-service` and `auth-service` as consumers. If the stale-claim finding above resolves to "api-gateway-service does use nest-shared", a consumer entry for `[[services/api-gateway-service]]` must be added to the nest-shared page.
