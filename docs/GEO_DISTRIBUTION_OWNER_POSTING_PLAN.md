# GEO distribution owner posting plan

**Owner manual only** — do not automate posts. Copy lives in repo; you publish on each platform.

**Related:** [PHASE3_DISTRIBUTION_PACKAGE.md](./PHASE3_DISTRIBUTION_PACKAGE.md) · [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md)

---

## Week 1 posting sequence (recommended)

| Day | Channel | Asset | Copy source file |
|-----|---------|-------|------------------|
| 1 | LinkedIn (company) | Template pack launch | [content/repurpose/review-request-templates-week1-launch.md](../content/repurpose/review-request-templates-week1-launch.md) |
| 2 | LinkedIn (founder) | Template pack angle #2 | Same file — second post block |
| 3 | Email newsletter | Template pack dedicated send | Same file — email section |
| 4 | X / Threads | Template pack short post | Same file — social snippets |
| 5 | LinkedIn | Compare or Shield teaser | [negative-feedback-shield.md](../content/repurpose/negative-feedback-shield.md) or [compare.md](../content/repurpose/compare.md) |

---

## Where to copy posts from

| Asset | Repurpose file |
|-------|----------------|
| Review request template pack | `content/repurpose/review-request-templates-week1-launch.md` |
| Negative Feedback Shield | `content/repurpose/negative-feedback-shield.md` |
| Birdeye pricing | `content/repurpose/birdeye-pricing-breakdown-2026.md` |
| Compare hub | `content/repurpose/compare.md` |

---

## UTM links (Week 1 template pack)

Base: `https://www.zyenereviews.com/resources/review-request-templates`

| Channel | Full link |
|---------|-----------|
| LinkedIn | `?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch` |
| Email | `?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch` |
| Threads / X | `?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch` |

Other campaigns: see [PHASE3_DISTRIBUTION_PACKAGE.md](./PHASE3_DISTRIBUTION_PACKAGE.md).

---

## LinkedIn instructions

1. Open repurpose markdown → copy post block (do not add fake metrics).
2. Paste UTM link in first comment or inline CTA.
3. Post from company page; optional founder reshare next day.
4. After publish: copy post URL → [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md).

---

## Threads / X instructions

1. Use short snippet from repurpose file (≤280 chars where needed).
2. One link with UTM (threads row above).
3. No PDF/download claims — “free web templates on our site.”
4. Save post URL to tracker.

---

## Email newsletter instructions

1. Use dedicated send copy from week-1 launch file.
2. Single CTA button → email UTM link.
3. Send to opted-in list only (not cold spam).
4. Record send date + Resend stats in tracker.

---

## After posting — when to measure

| When | What to check |
|------|----------------|
| **24 hours** | Impressions/clicks from platform analytics; `/growth` funnel (template pack) |
| **7 days** | Subscribers with `utm_campaign=template-pack-launch`; signup/pricing clicks |

```bash
# Optional API (Bearer = GROWTH_DASHBOARD_SECRET, do not commit)
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://www.zyenereviews.com/api/internal/marketing/template-pack-report?days=7"
```

---

## Posting tracker (fill when live)

Do **not** mark complete without real URLs.

| date | asset | channel | post copy file | final posted URL | UTM used | impressions | clicks | subscribers | signup clicks | pricing clicks | notes |
|------|-------|---------|----------------|------------------|----------|-------------|--------|-------------|---------------|----------------|-------|
| | template pack | LinkedIn | review-request-templates-week1-launch.md | | template-pack-launch | | | | | | |
| | template pack | email | review-request-templates-week1-launch.md | | template-pack-launch | | | | | | |
| | template pack | Threads/X | review-request-templates-week1-launch.md | | template-pack-launch | | | | | | |

Duplicate table maintained in [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md).

---

## Completion rule

Distribution phase is **not complete** until the tracker has real **final posted URL** values for Week 1 planned posts.
