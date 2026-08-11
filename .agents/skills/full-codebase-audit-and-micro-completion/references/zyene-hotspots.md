# Zyene Reviews hotspots and detection greps

Repo-specific starting points. These greps **triage** — they narrow where to look.
They do not replace reading the file in context, and a clean grep is not a clean audit.

Verify the paths below still exist before relying on them; the tree moves.

---

## Auth and tenancy

```bash
# Authorization decided from getSession() instead of getUser() — must be zero
rg -n "getSession\(" src

# API routes and server actions: which ones never resolve a user?
rg -L "getUser\(|getActiveBusinessId\(|authorizeCronRequest" \
  --glob "src/app/api/**/route.ts" --glob "src/app/actions/**/*.ts" -l src

# Supabase queries that select business-scoped tables without a business filter
rg -n "\.from\(\"(reviews|customers|campaigns|locations|businesses)\"\)" src -A 4 \
  | rg -B 2 -A 2 -v "business_id|organization_id"
```

Active business context: `src/lib/auth/business-context.ts` (`getActiveBusinessId()`).
Rate limiting: `src/lib/auth/rate-limit.ts`.

**Any** cross-tenant gap is Critical and Escalate — report, do not patch silently.

---

## Public / unauthenticated surfaces

Highest blast radius because anyone can reach them:

- `src/app/r/[slug]/` — review capture on collectratings.com (unauthenticated writes)
- `src/app/w/[slug]/` — embeddable widget (CORS, cacheability, data exposure)
- `src/app/(marketing)/` — public pages
- `src/app/api/` routes with no auth guard

Check each for: input validation (Zod), rate limiting, spam/abuse controls, what
fields the response exposes, and whether an ID in the URL is authorization-bearing.

---

## Webhooks and cron

```bash
# Every webhook route should verify a signature
ls src/app/api/webhooks   # clover generic google resend square stripe supabase twilio
rg -n "constructEvent|verify|signature|hmac" src/app/api/webhooks -i -l

# Cron routes must go through the shared guard
rg -L "authorizeCronRequest" --glob "src/app/api/cron/**/route.ts" -l src
```

Guard helper: `src/lib/cron/authorize-cron-request.ts`. A cron or webhook route that
skips its guard is Critical.

---

## Jobs and external APIs

- `src/lib/inngest/`, `src/services/inngest/` — check idempotency: does a retry
  re-send an email/SMS, re-charge, or duplicate a row? Are side effects inside
  `step.run` boundaries?
- `src/services/google/` — quota, retry/backoff, timeout, token refresh failure paths.
- Resend (email), Twilio (SMS), Stripe (billing) — the expensive-to-get-wrong ones.

```bash
# fetch() calls with no timeout / AbortSignal
rg -n "await fetch\(" src -A 3 | rg -v "signal|AbortSignal" | rg "await fetch"

# Unbounded concurrency against a rate-limited API
rg -n "Promise\.all\(" src -B 3 | rg -i "map\(|reviews|customers|locations"
```

---

## Data layer

```bash
pnpm check:migrations           # migration hygiene guard
rg -l "create table" supabase/migrations | \
  xargs rg -L "enable row level security" -l    # tables without RLS
```

Never edit an applied migration. Schema and RLS changes are **Escalate**.

---

## Standards guards (run these, don't re-derive them)

```bash
pnpm check:sizes        # file-size ratchet, scripts/check-file-sizes.mjs
pnpm check:colors       # color guards
pnpm check:migrations   # migration hygiene
```

```bash
# Client-side console.log (server uses Pino)
rg -l '"use client"' src | xargs rg -n "console\.log"

# Escaped types
rg -n ": any\b|as unknown as|@ts-ignore" src

# Deep relative imports instead of @/
rg -n "from \"\.\./\.\./\.\." src
```

---

## Marketing / SEO

Handled by the **seo** skill — invoke it rather than re-implementing the checks. Flag
here only if a new indexable page is missing from `src/app/sitemap.ts` (`pnpm test`
already fails on this) or a marketing route lacks OG/Twitter metadata.

---

## Known excluded paths

| Path | Reason |
|------|--------|
| `src/types/database.types.ts` | Generated from Supabase |
| `src/components/ui/` | Vendored shadcn/ui |
| `supabase/migrations/*` (applied) | Immutable once applied |
| `node_modules/`, `.next/`, lockfiles | Dependencies and build output |
| `src/lib/phase*/` | Verify before touching — may be live or may be stale staging code; confirm callers, do not assume dead |

Anything else excluded must be named in the report with a reason.
