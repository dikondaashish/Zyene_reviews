# Authentication

How identity, sessions, tenancy, and API keys work in Zyene Reviews.

Related: [CONFIGURATION.md](./CONFIGURATION.md), [API.md](./API.md), [DATA_MODELS.md](./DATA_MODELS.md).

---

## 1. Model overview

| Layer | Mechanism |
|-------|-----------|
| End-user identity | **Supabase Auth** (email/password + OAuth providers as configured) |
| Session transport | **HTTP cookies** via `@supabase/ssr` (server + browser clients) |
| Authorization check | **`supabase.auth.getUser()`** — verifies JWT with Auth server |
| Tenant context | **Organization membership** + **active business cookie** |
| Machine / Zapier access | **API keys** (`X-API-Key`), hashed at rest, scoped |
| Jobs / cron | **Shared secrets** (`CRON_SECRET`, webhook signing secrets) |

Zyene does **not** use a custom JWT issuer for the dashboard. Do not introduce a parallel session system.

---

## 2. Main user flows

### Sign up

1. UI: `src/app/(auth)/signup/`
2. Creates Supabase Auth user → profile row in `public.users`
3. Onboarding (`src/app/onboarding/`) creates org/business, optionally connects Google, selects plan
4. Email confirmation may be required (Supabase Auth settings). Rate limits: configure custom SMTP if hitting Supabase mail quotas (see `.env.example`).

### Login

1. UI: `src/app/(auth)/login/`
2. Supabase `signInWithPassword` (or OAuth)
3. Session cookies set; redirect to dashboard or onboarding

### OAuth / auth callback

- `GET /api/auth/callback` → `handleOAuthCallback` in `src/services/auth/oauth-callback`
- Completes Supabase OAuth / magic-link style redirects
- Google product connect may continue via `/api/auth/google/complete` and Google integration routes

### Logout

Client/server Supabase `signOut` clears session cookies; active business cookie should be cleared or ignored when unauthenticated (`getActiveBusinessId` returns empty without user).

### Password reset

1. Forgot password: `src/app/(auth)/forgot-password/` → Supabase reset email
2. Reset page: `src/app/(auth)/reset-password/` → set new password with recovery session

### Team invite

1. Owner/admin invites via `/api/team/invite` (Resend email)
2. Invitee accepts via `/api/team/accept-invite` / invitation links
3. Creates `organization_members` (and possibly `business_members`) rows

---

## 3. Active business context

Logged-in users operate on **one business (location) at a time**.

- Cookie name: `active_business_id` (HTTP-only)
- Resolver: `getActiveBusinessId()` in `src/lib/auth/business-context.ts`
- Validates membership; falls back to first available business
- May use Redis-backed cache via `business-context-load` helpers

**Security note:** Cookie alone is not trust — always re-check membership server-side (the helper does this).

---

## 4. Roles and access

Organization roles (see schema): `owner`, `admin`, `manager`, `member`, `viewer`.

Examples:

- API key management: owners/admins (`canManageApiKeys` in `src/lib/api-keys/scopes.ts`)
- Settings gates: `src/lib/auth/settings-access.ts`
- Billing: typically owner/admin

Always enforce role checks in Server Actions and API routes — layouts are not a security boundary for Server Actions.

---

## 5. Developer API keys

1. Created via dashboard / `/api/integrations/api-key`
2. Raw key shown once; store **SHA-256 hash**
3. Request header: `X-API-Key`
4. Scopes: `review_requests:write`, `reviews:read`, `analytics:read`, plus AEO scopes
5. Auth helper: `authenticateApiKey` — returns business id bound to the key

Keys are **business-scoped**, not org-wide (unless product changes this later).

---

## 6. Cron and webhooks

| Caller | Auth |
|--------|------|
| Cron routes | `Authorization: Bearer CRON_SECRET` |
| Stripe | Signature header + `STRIPE_WEBHOOK_SECRET` |
| Resend | Svix signing secret |
| Twilio | Request signature validation |
| Google Pub/Sub | Query `token` must match env secret |
| Growth dashboard | `GROWTH_DASHBOARD_SECRET` (falls back to cron secret) |

Treat these as privileged: use admin client only after verification.

---

## 7. Security considerations

1. **Never authorize with `getSession()` alone** on the server — session JWT can be forged in cookies; `getUser()` verifies.
2. **Do not put auth enforcement only in Edge middleware** — verify in layouts/pages/actions/routes with `getUser()`.
3. **Service role key** bypasses RLS — never expose to the client; minimize usage.
4. **OAuth tokens** encrypted via DB RPCs (`encrypt_token` / `decrypt_token`); avoid logging.
5. **Constant-time compare** helpers exist for secrets (`src/lib/auth/constant-time-compare.ts`) — use for token checks.
6. **Rate limiting** via Upstash on sensitive paths.
7. **RLS** required on new tables; test cross-tenant isolation.
8. **Known limitation:** email auth rate limits depend on Supabase/SMTP configuration; misconfigured redirect URLs cause auth loops (`NEXT_PUBLIC_ROOT_DOMAIN`).

---

## 8. Future extension

| Topic | Status |
|-------|--------|
| Enterprise SSO / SAML | Planned / roadmap — see [ROADMAP.md](./ROADMAP.md) |
| Stripe Connect marketplace | Not used (org-level subscriptions only) |
| Impersonation for support | Not documented as a first-class feature — confirm before building |

If SSO ships, document IdP config and role mapping here before enabling in production.
