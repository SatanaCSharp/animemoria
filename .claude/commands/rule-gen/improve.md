---
description: Improve a rule using evaluator feedback. Accepts a rule file and an optional eval report file. Produces a versioned improved rule file.
allowed-tools: Read, Write
argument-hint: '<rule_file> [eval_file]'
---

# /project:rule:improve

Improve a rule based on evaluation feedback.

## Parse $ARGUMENTS

- Token 1 = path to the rule file to improve (required)
- Token 2 = path to an evaluation report file (optional)

Read the rule file with the Read tool.

If an eval file path was provided, read it too.
If no eval file was provided, ask the user:

> "Please paste the evaluation report, or run `/project:rule:eval [file]` first to generate one."
> Then stop and wait.

---

## Build Improvement Plan

Before writing a single word of the improved rule, analyse the evaluation and print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPROVEMENT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Must fix  (scored < 8):
  • [criterion] ([score]) → [specific change that will be made]
  • ...

Must preserve  (scored >= 8):
  • [criterion] ([score]) — no changes

Addressing HIGH recommendations:
  • [recommendation text] → [how you will address it]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Improvement Rules

- **Fix every criterion scored < 8** — the change must be visible and specific, not cosmetic
- **Do not regress any criterion scored >= 8** — reread those sections carefully and keep them
- **Address every HIGH recommendation** — no exceptions
- Write every section in full — never use "same as before", "[unchanged]", or omit sections
- Rule Statement: use **MUST / MUST NOT** throughout — never "should", "might", "ideally"
- Scope: list explicit in-scope items AND explicit exclusions — no implicit assumptions
- Examples: both compliant and non-compliant must be domain-realistic, not toy examples
- Enforceability: name the specific tool, CI gate, linter rule, or review process
- Do not inflate length — only add what a scored deficiency requires

---

## Write the Complete Improved Rule

All 8 sections, fully written:

```
# [Title]

## Purpose
...

## Scope
...

## Rule Statement
...

## Conditions
Preconditions: ...
Exceptions:    ...
Edge cases:    ...

## Examples

### Compliant
...

### Non-Compliant
...

## Rationale
...

## Related Rules / References
...
```

---

## Save and Report

Determine the output filename:

- If the original file is `rule_v0.md` → save as `rule_v1.md` in the same directory
- If the original file is `rule_v1.md` → save as `rule_v2.md`
- If the original file is `rule_FINAL.md` or has no version suffix → save as `rule_v1.md` alongside it
- Otherwise increment the version number found in the filename

Write the improved rule to the determined output path.

Print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Improved rule saved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Original : [input file]
 Improved : [output file]

 Changes made:
   • [criterion] — [what changed]
   • [criterion] — [what changed]

 Next step: /project:rule:eval [output file]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
