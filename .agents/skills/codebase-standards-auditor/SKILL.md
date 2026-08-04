---
name: codebase-standards-auditor
description: Use this skill any time the user wants Claude to deeply understand a full codebase and bring it up to professional, senior-engineer / top-tech-company standards. Trigger on requests to audit, clean up, refactor, reorganize, or "go through" an entire codebase or repo; requests to fix inconsistent file/folder naming, enforce naming conventions, remove dead code, unused files, or leftover snippets; requests to reduce oversized files/functions to reasonable line counts; requests to make a codebase look like it was written by a senior developer or follows "top company" / FAANG-style standards; and any request to read or analyze "every line" or "the entire codebase." Also trigger for vaguer phrasing like "clean this up," "make this professional," "organize my project," or "this codebase is messy." Do NOT trigger for single small file edits, one-off bug fixes, or requests scoped to a single function unless the user explicitly asks for a full-project pass.
---

# Codebase Standards Auditor

A rigorous, safety-first workflow for understanding an entire codebase end-to-end and
raising it to the standard of a well-run engineering organization: consistent naming,
sane file/folder structure, no dead weight, readable file and function sizes, and a
clear paper trail of every change made and why.

This is not a "skim it and rename some things" skill. The whole point is **complete,
verifiable coverage** of the codebase and **no destructive action without a plan the
user has seen.**

## Guiding principles (do not skip these)

1. **Understand before you touch.** Never rename, move, or delete something because it
   *looks* wrong. Confirm what it does and what depends on it first (search the whole
   repo for references — imports, string paths, config files, CI scripts, docs).
2. **Plan, then execute.** Always produce a written plan (the Findings Report in Phase
   3) before making changes. For anything destructive (deletions, renames that break
   public APIs, structural moves), get explicit user confirmation unless the user has
   already said "just do it all."
3. **Preserve behavior.** The goal is structure and hygiene, not a rewrite. Refactors
   should not change what the code does. If you're unsure whether something is dead
   code or a deliberate hook (e.g., a plugin entry point, a reflection target, a
   feature flag path), flag it — don't delete it on a guess.
4. **Use version control as a safety net.** If the project is a git repo, work on a
   branch (or confirm a clean working tree / commit point) before making sweeping
   changes, so everything is reversible. If it's not a git repo, say so and suggest
   initializing one before proceeding.
5. **Verify, don't assume success.** After changes, actually run the build, linter,
   and test suite if they exist. A cleanup that breaks the build is a regression, not
   an improvement.
6. **No silent guessing.** If something is ambiguous (which naming convention the team
   actually wants, whether a module is really unused, whether a large file should be
   split), ask — don't invent an answer and present it as fact.

---

## Workflow

### Phase 0 — Reconnaissance

Before reading line-by-line, build a map:

- Get the full directory tree (respecting `.gitignore` — don't waste time analyzing
  `node_modules`, `venv`, build output, lockfiles, etc.).
- Identify the language(s), framework(s), package manager, and build tooling in play
  (check for `package.json`, `pyproject.toml`/`requirements.txt`, `Cargo.toml`,
  `go.mod`, `pom.xml`, `.csproj`, etc.).
- Identify entry points (main files, app factories, CLI entry points, `index.*`).
- Check for existing standards already in the repo: a `CONTRIBUTING.md`, a linter
  config (`.eslintrc`, `ruff.toml`, `.editorconfig`, `pyproject.toml [tool.black]`,
  `.clang-format`, etc.), or a style guide doc. **An existing, working convention in
  the repo always wins over a generic "best practice."** Your job is consistency with
  intent, not imposing an unrelated style.
- Note test setup (test framework, existing coverage) — you'll need this in Phase 4.

Only after this map exists should you start reading files in depth.

### Phase 1 — Full-coverage read

Read the entire codebase systematically, not just the files that "look interesting."
Track progress explicitly (a simple checklist/manifest of every source file, marked
as reviewed) so nothing gets skipped in a large repo. For very large codebases, go
module-by-module/folder-by-folder rather than trying to hold everything in one pass,
but don't stop until every source file has been opened and understood at least once.

While reading, take structured notes per file (this becomes the input to Phase 2):
- What the file/module is responsible for (one sentence).
- Its current naming, and whether it matches the rest of the codebase.
- Its size (lines, and roughly how many functions/classes it holds).
- Anything that looks unused, duplicated, commented-out, or leftover (debug prints,
  `TODO: remove`, old versions of a file like `utils_old.py`, `Component.bak`).
- Cross-file references you notice, so you can check for breakage later.

See `references/naming-conventions.md` for language-specific naming rules and
`references/structure-and-size.md` for file/folder layout and line-count guidance —
load whichever is relevant to the language(s) in this codebase before Phase 2.

### Phase 2 — Apply the standards baseline

Using the references above (and any repo-native convention found in Phase 0), work
out the concrete rules for *this* codebase — don't apply a generic checklist blindly.
For example: Python module names are `snake_case`, classes are `PascalCase`; JS/TS
files commonly follow the framework's own convention (React components are often
`PascalCase.tsx`, hooks are `useSomething.ts`); a monorepo's folder layout should
mirror what's already standard for its ecosystem (`src/`, `tests/`, `docs/`,
`scripts/`) unless the repo has its own working convention.

Line-count guidance is a signal, not a hard law — see the reference file for the
actual thresholds and, importantly, the reasoning (single-responsibility, not an
arbitrary number). A 600-line file that is one dense, cohesive state machine may be
fine; a 600-line file that's really four unrelated features glued together should
be split.

### Phase 3 — Findings Report (write this before changing anything)

Produce a clear report with these sections:

1. **Codebase summary** — stack, size, structure, entry points.
2. **Naming issues** — inconsistent or unclear file/folder/identifier names, with a
   proposed rename for each and the reason.
3. **Structural issues** — misplaced files, missing separation of concerns, folder
   layout that doesn't match the ecosystem convention or the repo's own pattern.
4. **Size/complexity issues** — files or functions that are oversized for what they
   do, with a proposed split (into which new files, holding which responsibilities).
5. **Dead weight** — unused files, unreferenced functions/exports, commented-out
   blocks, leftover debug code, duplicate/near-duplicate files, unused dependencies.
   For each, state *how you confirmed it's unused* (e.g., "no references found via
   repo-wide search for this symbol/path, and not listed in any entry point or
   config").
6. **Anything ambiguous** — things you're not confident about and want the user's
   call on before touching.
7. **Proposed action plan** — an ordered list of concrete changes, batched so that
   related changes ship together and each batch is independently verifiable.

Share this with the user and get a go-ahead (or scoped go-ahead — "do the renames but
leave the deletions for me to review") before Phase 4, unless they've pre-authorized
a full pass.

### Phase 4 — Execute in verifiable batches

- Make changes in small, logically-grouped batches (e.g., "all naming fixes in module
  X," then "dead code removal," then "the one file split") rather than one giant
  sweeping commit.
- After each batch: re-run the build/compiler, linter, and test suite if they exist.
  If there's no test suite, at minimum re-check that imports/references you touched
  still resolve (grep for the old name/path across the repo).
- If a batch breaks something, stop, fix or revert that batch specifically, and note
  it — don't let a failure silently roll into the next batch.
- Update any docs, READMEs, or config files that reference renamed/moved files.

### Phase 5 — Final report

Summarize what changed: files renamed (old → new), files removed (and why), files
split or merged, structural moves, and anything left deliberately untouched with a
reason. Note the verification steps you ran and their results. This is the artifact
the user should be able to hand to a teammate as a changelog.

---

## Hard rules

- Never delete a file or block of code you haven't confirmed is unreferenced anywhere
  in the repo (including non-code references: configs, CI YAML, Dockerfiles, docs).
- Never rename something that's part of a public/exported API without explicitly
  flagging it as a breaking change and asking first.
- Never fabricate confidence — if you didn't actually check something (run the tests,
  grep for references), don't imply that you did.
- Prefer the codebase's own existing convention over an imported "best practice" when
  the two conflict and the existing one is applied consistently.
- If the codebase is large enough that a single pass isn't realistic in one go, say so
  up front and propose tackling it in explicit, ordered chunks rather than silently
  giving a shallower pass over everything.
