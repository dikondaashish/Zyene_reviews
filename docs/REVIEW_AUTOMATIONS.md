# Review automations

How review requests, reminders, imports and review replies are sent and controlled. Code entry points are linked; see also [API.md](./API.md) and [DATA_MODELS.md](./DATA_MODELS.md).

## 1. One guarded send for every path

Every customer-facing review-request message goes through `dispatchReviewRequest` ([dispatch-review-request.ts](../src/lib/review-requests/dispatch-review-request.ts)). Callers:

- campaigns (`process-campaign-contact-function.ts`)
- reminders (`drip-step-send.ts`)
- scheduled and dashboard sends (`review-request-dashboard-dispatch.ts`)
- bulk SMS (`bulk-request-action.ts`)
- API, Zapier and POS (`send-outbound-dispatch.ts`)

Right before the provider call it:

1. **Re-checks eligibility** (`send-guard.ts`), so a change made after a message was queued still applies:
   - the business **SMS / Email switches**
   - SMS **STOP**
   - **email unsubscribes** for this business
   - customer **opt-out** and `zyene:test` tags
   - the **frequency cap**, which applies to first messages only; reminders of the same request skip it
2. **Honours quiet hours.** It returns `deferred`, and the caller re-queues: Inngest `sleepUntil`, or `queued` + `scheduled_for` picked up by the scheduled job and cron.
3. **Claims each message** in `review_request_messages` (request × step × channel) before calling Twilio or Resend.
   - A retry or overlapping worker finds the claim and does not send again.
   - A claim whose attempt failed before reaching the provider may be retried.
   - An in-flight claim is never resent; its outcome shows as unknown.
   - Email also uses a Resend idempotency key.
4. **Records outcomes.** It stores provider ids, per-channel status and a readable reason for every skip or failure (`review_requests.error_message`, `deferred_reason`).

Every review-request email has a signed unsubscribe link in the body and `List-Unsubscribe` + one-click headers. The link carries only the request id and an HMAC, never the email address. Unsubscribing covers review-request email from that one business. SMS STOP and unrelated transactional email (for example the reply to a customer's own private feedback) are separate.

## 2. Settings and what they do to queued messages

| Setting | Where | Effect on already-queued work |
|---|---|---|
| SMS / Email switches | Automations page; Settings → Business information | Immediate: queued sends and reminders on that channel are skipped with a reason |
| Quiet hours (start/end, business timezone, DST-aware) | same | Immediate: anything due inside the window waits until it ends |
| Frequency cap | Settings | Checked again at send time |
| First-message delay (campaign) | Campaign builder | New contacts only; contacts already waiting keep their delay |
| Reminder delay, reminders on/off | Campaign builder | Read live by the reminder job, so it applies to reminders not yet sent |
| Stop reminders after the link is opened | Campaign builder (default **on**, the previous behaviour) | Live |

Reminders always stop when:

- the customer finishes the review page (Google hand-off or private feedback)
- the customer opts out or unsubscribes
- a team member confirms the review
- the reminder is more than 72 hours overdue (it expires rather than surprising the customer, for example after a long pause)

## 3. Tracking: sent, delivered, opened, clicked, confirmed

These events are recorded and shown separately:

| Event | How it is recorded |
|---|---|
| **Sent** | Provider accepted the message |
| **Delivered / not delivered / bounced** | Twilio status callbacks (`/api/webhooks/twilio/status`) and Resend events (`/api/webhooks/resend`) |
| **Opened** | Email open, or the customer opened the review page |
| **Clicked** | Customer opened the review link. The first time is kept |
| **Finished review page** | Handed off to Google, or left private feedback |
| **Review confirmed** | A team member marked it (stored as `manual`) |

**A click or Google hand-off is never shown as a review.** Google, Yelp and Facebook give only a public display name for each reviewer, with no email or phone number. That is not enough to match a published review to a customer reliably, so there is **no automatic matching**. The Requests page offers "Mark review confirmed", which is shown as "Review confirmed (manual)". `review_confirmation_source = 'matched'` is reserved for a future reliable match.

Campaign counters (DB trigger): `total_sent` / `opened` / `clicked` / `completed` (finished page), and `total_reviews_received` (confirmed reviews only).

## 4. Reply rules (per star rating)

Settings → Reply rules. Off by default. While off, the existing single "automatically publish" switch works as before.

When on, each rating can be set to:

- **draft for approval** (the default for any rating without a saved rule)
- **post an AI reply**
- **post a saved template**
- **don't reply**

Rules apply to Google reviews received after the switch was turned on.

**Approvals** (`/reviews/approvals`):

- **Who:** designated approvers, or owners/admins/managers if none are set. Approvers get an email.
- **Editing:** drafts can be edited before posting.
- **No double posting:** approving claims the draft atomically, so a second click returns `409`.
- **No overwriting:** the review is re-checked right before posting, so an existing reply is never replaced.
- **Failures:** if Google rejects the reply, the draft can be retried.

Automatic posting (AI or template) needs the auto-reply plan. We never ask Google to remove reviews.

## 5. Gradual CSV enrollment

Campaign page → Gradual import.

1. **Upload and preview.** The same validator runs in the browser and on the server. It normalizes contacts, removes duplicates and lists unusable rows with reasons.
2. **Choose a daily limit** (1–500) and **confirm you may contact these customers**. Importing a list is not consent; opted-out and unsubscribed people are still skipped.
3. **Daily enrollment.** `/api/cron/enrollment-imports` enrolls up to the limit per local day, through the normal campaign worker.
   - Every send check applies.
   - Each row is claimed once, and the campaign job uses a stable event id.
   - Paused campaigns wait without using the day's limit.
4. **Progress and control.** You can pause, resume or cancel. Progress shows the day's count, and failures are reported per row (including campaign skips such as "Already asked within the last 30 days").

## 6. Invoice-copy email enrollment

Automations page → "Enroll customers from invoice emails".

- **Address:** each business gets `reviews-<random token>@<INBOUND_EMAIL_DOMAIN>` to CC/BCC on invoices.
- **Webhook security:** `/api/webhooks/resend-inbound` verifies the Svix signature and processes each provider event once.
- **Senders:** only allow-listed senders count (exact address or `@domain`).
- **Never enrolled:** the sender, the sender's domain, team members, the business's own address, no-reply mailboxes, and our inbound domain. At most 5 recipients per email are considered.
- **Storage:** only addresses and the outcome are kept, never the subject, body or attachments.
- **Sending:** customers go into the campaign's always-open enrollment stream (daily limit, same send checks). A customer already queued from an earlier invoice is not added again.

## 7. Setup still needed outside the code

| Dependency | Needed for | Steps |
|---|---|---|
| `INBOUND_EMAIL_DOMAIN`, `RESEND_INBOUND_WEBHOOK_SECRET` | Invoice-copy enrollment | Add a receiving domain in Resend (MX records), point its `email.received` webhook at `/api/webhooks/resend-inbound`, set both env vars. Until then the UI says the feature is not available. **Unverified:** whether Resend's `email.received` payload lists BCC'd envelope recipients; CC works either way. |
| `TWILIO_STATUS_CALLBACK_URL` (optional) | Delivery callbacks | Defaults to `${NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status` on https. Set it explicitly if the public URL differs, because the Twilio signature is checked against it |
| Resend webhook on the CollectRatings account | Delivery / bounce events for review-request email | Review-request email is sent from the CollectRatings Resend account; its webhook must also point at `/api/webhooks/resend`, signed with `RESEND_WEBHOOK_SECRET` |
| Vercel crons | Scheduled-send backstop and enrollment | `vercel.json` adds `scheduled-review-requests` (every 5 min) and `enrollment-imports` (every 15 min). Needs a Vercel plan that allows sub-daily crons. The follow-up reminder cron already runs every 15 min on cron-job.org |
| Regenerate `src/lib/db/supabase/database.types.ts` | Typing | After applying the migrations, run `supabase gen types`. New code uses the untyped client for new columns until then |

## 8. Production migration runbook

Apply in order (all additive, idempotent, no data deleted):

1. **`20261021090000_review_request_delivery_controls.sql`**
   - Adds quiet hours, the message ledger, email unsubscribes, confirmation columns and `stop_on_click`.
   - Widens status checks.
   - **Sets `review_request_email_enabled = TRUE`** for every business. The column defaulted to `FALSE`, but no send path read it and the settings form could not save it until 2026-10-20, so every `FALSE` was the default, not an owner's choice. Without this, enforcing the switch would silently stop email for every business.
   - Replaces the stats trigger with one that skips unrelated updates, and re-backfills.
2. `20261021100000_review_reply_rules.sql`: rules, templates, approvers, drafts (rules are off for everyone).
3. `20261021110000_enrollment_imports.sql`
4. `20261021120000_inbound_email_enrollment.sql`
5. `20261021130000_revoke_anon_review_request_ledgers.sql`: removes logged-out read access from the message ledger and unsubscribes (RLS already returned no rows).

**Applied to production on 2026-10-21** (all five, in order). Verified afterwards:
- all 10 new tables have RLS
- clients cannot write the ledger, drafts, imports or inbound tables; `anon` cannot read any of them
- the stats triggers are in place, and the refresh function is not client-callable
- all 22 businesses have email on (default `TRUE`)
- campaign counters match the request rows
- no queued sends or active reminders were affected
- Supabase security advisors flag nothing new

**Deploy the code in the same window.** The new code reads the new columns and tables. The old code ignores them, so applying migrations first is safe.

**Before applying**, check the starting state (all read-only):

```sql
SELECT review_request_email_enabled, count(*) FROM businesses GROUP BY 1;
SELECT count(*) FROM review_requests WHERE drip_status = 'active';
SELECT count(*) FROM review_requests WHERE status IN ('queued', 'processing');
```

On 2026-10-21 these returned: 21 businesses with email `false`, 0 active reminders, 0 queued.

**Recovery** (no customer data is removed by any step):

- **Email switch:** to undo the email backfill for specific businesses, run `UPDATE businesses SET review_request_email_enabled = FALSE WHERE id IN (...)`.
- **Stats trigger:** to restore the previous trigger, run
  ```sql
  DROP TRIGGER review_requests_campaign_stats_write ON review_requests;
  DROP TRIGGER review_requests_campaign_stats_change ON review_requests;
  ```
  then re-run `20261020121000_campaign_stats_trigger.sql`.
- **Feature tables:** the new tables can be left in place. They are unused if the feature code is rolled back.

**Verification**: `pnpm test:automation:sql` applies these migrations to a disposable Postgres shaped like production. It applies them twice and asserts:

- the data repair
- counter accuracy across insert, update, confirm, move and delete
- that unrelated updates skip the recount
- the unique claims
- tenant isolation and client write denial

## 9. Verification record (2026-10-21)

**Automated**

- `pnpm exec vitest run`: 2,547 tests pass. They include a fake database that runs the real guard, ledger and dispatcher queries.
- `pnpm verify:fast`: passes.
- `pnpm test:automation:sql`: passes. All migrations are applied twice to Postgres 17 shaped like production.
- `pnpm test:security:sql`: passes.

**Running app.** Local Supabase was rebuilt from the repo migrations, plus small shims copied from the live catalog for production-only drift. The app and the Inngest dev server ran locally. Email went only to `delivered+…@resend.dev` via real Resend; SMS stopped at the provider (no sender configured). Production data was never used. Shown:

1. Switches persist and block sends; viewers get 403.
2. Drafts save and can't send.
3. Quiet hours hold a send until 08:00 EDT, and the cron does not send early.
4. Each recipient got the campaign's own subject and body (confirmed in Resend) with a signed link and an unsubscribe link.
5. A re-added contact is skipped. Parallel cron runs plus an Inngest run produced one email.
6. Cap, opt-out and one-click unsubscribe work across paths, and tampered links are rejected.
7. Click, delivery (Resend and Twilio callbacks, including out-of-order and forged), and manual confirmation stay separate in the DB, the counters and the Requests page.
8. Reminders: due → one reminder; not due, clicked, or overdue → none; a re-run sends nothing more.
9. CSV: pause, resume and the daily limit work. Inbound email: dedupe works, unknown senders and staff are rejected, no content is stored. Approvals: viewer 403, double-decision 409, a Google failure is retryable. The 2★ review → approval draft → approver email flow ran via Inngest.
10. Another tenant gets 403/404 on every Business A endpoint.

**Bugs found during the runtime check and fixed**

- **Reminder delay ignored:** the reminder worker still used a fixed 7-day cutoff instead of the campaign delay.
- **`sms_opt_outs.id` does not exist** in production (the table has `phone_number`, `opted_out_at`). Old code selected `id`:
  - the API/Zapier path silently skipped STOP checks
  - the campaign path errored
  - the new guard would have failed every SMS
- **Viewer edit error:** a viewer editing business settings got a 500 instead of a 403.
- **Local links:** review links built on localhost used `/<slug>` instead of `/r/<slug>`. Production links are unchanged.

**Not run at runtime:** real SMS (no Twilio test credentials), posting a reply to a real Google review (no test Google location), and inbound mail through a real Resend receiving domain (needs setup, section 7). These paths are covered by unit tests only.
