# Marketing welcome nurture sequence

Three-email Inngest sequence for **new marketing leads** (newsletter, local SEO checklist, etc.). Separate from trial nurture (product signup) and template pack instant email.

**Related:** [TEMPLATE_PACK_LEAD_MAGNET.md](./TEMPLATE_PACK_LEAD_MAGNET.md) · [GEO_WIN_PLAYBOOK.md](./GEO_WIN_PLAYBOOK.md)

---

## Emails

| Step | Timing | Subject focus | CTA |
|------|--------|---------------|-----|
| `marketing_nurture_day0_guide` | +4 hours after subscribe | Best free guides (templates + checklist) | `/resources/review-request-templates` |
| `marketing_nurture_day2_shield` | +48 hours | Negative Feedback Shield explainer | `/blog/negative-feedback-shield` |
| `marketing_nurture_day5_trial` | +120 hours | Trial + pricing | `/signup` |

Definitions: `src/lib/phase6/email-sequences-data.ts` (`MARKETING_NURTURE_STEPS`).  
Templates: `marketingNurtureEmail()` in `src/services/resend/templates/growth-emails.ts`.

---

## Trigger logic

1. User submits email on a marketing form (`POST /api/marketing/newsletter/subscribe`).
2. `processNewsletterSubscribe()` inserts or reactivates subscriber; `newLead === true`.
3. Immediate email:
   - `review_request_templates` source → template pack email
   - Other sources → `newsletterWelcomeEmail`
4. If `newLead` and source is **not** template pack and email is **not** QA-filtered → `scheduleMarketingNurture({ email })`.
5. Inngest event `growth/marketing-nurture.start` runs `marketingNurtureWorker`.

**Guards**

- Existing subscribers (`newLead: false`) do not get the sequence.
- Template pack leads skip nurture (they already receive the pack email).
- QA UTM/email patterns (`template-pack-qa-filters`) skip nurture.
- `growth_email_runs` unique constraint prevents duplicate sequence registration per email.

---

## Compliance language

- Nurture copy does not promise AI Overview placement, review removal, or Google endorsement of Shield.
- Shield email links to the compliance-focused blog post.
- Template pack / checklist forms surface fair-outreach bullets on the page.

---

## Operations

| Task | How |
|------|-----|
| Verify worker registered | Inngest dashboard → Functions → `growth-marketing-nurture` |
| Test locally | Inngest dev server + subscribe with test email (non-QA UTM) |
| Pause sequence | Disable function in Inngest or remove `scheduleMarketingNurture` call |

---

## Future automation

- Branch day-0 CTA by `source` (checklist vs generic newsletter).
- Unsubscribe link in nurture emails (welcome already includes unsubscribe).
- Metrics in `/growth` from `growth_email_runs` status.
