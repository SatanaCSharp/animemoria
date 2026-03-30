---
description: Full rule creation workflow — analyze docs → create rule → evaluate → improve until avg score ≥ 9.0 or 3 improvement attempts are exhausted
allowed-tools: Read, Write, Bash(find:*), Bash(mkdir:*)
argument-hint: '<describe the rule you want to create>'
---

# /rule-gen:run

**Goal:** produce a rule that scores ≥ 9.0 average across 10 evaluation criteria.
**Loop limit:** 3 improvement attempts maximum.
**Input:** $ARGUMENTS

---

## State you must track throughout this workflow

```
request        = "$ARGUMENTS"
docs_context   = ""       # filled in Step 1
current_rule   = ""       # filled in Step 2, updated each improvement
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
   — relevant means: naming conventions, constraints, patterns, or existing rules for this topic.
5. Store the extracted summary as `docs_context`.

If nothing relevant is found: set `docs_context = "No relevant documentation found."` and continue.

---

## Step 2 — Create Initial Rule

Using `request` and `docs_context`, write a complete rule.

**All 8 sections are mandatory — no placeholders:**

```
# [Title: imperative verb phrase]

## Purpose
[1–2 sentences. Why this rule exists. What problem it prevents.]

## Scope
[Which systems/components/roles. Which environments.
Explicit exclusions: what this does NOT apply to.]

## Rule Statement
[Core directives. Use MUST / MUST NOT. Each must be independently testable.]

## Conditions
Preconditions: [what must be true for the rule to activate]
Exceptions:    [when the rule may be bypassed + required approval process]
Edge cases:    [boundary situations with explicit handling]

## Examples

### Compliant
[Realistic, specific. Not trivial.]

### Non-Compliant
[Realistic, specific. Explain exactly what is wrong.]

## Rationale
[Why written this way. Alternatives considered. Consequences of non-compliance.]

## Related Rules / References
[Interacting rules. External standards. Doc links.]
```

Set `current_rule` = this rule.

---

## Step 3 — Evaluate

Increment `attempt` by 1.

Score `current_rule` strictly against all 10 criteria.

**Scoring:**

- 10 = flawless, nothing to improve
- 8–9 = good, only minor polish needed
- 6–7 = acceptable but clear gaps
- 4–5 = significant problems
- 1–3 = fundamental issues, requires rewrite

**Score what is actually written — not what was intended.**

### Criteria

| Criterion              | Evaluate strictly                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **clarity**            | Every sentence has one interpretation. New team member can act on it.                  |
| **completeness**       | All 8 sections present. None are placeholder text. Each is substantive.                |
| **testability**        | Pass/fail is objective. No subjective judgment required.                               |
| **actionability**      | Reader knows exactly what to do. No unresolved "it depends".                           |
| **scope_precision**    | In-scope and out-of-scope both explicitly stated. No implicit assumptions.             |
| **example_quality**    | ≥1 compliant + ≥1 non-compliant. Both realistic. Non-compliant explains why.           |
| **rationale_strength** | "Why" is compelling. Alternatives acknowledged. Non-compliance consequences stated.    |
| **consistency**        | Same term for same concept throughout. No contradictions between sections.             |
| **brevity**            | Every sentence earns its place. No padding, restatements, or filler.                   |
| **enforceability**     | A specific tool, process, or role that enforces this rule is named or clearly implied. |

### Write this evaluation block:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVALUATION — Attempt [attempt]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
clarity            [X]/10  [one-line note]
completeness       [X]/10  [one-line note]
testability        [X]/10  [one-line note]
actionability      [X]/10  [one-line note]
scope_precision    [X]/10  [one-line note]
example_quality    [X]/10  [one-line note]
rationale_strength [X]/10  [one-line note]
consistency        [X]/10  [one-line note]
brevity            [X]/10  [one-line note]
enforceability     [X]/10  [one-line note]
─────────────────────────────────────────────────
AVERAGE:           [X.X]/10

STRENGTHS:
  • [what scored well and why]

POINTS TO IMPROVE  (score < 8):
  • [criterion] ([score]) — [specific problem in current rule text]

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

## Step 5 — Improve Rule

You are the improver. Rewrite `current_rule` using `latest_eval`.

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

**Then write the complete improved rule — all 8 sections in full.**

Improvement rules:

- Fix every criterion that scored < 8 — the improvement must be visible and specific
- Do not regress on any criterion that scored >= 8
- If enforceability was weak: name the specific tool, CI step, linter, or review gate
- If examples were weak: replace with domain-realistic, non-trivial scenarios
- If scope was vague: add an explicit in-scope list AND an explicit exclusions list
- Write MUST / MUST NOT throughout the Rule Statement — never "should" or "might"
- Do not add length for its own sake — only add what fixes a scored deficiency

Set `current_rule` = improved rule.
→ Return to **Step 3**

---

## FINALIZE

Derive the output filename from `request`:

- Convert to lowercase kebab-case (e.g. "NestJS error handling" → `nestjs-error-handling`)
- Set `rule_filename` = `.claude/rules/<derived-name>.md`

Write `rule_filename` with this structure — the `paths:` frontmatter block first, then the full rule content:

```
---
paths:
  # TODO: add glob patterns for when this rule should apply
  # Examples from existing rules:
  #   - "apps/*-service/src/**/*.ts"
  #   - "apps/admin/src/**/*.{ts,tsx}"
  #   - "apps/**"
---

<full content of current_rule>
```

Print to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Rule Workflow Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Request : [request]
 Attempts: [attempt] / 3

 Attempt 1: [score]/10
 Attempt 2: [score]/10  (if ran)
 Attempt 3: [score]/10  (if ran)

 Final score : [last score] / 10
 Outcome     : [Passed ✅  |  Max attempts reached ⚠️]

 [rule_filename]  ← your rule (fill in paths: frontmatter)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
