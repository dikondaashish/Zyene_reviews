# Onboarding flow (aligned with product spec)

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
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – required for “Connect with Google” on Step 2 (Google Cloud OAuth client ID for the app origin). If missing, users see a friendly error instead of Google’s “invalid_request”.

Marketing layout uses `auth.${NEXT_PUBLIC_ROOT_DOMAIN}` for login/signup links. Auth callback redirects new users to `app.${NEXT_PUBLIC_ROOT_DOMAIN}/onboarding`.

## Onboarding steps (app.zyenereviews.com/onboarding)

1. **Step 1 – Organization name**  
   Single field: organization name. Saves and advances to step 2.

2. **Step 2 – Business name & first location**  
   - Manual: Business name, Address, City, State, Phone.  
   - Optional: **Connect with Google** to auto-fill from Google Business Profile (name + address, city, state).  
   - User can edit after connecting. Next or Skip.

3. **Step 3 – Category selection**  
   Dropdown: Restaurant, Coffee, Salon, Dental, Gym, Spa, Hotel, Retail, Automotive, Healthcare, Other. Saves and advances.

4. **Step 4 – Notifications → Confetti → Dashboard**  
   - Form: Email alerts (frequency), SMS alerts (phone), “Alert me for reviews rated” (1–3 stars).  
   - On **Save & finish**: saves notification preferences, marks onboarding complete, fires confetti, shows completion screen.  
   - Completion screen: “Go to dashboard” (and optional status items). Redirect to dashboard.

## Supabase (existing schema)

No new migrations required. Flow uses:

- **users**: `onboarding_completed`, `onboarding_step` (migration `20260312_add_onboarding_step.sql`)
- **organizations**: `name`, `slug`
- **businesses**: `name`, `slug`, `address_line1`, `city`, `state`, `phone`, `category`
- **review_platforms**: Google OAuth tokens; onboarding can update business from first location
- **notification_preferences**: `email_enabled`, `email_frequency`, `sms_enabled`, `sms_phone_number`, `min_rating_threshold` (migration `20260313_add_notification_settings.sql`)

Auth callback creates **one organization** and **one business** for new signups; onboarding step 1 updates org name, step 2 updates that business (and optionally connects Google).
