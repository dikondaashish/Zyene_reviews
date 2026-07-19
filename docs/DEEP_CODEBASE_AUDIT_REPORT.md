# Deep Codebase Audit Report

> **Archive / historical snapshot.** File counts and removed paths reflect the audit date, not necessarily the current tree. For live structure, use `docs/CODEBASE_STRUCTURE.md` and the repo. For product architecture, use `docs/PROJECT_DEEP_DIVE.md`.

This report records a full-repo automated + manual audit pass across all tracked files.

## Phase 1 - File Usage Audit

- Total tracked files reviewed: `532`
- Full machine-readable inventory: `docs/FULL_FILE_USAGE_AUDIT.json`

### High-confidence dead/unused files removed

1. `src/lib/stores/onboarding-store.ts`
2. `src/app/(dashboard)/integrations/actions.ts`
3. `src/components/settings/index.ts`
4. `src/components/ui/pricing-demo.tsx`
5. `src/lib/twilio/send-sms.ts`
6. `src/lib/resend/send-email.ts`
7. `email-list-2026-04-06T20-24-54.html`

### Remaining cautionary candidates (manual review recommended)

Note: `public/` files are intentionally left untouched per product direction.

- `public/file.svg`
- `public/window.svg`
- `public/widget-test.html`
- `public/zyene-overview.pdf`

These have no internal app references but may be externally linked or manually used.

## Phase 2 - Dead Code Inside Used Files

### Confirmed cleanup done

- Removed duplicate dead integration action file (`integrations/actions.ts`), keeping canonical logic in `integrations/_actions.ts`.
- Removed duplicate onboarding store path in `src/lib/stores`, keeping canonical `src/lib/state/onboarding-store.ts`.
- Removed duplicate provider modules under `src/lib` and standardized on `src/services` for Twilio/Resend senders.
- Removed legacy full-page refresh in `src/app/(dashboard)/requests/send-request-dialog.tsx` and replaced it with `router.refresh()`.
- Removed low-value debug logging in onboarding and dashboard UI flows.

### High-priority remaining items (flagged)

- No blocking TODO/FIXME debt remains from the original flagged set.

## Phase 3 - Dependency Audit

- Full machine-readable matrix: `docs/DEPENDENCY_AUDIT.json`
- Total packages checked: `64`
- Candidate review list: `6` (TypeScript `@types/*` packages; expected for type tooling)

### Candidate review packages

- Type packages flagged by static grep but expected for TS toolchain:
  - `@types/node`
  - `@types/react`
  - `@types/react-dom`
  - `@types/canvas-confetti`
  - `@types/papaparse`
  - `@types/qrcode`

### Packages removed in cleanup

- `@radix-ui/react-label`
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`
- `@react-email/components`
- `@stripe/stripe-js`
- `react-wrap-balancer`
- `babel-plugin-react-compiler`
- `prettier-plugin-tailwindcss`

## Phase 4 - Folder & Architecture Audit

### Current structure quality

- `src/app` routing is organized and consistent with Next.js App Router conventions.
- Shared UI primitives are centralized under `src/components/ui`.
- Business logic is split across `src/lib` and `src/services`, but duplication exists.

### Architecture issues found

- Raw API calls (`fetch`) still exist in multiple components (tight UI/network coupling).
- Domain logic duplicated across `lib` and `services`.
- Several large "god files" remain over 300 lines and should be split by feature slices.

### Target structure recommendation

- Keep current root split but incrementally converge toward:
  - `src/components/ui`
  - `src/components/shared`
  - `src/components/features/<feature>`
  - `src/services/<feature>`
  - `src/types`
  - `src/constants`
  - `src/config`
  - `src/utils`

## Phase 5 - Naming & Consistency Audit

### Issues found

- Mixed naming conventions in onboarding component files (`Step*` + `step*-form`).
- Historic duplicate folder naming (`lib/state` vs removed `lib/stores`).

### Actions taken

- Removed one duplicate naming path (`src/lib/stores/onboarding-store.ts`).
- Reduced logger inconsistency in key UI flows by removing non-actionable console statements.
- Normalized utility imports to `@/lib/utils` (removed `@/lib/utils/index` usage).

## Phase 6 - Documentation Baseline

- Updated baseline audit docs added:
  - `docs/FULL_FILE_USAGE_AUDIT.json`
  - `docs/DEPENDENCY_AUDIT.json`
  - `docs/DEEP_CODEBASE_AUDIT_REPORT.md`

## Verification

- `pnpm typecheck` — Pass
- `pnpm test` — Pass
- `pnpm build` — Pass

