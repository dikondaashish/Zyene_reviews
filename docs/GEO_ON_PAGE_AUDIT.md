# GEO on-page SEO audit

**Last updated:** 2026-05-25  
**Scope:** Priority marketing URLs for GEO Phase 3 fixes. OG images use root default `/og/og-default.png` unless noted—intentional; per-page OG art is a future enhancement.

**Related:** [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) · [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md)

---

## Summary

| Area | Status |
|------|--------|
| Feature pillar Twitter cards | Fixed (added `twitter` in `generateMetadata`) |
| Long blog title (`true-cost…`) | Fixed (≤60 char segment) |
| Compare Birdeye title duplication | Fixed (removed redundant brand in title segment) |
| Resource guide meta descriptions | Verified / trimmed where needed |
| FAQPage JSON-LD on resource guides | 4/4 guides with structured `faqs` |
| HowTo JSON-LD | 2 guides (`review-request-templates`, `local-seo-checklist`) |

---

## Priority pages

| URL | Title (len) | Meta desc (len) | Canonical | H1 | OG | Twitter | JSON-LD | Sitemap | Robots | Notes |
|-----|-------------|-----------------|-----------|-----|----|---------|---------|---------|--------|-------|
| `/` | OK | OK | Yes | 1× h1 | Default | Yes | Organization | Yes | Allow | — |
| `/pricing` | OK | OK | Yes | 1× h1 | Default | Yes | Product | Yes | Allow | — |
| `/compare` | OK | OK | Yes | 1× h1 | Default | Yes | — | Yes | Allow | — |
| `/compare/birdeye` | Fixed (≤60) | OK | Yes | 1× h1 | Default | Yes | FAQ | Yes | Allow | Title segment: `vs Birdeye — Full Comparison 2026` |
| `/features/review-collection` | OK | OK | Yes | 1× h1 | Default | **Fixed** | — | Yes | Allow | Twitter meta added |
| `/resources/review-request-templates` | OK | OK | Yes | 1× h1 | Default | Yes | FAQ + HowTo | Yes | Allow | Lead magnet |
| `/resources/google-reviews-guide` | OK | OK | Yes | 1× h1 | Default | Yes | FAQ | Yes | Allow | FAQs added 2026-05-25 |
| `/resources/negative-review-templates` | OK | OK | Yes | 1× h1 | Default | Yes | FAQ | Yes | Allow | FAQs added 2026-05-25 |
| `/resources/local-seo-checklist` | OK | OK (trimmed) | Yes | 1× h1 | Default | Yes | FAQ + HowTo | Yes | Allow | Lead capture + FAQs |
| `/blog/birdeye-pricing-breakdown-2026` | OK | OK | Yes | 1× h1 | Default | Yes | Article + FAQ | Yes | Allow | — |
| `/blog/negative-feedback-shield` | OK | OK | Yes | 1× h1 | Default | Yes | Article + FAQ | Yes | Allow | — |
| `/blog/ai-visibility-audit-local-businesses` | OK | OK | Yes | 1× h1 | Default | Yes | Article + FAQ | Yes | Allow | New 2026-05-25 |
| `/blog/true-cost-of-bad-online-reputation` | **Fixed** | OK | Yes | 1× h1 | Default | Yes | Article + FAQ | Yes | Allow | Title trimmed to ≤60 chars |
| `/signup` | OK | OK | Yes | 1× h1 | Default | Yes | — | Yes | Allow | — |

---

## Heading hierarchy

All listed pages use a single page-level `<h1>` via shared marketing layouts. Resource guides and blog posts use `h2` → `h3` in body content without skipped levels in source data.

---

## Images

Marketing pages use `next/image` with `alt` text per project rules. Resource and blog inline images (where present) include dimensions.

---

## Internal links

| Page | Status |
|------|--------|
| Resource guides (3 updated + template pack) | `internalLinks` arrays added |
| Blog `ai-visibility-audit` | Links to compare, shield, checklist, pricing, signup |
| Feature pillars | In-page CTAs to pricing/signup |

---

## Validation commands

```bash
pnpm build
node scripts/validate-geo-faq-build.mjs
# After production deploy:
node scripts/validate-geo-faq-production.mjs
```

---

## Open items (not blockers)

- Per-page OG images for top URLs (use `/og/og-default.png` today)
- CORE-EEAT scores — fill in [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) when audits run
