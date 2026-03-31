### superpowers@claude-plugins-official

## Description

Superpowers is a comprehensive skills framework that teaches Claude structured software development methodologies.
It provides composable skills for test-driven development (TDD), systematic debugging, brainstorming, subagent-driven development with built-in code review, and the ability to author new skills.

## How to use

Invoke skills with slash commands from the terminal, or Claude invokes them automatically during a session when a skill applies.

## Key Skills

| Skill                                        | Purpose                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `superpowers:brainstorming`                  | Explore requirements and design **before** touching code               |
| `superpowers:writing-plans`                  | Create implementation plans from specs                                 |
| `superpowers:executing-plans`                | Run batched plans with review checkpoints                              |
| `superpowers:systematic-debugging`           | Root cause investigation with escalation after 3 failed fixes          |
| `superpowers:test-driven-development`        | TDD workflow before writing implementation code                        |
| `superpowers:requesting-code-review`         | Trigger code review against plans and coding standards                 |
| `superpowers:receiving-code-review`          | Handle review feedback with technical rigor, not blind agreement       |
| `superpowers:verification-before-completion` | Run verification commands before claiming work is done                 |
| `superpowers:writing-skills`                 | Author and test new skills using TDD principles                        |
| `superpowers:finishing-a-development-branch` | Structured options for merge, PR, or cleanup after implementation      |
| `superpowers:dispatching-parallel-agents`    | Run 2+ independent tasks in parallel with subagents                    |
| `superpowers:subagent-driven-development`    | Execute implementation plans with independent tasks in current session |
| `superpowers:using-git-worktrees`            | Isolate feature work in git worktrees before executing plans           |

## How it works

Skills override Claude's default behavior by enforcing structured workflows. When a skill applies (even 1% chance), Claude must invoke it before responding — this prevents ad-hoc approaches to complex tasks.

**Skill priority:**

1. Process skills first (brainstorming, debugging) — determine HOW to approach the task
2. Implementation skills second (domain-specific) — guide execution

---

### claude-md-management@claude-plugins-official

## Description

claude-md-management is a plugin for maintaining high-quality `CLAUDE.md` files across the repository.
It audits existing files against a quality rubric, produces a scored report, and applies targeted improvements to ensure Claude Code always has accurate, actionable project context.

## How to use

Invoke skills with slash commands from the terminal, or Claude invokes them automatically when working with CLAUDE.md files.

## Key Skills

| Skill                                     | Purpose                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `claude-md-management:claude-md-improver` | Audit all CLAUDE.md files, score them, and apply improvements after user approval |
| `claude-md-management:revise-claude-md`   | Update CLAUDE.md with learnings captured during the current session               |

## How it works

The improver skill discovers every `CLAUDE.md` in the repo (root, packages, subdirectories), evaluates each file across six weighted criteria (commands, architecture clarity, non-obvious patterns, conciseness, currency, actionability), and outputs a lettered grade. After the user approves the report, it applies only targeted additions — never verbose rewrites. The revise skill is lighter-weight and is designed to be called at the end of a session to incorporate new learnings.

---

### typescript-lsp@claude-plugins-official

## Description

typescript-lsp gives Claude direct access to a Language Server Protocol (LSP) server for TypeScript/JavaScript code intelligence.
Instead of relying solely on text search, Claude can navigate the codebase the same way an IDE does — following types, finding usages, and inspecting call hierarchies.

## How to use

The `LSP` tool is available automatically once the plugin is enabled. Claude invokes it when navigating or analyzing TypeScript code.

## Key Operations

| Operation              | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `goToDefinition`       | Jump to where a symbol is declared                               |
| `findReferences`       | List every usage of a symbol across the workspace                |
| `hover`                | Retrieve type info and documentation for a symbol                |
| `documentSymbol`       | List all functions, classes, and variables in a file             |
| `workspaceSymbol`      | Search for a symbol by name across the entire project            |
| `goToImplementation`   | Find concrete implementations of an interface or abstract method |
| `prepareCallHierarchy` | Get the call hierarchy entry for a function or method            |
| `incomingCalls`        | Find all callers of a given function                             |
| `outgoingCalls`        | Find all functions called by a given function                    |

## How it works

All operations require a file path, a 1-based line number, and a 1-based character offset. The LSP server must be configured for the file type — if no server is available, the tool returns an error. This enables precise, IDE-grade navigation without grep-and-guess workflows.

---

### skill-creator@claude-plugins-official

## Description

skill-creator is a plugin for authoring, evaluating, and iteratively improving Superpowers skills.
It guides Claude through the full skill-development lifecycle: capturing intent, writing a draft, running test cases against baseline runs, reviewing qualitative and quantitative results in a browser-based viewer, and refining the skill until quality is satisfactory.

## How to use

Invoke the skill when you want to create a new skill or improve an existing one.

## Key Skill

| Skill                         | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `skill-creator:skill-creator` | End-to-end skill authoring: draft → test → evaluate → iterate → package |

## How it works

The skill follows a structured loop:

1. **Intent capture** — clarify what the skill should do, when it should trigger, and what the expected output looks like.
2. **Drafting** — write `SKILL.md` with frontmatter (`name`, `description`) and bundled resources (`scripts/`, `references/`, `assets/`) using progressive disclosure (metadata → skill body → bundled files).
3. **Test runs** — spawn parallel subagents, one with the skill and one as a baseline (no skill or previous version), for each test prompt.
4. **Evaluation** — grade assertions programmatically, aggregate into `benchmark.json`, and launch an interactive HTML viewer (`eval-viewer/generate_review.py`) for human review.
5. **Iteration** — revise the skill based on user feedback, rerun, and repeat until outputs are satisfactory.
6. **Description optimization** — run `scripts/run_loop.py` to optimize the `description` frontmatter field for accurate triggering.
7. **Packaging** — produce a `.skill` file via `scripts/package_skill.py` for distribution.
