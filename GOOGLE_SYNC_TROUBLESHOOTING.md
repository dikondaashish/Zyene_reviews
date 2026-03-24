# Google review sync: 403 Forbidden / “Failed to start sync”

When **POST `/api/sync/google`** returns **500** (or the UI shows “Failed to start sync”), server logs often show:

```text
Failed to list reviews: 403 Forbidden
```

That means the access token is accepted by Google, but **Google refuses to return reviews** for that request. Fix it in **Google Cloud Console** and OAuth setup—not in application code alone.

## 1. Enable the right APIs (same project as your OAuth client)

In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Library**, enable at least:

- **Google My Business API** (legacy name; powers `mybusiness.googleapis.com/v4/.../reviews`)
- **My Business Account Management API** (accounts)
- **My Business Business Information API** (locations)

If any of these are disabled, calls can return **403**.

## 2. OAuth scope: `business.manage`

Users must connect Google with:

`https://www.googleapis.com/auth/business.manage`

That is already requested in:

- Supabase **Connect Google** (`google-connect-button`, `google-card`, businesses add flow)

If someone only signed in with **email/profile** and never completed **Connect Google** with the full scope, sync can fail. **Reconnect** from **Integrations** after enabling APIs.

## 3. Same OAuth client for refresh and login

Token refresh uses:

- `GOOGLE_CLIENT_ID` **or** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (fallback)
- `GOOGLE_CLIENT_SECRET`

Set **`GOOGLE_CLIENT_ID`** to the **same** OAuth 2.0 Client ID string as **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`** in production so refresh tokens match the client that issued them.

## 4. OAuth consent screen

For **sensitive** scopes, Google may require:

- App in **Testing** with test users added, or  
- **Production** + verification for `business.manage`

Until then, only added test users can grant the scope.

## 5. Verify redirect URIs

Ensure authorized redirect URIs include your app and auth URLs (e.g. `https://app.zyenereviews.com/...`, Supabase/auth callback URLs).

---

After changing APIs or scopes, **disconnect and reconnect** Google in the app, then try **Sync** again.
