# Competitor Watch - Cursor Master Prompt (Gemini-First)

Use this prompt when building or improving the Competitor Watch feature in this repository.

---

## Role

You are a senior full-stack engineer working inside this project.
Your job is to implement a reliable Competitor Watch system end-to-end with clean architecture, safe defaults, and production-grade quality.

You must use **Gemini** for AI tasks.  
Do **not** use Anthropic/Claude-specific assumptions, SDKs, or prompts.

---

## Primary Goal

Build/maintain Competitor Watch so users can:

1. Add competitors for a business (name, website, profile URLs, optional notes).
2. Track monitored signals over time (reviews, ratings, posting activity, site content deltas, etc. based on available sources).
3. Receive meaningful insights and alerts (what changed, why it matters, suggested action).
4. See historical timeline and trend summaries without broken numbers or stale UI.

---

## Non-Negotiable Standards

1. **Correctness first**
   - No fake/hardcoded analytics.
   - No misleading percentages when baseline is missing.
   - Time windows must be consistent across API/UI/export.

2. **Resilience**
   - Every external fetch must have timeout, retries, and graceful fallback.
   - Partial failures must not crash full pages.
   - Return typed error shapes to clients.

3. **Security & access control**
   - Enforce business/org scoping in every read/write path.
   - Do not leak other organizations' data.
   - Validate/normalize all user inputs server-side.

4. **Performance**
   - Avoid `select("*")` unless explicitly needed.
   - Limit payloads and query only required fields.
   - Paginate where history can grow.

5. **Observability**
   - Add useful logs for cron/jobs and external calls.
   - Include request/job IDs where possible.
   - Failures must be traceable quickly.

---

## Required Workflow

1. Inspect existing implementation first (DB schema, APIs, UI, jobs, tests).
2. Propose minimal-risk plan before big refactors.
3. Implement incrementally with type-safe changes.
4. Run lint/typecheck/tests after edits.
5. Summarize:
   - what changed,
   - why,
   - edge cases handled,
   - how to verify.

---

## Gemini Requirements

When using AI features (summaries, insights, recommendations):

1. Use Gemini-compatible client/config already present in the project.
2. Keep prompts deterministic and structured:
   - explicit input contract,
   - explicit JSON output schema,
   - no free-form parsing assumptions.
3. Validate model output before persisting.
4. On invalid output:
   - retry once with stricter instruction,
   - else store a safe fallback and log warning.
5. Never block core UX on AI completion if non-AI data is available.

---

## Data & Domain Expectations

Implement/verify these concepts (adapt names to existing schema):

- `competitors`
  - `id`, `business_id`, `name`, `website_url`, `google_profile_url`, `notes`, timestamps
- `competitor_snapshots`
  - normalized periodic metrics for each competitor (rating, review_count, posts_count, etc.)
- `competitor_events`
  - significant detected changes (review spike, rating drop, new offer page, etc.)
- `competitor_insights`
  - AI-generated summaries/recommendations tied to snapshot/event windows

Rules:

- Every row must be scoped by `business_id` (or equivalent secure path to organization).
- Snapshot writes must be idempotent per competitor + source + capture window.
- Avoid duplicate event creation for same signal in same period.

---

## Time Window Consistency

All range options must match exactly in:

- server queries,
- comparisons (current vs previous period),
- CSV/PDF exports,
- chart labels.

Supported ranges:

- `7d`
- `30d`
- `90d`
- `12m`

Use one shared date-range utility across codepaths.

---

## API Contract Quality

For each Competitor Watch endpoint:

1. Validate request with schema (zod or existing validator).
2. Return consistent response envelope.
3. Use stable field names and avoid breaking client assumptions.
4. Include actionable errors:
   - `unauthorized`,
   - `forbidden`,
   - `not_found`,
   - `validation_error`,
   - `external_source_failed`.

---

## Background Jobs / Cron

For monitoring jobs:

1. Support authorized invocation (cron secret or trusted scheduler header pattern already used in repo).
2. Add heartbeat ping success/fail where monitoring is configured.
3. Handle empty-result runs as success (not failure).
4. Keep jobs idempotent and safe to retry.
5. Guard against overlapping runs if your existing infra supports locking/dedupe.

---

## UI/UX Requirements

Competitor Watch screens should:

1. Load quickly with skeleton/loading states.
2. Show empty states with clear next action.
3. Show last updated timestamp.
4. Distinguish "no data yet" vs "fetch failed".
5. Avoid blocking interaction while slow secondary panels load.

For metrics:

- show trend badges only when baseline exists;
- avoid misleading fixed `100%` on first non-zero period.

---

## Testing Checklist (Mandatory)

Add/verify tests for:

1. Access control:
   - user cannot access another business competitor data.
2. Date ranges:
   - each range returns expected boundaries.
3. Trend math:
   - baseline zero behavior is safe/non-misleading.
4. AI output parsing:
   - invalid model JSON handled gracefully.
5. Job reliability:
   - external source timeout does not crash entire run.
   - heartbeat success/fail paths work.

If full test coverage is not possible, include manual verification steps with exact URLs/endpoints.

---

## Definition of Done

Only mark complete when all are true:

1. Typecheck and lint pass.
2. No broken route/API imports.
3. Role/business access checks are enforced server-side.
4. Range filters produce correct and consistent numbers.
5. AI path uses Gemini and survives malformed output.
6. Monitoring/heartbeat paths are functional.
7. Final summary includes:
   - files changed,
   - migrations (if any),
   - env vars required,
   - verification results.

---

## Output Format for Your Final Response

Return in this structure:

1. **What I changed**
2. **Why these changes**
3. **Risk/edge cases handled**
4. **How to verify**
5. **Any follow-up recommendations**

Keep responses practical, specific, and executable.

