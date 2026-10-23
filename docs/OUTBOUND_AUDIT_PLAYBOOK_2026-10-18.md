# Outbound 30-day plan: free reputation audit, one vertical (2026-10-18)

**Goal:** prove or kill one outbound motion in 30 days with a single vertical and a single metro. Success is a repeatable path from cold email to paid trial, not volume.

> **Evidence caveat.** Web research found no published conversion benchmarks for audit-led outbound to local businesses. Every number below marked *(assumption)* is a planning figure to be replaced with your own data by Day 14.

## 1. Decisions to make on Day 1

| Decision | Recommendation | Why |
|---|---|---|
| Vertical | **HVAC** (`/industries/hvac` already live) | Owner-operators who answer their own phone. One booked job is worth $300 to $10k, so a few extra reviews pay for the software many times over. Review count visibly drives who gets the call. Price gap vs NiceJob ($75/mo Starter per `SEO_COMPETITOR_GAP_REPORT_2026-10-16.md`) is large. |
| Fallback verticals | Plumbing, then auto repair (both have pages) | Same buyer, same pitch. |
| Metro | One mid-size metro, 300 to 400 HVAC companies | Local competitors make the audit personal ("you have 38 reviews, the top three have 210"). Pick where someone on the team can also call. |
| Offer | Free audit, then "I'll set up your first review campaign for you" | Done-for-you onboarding removes the biggest trial killer. |

**Known weakness to say out loud internally:** the HVAC buyer's stack is Jobber / Housecall Pro / ServiceTitan, and Zyene has no POS or field-service integrations (`GROWTH_BLUEPRINT.md` header: not shipped). The pitch must lean on CSV import and a manual first campaign, and you should log every prospect who objects on this. That count decides whether an integration is worth building.

## 2. The hook: a competitor-gap audit, not a score

The public checker (`/tools/reputation-score-checker`) only returns rating and review count and says it cannot measure response coverage. On its own that is weak. A stronger hook is computable from the same public Places data the repo already uses (`src/lib/free-tools/places-public.ts`):

1. Prospect rating and review count.
2. Top 3 competitors in the same metro and category by review count.
3. Reviews needed to match the median of the top 3, at a typical pace of N requests per week.
4. Date of the most recent review (stale profiles are the most receptive).

Build this as a script under `scripts/` that takes a list of `place_id`s and writes one CSV row per prospect with the four numbers and a 2-line summary. No new product surface needed for the test. Only if replies exceed target (Section 6) should it become a hosted page.

Check Google Maps Platform terms on caching and storing Places data before you store anything beyond `place_id`.

## 3. Compliance guardrails (non-negotiable)

- **Email, not SMS.** Cold SMS to owners carries TCPA exposure. Use email, plus phone calls to business lines checked against the DNC list.
- **CAN-SPAM:** truthful sender and subject, physical postal address, working one-click opt-out, honor opt-outs within 10 days. B2B is not exempt.
- **Separate sending domain** (not `zyenereviews.com`) so cold-email reputation cannot hurt transactional mail (Supabase auth, Resend receipts).
- **Keep prospects out of `marketing_subscribers`.** That table feeds the newsletter and nurture sequences. Cold prospects have not consented. Use a sheet or a separate CRM.
- **Do not lead with the Negative Feedback Shield.** Google prohibits review gating and the gap report already flags this as unresolved (`SEO_COMPETITOR_GAP_REPORT_2026-10-16.md`, footnote 2). Lead with getting more reviews and answering them faster.

## 4. The calendar

### Week 1 (Days 1 to 7): set up, send nothing yet

| Day | Work |
|---|---|
| 1 | Pick metro. Buy sending domain and 2 mailboxes. Start warm-up now; it takes about 2 to 3 weeks, which is why sending starts Day 10. |
| 2 to 3 | Build the prospect list: pull HVAC businesses for the metro via the Places API, keep `place_id`, name, website, phone. Target 300 to 400. |
| 3 to 4 | Find owner name and email from each website. Drop anyone without a findable owner email into a **call-only** list. |
| 4 to 5 | Write and run the audit script. Spot-check 10 audits by hand against Google Maps. |
| 6 to 7 | Write the three-email sequence (Section 5). Set up reply tracking and a one-page pipeline sheet: sent, opened, replied, audit sent, trial, paid. |

### Week 2 (Days 8 to 14): soft launch

- Day 8 to 10: confirm warm-up health (inbox placement test to your own accounts).
- Day 10: send **Touch 1 to 40 prospects**, 20 per mailbox per day max.
- Day 13: Touch 2 to the first 40. Send Touch 1 to the next 40.
- Calls: phone every non-opener from the first 40 on Day 12 to 14. Script: "I emailed you a note about how your Google reviews compare with three HVAC companies near you. Want me to send it over?"
- **Day 14 gate:** read replies. If fewer than 2 positive replies from 80 touches *(assumption)*, change the subject line and opener before scaling, do not scale a dead message.

### Week 3 (Days 15 to 21): scale to full list and close the first trials

- Send Touch 1 to the remaining ~200 prospects across the week, Touch 2 and 3 to earlier batches.
- Every positive reply gets the full audit same day, then a 15-minute call using the existing Cal.com link (`PHASE8_SALES_INBOUND.md`).
- On the call: get 20 recent customers (name plus phone or email) as a CSV, import it, send the first campaign **for them**, and start the trial. Record how long this takes; it is your real onboarding cost.

### Week 4 (Days 22 to 30): follow up and decide

- Day 22 to 26: check in with every trial at day 3 and day 5 of the trial. Report their actual review count change.
- Day 27 to 28: convert or log the loss reason for each trial.
- Day 29 to 30: write up the funnel and make the decision in Section 6.

## 5. Email sequence (3 touches, plain text, no attachments, no images)

Plain text with no links in Touch 1 protects deliverability. The reply is the conversion.

**Touch 1 (Day 0)**
Subject: `{company}'s Google reviews vs three {city} competitors`

> Hi {first_name},
>
> I looked up {company} on Google. You have {rating} stars from {count} reviews. {Competitor A} has {a_count}, {Competitor B} has {b_count}, and {Competitor C} has {c_count}.
>
> At about {pace} new reviews a month, that gap closes in roughly {months} months. Most of it comes from asking every customer right after the job.
>
> I put together a one-page comparison for {company}. Want me to send it?
>
> {sender}, Zyene Reviews
> {postal address}. Reply "stop" and I won't email again.

**Touch 2 (Day 3):** one new fact only, for example the date of their most recent review, then the same question.

**Touch 3 (Day 8):** short breakup. "Last note from me. If reviews are not a priority this season, no problem. If you want the comparison, reply 'yes' and I'll send it."

**After a "yes":** send the full audit, then offer: "I can import your last 20 customers and send the first request for you. Takes me 15 minutes, free for 7 days."

## 6. Metrics and decision gates

| Metric | Planning target *(assumption)* | Read |
|---|---|---|
| Emails sent | ~350 unique prospects | Volume is deliberately small |
| Positive reply rate | 3% or more (about 10 replies) | Below 1%: message problem |
| Reply → call booked | 40% | Below: audit isn't compelling enough |
| Call → trial | 50% | Below: onboarding friction or integration objection |
| Trial → paid | 30% | Below: product or follow-up problem |
| Paid customers in 30 days | 2 to 4 | The real test |

Also track: average minutes of onboarding per trial, objections by type (especially "does it connect to Jobber"), and CAC in your own hours.

**Day 30 decision:**
- **2 or more paid and objections dominated by one theme:** repeat in a second metro of the same vertical, fix the objection first.
- **Replies but no trials:** the problem is onboarding or integration, not outbound. Build the missing piece.
- **Few replies:** change vertical (plumbing, then auto repair) before changing channel.

## 7. What this does not cover

- The agency channel (separate plan).
- Paid ads and SEO (already planned in `GROWTH_BLUEPRINT.md` and `SEO_GROWTH_PLAN_2026-09-29.md`).
- Any change to product code. The only build is an audit script. Docs sync is not triggered because no API, auth, schema, or env change is involved.
