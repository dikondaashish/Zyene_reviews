---
name: indexnow-pinger
version: "2.0.0"
description: >-
  Ping IndexNow after publishing Zyene marketing content. Use when adding a blog
  post, deploying new URLs to production, or when the user says "ping indexnow",
  "submit to indexnow", "index this blog post", or "notify Bing about a new post".
license: Apache-2.0
metadata:
  author: zyene-reviews
  version: "2.0.0"
  tags:
    - seo
    - indexnow
    - indexing
    - blog
  triggers:
    - "ping indexnow"
    - "submit to indexnow"
    - "index this blog post"
    - "notify bing about a new post"
    - "indexnow publish"
---

# IndexNow pinger (Zyene Reviews)

Notify Bing and other IndexNow engines **after production** has the live URL. IndexNow only works for pages reachable at `https://zyenereviews.com/...`.

## Infrastructure

| Piece | Location |
|-------|----------|
| Key file | `public/b72e9354a8674d819712a48dc7b06b52.txt` → https://zyenereviews.com/b72e9354a8674d819712a48dc7b06b52.txt |
| Library | `src/lib/seo/indexnow.ts` |
| API | `POST /api/indexnow` — `Authorization: Bearer <CRON_SECRET>` |
| CLI | `pnpm indexnow:ping` → `scripts/ping-indexnow.mjs` |

**Never** commit or log `CRON_SECRET`. Use `.env.local` locally (same value as Vercel).

## When to ping

| Content | URL |
|---------|-----|
| Blog post (primary) | `https://zyenereviews.com/blog/{slug}` |
| Resource guide | `https://zyenereviews.com/resources/{slug}` |
| Case study | `https://zyenereviews.com/case-studies/{slug}` |
| Compare / industry / feature pillar | Matching production path |

Blog slugs live in `src/lib/phase4/blog-posts-month*.ts` → `blog-data.ts`.

## Agent checklist (new blog post)

1. Note the post `slug` → `https://zyenereviews.com/blog/{slug}`.
2. Commit, push `main`, wait for **Vercel production** deploy to finish.
3. Ping (preferred):

   ```bash
   pnpm indexnow:ping blog/{slug}
   ```

   Multiple URLs:

   ```bash
   pnpm indexnow:ping blog/{slug-a} blog/{slug-b}
   ```

4. Confirm output: `IndexNow ping OK` and exit code 0.

Run the ping yourself when `CRON_SECRET` is in `.env.local`. Otherwise give the user the slug and command — do not paste the secret into chat.

## Manual curl (fallback)

```bash
curl -X POST https://zyenereviews.com/api/indexnow \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://zyenereviews.com/blog/my-awesome-new-post"]}'
```

## Validation

- [ ] URL is absolute and on `zyenereviews.com`
- [ ] Production deploy completed (page returns 200)
- [ ] API responds with `{ "success": true, "count": N }`
- [ ] Key file still serves `b72e9354a8674d819712a48dc7b06b52` (one-time check)

## Does not replace

- XML sitemap (`src/app/sitemap.ts`)
- Google Search Console URL inspection
- On-page SEO (`on-page-seo-auditor`, `meta-tags-optimizer`)

## Errors

| Symptom | Fix |
|---------|-----|
| `401 Unauthorized` | Wrong/missing `CRON_SECRET` |
| `500 Failed to ping` | IndexNow API issue or bad URL list |
| `CRON_SECRET is not set` | Add to `.env.local` |
