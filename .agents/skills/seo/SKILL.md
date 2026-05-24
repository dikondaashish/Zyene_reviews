---
name: seo
description: Audit marketing pages for SEO compliance (metadata, images, headings, JSON-LD, sitemap). Use when asked to "run SEO audit", "check SEO", "audit metadata", or before committing marketing page changes.
metadata:
  author: zyene-reviews
  version: "1.0.0"
  argument-hint: <optional path glob, e.g. src/app/(marketing)>
---

# SEO audit (Zyene Reviews)

Run this skill on demand before committing marketing or page changes. Rules live in `.cursor/rules/seo.mdc`.

## When to run

- User asks for an SEO check, metadata review, or pre-commit SEO pass
- After adding or editing files under `src/app/(marketing)/`, marketing components, or `sitemap.ts` / `robots.ts`
- Before merging large marketing or content PRs

## Scope

Default scan root: `src/app/(marketing)/`

Also check when relevant:

- `src/app/layout.tsx` — root metadata template, Organization JSON-LD
- `src/app/sitemap.ts` — new URLs listed
- `src/app/robots.ts` — marketing paths not blocked
- `src/components/seo/` — shared JSON-LD helpers
- `src/app/r/` — review/collection pages (LocalBusiness if applicable)

## Audit checklist

Work through each section. Report violations as `file:line — issue — suggested fix`.

### 1. Metadata

For every `page.tsx` and `layout.tsx` under the scan root:

- [ ] Exports `metadata` or `generateMetadata`
- [ ] Unique `title` (≤ 60 chars for the title segment; no manual `| Zyene Reviews` suffix)
- [ ] Unique `description` (≤ 160 chars)
- [ ] Marketing pages: `openGraph.title`, `openGraph.description`, `openGraph.images`
- [ ] Marketing pages: `twitter.card`, `twitter.title`, `twitter.description`
- [ ] Dynamic routes use `generateMetadata()` with awaited `params`

**Commands (examples):**

```bash
# Pages missing metadata export
rg -l "export default" "src/app/(marketing)" --glob "**/page.tsx" | while read f; do
  rg -q "metadata|generateMetadata" "$f" || echo "MISSING_METADATA: $f"
done

# Duplicate titles (static title strings)
rg "title:\s*[\"']" "src/app/(marketing)" --glob "**/page.tsx"

# Manual brand suffix (should be none)
rg "\| Zyene Reviews" "src/app/(marketing)" --glob "**/*.{tsx,ts}"
```

### 2. Images

- [ ] No raw `<img` in marketing routes (use `next/image`)
- [ ] Every `<Image` has `alt=`
- [ ] `width`/`height` or valid `fill` usage
- [ ] `priority` only on hero / LCP images

```bash
rg "<img\b" "src/app/(marketing)" "src/components/marketing"
rg "<Image[^>]*>" "src/app/(marketing)" -n | rg -v "alt="
```

### 3. Duplicate titles

Collect all resolved titles (static + from data files for dynamic routes). Flag duplicates.

### 4. Headings & semantics

- [ ] Exactly one `<h1` per marketing page view
- [ ] No skipped heading levels in page templates
- [ ] `<main>` present on full-page marketing layouts where appropriate

```bash
rg "<h1" "src/app/(marketing)" --glob "**/*.{tsx}" -c
```

### 5. JSON-LD (key pages)

| Route / page | Expected |
|--------------|----------|
| `/` (homepage) | `Organization` / `WebSite` via root layout |
| `/blog/[slug]` | `Article` + author + `datePublished` |
| `/pricing` | `ProductJsonLd` / Offer |
| Public review surfaces | `LocalBusiness` when business data is shown |

```bash
rg "OrganizationJsonLd|Article|ProductJsonLd|LocalBusiness" "src/app" "src/components/seo" -n
```

Flag blog posts that only have `BreadcrumbJsonLd` without `Article` schema.

### 6. Links

- [ ] Internal: `from "next/link"` / `<Link href=`
- [ ] External `target="_blank"`: includes `rel="noopener noreferrer"`

```bash
rg '<a href="/' "src/app/(marketing)" "src/components/marketing"
rg 'target="_blank"' "src/app/(marketing)" -A1 | rg -v "noopener"
```

### 7. Sitemap & robots

For each new marketing path in the diff:

- [ ] URL appears in `src/app/sitemap.ts` (or is generated from a slug list already in sitemap)
- [ ] Path is not in `disallow` in `src/app/robots.ts` unless intentionally non-indexable

Compare new routes:

```bash
rg "url: \`\$\{BASE_URL\}" "src/app/sitemap.ts"
```

## Output format

```text
## SEO audit summary

**Scope:** <paths scanned>
**Pass:** <count> checks
**Violations:** <count>

### Critical
- path:line — issue — fix

### Warnings
- path:line — issue — fix

### Passed
- Brief list of what was verified
```

If violations exist, fix them or list them for the user before committing. Do not mark the audit complete while **Critical** items remain on changed marketing pages.

## Project references

- Metadata template: `src/app/layout.tsx` (`title.template`)
- JSON-LD helpers: `src/components/seo/json-ld.tsx`
- Sitemap: `src/app/sitemap.ts`
- Robots: `src/app/robots.ts`
- Cursor rule: `.cursor/rules/seo.mdc`
