# Documentation Index

Central index for project documentation and where each file belongs.

This is a discovery index, not a deletion allowlist. Unlisted documents may be
referenced by skills, runbooks, design context or human workflows. Verify those
consumers before retirement. Dated evidence is not proof of current deployment.

## Engineering knowledge base (START HERE)

- `docs/README.md` — documentation hub (setup overview + links).
- `codebase-analysis-docs/CODEBASE_KNOWLEDGE.md` — multi-level system map, gotchas, documentation TODOs.
- `docs/ARCHITECTURE.md` — subsystems, communication, Mermaid diagrams.
- `docs/API.md` — HTTP API catalog.
- `docs/DATA_MODELS.md` — core entities and relationships.
- `docs/PUBLIC_API.md` — internal modules to reuse (not an npm package).
- `docs/AUTHENTICATION.md` — sessions, tenancy, API keys.
- `docs/CONFIGURATION.md` — env vars and config loading.
- `docs/CODING_CONVENTIONS.md` — naming, layering, testing.
- `.cursor/rules/documentation.mdc` — keep docs in sync with code.
- `CLAUDE.md` — Claude/agent entry with pointers to the knowledge base.

## Core Product Docs (KEEP)

- `README.md` - project overview, setup, scripts, and environment baseline (kept at root).
- `docs/DESIGN.md` - design system source of truth.
- `docs/PLATFORM_FEATURES.md` - customer-facing platform capability summary.
- `docs/PROJECT_DEEP_DIVE.md` - deep technical architecture and domain model reference.
- `docs/ROADMAP.md` - unbuilt / planned work (drip campaigns, SSO, POS, etc.).
- `docs/CODEBASE_STRUCTURE.md` - repo structure and placement rules.
- `docs/PRODUCTION_CHECKLIST.md` - pre-release and deployment verification checklist.
- `PRODUCT.md` - product, voice and audience context consumed by the impeccable skill.
- `docs/dashboard-color-audit.md` - design decisions referenced by PRODUCT.md and DESIGN.md.
- `docs/marketing-component-licenses.md` - required attribution for live marketing adaptations.
- [analytics-presentation.md](analytics-presentation.md) - current chart meaning, missing-data rules and presentation rationale.
- [dashboard-loading.md](dashboard-loading.md) - current dashboard placeholder integration and reduced-motion behavior.
- [review-widget-builder.md](review-widget-builder.md) - current widget setup, aggregate summaries and installation.
- [widget-reference-analysis-2026-09-30.md](widget-reference-analysis-2026-09-30.md) - active widget implementation boundaries with dated reference research.

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
- [CONTENT_AUDIT_REPORT.md](../CONTENT_AUDIT_REPORT.md) - active content audit with a current reconciliation and unresolved factual/prompt findings.

## Operations & Verification Docs (KEEP in `docs/`)

- `docs/CRITICAL_FLOW_VERIFICATION.md` - critical flow verification and release gate.
- `docs/DEEP_CODEBASE_AUDIT_REPORT.md` - latest cleanup/audit outcomes.
- `docs/REPO_CLEANUP_VERIFICATION_2026-10-10.md` and `docs/REPO_CLEANUP_MANIFEST_2026-10-10.json` - claim checks and exact executed removals.
- `docs/DESIGN_UX_PHASES.md` - UX/design evolution roadmap and phase tracking.
- `docs/competitor-watch-cursor-prompt.md` - Cursor prompt for competitor watch feature work.
- `docs/OPERATOR_SCRIPTS.md` - manual diagnostic tools, environments and side effects.
- `docs/developer-role-2026-09-30.md` - support access, owner removal and recovery history.
- `docs/SECURITY-FOLLOW-UP-2026-09-30.md` - latest recorded security operational checkpoint.
- `docs/SECURITY-REMEDIATION-2026-09-29.md` - original findings and source/regression evidence.
- `docs/SECURITY-DEPLOYMENT-2026-09-30.md` - historical rollout record.
- `docs/security-readonly-verification-2026-09-29.sql` - saved read-only verification queries.
- `docs/SEO_GROWTH_PLAN_2026-09-29.md` and `docs/SEO_BACKLINK_STRATEGY.md` - owner execution plans.
- `docs/SEO_REMEDIATION_2026-09-13.md` - dated release and post-deployment checks.
- `docs/GOOGLE_SEO_AEO_RELEASE_PLAN.md` and `docs/AEO_*COMPLETION*.md` - phase plans and completion evidence.
- `docs/REVIEWS_WORKSPACE_IMPLEMENTATION_PLAN.md` - draft plan; reconcile against current implementation.
- `docs/design-handoff-2026-09/` - proposal/acceptance material and route inventory, not approved completion.
- `docs/seo-audit-2026-09-13/`, `docs/seo-audit-2026-09-29/` and `docs/audits/` - dated evidence backing retained plans.
- `docs/brand/zyene-mascot.md` - approved mascot source and reference assets.
- [app-ux-audit.md](app-ux-audit.md) - owner-approved dashboard arrangement and unfinished competitor-search keyboard review.
- [DOCUMENTATION_FOLLOW_UP_2026-10-10.md](DOCUMENTATION_FOLLOW_UP_2026-10-10.md) - all 15 archive decisions, five restorations, owners and completion evidence for remaining work.

## AI / Agent Runtime Docs (KEEP in `.agent/`)

Live agent playbooks under `.agent/docs/`. Canonical skills: `.agents/skills/` (synced to `.claude` / `.windsurf`). Cursor UI skill: `.cursor/skills/ui-ux-pro-max/`.

- `.agent/docs/AGENTS.md` — optional Next.js docs-mirror notes
- `.agent/docs/ONBOARDING_FLOW.md` — current 5-step onboarding
- `.agent/docs/GOOGLE_SYNC_TROUBLESHOOTING.md`

## Archived docs (`docs/archive/`)

Point-in-time snapshots — not live SoT:

- `docs/archive/TECHNICAL_OVERVIEW.md`
- `docs/archive/INTEGRATION_VERIFICATION.md`
- `docs/archive/DATABASE_VALIDATION_REPORT.md`
- `docs/archive/TEST_FLOWS.md`
- `docs/archive/README.md`
- `docs/archive/2026-07/`, `docs/archive/2026-08/`, `docs/archive/2026-09/` - ten of the 15 reviewed cleanup documents remain historical; five active references were restored. See the follow-up tracker and archive README for exact dispositions.

## Tooling Instruction Docs (KEEP in place)

- `.github/copilot-instructions.md` - Copilot-specific coding instructions and conventions.

## Current Organization Decision

- Keep `README.md` at repo root for discovery and onboarding.
- Keep `PRODUCT.md` and the restored `CONTENT_AUDIT_REPORT.md` at their existing root locations; other project documentation belongs under `docs/`.
- Keep operational and feature-specific docs inside `docs/`.
- Keep live agent playbooks in `.agent/docs/`; historical snapshots under `docs/archive/`.
- Planned / unbuilt work: `docs/ROADMAP.md`.
