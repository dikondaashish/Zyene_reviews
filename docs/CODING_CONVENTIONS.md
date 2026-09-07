# Coding Conventions

Contributor and AI-agent conventions for Zyene Reviews. Enforceable checklist: [AGENTS.md](../AGENTS.md). Placement: [CODEBASE_STRUCTURE.md](./CODEBASE_STRUCTURE.md).

---

## 1. Naming

| Kind | Convention | Example |
|------|------------|---------|
| Directories | kebab-case | `src/lib/review-requests/` |
| React components | PascalCase file matching export | `ReviewInbox.tsx` or `review-inbox.tsx` matching local pattern |
| Functions / vars | camelCase; booleans with auxiliaries | `isLoading`, `hasError` |
| Event handlers | `handle` prefix | `handleSubmit` |
| Server Actions / API | verb-led | `sendOutboundReviewRequest` |
| Env vars | `SCREAMING_SNAKE` | `CRON_SECRET` |
| DB tables / columns | snake_case | `business_id` |

Prefer **named exports** for components and helpers.

---

## 2. Architecture patterns

### Layering

```
src/app/(pages|api|actions)  →  src/lib/* (domain)  →  src/services/* (vendors)  →  DB / HTTP
```

| Put here | Don’t put here |
|----------|----------------|
| Routes: HTTP/UI wiring only | Fat business rules in `page.tsx` |
| `lib`: business rules, orchestration | Raw Stripe/Twilio SDK calls if a service exists |
| `services`: vendor adapters | Cross-feature UI |
| `components/ui`: shadcn primitives | Hand-edited forever forks |

### Server vs client

- Default **Server Components**.
- `"use client"` only for browser APIs, event handlers, or client state.
- Push client boundaries to the smallest leaf.

### API / Server Actions

1. Authenticate with `getUser()` (or API key / cron secret).
2. Resolve `businessId` / org context.
3. Validate with **Zod**.
4. Call `lib` helpers.
5. Return structured errors — no stack traces to clients.
6. Keep `route.ts` ≤ **100** lines; split helpers if needed.

### Types

- Strict TypeScript — no `any`; avoid `@ts-ignore` without a one-line justification.
- Prefer shared types in `src/types/` over copy-paste.
- Prefer `interface` for object shapes where the codebase already does.
- Avoid enums; use const maps / string unions.

### Imports

- Always `@/` aliases — no `../../../` chains.
- Avoid unnecessary barrel imports that pull huge modules (follow Vercel package-import guidance already in Next config where applicable).

### Logging

- **Pino** on server (`@/lib/logger`).
- Zero `console.log` in client components/hooks.

### File size limits (CI)

| File type | Max lines |
|-----------|-----------|
| `page.tsx` / `layout.tsx` in app | 100 |
| API `route.ts` | 100 |
| Components | 150 |
| `src/lib`, `src/services` | 200 |

Ratchet via `pnpm check:sizes`. Exempt: generated `database.types.ts`, vendored `src/components/ui/`.

---

## 3. Testing patterns

### Tools

| Tool | Use |
|------|-----|
| **Vitest** | Unit + integration under `tests/` |
| **Playwright** | Visual regression (`pnpm test:visual`) |
| Scripts | `verify:critical-flows`, feature-specific verify scripts |

### What to test

- Pure domain helpers (send rules, scoring, URL builders, Zod schemas).
- Authz helpers and API key hashing/scopes.
- Regression cases for bugs you fix.
- Sitemap / SEO invariants when touching marketing routes (existing tests).

### What not to over-test locally

- Full `pnpm build` after copy-only edits (CI builds on `main`).
- Entire Vitest suite after a single isolated unit change — run the matching file.

### Style

- `describe` / `it` with behavior-focused names.
- `vi.mock` dependencies before importing modules under test.
- Prefer 3–5 focused cases per file over sprawling suites.

Default after a change:

```bash
pnpm verify:fast
pnpm exec vitest run tests/unit/<touched>.test.ts
```

Run `npx react-doctor@latest --verbose --diff` when component structure/hooks change (not for pure copy/data).

---

## 4. SEO & marketing pages

When editing `src/app/(marketing)/`:

- Unique title (≤60) and description (≤160); root layout adds `| Zyene Reviews`.
- OG + Twitter metadata.
- One `h1`; semantic landmarks.
- `next/image` with alt; internal `next/link`.
- New URLs → `src/app/sitemap.ts`.

See `.cursor/rules/seo.mdc`.

---

## 5. Git & docs hygiene

- Do not commit secrets.
- New migrations only — never rewrite applied SQL.
- When changing APIs, auth, schema, or env: update matching files under `docs/` (see `.cursor/rules/documentation.mdc`).
- Prefer existing patterns over new frameworks/libraries unless requested.

---

## 6. Anti-patterns

| Avoid | Prefer |
|-------|--------|
| `getSession()` for authz | `getUser()` |
| Sync `params` in pages | `await params` |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` |
| Tables without RLS | RLS + policies |
| Secrets in `NEXT_PUBLIC_*` | Server env |
| Rewriting whole files for small fixes | Minimal diffs |
| New abstraction “for later” | Simplest working change |
