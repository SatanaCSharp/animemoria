---
paths:
  - apps/**
  - packages/**
---

# Tech documentation Lookup Rule

When working in `apps/` or `packages/` directories:

1. Read `_docs/TABLE_OF_CONTENTS.md` to find which README files are relevant
2. Match the task description against the README descriptions in the TOC
3. Read ONLY the matched README files (e.g. `apps/users-service/README.md` or `apps/auth-service/README.md`)
4. Do not read sibling READMEs unless the TOC description indicates overlap

This keeps context lean — irrelevant package docs waste tokens and dilute focus.
