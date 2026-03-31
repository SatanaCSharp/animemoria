---
description: Full skill creation workflow — analyze docs → create skill → evaluate → improve until avg score ≥ 9.0 or 3 improvement attempts are exhausted
allowed-tools: Read, Write, Bash(find:*), Bash(mkdir:*)
argument-hint: '<describe the skill you want to create>'
---

# /workflow:skill-gen

**Goal:** produce a skill that scores ≥ 9.0 average across 10 skill evaluation criteria.
**Loop limit:** 3 improvement attempts maximum.
**Input:** $ARGUMENTS

Use the `create-skill` skill as the primary reference for skill structure and authoring principles throughout this workflow.

---

## State you must track throughout this workflow

```
request        = "$ARGUMENTS"
docs_context   = ""       # filled in Step 1
current_skill  = ""       # filled in Step 2, updated each improvement
attempt        = 0        # incremented before each evaluation
latest_eval    = ""       # overwritten after each evaluation
scores_history = []       # one avg score per attempt
passed         = false    # set true when avg >= 9.0
```

---

## Step 1 — Analyze Reference Docs

1. Read `_docs/TABLE_OF_CONTENTS.md` to get the full index of available documentation.
2. From the TOC, identify which app and package READMEs are relevant to: **$ARGUMENTS**
   — relevant means the README description in the TOC overlaps with the topic domain.
   Read only those matched README files (e.g. `apps/users-service/README.md`).
3. Run `find _docs -type f 2>/dev/null` to discover any additional files directly in `_docs/`.
   Read each file found there using the Read tool.
4. From all files read, extract **only** what is relevant to: **$ARGUMENTS**
   — relevant means: workflows, patterns, tool integrations, domain knowledge, or schemas for this topic.
5. Store the extracted summary as `docs_context`.

If nothing relevant is found: set `docs_context = "No relevant documentation found."` and continue.

---

## Step 2 — Create Initial Skill

Invoke the `create-skill` skill before writing any content. Use `request` and `docs_context` to produce a complete skill.

**All required sections are mandatory — no placeholders:**

### SKILL.md structure

```
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms — third person, no workflow summary]
---

# Skill Name

## Overview
[What is this? Core principle in 1-2 sentences.]

## When to Use
[Bullet list with symptoms and use cases. When NOT to use.]

## [Core Pattern / Workflow / Reference]
[The main skill content. Code inline for short patterns; link to references/ for heavy material.]

## Quick Reference
[Table or bullets for scanning common operations.]

## Common Mistakes
[What goes wrong + specific fixes.]
```

**Authoring rules (from `create-skill`):**

- SKILL.md MUST be under 200 lines
- `name`: letters, numbers, hyphens only — no parentheses or special chars
- `description`: starts with "Use when...", third-person, triggering conditions only — never summarize the workflow
- Total YAML frontmatter ≤ 1024 characters
- Move heavy reference material (100+ lines) to `references/` files
- One excellent example beats multiple mediocre ones
- Every token must justify its cost — challenge each sentence

Set `current_skill` = this skill content (SKILL.md text only).

---

## Step 3 — Evaluate

Increment `attempt` by 1.

Score `current_skill` strictly against all 10 skill criteria.

**Scoring:**

- 10 = flawless, nothing to improve
- 8–9 = good, only minor polish needed
- 6–7 = acceptable but clear gaps
- 4–5 = significant problems
- 1–3 = fundamental issues, requires rewrite

**Score what is actually written — not what was intended.**

### Criteria

| Criterion               | Evaluate strictly                                                          |
| ----------------------- | -------------------------------------------------------------------------- |
| **trigger_clarity**     | Precise description of when to invoke this skill — no ambiguity about fit. |
| **scope_definition**    | What the skill covers AND explicitly does not cover — both stated.         |
| **instruction_quality** | Steps are complete, correct, and in the right order. No gaps.              |
| **example_coverage**    | Main use cases and meaningful edge cases are covered with examples.        |
| **error_handling**      | What to do on unexpected inputs or tool failures is specified.             |
| **reusability**         | Generalizable across contexts. Not hard-coded to one specific task.        |
| **dependency_clarity**  | Required tools, APIs, and prerequisites are explicitly listed.             |
| **output_consistency**  | Given similar inputs, the skill produces predictably similar outputs.      |
| **completeness**        | No critical steps or important considerations are missing.                 |
| **maintainability**     | Structured so it can be updated without rewriting the whole skill.         |

### Write this evaluation block:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVALUATION — Attempt [attempt]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
trigger_clarity     [X]/10  [one-line note]
scope_definition    [X]/10  [one-line note]
instruction_quality [X]/10  [one-line note]
example_coverage    [X]/10  [one-line note]
error_handling      [X]/10  [one-line note]
reusability         [X]/10  [one-line note]
dependency_clarity  [X]/10  [one-line note]
output_consistency  [X]/10  [one-line note]
completeness        [X]/10  [one-line note]
maintainability     [X]/10  [one-line note]
─────────────────────────────────────────────────
AVERAGE:            [X.X]/10

STRENGTHS:
  • [what scored well and why]

POINTS TO IMPROVE  (score < 8):
  • [criterion] ([score]) — [specific problem in current skill text]

IMPROVEMENT RECOMMENDATIONS:
  [HIGH]   [criterion] — [exact fix] / e.g. "[concrete rewrite sample]"
  [MEDIUM] [criterion] — [exact fix] / e.g. "[concrete rewrite sample]"
  [LOW]    [criterion] — [exact fix]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Set `latest_eval` = the block above.
Append average score to `scores_history`.

---

## Step 4 — Loop Decision

```
if average_score >= 9.0  →  passed = true   →  go to FINALIZE
if attempt >= 3          →  passed = false  →  go to FINALIZE
otherwise                →  go to Step 5
```

---

## Step 5 — Improve Skill

You are the improver. Rewrite `current_skill` using `latest_eval`.

**Before writing, state your improvement plan:**

```
IMPROVEMENT PLAN
─────────────────────────────────────────────────
Must fix (scored < 8):
  • [criterion] ([score]) → [what will change]
Must not regress (scored >= 8):
  • [criterion] ([score]) — preserving
Addressing HIGH recommendations:
  • [rec] → [how]
─────────────────────────────────────────────────
```

**Then write the complete improved SKILL.md — all required sections in full.**

Improvement rules:

- Fix every criterion that scored < 8 — the improvement must be visible and specific
- Do not regress on any criterion that scored >= 8
- If trigger_clarity was weak: rewrite description to start with "Use when..." and list specific symptoms
- If scope_definition was weak: add explicit "When NOT to use" section with concrete exclusions
- If example_coverage was weak: add a realistic, runnable example for the primary use case
- If error_handling was weak: add explicit handling for the most likely failure modes
- SKILL.md must remain under 200 lines — move excess to `references/` files
- Do not add length for its own sake — only add what fixes a scored deficiency

Set `current_skill` = improved skill.
→ Return to **Step 3**

---

## FINALIZE

Derive the output directory from `request`:

- Convert to lowercase kebab-case (e.g. "NestJS module generation" → `nestjs-module-generation`)
- Set `skill_dir` = `.claude/skills/<derived-name>`
- Set `skill_file` = `skill_dir/SKILL.md`

Create the directory if it does not exist:

```
mkdir -p [skill_dir]
```

Write `skill_file` with the final `current_skill` content.

Print to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Skill Workflow Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Request : [request]
 Attempts: [attempt] / 3

 Attempt 1: [score]/10
 Attempt 2: [score]/10  (if ran)
 Attempt 3: [score]/10  (if ran)

 Final score : [last score] / 10
 Outcome     : [Passed ✅  |  Max attempts reached ⚠️]

 [skill_file]  ← your skill
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
