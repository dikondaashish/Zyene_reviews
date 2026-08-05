# Naming Conventions Reference

Use the convention native to the language/ecosystem in play. If the repo already
follows a consistent convention that differs from the "default" below (and there's
no evidence it's accidental), keep the repo's convention — consistency beats generic
best practice.

## Python
- Modules/files: `snake_case.py`
- Packages/folders: `snake_case`
- Classes: `PascalCase`
- Functions/methods/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Private/internal: leading underscore `_helper`
- Test files: `test_<module>.py` or `<module>_test.py` (match whichever the repo
  already uses)

## JavaScript / TypeScript
- Regular modules/utilities: `camelCase.ts` or `kebab-case.ts` (match repo convention)
- React/Vue components: `PascalCase.tsx` / `PascalCase.vue`
- Hooks (React): `useThing.ts`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for true constants; `camelCase` for config objects
- Types/interfaces: `PascalCase` (avoid a redundant `I` prefix unless repo convention
  already uses it consistently)
- Test files: `<name>.test.ts` or `<name>.spec.ts` (match existing repo pattern)

## Java / C#
- Files: match the public class name exactly, `PascalCase.java` / `PascalCase.cs`
- Packages/namespaces: lowercase, dot-separated (Java) or `PascalCase` (C#)
- Classes/interfaces: `PascalCase`
- Methods/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Go
- Files: `snake_case.go`, or short lowercase names for small packages
- Packages: short, lowercase, no underscores (`httputil`, not `http_util`)
- Exported identifiers: `PascalCase`
- Unexported identifiers: `camelCase`

## Rust
- Files/modules: `snake_case.rs`
- Types/traits/enums: `PascalCase`
- Functions/variables: `snake_case`
- Constants/statics: `UPPER_SNAKE_CASE`

## Folder / project layout signals (language-agnostic)
- Source under `src/` (or the language's idiomatic equivalent, e.g. Go's flat root
  or Java's `src/main/java`).
- Tests mirrored in `tests/` or co-located `__tests__`/`*_test.*`, matching whatever
  the repo already does — don't introduce a second, competing pattern.
- Scripts/tooling under `scripts/` or `tools/`.
- Docs under `docs/`.
- No orphaned top-level files that duplicate what a subfolder already owns (e.g. a
  stray `helpers.py` at repo root next to a `utils/` package).

## Common red flags to fix
- Mixed case styles for the same kind of thing in the same language (`getUser.js`
  next to `get_user.js`).
- Version/status suffixes left in filenames: `_old`, `_new`, `_v2`, `_backup`,
  `_copy`, `_final`, `_final2`, `_test` (when it isn't actually a test file).
- Generic non-descriptive names: `utils2.py`, `misc.js`, `temp.ts`, `stuff.go`.
- Names that don't match what the file actually contains anymore (drifted over time
  as responsibilities changed).
