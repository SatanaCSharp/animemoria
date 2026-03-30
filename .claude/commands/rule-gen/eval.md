---
description: Evaluate a rule, prompt, or skill against 10 type-specific criteria. Returns a score per criterion, points to improve, and prioritized recommendations.
allowed-tools: Read
argument-hint: '<file_path> [rule|prompt|skill]'
---

# /project:rule:eval

Evaluate an artifact file and produce a structured quality report.

## Parse $ARGUMENTS

- Token 1 = file path (required)
- Token 2 = artifact type: `rule` | `prompt` | `skill` (default: `rule`)

Read the file at the given path with the Read tool.
If the file does not exist, report the error and stop.

---

## Select Criteria for Artifact Type

### Type: `rule`

| Criterion              | Evaluate strictly                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **clarity**            | Every sentence has one interpretation. New team member can act on it.                  |
| **completeness**       | All required sections present. None are placeholder text. Each is substantive.         |
| **testability**        | Pass/fail is objective. No subjective judgment required.                               |
| **actionability**      | Reader knows exactly what to do. No unresolved "it depends".                           |
| **scope_precision**    | In-scope and out-of-scope both explicitly stated. No implicit assumptions.             |
| **example_quality**    | ≥1 compliant + ≥1 non-compliant. Both realistic. Non-compliant explains why it fails.  |
| **rationale_strength** | "Why" is compelling. Alternatives acknowledged. Non-compliance consequences stated.    |
| **consistency**        | Same term for same concept throughout. No contradictions between sections.             |
| **brevity**            | Every sentence earns its place. No padding, restatements, or filler.                   |
| **enforceability**     | A specific tool, process, or role that enforces this rule is named or clearly implied. |

### Type: `prompt`

| Criterion               | Evaluate strictly                                                        |
| ----------------------- | ------------------------------------------------------------------------ |
| **clarity**             | Task is unmistakable. No ambiguous phrasing.                             |
| **specificity**         | Output format, length, and style are explicitly stated.                  |
| **context_richness**    | Persona, background, and constraints are sufficient for accurate output. |
| **output_definition**   | Expected response structure is clearly described.                        |
| **example_guidance**    | Few-shot examples or anti-examples are included where they would help.   |
| **constraint_coverage** | Edge cases, forbidden outputs, and hard constraints are listed.          |
| **tone_consistency**    | Tone and register match the intended use case throughout.                |
| **token_efficiency**    | No unnecessary verbosity or repeated instructions.                       |
| **robustness**          | Unlikely to be misinterpreted. Ambiguities resolved explicitly.          |
| **testability**         | There is a clear way to judge whether a model response is correct.       |

### Type: `skill`

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

---

## Scoring Guide

| Score | Meaning                                           |
| ----- | ------------------------------------------------- |
| 10    | Flawless — nothing to improve                     |
| 8–9   | Good — only minor polish needed                   |
| 6–7   | Acceptable — clear gaps that should be addressed  |
| 4–5   | Significant problems that undermine effectiveness |
| 1–3   | Fundamental issues — requires rewrite             |

**Score what is actually written, not what was intended.**

---

## Output

Write this exact report format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVALUATION REPORT
Type : [rule|prompt|skill]
File : [file path]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[criterion_1]      [X]/10   [specific observation about this file]
[criterion_2]      [X]/10   [specific observation about this file]
[criterion_3]      [X]/10   [specific observation about this file]
[criterion_4]      [X]/10   [specific observation about this file]
[criterion_5]      [X]/10   [specific observation about this file]
[criterion_6]      [X]/10   [specific observation about this file]
[criterion_7]      [X]/10   [specific observation about this file]
[criterion_8]      [X]/10   [specific observation about this file]
[criterion_9]      [X]/10   [specific observation about this file]
[criterion_10]     [X]/10   [specific observation about this file]
──────────────────────────────────────────────────────
AVERAGE:           [X.X] / 10
PASS (≥ 9.0):      [Yes ✅ | No ❌]

STRENGTHS:
  • [what is genuinely strong — quote specific evidence from the file]

POINTS TO IMPROVE  (score < 8):
  • [criterion] ([X]/10) — [specific issue quoting or referencing actual content]

IMPROVEMENT RECOMMENDATIONS:
  [HIGH]   [criterion] — [exact fix needed]
             e.g. "[concrete before/after or rewrite sample]"
  [MEDIUM] [criterion] — [exact fix needed]
             e.g. "[concrete before/after or rewrite sample]"
  [LOW]    [criterion] — [exact fix needed]

CRITICAL ISSUES  (must fix before use):
  • [blocking problem, or "None"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Notes:**

- Every observation must reference the actual content of the file — no generic feedback
- Every HIGH recommendation must include a concrete rewrite sample
- If average ≥ 9.0: add a closing line "This artifact is ready to use."
- If average < 9.0: add "Run /project:rule:improve [file] to address the issues above."
