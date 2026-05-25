# Local SEO checklist lead magnet

Funnel for `/resources/local-seo-checklist` — parallel to the template pack, separate source and events.

**Related:** [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md) · [WELCOME_SEQUENCE.md](./WELCOME_SEQUENCE.md)

---

## Lead capture

| Field | Value |
|-------|-------|
| Source tag | `local_seo_checklist` |
| Page | `/resources/local-seo-checklist` |
| PDF | **No** — success copy emails a link to the on-page checklist only |
| Welcome email | Generic `newsletterWelcomeEmail` (not template pack email) |
| Marketing nurture | **Yes** for new leads (same 3-email sequence as other non–template-pack sources) |

---

## Events (`marketing_events`)

| Event | When |
|-------|------|
| `local_seo_checklist_view` | Page load (once per session) |
| `local_seo_checklist_form_view` | Lead section visible |
| `local_seo_checklist_submit` | Server: form POST accepted |
| `local_seo_checklist_subscribe_success` | Server: new or reactivated lead |
| `local_seo_checklist_signup_click` | Click `/signup` from page |
| `local_seo_checklist_pricing_click` | Click `/pricing` from page |

Client events: `POST /api/marketing/events/track` (whitelist). Server events: `processNewsletterSubscribe()`.

---

## Reporting

| Surface | Access |
|---------|--------|
| `/growth` KPI tab | Local SEO checklist section (counts + latest leads, no email in shared exports) |
| API | `GET /api/internal/marketing/local-seo-checklist-report?days=30` (growth dashboard auth) |

QA traffic excluded via `template-pack-qa-filters` (UTM/email patterns).

---

## QA test (one subscriber)

See [WELCOME_SEQUENCE.md](./WELCOME_SEQUENCE.md) § QA test plan — use `utm_medium=qa` and a `+local-seo-qa` email alias; confirm nurture does **not** run for QA UTMs.
