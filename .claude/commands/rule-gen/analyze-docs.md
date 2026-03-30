---
description: Scan project docs and extract context relevant to a rule topic. Useful as a standalone step before manual rule creation.
allowed-tools: Read, Bash(find:*), Bash(ls:*)
argument-hint: '<rule topic or description>'
---

# Doc Analyzer

Extract documentation context relevant to the rule topic: **$ARGUMENTS**

## Instructions

1. Read `_docs/TABLE_OF_CONTENTS.md` to get the full index of available documentation.

2. From the TOC, identify which app and package READMEs are relevant to the topic: **$ARGUMENTS**
   — relevant means the README description in the TOC overlaps with the topic domain.
   Read only those matched README files (e.g. `apps/users-service/README.md`).

3. Run `find _docs -type f 2>/dev/null` to discover any additional files directly in `_docs/`.
   Read each file found there using the Read tool.

4. If neither step finds anything relevant, report:

   ```
   No relevant docs found for this topic.
   Check _docs/TABLE_OF_CONTENTS.md and add relevant README files or docs.
   ```

   Then stop.

5. For each file read, identify sections that are relevant to the topic: **$ARGUMENTS**
   Relevance means the content would inform, constrain, or guide the creation of a rule about this topic.

6. Output the extracted context in this format:

```
DOC CONTEXT SUMMARY
Topic: [topic from $ARGUMENTS]
Sources scanned: [N files]
────────────────────────────────────────────────

## Relevant Conventions & Patterns
[bullet points of relevant patterns found]

## Relevant Constraints
[bullet points of constraints, restrictions, or requirements]

## Existing Related Rules / Guidelines
[any existing rules or guidelines that overlap with this topic]

## Useful Examples from Docs
[concrete examples from the docs that would inform the rule]

## Irrelevant (skipped)
[list of files that contained nothing relevant, with one-line reason]
```

This context can then be passed to `/project:rule:run` or used manually when writing a rule.
