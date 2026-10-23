# Automations: competitor teardown and gap analysis (Local Marketing Manager / Paige)

**Date:** 2026-10-20 · **Scope:** investigation only, no application code changed · **Competitor URL:** `https://app.localmarketingmanager.com/automations/`

**Evidence labels used throughout**

- **[Observed]**: seen directly in the competitor UI (signed-in session in the user's Chrome) or read in browser-visible JS chunks.
- **[Code]**: verified by reading our source. Not runtime-tested.
- **[Inferred]**: a reasoned conclusion that was not directly confirmed.
- **[Unknown]**: not observable with read-only access.

---

## 1. Executive summary

- **What the competitor is.** "Paige" by Merchynt, white-labelled as Local Marketing Manager. It is a Vite/React SPA served from `paige-production-raw.vercel.app`, with a REST API at `www.localmarketingmanager.com/api/*` [Observed].
- **Their "Automations" is not a workflow builder.** It is a fixed panel of seven on/off modules per Google Business Profile location [Observed]:
  - Upload Images
  - Automate Posting
  - Review Management
  - Automate Videos
  - Website & AI SEO
  - Account Manager (alerts)
  - Reporting

  A **Calendar** shows everything Paige has done or will do. A progress bar scores "setup completeness" [Observed].
- **The review-relevant module (Review Management)** combines three things:
  1. A **fixed two-message review-request sequence**: enrol → wait → message 1 → wait → follow-up. Both waits are configurable from 0.5 h to 30 days, or "Never".
  2. **Low-friction enrolment.** Customers can be added through a BCC "magic" email address, Zapier, an inbound webhook, or a CSV that drips at N contacts/day.
  3. **Per-star-rating reply rules.** For each star rating the owner picks AI draft for approval, auto-post, template, or ignore. Reviews of 1–3 stars are also flagged for Google removal, and approvers can be named.
- **How they send.** They don't run SMS themselves. Email goes out from the **owner's own Gmail/Workspace inbox** (OAuth). SMS/WhatsApp goes through an **outbound webhook** to the customer's own provider [Observed].
- **Our position.** On paper, Zyene has **more automation machinery** than Paige's review module:
  - native Twilio SMS and Resend email
  - Square/Clover POS triggers, Zapier, and a public API
  - scheduled sends, a 3-step drip, AI auto-replies to Google
  - private negative-feedback recovery, STOP handling, and frequency caps

  However, **several core paths are broken in code** (see §6). The most serious:
  1. Campaign and drip messages link to a non-existent `/review/{businessId}` page.
  2. Campaigns never go back to `active`, so follow-ups never run.
  3. The Review Request Settings form cannot save.
  4. Campaign stats are never incremented.
  5. Scheduled sends nest `step.sleepUntil` inside `step.run`.
- **Bottom line.**
  1. **Fix what we already have first** (P0, mostly small fixes).
  2. **Then close real parity gaps:** per-star reply rules with templates, approval routing, BCC/CSV-drip enrolment, a configurable follow-up delay, and an automations overview/calendar.
  3. **Then lean on differentiators Paige lacks:** native SMS with compliance, POS triggers, private feedback, and attribution.

---

## 2. Competitor workflow walkthrough

All observations come from the signed-in account for business "The Budget Wheels". Nothing was saved or toggled. Every dialog was closed with Cancel/Close.

### 2.1 Page structure

- **Navigation.** The left nav has: Dashboard, Businesses, **Automation**, Reviews, Reports, Competition, Citations, Settings, Partner Hub, Refer a friend. A header business switcher reads "Here's your overview for: <business>" [Observed].
- **Routes.** `/automations/{image-upload|posting|review-management|video|ai-seo|account-manager|reporting|calendar}` [Observed].
- **Progress banner.** It covers six modules and shows a percentage. In `AutomationsPage-*.js` the value is computed as `(doneKeys − disabledKeys) / 6 × 100`, and the banner only renders when `currentAccessLevel.includes("full")` [Observed in JS].
- **Module toggles.** Each module in the "Automation Settings" sidebar has its own switch [Observed]. The module keys are `imageUploading`, `posts`, `reviewReplies`, `questions`, `alerts`, `reporting` [Observed in JS].
- **Permissions.** Editing is gated by `automations.write`. Without it, the section is greyed out and has `pointer-events-none` [Observed in JS].
- **Guidance.**
  - A dismissible "Train Paige" card lets the owner customise the AI voice.
  - Review Management opens with a long, industry-specific tip paragraph. For this car dealer it suggests QR codes at the delivery desk, text 24–48 h later, and similar [Observed]. The copy appears to be AI-generated per vertical [Inferred].
- **Not observed:** search, filters, sorting, or pagination. There is no list of automations to search, because the modules are fixed.

### 2.2 Review Management module

**A. Review link.** `https://www.giveratings.com/<slug>` is shown with a copy button [Observed].

**B. Automated Review Request Campaign.** This is a fixed vertical flow, not a builder [Observed]:

```
Sender settings [Edit]
  → Customer added to campaign [Learn More]
  → Wait for [0.5 hour]
  → Send first message [Edit]
  → Wait for [2 days]
  → Send follow up message [Edit]
```

- **Wait picker.** It has two tabs:
  - **Hour(s):** 0.5, 1, 1.5 … in 0.5 h steps (at least up to 20.5 h).
  - **Day(s):** 1 to 30 days, plus **Never** (which disables the follow-up) [Observed].

  These values are stored as `firstWaitingTimeMinutes` and `followUpWaitingTimeMinutes` [Observed in JS].
- **Sender configuration ("Review Request Sender Configuration")** [Observed]:
  - **Ask via Email.** Connect your own Google email (Gmail/Workspace OAuth), or send a shareable auth link to a colleague so they can connect their inbox instead. The connected inbox is shown, with Disconnect.
  - **Ask via SMS, WhatsApp, or anything else.** You enter an "Integration Webhook URL". "Paige will POST to this URL when a customer is ready to be asked for a review." Example payload: `{ slug, phone, email, message }`.
  - **Routing rule** (from the editor copy): if both senders are connected, Paige uses the webhook when a phone number is present, and otherwise falls back to email.
- **Enrolment ("How to Add Customers to Your Automated Review Campaign")** [Observed]:
  - **Enroll via email.** BCC `<slug>@giveratings.com` on invoices or receipts, and Paige follows up. "No integration required!"
  - **Enroll with Zapier.** "Integrate now" embeds the Zapier Elements partner SDK, which is loaded from `cdn.zapier.com/packages/partner-sdk` [Observed]. The card also mentions Make and N8N.
  - **Enroll with integration.** An inbound webhook at `www.localmarketingmanager.com/api/review-campaign-setting/<id>`.
  - **Upload CSV File.** In JS this is a **drip enrolment**: `csvContactCreationLimit` sets a daily enrol count (default **5/day**). It has `start / pause / resume` modes (`POST review-campaign-setting/csv-contacts/mode`), a progress readout (`csv-progress`: total/processed/paused), and delete. Starting is blocked until a sender is configured ("campaignPendingSenderSetup") [Observed in JS].
- **Message editors ("Customize first message" / "Customize follow up message")** [Observed]:
  - Each has an **Email** tab (subject plus rich-text body) and an **Integrated Platform** tab (plain message with a character counter).
  - Defaults: first email subject "Thank you", follow-up subject "Thank you again"; both bodies contain the review link.
  - The default SMS text reads **256 / 160** characters, already over the counter, and nothing visibly blocks saving it [Observed].
  - Copy bug: "The The Budget Wheels Team" [Observed].
- **Claimed but not verifiable:** "follow up with the ones who don't leave one". **How they detect that a review was left is [Unknown].** They have no per-customer tracking link in the default template: the link is the generic `giveratings.com/<slug>` [Observed]. So matching is probably by reviewer name, or not done at all [Inferred].

**C. Automated Review Replies** [Observed]:

| Rating | Removal flag shown | Reply options (same list for every row) |
|---|---|---|
| 1★, 2★, 3★ | "I'll ask Google to remove these" | I'll draft a reply for you to approve · I'll respond automatically · I'll reply using a template · I'll ignore it |
| 4★, 5★ | — | same |

- **Data model** [Observed in JS]: `reviewReplies.templates[]` holds five entries, one per rating. Each entry has `{rating, autoPost, ignored, template}`. Reply templates have their own CRUD: `POST/PATCH/DELETE template` with `type:"reviewReply"`.
- **Approvals** [Observed]:
  - Shown only if some rating uses "draft for approval".
  - "Who should I ask to approve review replies?": Me / Multiple people / Nobody.
  - Toggle: "Do you want to see these tasks in your dashboard feed?"
  - Stored as `alerts.approveReviewReply {value, emails[], hideTask}`.
- **Removal flagging:** the label appears on 1–3★ rows. Whether it is configurable, and what it actually does (most likely a Google "report review" submission), is [Unknown].

### 2.3 Other modules (summarised; less relevant to us)

- **Upload Images.** AI describes, renames, and geotags uploaded images, then drips them to the GBP. Frequency is "Trust Paige" or custom. Upload sources: a password-protected public upload link, drag-and-drop, or integrations [Observed].
- **Automate Posting.** AI-written GBP posts on a "Trust Paige" or custom cadence, with an image-source preference and a default CTA (`automation-settings/default-cta`) [Observed].
- **Website & AI SEO.** Paige generates a replacement site (`<slug>.biz.page`), scores it against the current site on five SEO checks plus AI-crawler access, and keeps it updated [Observed].
- **Account Manager.** Paige emails the owner every N days asking for news to post about, and lets the owner route each alert to Me or multiple recipients. Alerts [Observed]:
  - "You're not getting enough reviews"
  - "Doing great with reviews"
  - "Doing great with image uploading"
  - "A change was made to your profile"
  - "Need to upload more images"
  - "Weekly Summary of Automations"
- **Reporting.** Monthly report with To/BCC recipients. Schedule: every 30 days from today, or a specific day of the month. Content: only positive metrics, or all metrics [Observed].
- **Calendar.** Month/week view of "Everything Paige has done and will do". Legend: Post, Video, Image upload, **Review reply**, FAQ, Report, Offer [Observed].

### 2.4 Technical notes (browser-visible only)

- **Stack.** React SPA (Vite chunk naming). Resources include Sentry, Microsoft Clarity, HubSpot, FirstPromoter, Zapier Elements, and a Merchynt support widget [Observed].
- **API resources:** `automation-settings/{locationId}` (GET/PUT), `review-campaign-setting/{locationId}` (GET/PATCH), `review-campaign-setting/csv-*`, `template/*`, `locations/{id}`, `payments/subscription-info` [Observed in JS].
- **Patch quirk.** The client builds its PATCH body with truthy spreads (`...x && {x}`). Setting a value to `0` therefore cannot be sent [Inferred from JS].
- **What I did not do:** I didn't capture request/response bodies or tokens. No REA CDP endpoint was available: Chrome wasn't started with remote debugging, so REA's page tools couldn't attach. Evidence was gathered with Claude-in-Chrome DOM reads plus static reading of the publicly served JS chunks.

### 2.5 Not observed / unknown on the competitor

All of the following are [Unknown]. They were not visible on these screens, which does not prove they are absent:

- Per-contact execution history and delivery status
- Retries
- Quiet hours or time zones for sends
- SMS consent and opt-out handling (delegated to the customer's webhook provider)
- Frequency caps and duplicate suppression
- Conditions and branching
- More than two messages
- Multi-location bulk configuration
- Campaign conversion analytics

---

## 3. Our current implementation (Zyene Reviews)

Every item below is [Code]-verified unless marked otherwise. Paths are repo-relative.

### 3.1 Surfaces

| Surface | Where | State |
|---|---|---|
| Campaigns list, builder, detail | `src/app/(dashboard)/campaigns/**`; builder steps Basics / Message / Timing / Review & Launch (`campaigns/new/new-campaign-constants.ts:1`) | Wired for create, queue, pause and delete. Send path is broken (see §6) |
| Send delay options | `new-campaign-constants.ts:3-9`: Immediately, 1 h, 2 h, 4 h, 1 day | Wired: `step.sleep` in `process-campaign-contact-function.ts:50` |
| Trigger type | `new-campaign-basics-step.tsx:69-92`: Manual Batch / Scheduled / After Payment ("Coming Soon") | **UI only.** `trigger_type` is never read by the backend |
| 3-step drip (Day 0 → 7 → 14) | `new-campaign-timing-step.tsx:50-60`, `drip-phase1.ts:6` | Fixed 168 h gap; `follow_up_delay_hours` is ignored. Effectively dead (see §6) |
| Campaign templates | `src/lib/campaigns/templates.ts`: Post-Visit Review, Appointment Follow-up, Customer Re-engagement | Pre-fill only. Header "Browse Templates" goes to `/campaigns/templates`, which is a 404 (`campaigns-page-header.tsx:14`) |
| One-off and scheduled requests | `/requests`; send dialog with "Schedule for later" (`send-request-dialog-form-schedule-footer.tsx:37-57`) → `POST /api/requests/send` | Immediate: wired, signed link. Scheduled: see §6 |
| Request history, stats, export | `requests-list-section.tsx`, `requests-stats-section.tsx`, `/api/requests/export` | Wired |
| Review Request Settings (delay, minimum amount, frequency cap, SMS/Email toggles) | `components/settings/review-settings-form*.tsx`, `use-review-settings-form.ts:35` | **Cannot save.** `business-patch-schema.ts` is `.strict()` and lists none of the `review_request_*` keys. The SMS/Email toggles are never read anywhere |
| AI auto-reply (Google) | `components/reviews/auto-reply-toolbar*.tsx`. Options: 3★+ / 4★+ / 5★ only; tone Professional / Friendly / Concise | Wired. Plan-gated on the server (`business-patch-guards.ts:74-98`). Job: `process-auto-reply-review-function.ts` (Google only, reviews ≤ 14 days old) |
| Private negative feedback | `/r/[slug]` flow → `POST /api/reviews/private` → `private_feedback`, owner alert, automatic recovery email | Wired. The recovery email always sends and has no setting |
| Owner alerts | `/settings/notifications`: email, SMS, minimum urgency 5–10, quiet hours, weekly digest; `lib/notifications/review-alert.ts` | Wired. Google alerts depend on AI urgency ≥ 7. Yelp/Facebook alert on every new review |
| Integrations | `/settings/integrations`: Square (auto-send toggle, delay, minimum amount), Clover (backend only), Toast (placeholder), Zapier/generic webhook, Developer API key | Square, Zapier and API wired. Clover has no toggle. Toast is decorative |
| Sidebar | `use-app-sidebar-nav.ts:45-66`: Reviews, Review Requests, Campaigns, Integrations | There is no single "Automations" hub |

### 3.2 Backend

- **Inngest functions** are registered in `src/app/api/inngest/route.ts`, with the client at `src/services/inngest/client.ts`. The main ones:
  - `process-campaign-contact`
  - `process-scheduled-review-request`
  - `send-delayed-pos-review-request`
  - `follow-up-worker`
  - `process-auto-reply-review`
  - `sync-google-reviews` / `sync-platform-worker`
  - `process-review-analysis-batch`
  - `weekly-digest-worker`
- **Cron.** Crons are HTTP routes under `/api/cron/*`, protected by `runCronJob` with a DB lease (`20260914161000_cron_job_run_claims.sql`). The `follow-up` and `scheduled-review-requests` jobs are **not** in `vercel.json`; they rely on an external cron-jobs.org schedule, which I couldn't verify.
- **Send paths.** There are four, and their guards differ:

  | Path | Signed link | Opt-out | Frequency cap |
  |---|---|---|---|
  | `sendOutboundReviewRequest` (`lib/review-requests/send-outbound.ts`): API, webhook, Square, Clover | ✔ | ✔ | ✔ |
  | Dashboard dispatch (`services/review-requests/api/*`) | ✔ | ✔ | ✔ |
  | **`sendReviewRequest` (`lib/notifications/review-request.ts:53`): campaigns and drip** | ✘ broken link | ✔ | follow-ups pass 0 |
  | **Bulk SMS (`services/customers/bulk-request-action.ts`)** | ✔ | ✔ | ✘ |

- **Compliance:**
  - Twilio STOP/START/HELP is handled into `sms_opt_outs` (`api/webhooks/twilio/route.ts`). `sendSMS` re-checks opt-outs and appends "Reply STOP".
  - There is no SMS `statusCallback`, so we never get delivery receipts.
  - `sendEmail` supports `List-Unsubscribe` (`services/resend/send-email.ts:83`), but review-request sends don't pass an unsubscribe URL [Inferred from the agent trace; spot-check before acting].
  - Resend bounces and complaints don't suppress future sends.
- **Tracking.** HMAC-signed `/api/track/review-open` and `/api/track/review` set `clicked_at` and stop follow-ups. The Resend webhook records delivered, opened, clicked, and bounced.
- **Data model:**
  - Tables: `campaigns`, `review_requests`, `customers`, `sms_opt_outs`, `notification_preferences`, `integrations`, `square_*`, `clover_*`, `events`, `cron_job_runs`.
  - Auto-reply settings are columns on `businesses`.
  - There is no templates table and no per-message event log.
  - RLS is on for all core tables. Senders use the service role and scope tenants in code.
- **Tests.** Good unit coverage for campaign security, drip, POS timing, Square/Clover, Twilio, tracking token, quiet hours, auto-reply, and API keys. **Gaps:** `sendOutboundReviewRequest` validation, the scheduled-send function, the Resend webhook, the campaign status lifecycle, the link built by `sendReviewRequest`, and the bulk cap. `tests/integration/` is empty.
- **Backend with no UI:**
  - Clover `auto_send_enabled`
  - `drip_channel_alternate`
  - `sms_opt_outs` viewer
  - Delivery/open fields: whether any dashboard shows them is unconfirmed
  - Campaign `trigger_type` values `pos_payment` and `scheduled`

---

## 4. Feature parity matrix

| # | Competitor capability | Competitor evidence | Our implementation | Our code evidence | Parity | Gap and recommendation |
|---|---|---|---|---|---|---|
| 1 | Automations overview: toggleable modules plus setup progress | `/automations/*`, `AutomationsPage-*.js` progress formula | No single hub. Settings are spread across Campaigns, Requests, Reviews toolbar, Settings and Integrations | `use-app-sidebar-nav.ts:45-66` | **Missing** | Add an "Automations" overview with status cards per automation (requests, follow-ups, auto-reply, alerts, digest) and on/off state. P1 |
| 2 | Activity calendar (done and scheduled) | `/automations/calendar` legend includes Review reply and Report | Request history list only | `requests-list-section.tsx` | **Partial** | Timeline/calendar of scheduled sends, follow-ups and auto-replies. P2 |
| 3 | Delay before first message, 0.5 h–30 d | Wait picker [Observed] | Campaign delay 0/1/2/4 h/1 d. POS/Zapier delay in minutes (form can't save) | `new-campaign-constants.ts:3-9`; `use-review-settings-form.ts:35`; `business-patch-schema.ts:79` | **Partial** | Fix the settings save (P0). Widen campaign delay options (P2) |
| 4 | Configurable follow-up delay, or "Never" | Second wait picker; `followUpWaitingTimeMinutes` | Fixed 7-day gap; `follow_up_delay_hours` saved but ignored; worker effectively dead | `drip-phase1.ts:6`; `campaign-send-api.ts:89` vs `cron/follow-up/route.ts:27` | **UI only / broken** | P0: fix the status lifecycle and link. P1: honour `follow_up_delay_hours` |
| 5 | Editable first and follow-up templates (email subject/body, SMS) | Customize first/follow-up dialogs | Campaign SMS/email templates plus step 2/3 messages. Email subject ignored; email body falls back to SMS text | `process-campaign-contact-function.ts:65`; `lib/email/review-request-subject.ts:5-8` | **Partial** | P0: send the saved email subject and body |
| 6 | SMS length guidance | 160 counter (default already 256) | 160-char counter | `new-campaign-message-step.tsx` | **Implemented** | Show segment count, which is better than theirs. P3 |
| 7 | Send email from the owner's Gmail/Workspace | Sender config OAuth plus shareable auth link | Resend from our domain | `services/resend/send-email.ts` | **Missing** | Optional. Better deliverability and personal tone, but it needs Gmail OAuth scopes and Google verification. P3 (evaluate) |
| 8 | SMS via the customer's own provider (outbound webhook) | Integration Webhook URL; payload `{slug, phone, email, message}` | Native Twilio SMS | `services/twilio/send-sms.ts` | **Not applicable** (we're stronger) | Keep native SMS as a differentiator. An outbound "request ready" webhook could be a P3 add-on |
| 9 | Channel routing (phone present → SMS, else email) | Editor copy | Channel per request/campaign (`sms`/`email`/`both`); generic webhook accepts `auto` | `send-request-dialog-schema.ts:22`; `generic-webhook-body.ts:19-24` | **Implemented** | Expose "Auto (SMS if phone, else email)" in the campaign UI. P2 |
| 10 | Enrol by BCC magic email | `<slug>@giveratings.com` | None | — | **Missing** | High value, low friction for non-technical SMBs. Inbound email parse (e.g. Resend inbound) → create request. P1 |
| 11 | Enrol via Zapier (embedded) | Zapier Elements partner SDK | Generic webhook plus static Zapier guide | `zapier-card.tsx`; `/api/webhooks/generic` | **Partial** | Publish a Zapier app / embed Elements. P2 |
| 12 | Enrol via inbound webhook | `/api/review-campaign-setting/<id>` | `/api/webhooks/generic` (Bearer API key), `/api/v1/requests/send` | `generic-webhook-api.ts` | **Implemented** (stronger auth) | Preserve |
| 13 | CSV enrolment with daily drip, start/pause/resume and progress | `csvContactCreationLimit` (default 5), `csv-contacts/mode`, `csv-progress` | CSV import creates contacts only. Campaign "Add contacts" queues everything at once (≤ 500) | `/api/customers/import`; `create-and-queue-campaign.ts:22-27` | **Partial** | Add a "drip N per day" option for back-catalogue CSV campaigns. It protects reputation (no review spikes) and sender reputation. P1 |
| 14 | POS-triggered requests | Not observed | Square wired (delay and minimum amount); Clover backend only | `dispatch-payment-send.ts`; `clover/store-connection.ts:44` | **Not applicable** (we lead) | P1: Clover toggle plus timing parity |
| 15 | Per-star reply rule: AI draft / auto / template / ignore | Reply rules table; `reviewReplies.templates[]` | Single toggle with minimum rating and tone; auto-posts or nothing | `auto-reply-toolbar-types.ts:9-13`; `process-auto-reply-review-function.ts` | **Partial** | P1: per-rating action matrix that includes **draft for approval** and **template** |
| 16 | Reply template library | `template` CRUD (`type: reviewReply`) | None for replies (there is a marketing tool `tools/review-response-generator`) | — | **Missing** | P1, together with #15 |
| 17 | Approval routing (who approves, dashboard tasks) | Approvals block; `alerts.approveReviewReply` | None (manual reply UI only) | — | **Missing** | P1: approver email(s) plus approve-from-email link |
| 18 | Flag 1–3★ reviews for Google removal | Label on 1–3★ rows | None | — | **Unknown / partial** | Their mechanism is unverified. If we pursue it, do a guided "report policy-violating review" flow, not automatic flagging, to stay within Google policy. P3 |
| 19 | AI voice training | "Train Paige" | Tone preset only | `auto-reply-toolbar-types.ts` | **Partial** | Business-specific reply guidance (custom instructions). P2 |
| 20 | Owner alerts (not enough reviews, profile changed, weekly summary) | Account Manager | Urgency alerts, quiet hours, weekly digest | `review-alert.ts`; `weekly-digest-worker` | **Partial** | Add a "review velocity dropped" alert and a GBP change alert. P2. Fix the Google alert rule to include "rating ≤ 2" (`review-alert.ts:17`). P1 |
| 21 | Monthly emailed report (recipients, day, positive-only) | Reporting module | Weekly digest; AEO reporting behind flags | `weekly-digest-worker` | **Partial** | Scheduled monthly PDF/email with recipients. P2 |
| 22 | Stop follow-up once the review is left | Claimed in copy; mechanism unknown | Stops on **click** (signed link); `review_left` never set; no attribution | `record-review-request-open.ts:59`; no `review_left` writer | **Partial** | P1: match new synced reviews to recent requests (name/time window) → set `review_left` and stop the sequence. This is a differentiator if done well |
| 23 | Campaign analytics | Not observed | Funnel UI exists but counters never increment | `campaign-detail-funnel-utils.ts:6-11`; `001_initial_schema.sql:208-210` | **UI only** | P0: compute from `review_requests`, or add a trigger |
| 24 | Opt-out, consent, quiet hours, frequency cap | Not observed (delegated to the customer's provider) | STOP handling and frequency cap ✔. No quiet hours for customer sends; no stored consent; bulk path skips the cap; no unsubscribe on request emails [Inferred] | `webhooks/twilio/route.ts`; `bulk-request-action.ts:52`; `quiet-hours.ts` (owner only) | **Partial** | P0/P1: apply the cap on the bulk path, add quiet hours for customer sends, add email unsubscribe plus suppression on bounce/complaint |
| 25 | Execution history and delivery status | Not observed | Per-request status plus Resend events. No Twilio delivery callback | `resend-api.ts`; no `statusCallback` | **Partial** | P1: Twilio status callbacks and an error column in request history |
| 26 | Lifecycle: enable/disable per module, role write-permission | Toggles; `automations.write` | Campaign pause/activate; auto-reply toggle; org roles | `campaign-detail-header.tsx:45-51` | **Partial** | Covered by #1 |
| 27 | Scheduled one-off send | Not observed | Schedule dialog, Inngest plus fallback cron | `process-scheduled-review-request-function.ts:57-62` | **Implemented, buggy** | P0: move `step.sleepUntil` out of `step.run`; re-check `scheduled_for` in `process-scheduled-one.ts` |
| 28 | Private negative-feedback capture and recovery | Not observed | `/r/[slug]` gate, private feedback inbox, recovery email | `private-feedback-api.ts:157-166` | **Not applicable** (we lead) | Add a toggle or template for the recovery email. P2 |
| 29 | Multi-location | Location switcher; settings per location | Business switcher (`getActiveBusinessId`) | — | **Implemented** (per business) | Bulk "copy automation settings to other locations". P3 |

---

## 5. Existing functionality to preserve (do not rebuild)

- **Native Twilio SMS** with STOP/START/HELP and a global `sms_opt_outs` table. It is more compliant than Paige's "bring your own webhook" approach.
- **`sendOutboundReviewRequest`** and the dashboard dispatch: signed per-request links, opt-out checks, frequency cap, plan limits. **Point campaigns and drip at this path** rather than writing a fourth one.
- **Square POS automation** with delay and minimum amount through `send-delayed-pos-review-request`, plus payment-event dedupe.
- **Generic webhook and public API** with scoped API keys (stronger than Paige's URL-only inbound webhook).
- **HMAC tracking endpoints** and click-stops-follow-up logic.
- **AI auto-reply pipeline:** plan gate, ≤ 14-day window, enable timestamp, usage counter.
- **Private-feedback flow** and owner alerts with quiet hours and urgency.
- **Cron lease and Inngest event-id dedupe** (`runCronJob`, `claim_cron_job_run`).

---

## 6. Critical gaps (fix before any new feature)

All of these are [Code]-verified. None was runtime-tested.

1. **Campaign and drip links are dead.** `src/lib/notifications/review-request.ts:53` builds `/review/${businessId}`, but no such route exists; the public flow is `/r/[slug]`. The link also carries no request id, so clicks never register and follow-ups never stop.
2. **Follow-ups never run after a send.** `campaign-send-api.ts:89` sets the status to `processing`. The cron and worker select only `active` (`cron/follow-up/route.ts:27`). Nothing resets it, and `:52` also blocks adding contacts.
3. **Review Request Settings cannot save.** The `review_request_*` keys are not in the `.strict()` schema at `business-patch-schema.ts:79`. Square and Zapier timing therefore can't be configured from the UI.
4. **Campaign email ignores the saved subject and body.** It sends `sms_template || email_template` (`process-campaign-contact-function.ts:65`).
5. **Scheduled sends may fire immediately.** `step.sleepUntil` is nested inside `step.run` (`process-scheduled-review-request-function.ts:57-62`).
6. **Campaign counters are never updated** (`total_sent` / `total_clicked`, …), and **`review_left` is never set**. All conversion metrics read 0.
7. **"Save as draft" violates the DB constraint.** The campaign status check allows `active, paused, completed, processing` (`20260304202800_audit_schema_fixes.sql:81`), but the UI saves `"draft"` (`use-new-campaign-form.ts:86`).
8. **The bulk SMS path skips the frequency cap** (`bulk-request-action.ts:52`).
9. **"Trigger type: Scheduled"** is selectable but has no scheduler. "Browse Templates" goes to a 404.
10. **Doc drift.** `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATA_MODELS.md` and `CODEBASE_KNOWLEDGE.md` have wrong paths, wrong statuses and wrong webhook claims (details in the backend audit notes). Fix them alongside the code.

---

## 7. Recommendations, prioritised

### P0: make the existing automation actually work (parity blockers, small to medium effort)

- Route campaign and drip sends through the signed-link sender, fixing items 1 and 4.
- Fix the campaign status lifecycle so that `processing` returns to `active`, or let the worker accept `processing`. Allow re-sends.
- Add the `review_request_*` fields to the business patch schema, and wire or remove the SMS/Email toggles.
- Un-nest `sleepUntil`, and re-check `scheduled_for` before sending.
- Derive campaign stats from `review_requests` and fix the `draft` status.
- Apply the frequency cap on the bulk path.
- Add tests for each of the above, especially the `sendReviewRequest` link and the status lifecycle.

### P1: essential parity with Paige's review module

1. **Per-star reply rules:** AI draft for approval / auto-post / template / ignore, plus a **reply template library** and **approver routing** (email approve link and dashboard task).
2. **Configurable follow-up delay**, including "never", that honours `follow_up_delay_hours`.
3. **CSV drip enrolment:** N/day, start/pause/resume, progress.
4. **BCC "magic email" enrolment** via inbound email parsing.
5. **"Review left" detection.** Match synced reviews to requests and stop sequences. This also unlocks real conversion analytics.
6. **Delivery visibility.** Twilio status callbacks, failure reasons in request history, and bounce/complaint suppression.
7. **Compliance hardening.** Quiet hours and time zone for customer sends, email unsubscribe on review requests, a stored consent record.
8. **Clover parity:** auto-send toggle, delay, minimum amount.

### P2: UX and simplification

- **One "Automations" hub.** Status cards per automation, on/off switches, setup-completeness checklist, link to config. Paige's simplest-possible framing works well for SMBs. Prefer **fixed, opinionated sequences with a few knobs** over a generic node builder.
- **Activity calendar/timeline** of scheduled sends, follow-ups, replies and reports.
- **Auto channel** in the campaign UI; wider delay options.
- **AI reply guidance** ("train" custom instructions).
- **Monthly emailed report** with recipients.
- **Velocity-drop and GBP-change alerts.**
- **Recovery-email toggle and template** for private feedback.
- **Native Zapier app.**

### P3: optional or differentiators to evaluate

- Send from the owner's Gmail (OAuth): better deliverability, but heavy verification.
- Outbound "request ready" webhook for customers who insist on their own SMS provider.
- Guided "report a policy-violating review" flow. Do not auto-flag.
- Copy automation settings across locations.
- AI-generated, vertical-specific "how to ask for reviews" tips (cheap content win).

### Differentiators we already have and should market

These are all things Paige does not visibly offer:

- Native, compliant SMS
- POS-triggered sends
- Private negative-feedback capture and recovery
- Signed per-customer tracking links (Paige's default link is generic)
- Scoped API keys

---

## 8. Limitations of this investigation

- **Competitor access.** Only one signed-in account and one location were inspected. Nothing was saved. Network traffic was not captured, because the API calls had fired before observation started and no CDP endpoint was available for REA. The JS chunks were read statically.
- **Behaviour versus configuration.** Competitor claims about backend behaviour (follow-up suppression, removal flagging, BCC parsing) come from UI copy, not execution.
- **Our side.** Our findings come from reading the code. I didn't check the live database (triggers could exist outside the repo), the external cron-jobs.org schedule, or production env flags.
