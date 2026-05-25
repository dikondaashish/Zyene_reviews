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
- `docs/GEO_BASELINE_AUDIT.md` - GEO/SEO baseline placeholders (GSC, AI citations, IndexNow).
- `docs/GEO_ON_PAGE_AUDIT.md` - Priority URL on-page SEO audit table.
- `docs/GEO_WEEKLY_REPORT_TEMPLATE.md` - Weekly GEO tracking template.
- `docs/GEO_CLOSEOUT_STATUS.md` - GEO implementation closeout: done vs manual vs external ops.
- `docs/GEO_OWNER_FINAL_CHECKLIST.md` - Single owner checklist for GEO closeout (Phases 0, 5–8).
- `docs/GEO_OWNER_FINAL_ACTIONS.md` - GSC OAuth, AI citation workflow, weekly commands.
- `docs/LEAD_NURTURE_QA_RUNBOOK.md` - Safe QA for template pack + local SEO funnels.
- `docs/GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md` - Week 1 posting sequence (manual only).
- `docs/GEO_DISTRIBUTION_EXECUTION_TRACKER.md` - Manual social/email distribution checklist (owner-filled).
- `docs/GEO_PROOF_COLLECTION_RUNBOOK.md` - Real proof collection rules (no fake metrics).
- `docs/GEO_EXTERNAL_PROFILE_CHECKLIST.md` - G2, Capterra, LinkedIn, consistency (owner).
- `docs/GEO_PRODUCT_PROOF_ROADMAP.md` - Proof assets, data requirements, compliance rules.
- `docs/GEO_ENTITY_BRAND_CHECKLIST.md` - Entity/NAP/social/schema consistency (owner tasks).
- `docs/GEO_CONTENT_REFRESH_QUEUE.md` - Priority URL refresh schedule.
- `docs/LOCAL_SEO_CHECKLIST_LEAD_MAGNET.md` - Local SEO checklist funnel events and reporting.
- `docs/PHASE3_DISTRIBUTION_PACKAGE.md` - Phase 3 launch copy, UTMs, posting guide, template pack tracking.
- `docs/TEMPLATE_PACK_LEAD_MAGNET.md` - Template pack funnel events, report API, QA filters.
- `docs/WELCOME_SEQUENCE.md` - Marketing nurture email sequence (Inngest).

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
