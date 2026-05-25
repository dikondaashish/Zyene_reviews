# Documentation Index

Central index for project documentation and where each file belongs.

## Core Product Docs (KEEP)

- `README.md` - project overview, setup, scripts, and environment baseline (kept at root).
- `docs/DESIGN.md` - design system source of truth.
- `docs/PLATFORM_FEATURES.md` - customer-facing platform capability summary.
- `docs/PROJECT_DEEP_DIVE.md` - deep technical architecture and domain model reference.
- `docs/CODEBASE_STRUCTURE.md` - repo structure and placement rules.
- `docs/PRODUCTION_CHECKLIST.md` - pre-release and deployment verification checklist.

## Growth & GEO Docs (KEEP in `docs/`)

- `docs/GROWTH_BLUEPRINT.md` - phased product growth plan (Phases 0–8).
- `docs/GROWTH_OPERATIONS.md` - weekly KPI rhythm and `/growth` dashboard ops.
- `docs/GEO_WIN_PLAYBOOK.md` - GEO + omni-channel win plan (Phases 0–8, stacks on growth blueprint).
- `docs/PHASE3_DISTRIBUTION_PACKAGE.md` - Phase 3 launch copy, UTMs, posting guide, template pack tracking.
- `docs/TEMPLATE_PACK_LEAD_MAGNET.md` - Template pack funnel events, report API, QA filters.

## Operations & Verification Docs (KEEP in `docs/`)

- `docs/CRITICAL_FLOW_VERIFICATION.md` - critical flow verification and release gate.
- `docs/DEEP_CODEBASE_AUDIT_REPORT.md` - latest cleanup/audit outcomes.
- `docs/DESIGN_UX_PHASES.md` - UX/design evolution roadmap and phase tracking.
- `docs/competitor-watch-cursor-prompt.md` - Cursor prompt for competitor watch feature work.

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
- Keep operational and feature-specific docs inside `docs/`.
- Keep all agent-specific operational docs in `.agent/` to avoid mixing runtime project docs with automation docs.
