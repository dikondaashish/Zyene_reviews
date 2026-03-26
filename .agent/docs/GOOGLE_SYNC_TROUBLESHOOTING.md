# Google review sync: 403, quota, and API access

When **POST `/api/sync/google`** fails, check Vercel logs for the JSON body from Google.

---

## Why you don’t see one “Google My Business API” in search

Google **split** the old monolithic Business Profile stack into **separate APIs** in the Library (Account Management, Business Information, Notifications, etc.). The **legacy Reviews v4** endpoint your app calls is still:

`https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`

That hostname maps to the **`mybusiness.googleapis.com`** product. In Console you enable it via the **direct link** Google puts in the error (or search **“Google My Business API”** — it may appear under the old name). Enabling that is what fixes **`SERVICE_DISABLED`** for that service.

**Also enable** (same Google Cloud project as your OAuth client):

| API | Role |
|-----|------|
| **My Business Account Management API** | Accounts / hierarchy |
| **My Business Business Information API** | Locations |
| **Google My Business API** (`mybusiness.googleapis.com`) | **Reviews v4** list/reply (use activation URL from logs if Library search is confusing) |

---

## Fix: `SERVICE_DISABLED` / “has not been used… or it is disabled”

1. Open the **activation URL** from the log, e.g.  
   `https://console.developers.google.com/apis/api/mybusiness.googleapis.com/overview?project=YOUR_PROJECT_ID`
2. Click **Enable**.
3. Enable the **Account Management** and **Business Information** APIs in the same project.
4. Wait **2–5 minutes**, then try **Sync** again.

---

## After enabling: quota **0** or “request GBP API access”

Google’s Library text says: *“If you have a quota of 0 after enabling the API, please request for GBP API access.”*

That is **separate** from clicking Enable. Many projects must **apply** for Business Profile API access:

1. Read prerequisites: [Google Business Profile APIs — prerequisites & access](https://developers.google.com/my-business/content/prereqs)
2. Submit Google’s **access request** with your use case (e.g. review sync for a SaaS dashboard), expected traffic, and OAuth consent details.
3. Approval can take **days to a couple of weeks**. Until then, APIs may return **403** or **429** with quota-related messages.

The app surfaces these as **`GOOGLE_GBP_ACCESS_PENDING`** when the error text matches quota/access patterns—check the toast and API `details`.

---

## OAuth scope: `business.manage`

Users must **Connect Google** with:

`https://www.googleapis.com/auth/business.manage`

(sign-in with email only is not enough.) Reconnect from **Integrations** after APIs and access are sorted.

---

## Same OAuth client for token refresh

Set **`GOOGLE_CLIENT_ID`** = same value as **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`**, and **`GOOGLE_CLIENT_SECRET`**, in Vercel.

---

## OAuth consent screen

For production + sensitive scopes, Google may require app verification or test users on the consent screen.

---

## Redirect URIs

Authorized redirect URIs must include your app and auth callbacks (e.g. `https://app.zyenereviews.com/...`).

---

After Google approves access and quotas are non-zero, **Sync** should work without further app code changes for that flow.
