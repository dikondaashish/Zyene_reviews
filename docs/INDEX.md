# Documentation Index

Central index for project documentation and where each file belongs.

## Core Product Docs (KEEP)

- `README.md` - project overview, setup, scripts, and environment baseline (kept at root).
- `docs/DESIGN.md` - design system source of truth.
- `docs/PLATFORM_FEATURES.md` - customer-facing platform capability summary.
- `docs/PROJECT_DEEP_DIVE.md` - deep technical architecture and domain model reference.
- `docs/CODEBASE_STRUCTURE.md` - repo structure and placement rules.
- `docs/PRODUCTION_CHECKLIST.md` - pre-release and deployment verification checklist.

## Operations & Verification Docs (KEEP in `docs/`)

- `docs/CRITICAL_FLOW_VERIFICATION.md` - critical flow verification and release gate.
- `docs/DEEP_CODEBASE_AUDIT_REPORT.md` - latest cleanup/audit outcomes.
- `docs/DESIGN_UX_PHASES.md` - UX/design evolution roadmap and phase tracking.
- `docs/DEPENDENCY_AUDIT.json` - generated dependency usage matrix.
- `docs/FULL_FILE_USAGE_AUDIT.json` - generated full file usage classification.

## AI / Agent Runtime Docs (KEEP in `.agent/`)

These are internal working docs for agent-assisted development and should stay under `.agent`.

- `.agent/docs/AGENTS.md`
- `.agent/docs/TECHNICAL_OVERVIEW.md`
- `.agent/docs/ONBOARDING_FLOW.md`
- `.agent/docs/ONBOARDING_2STEP_IMPLEMENTATION.md`
- `.agent/docs/FLOWY_STEP_ONBOARDING_IMPLEMENTATION.md`
- `.agent/docs/INTEGRATION_VERIFICATION.md`
- `.agent/docs/GOOGLE_SYNC_TROUBLESHOOTING.md`
- `.agent/docs/TEST_FLOWS.md`
- `.agent/docs/DATABASE_VALIDATION_REPORT.md`
- `.agent/skills/ui-ux-pro-max/SKILL.md`

## Tooling Instruction Docs (KEEP in place)

- `.github/copilot-instructions.md` - Copilot-specific coding instructions and conventions.

## Current Organization Decision

- Keep `README.md` at repo root for discovery and onboarding.
- Keep all remaining project documentation under `docs/`.
- Keep verification and generated audit artifacts inside `docs/`.
- Keep all agent-specific operational docs in `.agent/` to avoid mixing runtime project docs with automation docs.
