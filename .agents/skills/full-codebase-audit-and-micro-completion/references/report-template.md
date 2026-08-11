# Final report template

Produce this even when no changes were made. Order findings most-severe first.

---

# Codebase Audit Report

## Scope

- Repository / branch reviewed:
- Requested scope (full repo, or the slice the user named):
- Files discovered (in-scope count):
- Files inspected (count):
- Files excluded, with reason (generated, vendored, out of requested scope):
- Tools and commands run:

## Architecture overview

- Stack:
- Entry points:
- Major modules:
- Key data flows:
- External dependencies and trust boundaries:

## Changes applied

For each change:

- **File and location:** `path/to/file.ts:42`
- **Classification:** Auto-fix
- **Problem:**
- **Why intent was unambiguous:** (signature / callers / existing test / neighboring
  pattern / spec — cite the specific evidence)
- **Change made:**
- **Verification performed:** (exact command)
- **Result:**

If no changes were applied, say so explicitly.

## Findings

Repeat this block per severity: **Critical**, **High**, **Medium**, **Low**.

### Critical

- **File / location:**
- **Impact:** (what breaks, for whom, under what input)
- **Evidence:** (the code path, the caller, the failing scenario)
- **Recommended fix:**
- **Classification:** Recommend | Escalate

### High
### Medium
### Low

Severity guidance for this repo:

| Severity | Examples |
|----------|----------|
| Critical | Cross-tenant data leak, missing RLS, unverified webhook signature, secret in source, auth bypass, billing miscalculation |
| High | `getSession()` for authorization, unvalidated API input, SSRF, non-idempotent job that double-sends or double-charges, unhandled rejection in a critical flow |
| Medium | N+1 on a hot path, missing timeout on a third-party call, silent catch on a user-visible action, duplicated business logic, file-size violation |
| Low | Dead code, weak naming, missing comment on a non-obvious decision, minor render inefficiency |

## Test and verification results

- Passed:
- Failed:
- **Pre-existing failures** (present before this audit):
- Not run, and why:

## Prioritized next steps

1. Fix critical/high-risk items first.
2. Address correctness and security gaps before performance refactors.
3. Add regression tests for every fixed defect.
4. Schedule recommended architectural work separately from low-risk fixes.
