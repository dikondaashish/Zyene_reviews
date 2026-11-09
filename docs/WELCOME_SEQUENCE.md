# Marketing and product email policy

Updated 2026-11-09. We send as few emails as a professional company needs. Anything not on
this page should not be added without a clear reason.

**Related:** [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md) · [LEAD_NURTURE_QA_RUNBOOK.md](./LEAD_NURTURE_QA_RUNBOOK.md)

---

## Newsletter and lead-magnet sign-ups

1. Public form → `POST /api/marketing/newsletter/subscribe` → a single **"Confirm your email"** message (double opt-in).
2. On confirm (`/newsletter/confirm`): one email —
   - `review_request_templates` source → template pack email
   - other sources → `newsletterWelcomeEmail`
3. After that, only **Zyene Reviews Monthly** (`monthly-newsletter` cron), to confirmed, subscribed rows.

There is **no** follow-up nurture sequence. The former 3-email `marketing_nurture` sequence was
removed on 2026-11-09 because it repeated the welcome email.

## Product signups (trial)

| When | Email |
|------|-------|
| Signup | Welcome + connect Google (`welcome-email.ts`) |
| Trial checkout | "Your trial has started" (Stripe webhook) |
| +24 h | Day 2: Send your first review request |
| +7 days | Day 7: Review your plan and next steps |

The trial tips (`TRIAL_NURTURE_STEPS`) stop as soon as the organization's `plan_status` is `active`.

## Paying customers

Plan welcome at checkout, payment receipt on renewal, payment failed, subscription canceled,
and one "We miss you" email 14 days after canceling. The former 4-email post-purchase
`onboarding_drip` was removed on 2026-11-09.

## Product alerts (customers can switch these off in Settings → Notifications)

- New-review alerts: only urgent reviews (AI urgency ≥ 7) or 1–2 stars, on every platform
  (`isAlertWorthyReview`). Other reviews are in the weekly summary.
- Weekly review summary, competitor alerts, AI visibility (AEO) alerts and reports, reply approval.

## Retired rows

Old `growth_email_runs` rows with `sequence_key` `onboarding_drip` or `marketing_nurture` may
exist. They are history only; nothing schedules or reads them for sending.
