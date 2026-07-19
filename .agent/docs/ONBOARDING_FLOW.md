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

Source of truth for step labels: `src/app/onboarding/onboarding-types.ts` (`ONBOARDING_STEPS`).

1. **Organization**  
   Organization name. Creates/updates org, advances to Business.

2. **Business**  
   Business name and location fields (address, city, state, phone).  
   Optional: Connect with Google Business Profile to auto-fill.  
   User can edit after connecting. Next or skip Google.

3. **Category**  
   Industry category (Restaurant, Coffee, Salon, Dental, Gym, Spa, Hotel, Retail, Automotive, Healthcare, Other, etc.). Saves and advances.

4. **Plan**  
   Plan selection and Stripe checkout / trial path. Advances when billing step completes.

5. **All Set**  
   Completion screen, then redirect to dashboard.

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
