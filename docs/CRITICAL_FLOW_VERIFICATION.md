# Critical Flow Verification

This document defines the minimum pre-release verification pass for `app.zyenereviews.com`.

## Run command

```bash
pnpm verify:critical-flows
```

This command validates:
- required architecture files exist
- required runtime environment variables are present
- type safety (`tsc --noEmit`)
- production build health (`next build --no-lint`)

## Manual browser checklist

Run these in a logged-in session after the command succeeds.

1. **Auth boot**
   - Login and confirm dashboard loads with organization and business switcher.

2. **Business creation + context**
   - Add a business from `/businesses/add`.
   - Confirm it appears in the header switcher.
   - Switch to the new business and refresh once.

3. **Integrations context**
   - Open `/integrations`.
   - Confirm page resolves business context and does not show “No Business Found” when business exists.

4. **Team is business-scoped**
   - Open `/settings/team`.
   - Confirm member list is scoped to current active business.
   - Switch business in header and verify list changes.

5. **Invite acceptance**
   - Send invite from Team settings.
   - Accept invite through password login flow.
   - Confirm invited user appears only in target business team.

6. **Billing + limits**
   - Open `/settings/billing`.
   - Confirm current plan/usage and limits are consistent with active organization and business count.

## Release gate recommendation

A deployment should be treated as merge-ready only when:
- `pnpm verify:critical-flows` passes
- all manual flow steps above pass
- no high-severity Sentry errors appear during the smoke session
