# GEO entity & brand presence checklist

Use this to align **Zyene Reviews** as a consistent entity across the web and in structured data. Mark **Owner manual** items only when the live profile exists and matches NAP.

**Related:** [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md) · [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md)

---

## Canonical identity

| Item | Canonical value | Site / schema | Status |
|------|-----------------|---------------|--------|
| Legal / brand name | Zyene Reviews | Copy sitewide | Verify |
| Primary domain | `https://www.zyenereviews.com` | `sitemap`, canonicals | Verify |
| Product domain | `https://app.zyenereviews.com` | Auth / dashboard links | Verify |
| Support email | (fill live address) | Footer, contact, emails | **Owner manual** |
| Company address (if public) | (fill or N/A) | Footer, LocalBusiness if used | **Owner manual** |

---

## NAP consistency (Name, Address, Phone)

| Surface | Name matches? | Address matches? | Phone matches? | Notes |
|---------|---------------|------------------|----------------|-------|
| Website footer | | | | |
| Google Business Profile | | | | **Owner manual** — if applicable |
| LinkedIn company page | | | | **Owner manual** |
| Crunchbase | | | | **Owner manual** |
| G2 / Capterra | | | | **Owner manual** |

---

## Social & directory profiles

| Platform | URL | Claimed? | Matches brand voice? | Owner |
|----------|-----|----------|----------------------|-------|
| LinkedIn (company) | | Pending | | **Owner manual** |
| LinkedIn (founder) | | Pending | | **Owner manual** |
| X / Twitter | | Pending | | **Owner manual** |
| YouTube | | Pending | | **Owner manual** |
| Facebook Page | | Pending | | **Owner manual** |
| G2 | | Pending | | **Owner manual** |
| Capterra | | Pending | | **Owner manual** |
| Crunchbase | | Pending | | **Owner manual** |

---

## Structured data & site

| Check | Where | Status |
|-------|-------|--------|
| `Organization` JSON-LD on homepage | Root layout / `json-ld` helpers | Engineering — verify in Rich Results |
| `WebSite` / logo URL absolute HTTPS | Organization schema | Verify |
| Article / FAQ / HowTo on key URLs | Blog + resources | Run `validate-geo-faq-production.mjs` |
| Same `name` in OG + Twitter + title template | Marketing metadata | [GEO_ON_PAGE_AUDIT.md](./GEO_ON_PAGE_AUDIT.md) |
| `sameAs` array (social URLs) | Organization schema | **Owner manual** — add when profiles live |

---

## Founder / executive bio consistency

| Field | Website bio | LinkedIn | Other | Match? |
|-------|-------------|----------|-------|--------|
| Name | | | | **Owner manual** |
| Title | | | | **Owner manual** |
| Company link | `zyenereviews.com` | | | **Owner manual** |
| Photo / avatar | | | | **Owner manual** |

---

## Domain & email consistency

| Check | Expected | Status |
|-------|----------|--------|
| Marketing links use `www.zyenereviews.com` | Yes | Verify redirects |
| Transactional email From domain | SPF/DKIM aligned | **Owner manual** — Resend domain |
| No mixed `zyene.com` / typo domains in live copy | — | Spot-check quarterly |
| App links use `app.zyenereviews.com` | Yes | Verify |

---

## Completion

Entity checklist is **complete** only when:

- All **Owner manual** rows are filled with live URLs or marked N/A, and
- Organization schema `sameAs` includes verified profiles (optional but recommended for GEO).

Do not claim “entity optimized” until evidence is linked here.
