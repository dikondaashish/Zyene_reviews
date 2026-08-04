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

Definitions: `src/lib/campaign-content/email-sequences-data.ts` (`MARKETING_NURTURE_STEPS`).  
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

## Lead source matrix

| `source` | Immediate email | Marketing nurture (3-email) |
|----------|-----------------|------------------------------|
| `review_request_templates` | Template pack email | **Skipped** |
| `local_seo_checklist` | Newsletter welcome | **Yes** (new leads only) |
| `newsletter` / other | Newsletter welcome | **Yes** (new leads only) |
| QA UTM/email patterns | Per source above | **Skipped** |

Template pack and checklist are **not** duplicate sequences: pack skips nurture; checklist uses welcome + nurture.

---

## QA test plan (one subscriber — do not use production list)

**Goal:** Verify one new lead gets welcome + nurture scheduling without emailing real customers.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Use **staging/local** with Inngest dev + Resend test mode (or mail catcher) | No mail to real users |
| 2 | Subscribe with test email e.g. `you+marketing-qa@yourdomain.com` and UTM `utm_medium=qa` (see `template-pack-qa-filters`) | `newLead: true`, **no** `growth/marketing-nurture.start` |
| 3 | Subscribe with `you+marketing-nurture-qa@yourdomain.com`, source `newsletter`, **no** QA UTM | Welcome sent; Inngest shows `growth-marketing-nurture` scheduled |
| 4 | Repeat with source `local_seo_checklist` on `/resources/local-seo-checklist` | Welcome only (not pack email); nurture scheduled; events `local_seo_checklist_submit` + `local_seo_checklist_subscribe_success` in DB |
| 5 | Re-submit same email | `newLead: false`; no second nurture registration (`growth_email_runs` unique) |
| 6 | Submit template pack source | Pack email; **no** nurture worker |

**Do not** invent open/click metrics. Record pass/fail in ops notes only.

---

## Future automation

- Branch day-0 CTA by `source` (checklist vs generic newsletter).
- Unsubscribe link in nurture emails (welcome already includes unsubscribe).
- Metrics in `/growth` from `growth_email_runs` status.
