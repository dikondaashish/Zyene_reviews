---
canonical: https://www.zyenereviews.com/resources/review-request-templates
week: 1
campaign: template-pack-launch
---

# Template pack — Week 1 launch (publish-ready)

**Playbook:** [docs/PHASE3_DISTRIBUTION_PACKAGE.md](../../docs/PHASE3_DISTRIBUTION_PACKAGE.md)  
**Source copy:** [review-request-templates.md](./review-request-templates.md)

## UTM destination URLs

| Channel | URL |
|---------|-----|
| **LinkedIn** | https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch |
| **Email** | https://www.zyenereviews.com/resources/review-request-templates?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch |
| **Threads / X** | https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch |

**Trial CTA (email):** https://www.zyenereviews.com/signup?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch  
**Product CTA (LinkedIn day 7 optional):** https://www.zyenereviews.com/features/review-collection?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

---

## Week 1 posting schedule

| Day | Channel | Asset | Section below |
|-----|---------|-------|----------------|
| **Day 1** (Mon) | LinkedIn — **founder profile** | Founder announcement | [Founder announcement](#founder-announcement-day-1) |
| **Day 2** (Tue) | Threads / X | Short hook post | [Threads/X post 1](#threadsx-post-1-day-2) |
| **Day 3** (Wed) | LinkedIn — company page | Practical templates | [LinkedIn post 2](#linkedin-post-2-day-3) |
| **Day 4** (Thu) | Email newsletter | Dedicated send | [Email](#email-day-4) |
| **Day 5** (Fri) | LinkedIn — company page | Compliance + pack intro | [LinkedIn post 1](#linkedin-post-1-day-5) |
| **Day 6 or 7** (Sat/Sun) | Threads / X | Reminder | [Threads/X post 3](#threadsx-post-3-day-67) |

**Optional Day 7 (LinkedIn company):** Manual vs automate angle → [LinkedIn post 3](#linkedin-post-3-optional-day-7)

**Not scheduled in Week 1 (hold for Week 2 or boost):** [Threads/X post 2](#threadsx-post-2-hold)

---

## Tracking checklist

### Before you post (once)

- [ ] **Page loads:** Open the LinkedIn UTM URL in an incognito window → `/resources/review-request-templates` renders (200).
- [ ] **Form submits:** Submit a test email with `utm_source=qa` / `utm_medium=funnel_test` (or delete QA rows after) — confirm `{ "ok": true }` from `POST /api/marketing/newsletter/subscribe`.
- [ ] **Email delivery:** Confirm Resend sends **“Your Review Request Template Pack”** for a new lead (`newLead: true`); duplicate active email does not resend.
- [ ] **UTM cookie:** Land with LinkedIn UTM, then submit — verify `marketing_subscribers` or events show `utm_source=linkedin`, `utm_campaign=template-pack-launch`.

### After Week 1 posts (within 24–48h of Day 7)

- [ ] **Report API** (7-day window):

```bash
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://www.zyenereviews.com/api/internal/marketing/template-pack-report?days=7" | jq
```

- [ ] **`pageViews`** — `template_pack_view` from social/email landings
- [ ] **`submissions`** — form submits
- [ ] **`subscribeSuccesses`** — new/reactivated leads
- [ ] **`conversionRatePercent`** — successes ÷ views (null if no views)
- [ ] **`signupClicks`** — clicks to `/signup` from pack page
- [ ] **`pricingClicks`** — clicks to `/pricing` from pack page
- [ ] **UTM breakdown** — in `latestSubmissions` and SQL:

```sql
SELECT utm_source, utm_medium, utm_campaign, COUNT(*) AS leads
FROM marketing_subscribers
WHERE source = 'review_request_templates'
  AND subscribed_at >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2, 3
ORDER BY leads DESC;
```

- [ ] **QA excluded:** `excludesQaTraffic: true` in report; no `template-pack-prod-qa-*` in `latestSubmissions` for production metrics.

Full reference: [docs/TEMPLATE_PACK_LEAD_MAGNET.md](../../docs/TEMPLATE_PACK_LEAD_MAGNET.md)

---

## Copy-paste launch posts

Replace `{first_name}` and `{sender_name}` in email only.

---

### Founder announcement (Day 1)

We just shipped something small but useful: a **free review request template pack**—a web swipe file with 20+ SMS and email scripts local businesses can copy today.

It’s ungated on the page (no PDF download). If you want a link in your inbox, there’s optional email capture.

We built it because owners kept asking for exact wording—not another platform pitch. When you’re ready to automate fair campaigns, that’s what Zyene Reviews is for.

**Compliance matters to us:** no review incentives, and don’t only ask happy customers for public reviews.

Take the scripts: https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

---

### Threads/X post 1 (Day 2)

Free web swipe file: 20+ SMS & email scripts for honest Google review requests (restaurant, dental, HVAC, salon + reminders).

No PDF—live page you can copy from.

No incentives. Same ask for every customer.

https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

---

### LinkedIn post 2 (Day 3)

“Can you leave us a Google review?” is the hardest 12 words in local marketing.

Our new **review request template pack** includes:

- Short SMS asks (under 160 characters)
- Email subject lines + bodies
- Restaurant, dental, HVAC, and salon variants
- Reminder and thank-you follow-ups

It’s a **web swipe file** on Zyene Reviews—preview and copy on the page. Optional email sends you back to the same URL (no download attachment).

Same rules we recommend to customers: **no review incentives**, and **no happy-customer-only** review routing.

https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

---

### Email (Day 4)

**Subject line:** Free review request scripts for your inbox (web swipe file)

**Preview text:** Web template pack—no PDF. Compliance-friendly scripts for SMS and email.

**Body:**

Hi {first_name},

Most owners I talk to don’t need another “reputation” lecture—they need **exact words** for SMS and email when they ask for a Google review.

We put together a **free web swipe file** on Zyene Reviews:

- 20+ copy-paste templates (restaurants, dental, home services, salons, and more)
- Reminder and thank-you follow-ups
- Short compliance notes on each section

**How to use it:** open the page, copy the scripts, replace `[Name]` and `[Business Name]`, and send. Optional email capture sends you a link back to the same page—we’re **not** attaching a PDF.

**Please follow the same rules we recommend:**

- **No incentives** for leaving a review
- **No happy-customer-only** routing—ask customers the same way; handle issues in private feedback, not by hiding them from Google

**Open the template pack →** https://www.zyenereviews.com/resources/review-request-templates?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch

When manual copy-paste stops scaling, Zyene Reviews can run the same outreach as campaigns—with alerts, AI-assisted replies, and Shield for early private feedback.

**Start a 7-day trial →** https://www.zyenereviews.com/signup?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch

— {sender_name}
Zyene Reviews

---

### LinkedIn post 1 (Day 5)

Most local businesses still wing review requests in the inbox—different tone every time, easy to sound pushy, and hard to stay compliant.

We published a **free web swipe file**: 20+ SMS and email scripts for restaurants, dental, home services, salons, reminders, thank-yous, and private follow-ups.

Copy what you need on the page. No PDF—just the live template pack.

**Compliance note:** No incentives for reviews. Ask every customer the same way—don’t route only happy customers to Google.

👉 https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

#LocalBusiness #GoogleReviews #ReputationManagement

---

### Threads/X post 3 (Day 6–7)

Stop rewriting the same review text in your inbox.

Copy-paste scripts: https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

When you outgrow manual sends → Zyene Reviews campaigns + Shield for private feedback (not review gating).

---

### LinkedIn post 3 (optional Day 7)

If you’re still pasting review requests from Notes app → SMS → email, you’re not alone.

Start with our **free template pack** (web swipe file) to standardize outreach today.

When copy-paste doesn’t scale, Zyene Reviews runs SMS/email campaigns, tracks opens, and keeps requests fair—with Negative Feedback Shield for private issues before they hit Google.

Grab the scripts: https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

Explore product: https://www.zyenereviews.com/features/review-collection?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

---

### Threads/X post 2 (hold)

“Leave us a review?” templates that don’t sound desperate:

→ Short SMS
→ Email bodies
→ Thank-you + reminder lines

Template pack (web): https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

---

## Quick reference — all copy blocks

### LinkedIn post 1

Most local businesses still wing review requests in the inbox—different tone every time, easy to sound pushy, and hard to stay compliant.

We published a **free web swipe file**: 20+ SMS and email scripts for restaurants, dental, home services, salons, reminders, thank-yous, and private follow-ups.

Copy what you need on the page. No PDF—just the live template pack.

**Compliance note:** No incentives for reviews. Ask every customer the same way—don’t route only happy customers to Google.

👉 https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

#LocalBusiness #GoogleReviews #ReputationManagement

### LinkedIn post 2

“Can you leave us a Google review?” is the hardest 12 words in local marketing.

Our new **review request template pack** includes:

- Short SMS asks (under 160 characters)
- Email subject lines + bodies
- Restaurant, dental, HVAC, and salon variants
- Reminder and thank-you follow-ups

It’s a **web swipe file** on Zyene Reviews—preview and copy on the page. Optional email sends you back to the same URL (no download attachment).

Same rules we recommend to customers: **no review incentives**, and **no happy-customer-only** review routing.

https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

### LinkedIn post 3

If you’re still pasting review requests from Notes app → SMS → email, you’re not alone.

Start with our **free template pack** (web swipe file) to standardize outreach today.

When copy-paste doesn’t scale, Zyene Reviews runs SMS/email campaigns, tracks opens, and keeps requests fair—with Negative Feedback Shield for private issues before they hit Google.

Grab the scripts: https://www.zyenereviews.com/resources/review-request-templates?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

Explore product: https://www.zyenereviews.com/features/review-collection?utm_source=linkedin&utm_medium=social&utm_campaign=template-pack-launch

### Threads/X post 1

Free web swipe file: 20+ SMS & email scripts for honest Google review requests (restaurant, dental, HVAC, salon + reminders).

No PDF—live page you can copy from.

No incentives. Same ask for every customer.

https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

### Threads/X post 2

“Leave us a review?” templates that don’t sound desperate:

→ Short SMS
→ Email bodies
→ Thank-you + reminder lines

Template pack (web): https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

### Threads/X post 3

Stop rewriting the same review text in your inbox.

Copy-paste scripts: https://www.zyenereviews.com/resources/review-request-templates?utm_source=threads&utm_medium=social&utm_campaign=template-pack-launch

When you outgrow manual sends → Zyene Reviews campaigns + Shield for private feedback (not review gating).

### Email subject line

Free review request scripts for your inbox (web swipe file)

### Email preview text

Web template pack—no PDF. Compliance-friendly scripts for SMS and email.

### Email body

Hi {first_name},

Most owners I talk to don’t need another “reputation” lecture—they need **exact words** for SMS and email when they ask for a Google review.

We put together a **free web swipe file** on Zyene Reviews:

- 20+ copy-paste templates (restaurants, dental, home services, salons, and more)
- Reminder and thank-you follow-ups
- Short compliance notes on each section

**How to use it:** open the page, copy the scripts, replace `[Name]` and `[Business Name]`, and send. Optional email capture sends you a link back to the same page—we’re **not** attaching a PDF.

**Please follow the same rules we recommend:**

- **No incentives** for leaving a review
- **No happy-customer-only** routing—ask customers the same way; handle issues in private feedback, not by hiding them from Google

**Open the template pack →** https://www.zyenereviews.com/resources/review-request-templates?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch

When manual copy-paste stops scaling, Zyene Reviews can run the same outreach as campaigns—with alerts, AI-assisted replies, and Shield for early private feedback.

**Start a 7-day trial →** https://www.zyenereviews.com/signup?utm_source=email&utm_medium=email&utm_campaign=template-pack-launch

— {sender_name}
Zyene Reviews
