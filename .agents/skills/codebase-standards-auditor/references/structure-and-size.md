# Structure & Size Reference

These are signals for judgment, not hard limits to enforce mechanically. The real
test is always **single responsibility**: does this file/function do one coherent
thing, or several unrelated things stapled together? A large file that's genuinely
one cohesive unit (a big enum/state machine, a generated file, a data table) is not
automatically a problem. A small file that's badly named or in the wrong place still
is.

## Rough size signals (used by many well-run engineering orgs as review triggers,
not compiler-enforced rules)

- **Functions/methods:** aim for roughly 20–50 lines. Past ~50, ask whether the
  function is doing more than one job and could be split into named sub-steps.
- **Files:** aim for roughly 200–400 lines for typical application code. Past ~500,
  it's usually a sign the file holds more than one responsibility (e.g., a
  "utils.py" that grew into five unrelated toolkits) and should be split by concern.
- **Classes:** if a class has more than ~7–10 public methods or multiple unrelated
  reasons to change, consider splitting by responsibility.
- **Function parameters:** more than ~4–5 positional parameters is a sign an options
  object/struct or a smaller-scoped function is warranted.
- **Nesting depth:** more than 3–4 levels of nested conditionals/loops is a sign to
  extract a helper function or invert conditions (early returns).

## Structural checklist

- One clear responsibility per folder; folders shouldn't mix, e.g., UI components
  with data-access code, unless that's the established framework convention.
- Shared/reusable code lives in a clearly-named shared location, not duplicated
  across features.
- Configuration is centralized (env files, config modules) rather than scattered
  magic values/strings across the codebase.
- No circular dependencies between modules/packages.
- Tests live alongside or in a clear mirrored structure to the code they test, and
  test file naming matches the existing repo convention.
- Generated code, build artifacts, and dependencies are excluded from analysis and
  from version control via `.gitignore` (flag if they aren't).

## Identifying genuine dead weight

Before flagging something as removable, confirm via at least one of:
- A repo-wide text search for the exact symbol/path/import found zero references
  outside its own definition.
- It isn't wired into any entry point, router, config file, dependency-injection
  registration, or CI/build script.
- It isn't referenced by name as a string anywhere (dynamic imports, plugin
  registries, and reflection-based frameworks often reference things by string, not
  a normal import — check for this explicitly in frameworks known to do so).

If any of the above can't be confirmed, list the item under "ambiguous" in the
Findings Report instead of proposing deletion.

## Splitting an oversized file — a reasonable approach

1. Identify the distinct responsibilities currently mixed together in the file.
2. Propose one new file per responsibility, with a name reflecting that
   responsibility (not `part1.py`, `part2.py`).
3. Keep the original file as a thin re-export/entry point only if other code depends
   on the old import path and a clean rename-everywhere isn't in scope for this pass.
4. Otherwise, update all importers to the new locations directly — don't leave a
   permanent indirection layer as the default choice.
