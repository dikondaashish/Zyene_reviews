# Phase 8 — Sales inbound routing (ops)

> **Goal:** Every enterprise lead from the product reaches a human owner quickly.

## Channels (live in product)

| Channel | URL / address | What happens |
|---------|----------------|--------------|
| **Cal.com** | [cal.com/zyene/30-min-meeting](https://cal.com/zyene/30-min-meeting) | Embedded on [zyenereviews.com/demo](https://zyenereviews.com/demo) |
| **Demo form** | `/demo` → `POST /api/marketing/demo-request` | Email to `DEMO_INBOUND_EMAIL` or `sales@zyenereviews.com`; lead in `marketing_subscribers` |
| **Enterprise page** | `/enterprise` | Links to demo + `sales@zyenereviews.com` |
| **Contact** | `/contact` | Enterprise card → demo + sales email |
| **Sales deck** | `docs/ENTERPRISE_SALES_DECK.md` | Send PDF/Notion export after first call |

## Assignment checklist

1. **Owner:** Assign primary inbox monitor for `sales@zyenereviews.com` (and `DEMO_INBOUND_EMAIL` if different).
2. **SLA:** Respond to demo form submissions within **1 business day** (auto-confirmation email already sent).
3. **Cal.com:** Connect team calendar to `zyene/30-min-meeting`; keep availability updated.
4. **CRM:** Copy `marketing_subscribers` with `source=demo_request` into your CRM weekly.
5. **Partnerships:** Route agency inquiries to `partners@zyenereviews.com` (separate from enterprise).

## Vercel env (optional overrides)

```bash
NEXT_PUBLIC_CAL_COM_EMBED_URL=https://cal.com/zyene/30-min-meeting?overlayCalendar=true
DEMO_INBOUND_EMAIL=sales@zyenereviews.com
```

Default Cal.com URL is baked into code if env is unset.
