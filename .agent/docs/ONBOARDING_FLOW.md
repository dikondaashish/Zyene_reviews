# Onboarding flow (current)

## URLs

- **Landing**: `https://www.zyenereviews.com` (or root domain)
- **Log In**: `https://auth.zyenereviews.com/login`
- **Start Free Trial**: `https://auth.zyenereviews.com/signup`
- **After new signup**: `https://app.zyenereviews.com/onboarding`
- **After onboarding**: `https://app.zyenereviews.com/` (dashboard)

## Production env

Set in production (e.g. Vercel):

- `NEXT_PUBLIC_ROOT_DOMAIN=zyenereviews.com` (no `www.`)
- `NEXT_PUBLIC_APP_URL=https://app.zyenereviews.com`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – required for Google connect during Business step (Google Cloud OAuth client ID for the app origin). If missing, users see a friendly error instead of Google’s `invalid_request`.

Marketing layout uses `auth.${NEXT_PUBLIC_ROOT_DOMAIN}` for login/signup links. Auth callback redirects new users to `app.${NEXT_PUBLIC_ROOT_DOMAIN}/onboarding`.

## Onboarding steps (`src/app/onboarding/`)

Source of truth: `src/app/onboarding/onboarding-types.ts` (`ONBOARDING_STEP` ids, `ONBOARDING_PHASES` labels).
Step ids are what `users.onboarding_step` stores; new steps took new ids so saved progress keeps its meaning.

Owners see five phases: **Connect → Your results → Plan → Automate → All set**.

| Phase | Step id | What happens |
|-------|---------|--------------|
| Connect | 1 | Workspace name. **Skipped**: a stored 0 or 1 opens step 2, and the signup default "<Name>'s Org" is renamed to the business name when step 3 is saved (`services/onboarding/name-default-workspace.ts`). A name the owner chose is never changed. |
| Connect | 2 | Business. Connect Google (searchable list once there are 6+ locations) or enter details by hand. |
| Connect | 3 | Industry (pre-filled from the Google category) and support email. Saves step 6 with Google, else 4. |
| Your results | 6 | Google only. The owner's real rating, review count, unanswered and unhappy (1–2★, unanswered) counts, plus up to 3 unhappy reviews. Polls while the first import runs. Same definitions as the dashboard (`lib/reviews/unanswered-reviews.ts`). |
| Plan | 4 | Plan and Stripe checkout, or "Explore free" (goes to 5). |
| Automate | 7 | After a successful checkout. "Skip for now" always moves on, and "Check again" re-checks a plan the Stripe webhook has not switched on yet. One choice writes reply rules for all five ratings via `PUT /api/settings/reply-rules`: auto-post 4–5★ and approve 1–3★ (Growth+ only), approve everything, or reply myself. Ends with a "Zyene will now" list. Waits briefly for the Stripe webhook to switch the plan on. |
| All set | 5 | Completes onboarding and opens `/dashboard?welcome=1`. There a one-time welcome takes over: a "Great work" pop-up and five short slides (review link with copy, ask past customers, replies with the owner's real reply rules, what to expect). The last slide offers the spotlight tour ("Show me around") or the dashboard. The tour does not start by itself on that visit, and the milestone pop-up is held back. |

Every onboarding screen has a **Get help** button (bottom left, from `app/onboarding/layout.tsx`): a help article for the current step, an email to support@zyenereviews.com with the step in the subject, and the help centre. Step-to-article map: `src/lib/onboarding/onboarding-help.ts`.

New accounts are on plan `none`, which has no AI drafts or auto-replies, so nothing that needs a plan is offered before the Plan step.

Notification preferences are configured under **Settings → Notifications** after onboarding (not a dedicated onboarding step in the current UI).

## Code locations

- UI: `src/app/onboarding/` (`page.tsx`, `page-client.tsx`, step components)
- Server actions: `src/app/actions/onboarding/`
- Types/steps: `src/app/onboarding/onboarding-types.ts`

## Supabase (existing schema)

Flow uses (among others):

- **users**: `onboarding_completed`, `onboarding_step`
- **organizations**: `name`, `slug`, plan/billing fields
- **businesses**: `name`, `slug`, address fields, `category`, …
- **review_platforms**: Google (and other) OAuth tokens when connected
- **notification_preferences**: post-onboarding settings

Auth callback creates **one organization** and **one business** for new signups; later steps update those rows and billing state.

## Historical notes

- Older 4-step / 2-step proposals are **not** current. Historical notes: `docs/ROADMAP.md`.
