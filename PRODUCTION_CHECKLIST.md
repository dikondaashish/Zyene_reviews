# PRODUCTION CHECKLIST

> Doc classification: release operations checklist. See `docs/INDEX.md` for full documentation map.

## 1. Pre-deploy checklist
- [ ] TypeScript check: `pnpm tsc --noEmit`
- [ ] Lint check: `pnpm lint`
- [ ] Test check: `pnpm test`
- [ ] Health endpoint check:
  - Local: `curl -fsS http://localhost:3000/api/health`
  - Production: `curl -fsS https://<your-app-domain>/api/health`

## 2. RESOLVED items (Critical + High)
- [x] 01. OAuth callback exchanges auth code for session safely and consistently.
- [x] 02. OAuth requests enforce offline access (`access_type=offline`) for refresh tokens.
- [x] 03. OAuth consent prompt flow is configured to reliably obtain long-lived tokens.
- [x] 04. Refresh token preservation is implemented when provider does not return a new one.
- [x] 05. Cross-subdomain auth cookie/session handling is configured for auth/app domains.
- [x] 06. Session refresh is performed in middleware on protected navigation requests.
- [x] 07. Unauthenticated access to dashboard routes redirects to `/login`.
- [x] 08. Webhook verification is enforced for Stripe (`stripe-signature`).
- [x] 09. Webhook verification is enforced for Twilio (`x-twilio-signature`).
- [x] 10. Webhook verification is enforced for Google GBP shared secret headers.
- [x] 11. Critical secrets fail closed in production when missing for protected webhook paths.
- [x] 12. Tenant isolation rules are enforced (`business_id` and `organization_id` scoping).
- [x] 13. Ownership checks are enforced before privileged business mutations.
- [x] 14. Mass-assignment risks are reduced via explicit field allowlists on updates.
- [x] 15. Client-side trust boundaries are hardened (no privileged trust in client-supplied IDs).
- [x] 16. Provider tokens remain server-side only and are not exposed in client code.
- [x] 17. Google sync locking/cooldown protections are in place to avoid concurrent sync races.
- [x] 18. Stripe subscription state is webhook-driven as source of truth.
- [x] 19. Admin Supabase usage is restricted to trusted server contexts (cron/webhooks/jobs).
- [x] 20. Core auth-routing behavior is centralized and guarded for protected app areas.

## 3. VERIFY before each deploy (Medium items)
- [ ] M1: No new `any` usage introduced in changed code (`src/lib`, `src/services`, `src/components`).
- [ ] M2: Decomposed large backend flows remain intact (auth callback and Google sync orchestration).
- [ ] M3: Component decomposition boundaries remain clean (single-responsibility UI components).
- [ ] M4: Memoized heavy derived data paths remain memoized with correct dependency arrays.
- [ ] M5: API envelope consistency (`apiOk` / `apiError`) preserved for converted JSON routes.
- [ ] M6: All mutating API routes touched in release are Zod-validated.
- [ ] M7: Google sync/performance/profile modules use constants (no new magic numbers).
- [ ] M8: Customer import/bulk endpoints retain rate limits and abuse protections.
- [ ] M9: Test config remains on V8 provider and thresholds are unchanged.
- [ ] M12: Request correlation IDs/logging remain present on high-signal API handlers.

## 4. BACKLOG (Low priority items)
- [ ] Burn down repo-wide lint debt (remaining `no-explicit-any`, `react-hooks/set-state-in-effect`, unused vars).
- [ ] Add tighter domain types for dashboard and settings UI props currently loosely typed.
- [ ] Replace remaining non-optimized image tags with `next/image` where practical.
- [ ] Normalize minor style issues (`prefer-const`, small refactors) in untouched legacy files.
- [ ] Expand test coverage for API edge cases and webhook failure paths.
- [ ] Add automated pre-merge checks to block newly introduced `no-explicit-any` errors.

## 5. M11 decision needed (OAuth token encryption approach)
Decision required before final rollout of M11.

- Proposed options:
  1. Database-level encryption via Postgres/pgcrypto RPC wrappers (`encrypt_token` / `decrypt_token`).
  2. Application-layer envelope encryption (KMS-managed key + AES-GCM payloads).
  3. External secret store + token reference IDs in DB.

- Decision checklist:
  - [ ] Chosen encryption layer and key custody model.
  - [ ] Key rotation plan and blast-radius limits.
  - [ ] Backfill strategy for existing plaintext/encrypted token rows.
  - [ ] Runtime failure mode (fail closed vs retry queue) and alerting.
  - [ ] Rollout plan (feature flag, staged migration, rollback path).

Owner: __________
Target decision date: __________
