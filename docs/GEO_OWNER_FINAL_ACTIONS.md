# GEO owner final actions

Single reference for **manual** GEO closeout work. Engineering cannot complete these without real credentials, posts, or customer data.

**Do not** mark steps complete until evidence exists (files, URLs, screenshots).

---

## 1. Google Search Console export (OAuth)

### Why OAuth

Search Console often returns **“email not found”** when adding a service account. Use a **Desktop OAuth client** and a Google account that already has property access.

### Google Cloud setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) → project **zyene-reviews** (or your GSC project).
2. **APIs & Services → Library** → enable **Google Search Console API**.
3. **Credentials → Create credentials → OAuth client ID**.
4. Application type: **Desktop app** → Create.
5. Copy **Client ID** and **Client secret** (or download JSON).

### `.env.local` (never commit)

```bash
# Prefer OAuth — unset service account if present:
# GOOGLE_APPLICATION_CREDENTIALS=

GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
# Or: GOOGLE_OAUTH_CLIENT_JSON=/absolute/path/to/client_secret_....json

# Optional:
# GOOGLE_OAUTH_REDIRECT_URI=http://localhost
# GSC_SITE_URL=https://www.zyenereviews.com/
```

### Run export

```bash
pnpm geo:gsc-baseline
```

If the URL-prefix property fails:

```bash
GSC_SITE_URL="sc-domain:zyenereviews.com" pnpm geo:gsc-baseline
```

First run opens a browser URL → sign in → paste `code` from redirect into the terminal. Token saves to `.cache/google-gsc-token.json` (gitignored).

### Outputs

| File | Purpose |
|------|---------|
| `reports/gsc/gsc-baseline-latest.json` | Full payload |
| `reports/gsc/gsc-top-queries-latest.csv` | Top 50 queries |
| `reports/gsc/gsc-top-pages-latest.csv` | Top 50 pages |
| `reports/gsc/gsc-query-page-latest.csv` | Top 100 query×page |
| `reports/gsc/GSC_BASELINE_SUMMARY.md` | Human summary |

### Copy into baseline doc

1. Open [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) §1–2 (or link to `GSC_BASELINE_SUMMARY.md`).
2. Paste top queries/pages or note “see `reports/gsc/`”.
3. Do **not** invent rows if export failed.

More detail: [GROWTH_OPERATIONS.md](./GROWTH_OPERATIONS.md).

---

## 2. AI citation baseline (manual)

### Platforms (5)

- ChatGPT  
- Perplexity  
- Gemini  
- Google AI Overview  
- Google Search (normal blue-link results)

### Queries (7)

1. best Birdeye alternative for restaurants  
2. Birdeye pricing alternatives  
3. best review management software for small businesses  
4. how to get more Google reviews  
5. Google review request templates  
6. negative feedback shield review management  
7. AI visibility audit for local businesses  

### Workflow

1. Use a **fresh** session / incognito per platform.
2. Run each query exactly as written.
3. Record in [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) §4a:

   | Field | What to record |
   |-------|----------------|
   | date checked | Today’s date |
   | platform | One of the five above |
   | query | Exact query text |
   | Zyene mentioned | Yes / No / Partial |
   | URL cited | Full URL if Zyene or zyenereviews.com appears |
   | competitor mentioned | Names cited (Birdeye, Podium, etc.) |
   | screenshot/file link | Path under `reports/ai-citations/` (gitignored) |
   | notes | Session model, date, quirks |

4. Save screenshots locally (optional folder: `reports/ai-citations/`).
5. Do **not** mark baseline complete until all 35 rows (7×5) are filled with real checks.

---

## 3. Lead / nurture QA

See [LEAD_NURTURE_QA_RUNBOOK.md](./LEAD_NURTURE_QA_RUNBOOK.md).

Quick commands:

```bash
node scripts/qa-lead-magnet-flow.mjs           # dry-run
node scripts/qa-lead-magnet-flow.mjs --execute   # staging/local only
```

---

## 4. `/growth` dashboard

1. Set `GROWTH_DASHBOARD_SECRET` in Vercel Production (if not set).
2. Open `https://www.zyenereviews.com/growth` → enter password.
3. Confirm **Template pack** and **Local SEO checklist** sections.
4. Confirm empty states when no events (no errors).
5. Confirm subscriber table does **not** show on the public gate page.

---

## 5. Distribution (Week 1)

See [GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md](./GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md).  
Track URLs in [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md).

---

## 6. First weekly report

```bash
pnpm geo:gsc-baseline    # when OAuth ready
pnpm geo:weekly-report   # creates reports/geo-weekly/week-<date>.md
```

Fill remaining `_Pending_` fields with real numbers only.

---

## 7. External profiles & proof

- Profiles: [GEO_EXTERNAL_PROFILE_CHECKLIST.md](./GEO_EXTERNAL_PROFILE_CHECKLIST.md)  
- Proof collection: [GEO_PROOF_COLLECTION_RUNBOOK.md](./GEO_PROOF_COLLECTION_RUNBOOK.md)  
- Benchmark page: **blocked** — [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md)

---

## One-page checklist

Use [GEO_OWNER_FINAL_CHECKLIST.md](./GEO_OWNER_FINAL_CHECKLIST.md) for a single ordered list.
