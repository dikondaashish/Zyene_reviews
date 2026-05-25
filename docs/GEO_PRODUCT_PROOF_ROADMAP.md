# GEO product proof & research roadmap

**Status:** Planning doc — no customer metrics are invented here. Ship new proof assets only when verified data exists.

**Related:** [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md) · [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) · [GEO_ENTITY_BRAND_CHECKLIST.md](./GEO_ENTITY_BRAND_CHECKLIST.md)

---

## Current proof assets (live on site)

| Asset | URL | Proof type | Notes |
|-------|-----|------------|-------|
| Birdeye pricing breakdown | `/blog/birdeye-pricing-breakdown-2026` | Competitive / pricing research | Public pricing research — keep dates fresh |
| Negative Feedback Shield | `/blog/negative-feedback-shield` | Product capability + compliance framing | No “Google approval” claims |
| Compare matrix | `/compare`, `/compare/birdeye` | Competitive positioning | Update when competitor pricing changes |
| Review request template pack | `/resources/review-request-templates` | Lead magnet + on-page templates | Tracked on `/growth` |
| Local SEO checklist | `/resources/local-seo-checklist` | Lead magnet + on-page checklist | No PDF — honest copy |
| AI visibility audit | `/blog/ai-visibility-audit-local-businesses` | Educational audit framework | Manual citation checks in baseline doc |

---

## Missing proof (blocked or owner-owned)

| Gap | Why it matters | Owner | Status |
|-----|----------------|-------|--------|
| Verified customer case studies | EEAT + conversion | Product / CS | **Not started** — need named permission |
| Benchmark report (`/research/2026-local-reviews-benchmark`) | Linkable research asset | Product / data | **Blocked** until real aggregated stats |
| Anonymized product performance stats | Quotable metrics for GEO | Engineering + product | **Blocked** — query production DB with privacy review |
| Public product screenshots / Loom | Trust on compare & pricing pages | Design / marketing | **Partial** — add to roadmap when ready |
| G2 / Capterra profiles | Off-site entity + backlinks | Marketing | **External ops** |
| Entity / brand consistency | Knowledge graph signals | Marketing | [GEO_ENTITY_BRAND_CHECKLIST.md](./GEO_ENTITY_BRAND_CHECKLIST.md) |

---

## Exact data needed (before publishing stats)

Collect only from production systems with legal/privacy sign-off. **Do not** publish until verified.

| Metric | Definition | Source (suggested) | Published? |
|--------|------------|-------------------|------------|
| Review request sends | SMS/email review invites sent | App DB / campaigns | Pending |
| Review link clicks | Clicks on review destination links | Analytics / app events | Pending |
| Review completions | Reviews left on Google (or proxy) | Integrations / manual sample | Pending |
| SMS/email response rates | % who click or complete | Campaign analytics | Pending |
| Before/after review count | Verified delta for a customer | Case study interview | Pending |
| Industry-specific examples | Vertical proof (dental, HVAC, etc.) | Sales / CS stories | Pending |

---

## Compliance rules (non-negotiable)

- **No fake customer metrics** — no invented percentages, counts, or “average results.”
- **Composite / illustrative case studies** must be labeled (e.g. “illustrative example”).
- **No fake logos or testimonials** — only customers who signed release forms.
- **No fake “Google approval”** — Shield routes private feedback; it does not remove Google reviews.
- **Pricing claims** — cite public competitor pages and `dateModified` when refreshed.

---

## Recommended next asset

**URL (planned):** `/research/2026-local-reviews-benchmark`

| Field | Value |
|-------|-------|
| Status | **Blocked** — waiting on real anonymized dataset |
| Minimum bar | ≥ N businesses (define N with legal), time-bounded metrics, methodology section |
| GEO use | Link from compare hub, Birdeye post, AI visibility post |
| Engineering | New marketing route + Article schema when copy + data exist |

Until data exists: link internally to existing blog/resources only; do not create empty benchmark page.

---

## Research backlog (priority order)

1. **One verified case study** (single customer, real numbers, signed approval).
2. **Refresh Birdeye pricing post** when vendor pricing changes ([GEO_CONTENT_REFRESH_QUEUE.md](./GEO_CONTENT_REFRESH_QUEUE.md)).
3. **Screenshot pack** for dashboard (review inbox, Shield flow, SMS send) — blur PII.
4. **Benchmark report** — only after row “Exact data needed” is fillable from production.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-05-25 | Initial roadmap — no metrics claimed |
