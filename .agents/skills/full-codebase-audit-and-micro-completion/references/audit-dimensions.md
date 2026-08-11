# Audit dimensions

Work each file through these five dimensions. Record every hit as
`file:line — issue — impact — fix — classification`.

---

## 1. Correctness

- Missing implementations, placeholder code, `TODO`/`FIXME`, unreachable branches,
  inconsistent return values across a function's exits.
- Null / undefined / empty-array / empty-string handling, especially on values that
  cross an API or DB boundary.
- Boundary conditions, off-by-one, numeric overflow, timezone and date arithmetic,
  race conditions, retries, idempotency.
- Async: unawaited promises, floating promises in event handlers, `Promise.all` where
  one rejection loses the rest, missing `finally` cleanup, unclosed streams/handles.
- Input validation and error propagation — does a caller see a distinguishable failure,
  or a swallowed `catch {}`?
- Mismatches between implementation, its tests, its JSDoc/comments, and actual caller
  usage. When these disagree, the callers are the strongest evidence of intent.

Next.js / React specifics:

- `"use client"` files importing server-only modules, or leaking server env vars.
- Server Components doing client-only work (`window`, `localStorage`) and vice versa.
- `useEffect` with missing/incorrect deps, effects that should be event handlers,
  state derived in an effect that should be computed during render.
- `await params` / `await searchParams` in Next.js 15+ dynamic routes.
- Stale `revalidate` / cache tags after a mutation.

---

## 2. Security and privacy

- Secrets, tokens, private keys, or credentials in source, tests, fixtures, migrations,
  or log statements. **Report the location, never the value.**
- Injection: SQL (raw `.rpc`/string-built SQL), shell, template, command, path
  traversal, SSRF (any user-controlled URL passed to `fetch`), XSS
  (`dangerouslySetInnerHTML`, unsanitized markdown).
- Authn/authz gaps:
  - `supabase.auth.getSession()` used for an authorization decision (must be
    `getUser()`).
  - API route or server action with no auth check at all.
  - Business-scoped query missing a `business_id` / org filter — cross-tenant leak.
  - New Supabase table without an RLS policy.
- Webhooks without signature verification; cron routes without `CRON_SECRET`.
- Unsafe deserialization, open redirects, weak crypto, `Math.random()` for tokens,
  wildcard CORS, missing rate limits (Upstash), unsafe file handling/upload.
- Sensitive data leaking into error responses, logs, analytics, or API payloads —
  stack traces, emails, phone numbers, review-author PII.
- Vulnerable or unnecessary dependencies (`pnpm audit`, unused packages).

---

## 3. Performance and reliability

- N+1 queries or per-row API calls — especially inside `.map()` over reviews,
  customers, or locations.
- Expensive work inside loops; repeated I/O that could be batched.
- Unnecessary allocations, unbounded arrays from unpaginated queries, memory leaks
  (uncleaned intervals, listeners, subscriptions).
- Excessive re-rendering: unstable object/array/function props, missing keys, heavy
  work in render, context that re-renders a whole subtree.
- Missing DB indexes or inefficient query patterns where the migration is visible.
- Retry storms, missing `fetch` timeouts / `AbortSignal`, no cancellation, unbounded
  concurrency against a rate-limited third-party API (Google, Stripe, Resend).
- Inngest jobs: non-idempotent steps, missing `step.run` boundaries, retries that
  duplicate side effects (sent emails, SMS, charges).
- Caching opportunities **only** where invalidation and correctness are clear.

---

## 4. Architecture and maintainability

- Circular dependencies; modules reaching across layer boundaries (a component
  importing a service that imports a component).
- Duplicated business logic and competing abstractions for the same concept.
- God functions/components, deep nesting, high branching complexity.
- File-size limits from AGENTS.md — pages/API **100**, components **150**,
  lib/services **200**. Check with `pnpm check:sizes`; the ratchet baseline may shrink,
  never grow.
- Deep relative imports (`../../../`) instead of `@/`.
- `any`, `as unknown as`, unjustified `@ts-ignore`.
- `console.log` in `"use client"` files or client hooks (server uses Pino).
- Dead code, unused exports, stale feature flags, orphaned `src/lib/phase*/` modules,
  obsolete dependencies.
- Weak naming, surprising side effects, unclear ownership, missing rationale comments
  for non-obvious decisions.

---

## 5. Tests and observability

- Missing tests for critical behavior, failure paths, boundaries, and every defect
  fixed in this audit.
- Tests asserting implementation details rather than behavior; snapshot tests that
  pass through any change.
- Flaky, order-dependent, or slow tests; tests hitting real external services instead
  of fixtures.
- Missing structured logs, useful error messages, metrics, tracing, or health checks
  on critical flows: review sync, campaign send, billing webhook, onboarding.
- Silent failure paths — a `catch` that logs nothing and returns a default.
- New indexable marketing page missing from `src/app/sitemap.ts` (`pnpm test` enforces).
