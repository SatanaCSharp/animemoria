# Pull Request Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a PR CI pipeline that detects changed workspaces, runs lint + Prettier (fail-fast), then runs tests only if quality checks pass.

**Architecture:** Three jobs in sequence — `detect-changes` (outputs a JSON matrix of changed workspaces), `quality-checks` (matrix fan-out: lint + prettier per workspace), `tests` (matrix fan-out: only runs if quality-checks passes). The existing `change-detection` composite action is extended to cover packages as well as apps and to declare its outputs properly.

**Tech Stack:** GitHub Actions composite actions, Turborepo `turbo ls`, `jq`, `prettier`, `pnpm`

---

## File Map

| Action | File                                          |
| ------ | --------------------------------------------- |
| Modify | `.github/actions/change-detection/action.yml` |
| Modify | `.github/workflows/ci.yml`                    |
| Modify | `.github/workflows/pull-request.yml`          |

---

### Task 1: Fix and extend the `change-detection` action

**Files:**

- Modify: `.github/actions/change-detection/action.yml`

The current action has three problems:

1. It never declares `outputs:` so callers can't reference `has_changes` or `matrix`.
2. It filters to `apps/` only — packages are excluded.
3. It uses `--targets='build'` — packages like `eslint-config-*` or `tsconfig` have no `build` task, so they're invisible.
4. It hardcodes `origin/main` but the repo's default branch is `master`.

- [ ] **Step 1: Replace the full action file**

Write the following content to `.github/actions/change-detection/action.yml`:

```yaml
name: Change detection
author: yuriihorchuk
description: Detects changed apps and packages relative to the base branch and outputs a JSON matrix.

inputs:
  base-branch:
    description: Base branch to compare against (e.g. master).
    required: false
    default: 'master'

outputs:
  has_changes:
    description: "'true' if any workspace changed, 'false' otherwise"
    value: ${{ steps.set-matrix.outputs.has_changes }}
  matrix:
    description: 'JSON array of changed workspace names'
    value: ${{ steps.set-matrix.outputs.matrix }}

runs:
  using: 'composite'
  steps:
    - name: change detection
      id: set-matrix
      shell: bash
      run: |
        CHANGES=$(npx turbo ls --filter="...[origin/${{ inputs.base-branch }}]" --targets='lint' --json | jq -c '.packages | map(.name)')
        if [ "$CHANGES" == "[]" ] || [ -z "$CHANGES" ]; then
          echo "has_changes=false" >> $GITHUB_OUTPUT
        else
          echo "has_changes=true" >> $GITHUB_OUTPUT
          echo "matrix=$CHANGES" >> $GITHUB_OUTPUT
        fi
```

- [ ] **Step 2: Verify YAML is valid**

```bash
npx js-yaml .github/actions/change-detection/action.yml
```

Expected: no output (no errors). If `js-yaml` isn't available, use:

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/actions/change-detection/action.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/actions/change-detection/action.yml
git commit -m "fix(change-detection): add outputs, include packages, fix base branch"
```

---

### Task 2: Disable `ci.yml` automatic trigger

**Files:**

- Modify: `.github/workflows/ci.yml`

The `ci.yml` workflow currently triggers on `pull_request`. Since `pull-request.yml` will own all PR checks, `ci.yml` must not run automatically until it is reworked later.

- [ ] **Step 1: Replace the `on:` block in `ci.yml`**

Open `.github/workflows/ci.yml`. Replace the existing `on:` block:

```yaml
on:
  pull_request:
    branches:
      - master
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review
```

With:

```yaml
on:
  workflow_dispatch:
```

Leave everything else (permissions, env, jobs) unchanged.

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore(ci): switch to manual trigger while pull-request.yml takes over PR checks"
```

---

### Task 3: Implement `pull-request.yml` — `detect-changes` job

**Files:**

- Modify: `.github/workflows/pull-request.yml`

The file currently contains only a skeleton (`name:` and empty `on:`/`jobs:`). Build it up job by job, starting with `detect-changes`.

- [ ] **Step 1: Write the workflow header and `detect-changes` job**

Replace the entire contents of `.github/workflows/pull-request.yml` with:

```yaml
name: Pull Request

on:
  pull_request:
    branches:
      - master
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review

env:
  NODE_VERSION: '24.x'
  PNPM_VERSION: '9.15.3'

jobs:
  detect-changes:
    name: Detect changed workspaces
    runs-on: ubuntu-latest
    outputs:
      has_changes: ${{ steps.changes.outputs.has_changes }}
      matrix: ${{ steps.changes.outputs.matrix }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run change detection
        id: changes
        uses: ./.github/actions/change-detection
        with:
          base-branch: ${{ github.base_ref }}
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/pull-request.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pull-request.yml
git commit -m "feat(pull-request): add workflow skeleton with detect-changes job"
```

---

### Task 4: Add the `quality-checks` job (lint + prettier)

**Files:**

- Modify: `.github/workflows/pull-request.yml`

- [ ] **Step 1: Append the `quality-checks` job**

Open `.github/workflows/pull-request.yml` and append the following inside the `jobs:` block (after the `detect-changes` job):

```yaml
quality-checks:
  name: 'Quality: ${{ matrix.workspace }}'
  needs: detect-changes
  if: needs.detect-changes.outputs.has_changes == 'true'
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      workspace: ${{ fromJson(needs.detect-changes.outputs.matrix) }}
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup environment
      uses: ./.github/actions/setup-environment
      with:
        pnpm-version: ${{ env.PNPM_VERSION }}
        node-version: ${{ env.NODE_VERSION }}
        node: 'true'
        app-dependencies: 'true'

    - name: Lint
      run: pnpm turbo run lint --filter="${{ matrix.workspace }}"

    - name: Prettier check
      run: |
        WORKSPACE_DIR=$(pnpm --filter="${{ matrix.workspace }}" exec pwd --if-present 2>/dev/null || true)
        if [ -z "$WORKSPACE_DIR" ]; then
          echo "Could not resolve path for ${{ matrix.workspace }}, skipping prettier"
          exit 0
        fi
        REL_PATH="${WORKSPACE_DIR#$GITHUB_WORKSPACE/}"
        CHANGED=$(git diff --name-only "origin/${{ github.base_ref }}...HEAD" \
          -- "${REL_PATH}/**/*.ts" "${REL_PATH}/**/*.tsx" \
             "${REL_PATH}/**/*.js" "${REL_PATH}/**/*.jsx" \
             "${REL_PATH}/**/*.json" "${REL_PATH}/**/*.css" \
             "${REL_PATH}/**/*.md" | xargs)
        if [ -n "$CHANGED" ]; then
          echo "Checking prettier for: $CHANGED"
          npx prettier --check $CHANGED
        else
          echo "No prettier-eligible files changed in ${{ matrix.workspace }}"
        fi
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/pull-request.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pull-request.yml
git commit -m "feat(pull-request): add quality-checks job (lint + prettier per workspace)"
```

---

### Task 5: Add the `tests` job

**Files:**

- Modify: `.github/workflows/pull-request.yml`

- [ ] **Step 1: Append the `tests` job**

Open `.github/workflows/pull-request.yml` and append the following inside the `jobs:` block (after the `quality-checks` job):

```yaml
tests:
  name: 'Tests: ${{ matrix.workspace }}'
  needs: [detect-changes, quality-checks]
  if: needs.detect-changes.outputs.has_changes == 'true'
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      workspace: ${{ fromJson(needs.detect-changes.outputs.matrix) }}
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup environment
      uses: ./.github/actions/setup-environment
      with:
        pnpm-version: ${{ env.PNPM_VERSION }}
        node-version: ${{ env.NODE_VERSION }}
        node: 'true'
        app-dependencies: 'true'

    - name: Run tests
      run: pnpm turbo run test --filter="${{ matrix.workspace }}"
```

- [ ] **Step 2: Verify complete YAML is valid**

```bash
python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/pull-request.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pull-request.yml
git commit -m "feat(pull-request): add tests job (runs only after quality-checks pass)"
```

---

### Task 6: Smoke-test the full workflow

No code changes — verify the pipeline behaves as designed before merging.

- [ ] **Step 1: Verify YAML structure matches intent**

Run a final parse of all three modified files:

```bash
for f in \
  .github/actions/change-detection/action.yml \
  .github/workflows/ci.yml \
  .github/workflows/pull-request.yml; do
  python3 -c "import yaml; yaml.safe_load(open('$f'))" && echo "OK: $f" || echo "FAIL: $f"
done
```

Expected:

```
OK: .github/actions/change-detection/action.yml
OK: .github/workflows/ci.yml
OK: .github/workflows/pull-request.yml
```

- [ ] **Step 2: Push branch and open a draft PR to master**

```bash
git push origin HEAD
```

Open a draft PR targeting `master` on GitHub. Verify in the Actions tab:

- `detect-changes` job runs and outputs a non-empty matrix (check job summary).
- `quality-checks` matrix jobs appear — one per changed workspace.
- `tests` matrix jobs are blocked until `quality-checks` all pass.
- `ci.yml` does NOT trigger.

- [ ] **Step 3: Verify fail-fast behaviour**

Introduce a deliberate lint error in one changed workspace (e.g., add `const x = 1` with no usage). Push. Verify:

- Only the affected workspace's `quality-checks` job fails.
- Other workspace `quality-checks` jobs still run to completion (`fail-fast: false`).
- All `tests` jobs are skipped because `quality-checks` did not fully pass.

Revert the lint error and push again. Verify all jobs go green.

- [ ] **Step 4: Verify skip behaviour**

Open a PR that only modifies a file outside any workspace (e.g., `infra/` or root `README.md`). Verify:

- `detect-changes` completes with `has_changes=false`.
- `quality-checks` and `tests` are both skipped.
