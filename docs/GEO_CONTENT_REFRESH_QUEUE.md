# GEO content refresh queue

Prioritized URLs to refresh on a schedule. **Last updated** and **next refresh** are owner-maintained — do not invent dates.

**Related:** [GEO_WEEKLY_REPORT_TEMPLATE.md](./GEO_WEEKLY_REPORT_TEMPLATE.md) · [GEO_ON_PAGE_AUDIT.md](./GEO_ON_PAGE_AUDIT.md) · [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md)

---

## Refresh cadence guide

| Priority | Suggested cadence |
|----------|-------------------|
| P0 — Compare + pricing competitor | Monthly or when competitor pricing changes |
| P1 — Lead magnets + top blogs | Quarterly |
| P2 — Supporting resources | Semi-annual |
| P3 — GSC-driven URLs | When GSC shows position drop > 3 or impressions −20% |

After each refresh: update `dateModified` in content if applicable, run IndexNow (`pnpm indexnow:ping`), note in weekly report.

---

## Priority queue

| URL | Priority | Last updated | Owner | Next refresh | What to check |
|-----|----------|--------------|-------|--------------|---------------|
| `/compare` | P0 | | | | Matrix accuracy, internal links, CTAs, FAQ schema |
| `/compare/birdeye` | P0 | | | | Pricing rows, feature claims, competitor links |
| `/blog/birdeye-pricing-breakdown-2026` | P0 | | | | Public Birdeye pricing, dates, disclaimers |
| `/blog/negative-feedback-shield` | P1 | | | | Compliance copy, no overclaims, CTAs |
| `/resources/review-request-templates` | P1 | | | | Template count, lead form copy, HowTo steps |
| `/resources/local-seo-checklist` | P1 | | | | Checklist items, lead copy (no PDF claim) |
| `/blog/ai-visibility-audit-local-businesses` | P1 | | | | Audit steps, comparison table, FAQs |
| _Top blog #1 from GSC_ | P3 | Pending GSC | | | Title/meta, snippets, internal links |
| _Top blog #2 from GSC_ | P3 | Pending GSC | | | |
| _Top blog #3 from GSC_ | P3 | Pending GSC | | | |
| _Top blog #4 from GSC_ | P3 | Pending GSC | | | |

Fill GSC top URLs after first successful `pnpm geo:gsc-baseline` export ([GSC_BASELINE_SUMMARY.md](../reports/gsc/GSC_BASELINE_SUMMARY.md)).

---

## Per-URL refresh checklist (copy per refresh)

- [ ] **Content accuracy** — pricing, features, competitor names
- [ ] **Internal links** — compare, resources, signup, pricing
- [ ] **CTA** — primary CTA still correct (`/signup`, lead magnet)
- [ ] **Schema** — FAQ / HowTo / Article valid (`validate-geo-faq-build.mjs`)
- [ ] **Metadata** — title ≤ 60 chars (segment), description ≤ 160, OG/Twitter
- [ ] **Proof / data** — no new stats without [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md) approval
- [ ] **IndexNow** — ping URL after deploy
- [ ] **AI citation spot-check** — 1–2 baseline queries from [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md)

---

## Revision log

| Date | Change |
|------|--------|
| 2026-05-25 | Initial queue — GSC top-4 slots pending real export |
