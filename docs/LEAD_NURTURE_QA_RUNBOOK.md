# Lead & nurture QA runbook

Safe QA for template pack and local SEO checklist flows. **Never spam production marketing lists.**

**Related:** [WELCOME_SEQUENCE.md](./WELCOME_SEQUENCE.md) · [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md) · [LOCAL_SEO_CHECKLIST_LEAD_MAGNET.md](./LOCAL_SEO_CHECKLIST_LEAD_MAGNET.md)

---

## Environment

| Use | URL |
|-----|-----|
| Local | `http://localhost:3000` + Inngest dev + Resend test mode |
| Staging | Your preview URL only with test keys |
| Production | **Read-only checks only** (401 tests, `/growth` login) — avoid `--execute` |

```bash
# .env.local
QA_MARKETING_BASE_URL=http://localhost:3000
GROWTH_DASHBOARD_SECRET=...   # optional, for report API checks
```

---

## QA naming & exclusion

| Rule | Value |
|------|-------|
| Email prefix | `template-pack-prod-qa-<timestamp>@example.com` (script default) |
| UTM source | `qa` |
| UTM medium | `funnel_test` or `qa_test` |
| Nurture | **Skipped** for QA UTM and template pack source |
| Funnel reports | QA rows **excluded** from `/growth` counts |

Code: `src/lib/marketing/template-pack-qa-filters.ts`

---

## Automated helper

```bash
node scripts/qa-lead-magnet-flow.mjs           # dry-run (default)
node scripts/qa-lead-magnet-flow.mjs --execute  # live subscribe (QA email/UTM only)
```

Checks:

- Report APIs return **401** without auth
- Report APIs return JSON with `pageViews` when `GROWTH_DASHBOARD_SECRET` set
- Subscribe: `review_request_templates`, `local_seo_checklist`, duplicate submit

---

## Manual test matrix

| Step | Template pack | Local SEO checklist |
|------|---------------|---------------------|
| Page loads | `/resources/review-request-templates` | `/resources/local-seo-checklist` |
| Honest copy | No PDF; web swipe file | No PDF; email link to page |
| Submit new email | Pack email via Resend | Newsletter welcome |
| Nurture scheduled | **No** | **Yes** (if not QA UTM) |
| Duplicate submit | `Already subscribed`; submit event still logged | Same |
| Events | `template_pack_*` | `local_seo_checklist_*` |

---

## Resend verification

1. Resend dashboard → Logs after QA subscribe.
2. Template pack: subject/body from `reviewRequestTemplatePackEmail`.
3. Checklist: `newsletterWelcomeEmail` (not pack).
4. Nurture emails: only for non–template-pack, non-QA leads (`marketing_nurture_*` subjects in `growth-emails.ts`).

---

## Inngest verification

1. Run Inngest dev server with app (`pnpm dev`).
2. After checklist QA subscribe (non-QA UTM): event `growth/marketing-nurture.start`.
3. After template pack or QA UTM subscribe: **no** nurture event.
4. Function: `growth-marketing-nurture` in Inngest UI.

---

## Supabase verification SQL

Replace email with your QA address.

```sql
-- Latest subscriber row
SELECT email, source, utm_source, utm_medium, subscribed_at, unsubscribed_at
FROM marketing_subscribers
WHERE email LIKE 'template-pack-prod-qa%'
ORDER BY subscribed_at DESC
LIMIT 10;

-- Marketing events for checklist page
SELECT event_name, page_path, source, created_at
FROM marketing_events
WHERE page_path = '/resources/local-seo-checklist'
ORDER BY created_at DESC
LIMIT 20;

-- Nurture registration (should be empty for template pack / QA)
SELECT email, sequence_id, step_id, status, created_at
FROM growth_email_runs
WHERE email LIKE 'template-pack-prod-qa%'
ORDER BY created_at DESC;
```

---

## Cleanup SQL (after QA)

```sql
DELETE FROM marketing_events
WHERE utm_source = 'qa' OR utm_medium IN ('funnel_test', 'qa_test');

DELETE FROM growth_email_runs
WHERE email LIKE 'template-pack-prod-qa%';

DELETE FROM marketing_subscribers
WHERE email LIKE 'template-pack-prod-qa%';
```

Run only in dev/staging unless you are certain rows are QA-only.

---

## `/growth` checks (authenticated)

- [ ] Template pack section: views, submits, conversion, signup/pricing clicks
- [ ] Local SEO section: same metrics
- [ ] Latest submissions table: **no emails** on unauthenticated page
- [ ] Empty state: “No events recorded yet for this period” when zero traffic
- [ ] QA rows do not appear when using QA UTM (excluded server-side)

---

## Pass criteria

- All dry-run checks pass
- Execute tests only on local/staging
- Resend + Inngest behavior matches [WELCOME_SEQUENCE.md](./WELCOME_SEQUENCE.md) matrix
- Cleanup SQL run after QA
- No real customer emails used
