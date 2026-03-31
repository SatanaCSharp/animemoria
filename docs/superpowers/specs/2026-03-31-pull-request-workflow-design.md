# Pull Request Workflow Design

**Date:** 2026-03-31
**Scope:** `.github/workflows/pull-request.yml`, `.github/actions/change-detection/action.yml`, `.github/workflows/ci.yml`

---

## Goal

Add a CI pipeline that runs on every pull request to `master`. It detects which workspaces (apps and packages) changed, runs lint and Prettier checks fast to fail early, then runs tests only if quality checks pass.

---

## Architecture

Three jobs in sequence:

```
detect-changes
      ↓
quality-checks  (matrix: changed workspaces — lint + prettier)
      ↓
tests           (matrix: same changed workspaces)
```

---

## Components

### 1. Updated `change-detection` action

**File:** `.github/actions/change-detection/action.yml`

Two fixes + one extension to the existing action:

- **Add `outputs` declaration** — the action writes to `$GITHUB_OUTPUT` but never declares `outputs:` in the composite YAML. Callers cannot reference undeclared outputs. Add:
  ```yaml
  outputs:
    has_changes:
      description: "'true' if any workspace changed, 'false' otherwise"
      value: ${{ steps.set-matrix.outputs.has_changes }}
    matrix:
      description: 'JSON array of changed workspace names'
      value: ${{ steps.set-matrix.outputs.matrix }}
  ```
- **Remove `apps/`-only filter** — drop `map(select(.path | startswith("apps/")))` so packages are included alongside apps.
- **Switch `--targets` from `build` to `lint`** — captures all workspaces that have a `lint` task (including config packages that have no `build` task).

Output shape (unchanged): `has_changes` (string `"true"`/`"false"`) and `matrix` (compact JSON array of workspace names, e.g. `["users-service","@packages/nest-shared"]`).

---

### 2. `pull-request.yml` workflow

**File:** `.github/workflows/pull-request.yml`

**Trigger:**

```yaml
on:
  pull_request:
    branches:
      - master
    types: [opened, synchronize, reopened, ready_for_review]
```

**Top-level env** (mirrors `ci.yml`):

```yaml
env:
  NODE_VERSION: '24.x'
  PNPM_VERSION: '9.15.3'
```

#### Job: `detect-changes`

- `actions/checkout@v4` with `fetch-depth: 0` (required for `turbo ls --filter='...[origin/master]'`)
- Uses `./.github/actions/change-detection`
- Declares job-level `outputs` forwarding `has_changes` and `matrix` from the action step

#### Job: `quality-checks`

- `needs: detect-changes`
- `if: needs.detect-changes.outputs.has_changes == 'true'`
- `strategy.matrix.workspace: ${{ fromJson(needs.detect-changes.outputs.matrix) }}`
- `fail-fast: false` — let all matrix jobs run independently so all lint errors are visible at once

Steps per matrix job:

1. `actions/checkout@v4` (fetch-depth: 0 for git diff)
2. `./.github/actions/setup-environment` with `node: 'true'`, `app-dependencies: 'true'`
3. **Lint:** `pnpm turbo run lint --filter=${{ matrix.workspace }}`
4. **Prettier:** resolve the workspace's relative path via `pnpm --filter=<workspace> exec pwd`, then get only changed files under that path and run `prettier --check` on matching extensions; skip gracefully if no matching files:
   ```bash
   WORKSPACE_DIR=$(pnpm --filter="${{ matrix.workspace }}" exec pwd --if-present 2>/dev/null)
   REL_PATH="${WORKSPACE_DIR#$GITHUB_WORKSPACE/}"
   CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \
     -- "${REL_PATH}/**/*.ts" "${REL_PATH}/**/*.tsx" \
        "${REL_PATH}/**/*.js" "${REL_PATH}/**/*.jsx" \
        "${REL_PATH}/**/*.json" "${REL_PATH}/**/*.css" \
        "${REL_PATH}/**/*.md" | xargs)
   if [ -n "$CHANGED" ]; then
     npx prettier --check $CHANGED
   else
     echo "No prettier-eligible files changed in ${{ matrix.workspace }}"
   fi
   ```

#### Job: `tests`

- `needs: [detect-changes, quality-checks]`
- `if: needs.detect-changes.outputs.has_changes == 'true'`
- Same matrix as `quality-checks`
- `fail-fast: false`

Steps per matrix job:

1. `actions/checkout@v4`
2. `./.github/actions/setup-environment` with `node: 'true'`, `app-dependencies: 'true'`
3. **Test:** `pnpm turbo run test --filter=${{ matrix.workspace }}`

---

### 3. `ci.yml` — temporary manual trigger

**File:** `.github/workflows/ci.yml`

Change trigger from `pull_request` to `workflow_dispatch` so it no longer runs automatically on PRs. The existing job body is left intact for future use.

---

## Data Flow

```
PR opened/updated
      │
      ▼
detect-changes
  turbo ls --filter='...[origin/master]' --targets='lint'
  → has_changes: "true"
  → matrix: ["users-service", "@packages/nest-shared", ...]
      │
      ▼
quality-checks (per workspace in matrix)
  lint:    turbo run lint --filter=<workspace>
  prettier: prettier --check <changed files in workspace>
  → pass or fail fast
      │
      ▼ (only if all quality-checks pass)
tests (per workspace in matrix)
  turbo run test --filter=<workspace>
```

---

## Error Handling

- If `has_changes` is `false` (no workspace changes detected), `quality-checks` and `tests` are both skipped — no wasted runner time.
- `fail-fast: false` on both matrix jobs means a lint failure in one workspace does not cancel others; all results are visible before the PR is blocked.
- Prettier step skips gracefully when no matching changed files exist in a workspace.

---

## Testing the Workflow

- Open a PR that touches a single package (e.g., `@packages/utils`) — only that workspace should appear in the matrix.
- Introduce a lint error — `quality-checks` should fail and `tests` should not run.
- Fix lint but leave a prettier violation — same fail-fast behavior.
- All clean — `tests` job should run and pass.
- Open a PR with no workspace changes (e.g., only `infra/` or docs changes) — all jobs should be skipped.
