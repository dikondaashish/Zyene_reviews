# Drip Campaigns (Multi-Step Review Request Sequences)

> **Document type:** Product + Engineering plan, written like a PM hand-off
> **Owner:** Product / Eng leads
> **Status:** Proposal (not yet approved for build)
> **Last updated:** 2026-05-19
> **Repo target:** `Zyene Reviews` (Next.js + Supabase + Inngest)

---

## TL;DR

We already have **single-step campaigns + one optional follow-up**. We want to ship a **visual, multi-step drip** ("SMS → wait 2 days → Email → wait 2 days → Email") that beats Birdeye, Podium, NiceJob, and Reputation.com on:

1. **Smart-skip** (don't follow up if the customer already opened, clicked, or left a review).
2. **Engagement-aware branching** (e.g. fork "opened, not clicked" vs "ignored").
3. **AI-assisted copy, channel selection, and send-time** (per-step suggestions inside the builder).
4. **Per-step analytics with conversion attribution** (which step actually produced the review).
5. **Compliance-first** (STOP/HELP, quiet hours, daily contact caps, opt-outs at recipient level).

Ship in **4 phases** so business value lands as early as Phase 1.

---

## 1. Vision & Competitive Positioning

### 1.1 What we want users to feel

> "I built a 4-step SMS + email drip in 90 seconds, it stopped on its own when customers left reviews, and the analytics told me **step 2 (email reminder)** is what actually converts."

### 1.2 Competitive teardown

| Competitor | Drip UI | Engagement-aware skip | AI in builder | Per-step analytics |
|---|---|---|---|---|
| **Birdeye** | Linear, max 2 follow-ups | Yes (basic) | No | Funnel only at campaign level |
| **Podium** | Linear, no visual flow | Partial | Partial | Conversation-centric, weak step view |
| **NiceJob** | Drip ladder | Yes | No | Per-step open/click, no conversion attribution |
| **Reputation.com** | Enterprise rule builder, heavy | Yes | Partial | Strong, but not actionable for SMB |
| **Zyene (this plan)** | **Visual + JSON-as-source-of-truth, smart-skip default-on, AI copy + AI send-time, attribution to converting step** | ✅ | ✅ | ✅ |

### 1.3 Our wedges (do not skip these)

1. **Smart-skip by default** — drip auto-terminates the moment a customer engages or leaves a review. (Birdeye requires you to toggle this; NiceJob hides it under settings.)
2. **Channel fallback per step** — if step 2 is SMS and the customer has no phone, downgrade to email instead of skipping silently.
3. **Adaptive send-time (Phase 3)** — model picks "best 1-hour window" per recipient based on prior open/click data.
4. **Visual builder + JSON template export** — power users can copy/paste sequences across businesses (multi-location).
5. **Conversion attribution** — first review left after step N is attributed to step N (single-touch attribution); also expose multi-touch in analytics.

---

## 2. Glossary

| Term | Meaning |
|---|---|
| **Campaign** | Existing entity. Wraps a sequence + audience. |
| **Step** | One node in the sequence. Either an `action` (send SMS / send email / both) or a `delay` (wait N hours/days). |
| **Step run** | One execution of a step for a specific recipient (review request). |
| **Drip instance** | The full pipeline for one recipient through one campaign (status = `active`, `completed`, `terminated`, `errored`). |
| **Smart-skip** | Drip terminates early when a configurable event happens (clicked, review_left). |
| **Channel fallback** | If preferred channel is missing for a recipient, downgrade to the other (e.g. SMS → email). |

---

## 3. Where we are today (audit)

**Schema today (`campaigns` table):**
```
sms_template, email_subject, email_template,
delay_minutes, follow_up_enabled, follow_up_delay_hours, follow_up_template
```
Plus `review_requests.is_follow_up_sent`.

**Workers today:**
- `Process Manual Batch` (initial sends).
- `Process Follow-ups` (a **single** follow-up after `follow_up_delay_hours`).
- Cron: `/api/cron/follow-up` fans out follow-up events per active campaign.

**Limits:**
- Only **one** follow-up. The screenshot needs **N** steps.
- Follow-up filter is `status = delivered`, not "didn't open/click" — the UI claims more than it does.
- No branching (engaged vs not engaged).
- No per-step analytics: stats roll up to the campaign.

---

## 4. Data Model (target)

We add **two** new tables and keep backward-compat with the old `follow_up_*` columns until Phase 2.

### 4.1 `campaign_steps` (sequence definition)

```sql
CREATE TABLE campaign_steps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  position        INT  NOT NULL,                       -- 1-based ordering
  kind            TEXT NOT NULL CHECK (kind IN ('send','wait','branch')),
  -- send config
  channel         TEXT CHECK (channel IN ('sms','email','both')),
  sms_template    TEXT,
  email_subject   TEXT,
  email_template  TEXT,
  -- wait config
  wait_minutes    INT,                                 -- canonical (avoid hours/days drift)
  -- branch config (Phase 2)
  branch_condition JSONB,                              -- { "if": "opened" | "clicked" | "no_engagement" }
  -- engagement gating
  skip_if         TEXT[] NOT NULL DEFAULT '{}',        -- e.g. {'clicked','review_left'}
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, position)
);
CREATE INDEX idx_campaign_steps_campaign ON campaign_steps(campaign_id, position);
```

Why `wait_minutes` instead of hours: Twilio quiet-hour math, A/B short tests, and POS receipts all need finer granularity. UI still shows "2 days" / "48 hours" / "1 week" — store canonical.

### 4.2 `campaign_step_runs` (one row per recipient per step)

```sql
CREATE TABLE campaign_step_runs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_id             UUID NOT NULL REFERENCES campaign_steps(id) ON DELETE CASCADE,
  review_request_id   UUID NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
  status              TEXT NOT NULL
                        CHECK (status IN ('scheduled','running','sent','delivered',
                                          'opened','clicked','skipped','failed','terminated')),
  scheduled_for       TIMESTAMPTZ NOT NULL,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ,
  clicked_at          TIMESTAMPTZ,
  channel_used        TEXT CHECK (channel_used IN ('sms','email')),
  fallback_used       BOOLEAN NOT NULL DEFAULT FALSE,
  error               TEXT,
  inngest_event_id    TEXT,                            -- idempotency key for retries
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (step_id, review_request_id)                  -- exactly-once per (step, recipient)
);
CREATE INDEX idx_step_runs_due ON campaign_step_runs(status, scheduled_for);
CREATE INDEX idx_step_runs_request ON campaign_step_runs(review_request_id);
```

The **`UNIQUE (step_id, review_request_id)`** is critical for idempotency under Inngest retries.

### 4.3 `review_requests` additions

```sql
ALTER TABLE review_requests
  ADD COLUMN drip_status        TEXT NOT NULL DEFAULT 'idle'
    CHECK (drip_status IN ('idle','active','completed','terminated','errored')),
  ADD COLUMN drip_current_step  INT,
  ADD COLUMN drip_terminated_reason TEXT;             -- 'review_left' | 'clicked' | 'opted_out' | 'manual_stop'
```

### 4.4 RLS

- `campaign_steps`: same policy shape as `campaigns` (business → membership).
- `campaign_step_runs`: read via parent `campaigns` → business. Service role writes only.

---

## 5. Engagement-aware execution (the "smart" part)

For every step, before sending, the worker evaluates:

```
EVALUATE skip_if rules against review_requests + reviews:
  if review_left ─────────────────── terminate("review_left")
  if 'clicked'   AND clicked_at     terminate("clicked")
  if 'opened'    AND opened_at      skip step, advance to next
  if customer.opt_out               terminate("opted_out")
  if quiet hours active              reschedule to next allowed window
  if business out of plan quota      mark step run 'failed', terminate
```

Defaults shipped:
- Step 1 (first send): `skip_if = {}` (always sends).
- Step 2+ (any reminder): `skip_if = {clicked, review_left}` — **smart-skip ON by default**.
- All steps inherit per-customer opt-out + per-business quiet hours.

This is what makes our drip feel intelligent vs Birdeye/Podium.

---

## 6. API surface (Phase 1)

### 6.1 REST

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/campaigns/:id/steps` | — | `{ steps: CampaignStep[] }` |
| `PUT` | `/api/campaigns/:id/steps` | `{ steps: CampaignStep[] }` | replaces all steps atomically |
| `POST`| `/api/campaigns/:id/steps/preview` | `{ steps }` | dry-run validation + Twilio length warnings + suggested wait windows |
| `POST`| `/api/campaigns/:id/send` | `{ contacts: [...] }` | enqueues drip instances |
| `POST`| `/api/campaigns/:id/recipients/:rid/stop` | — | terminates one drip instance |

### 6.2 Inngest events

| Event | Payload | Trigger |
|---|---|---|
| `drip/instance.start` | `{ campaignId, reviewRequestId }` | Created on initial send |
| `drip/step.run` | `{ stepRunId }` | Scheduled by previous step; idempotent via `inngest_event_id` |
| `drip/step.engagement` | `{ reviewRequestId, kind: 'opened' \| 'clicked' \| 'review_left' }` | From Resend webhook / Twilio status / Google review match |

### 6.3 Atomic step replace (PUT)

A campaign with active drip instances must not change steps mid-flight in ways that break ordering. The PUT handler:

1. If campaign has any `campaign_step_runs` with `status IN ('scheduled','running')` → **clone** campaign into a new `campaign_id` (versioning), reject in-place edit unless `force=true`.
2. Otherwise replace within a single transaction.

This is a wedge vs Birdeye, which silently mutates and breaks live runs.

---

## 7. UI / UX

### 7.1 Builder view (matches the screenshot)

Single vertical stack:
```
┌──────────────────────────────┐
│ [Step 1] SMS REVIEW REQUEST  │   ← action node
│ Channel: SMS  Edit ▾         │
└────┬─────────────────────────┘
     │ Wait 2 days ▾
┌────▼─────────────────────────┐
│ [Step 2] EMAIL REVIEW REQUEST│
│ Smart-skip: clicked, opened  │
│ Channel: Email  Edit ▾       │
└────┬─────────────────────────┘
     │ Wait 2 days ▾
... etc
[ + Add step ]
```

Components to add:
- `components/campaigns/builder/StepCard.tsx`
- `components/campaigns/builder/WaitConnector.tsx`
- `components/campaigns/builder/AddStepMenu.tsx`
- `components/campaigns/builder/StepEditor.tsx` (slide-over)
- `components/campaigns/builder/PreviewPane.tsx` (live SMS/email preview using `{customer_name}` mock)

Constraints (Phase 1):
- Linear only (no branches).
- Max 6 steps.
- First step cannot be a `wait`.

### 7.2 Wizard fallback (existing `/campaigns/new`)

Step 2 ("Message"): keep current SMS/email fields but render them inside **Step 1 of the builder** so the existing screen still works for simple cases. The wizard's "Follow-up" tab becomes a generated **Step 2** under the hood.

This is the safest migration: nobody loses anything.

### 7.3 Analytics view (campaign detail)

Add a **funnel** + **per-step table**:

```
Step 1 (SMS)          1,000 sent   780 deliv.   620 opened   210 clicked   140 reviews
Step 2 (Email, 48h)     660 elig.  640 deliv.   430 opened    95 clicked    72 reviews
Step 3 (Email, 4d)      530 elig.  510 deliv.   320 opened    50 clicked    34 reviews
─────────────────────────────────────────────────────────────────
Total reviews attributed  246 (single-touch)   /   312 (multi-touch)
```

---

## 8. Workers / scheduling

We replace the single `followUpWorker` with a generic per-step worker.

### 8.1 `dripStepWorker` (Inngest function)

Event: `drip/step.run`.

```
1. Load step + step_run + review_request + campaign.
2. Idempotency: if step_run.status NOT IN ('scheduled') → return early.
3. Evaluate skip_if; if terminate → mark run 'terminated', mark request drip_status.
4. Evaluate skip (opened); if skip → schedule next step, mark this run 'skipped'.
5. Quiet hours: if outside allowed window → reschedule run.
6. Channel fallback: pick best channel based on contact availability.
7. Send via sendReviewRequest({ isFollowUp: position > 1, ... }).
8. Mark run 'sent'; advance review_request.drip_current_step.
9. Schedule next step: enqueue 'drip/step.run' with delay = next step's wait_minutes.
```

Idempotency:
- `inngest_event_id` = deterministic hash of `(step_id, review_request_id, attempt)`.
- Use Inngest's `step.run` to wrap each side effect.

### 8.2 Engagement listener

- **Email open / click** → existing Resend webhook → mark `review_requests.opened_at` / `clicked_at` → publish `drip/step.engagement` for any in-flight runs of that recipient.
- **SMS reply (STOP)** → existing Twilio webhook → mark customer opt-out → terminate all active drips for that phone.
- **Google review match** → existing review sync sets `review_left = true` → publish `drip/step.engagement` (review_left).

### 8.3 Cron we keep / change

- **Replace** `/api/cron/follow-up` Inngest behavior to enqueue **first** in-flight `drip/step.run` for any campaign with overdue scheduled runs (safety net for missed scheduler ticks). Cron itself stays, schedule unchanged.

### 8.4 Concurrency

- Per-function concurrency: `dripStepWorker` limit **5** (matches `processScheduledReviewRequest` you already set for plan-tier safety).
- Per-business throttle: at most **100 messages/min** to avoid Twilio/Resend rate limits.

---

## 9. Compliance, deliverability, throttles

| Concern | Implementation |
|---|---|
| **STOP/HELP** | Inbound SMS Twilio webhook flags `customers.is_opted_out = true` (already exists). Drip listener terminates all active runs for that phone. |
| **Email unsubscribe** | List-Unsubscribe header (already in `services/resend/send-email.ts`) + per-business suppression list. |
| **Quiet hours** | `notification_preferences.quiet_hours_start/end` already exist for users. Add **business**-level `quiet_hours_send_start/end` (default 9–18 in business TZ). Reschedule, don't drop. |
| **Daily contact cap** | Hard cap: max 1 message per contact per 12h across all campaigns (configurable per business). |
| **Plan quotas** | Check `checkLimit` per send. If over, mark `failed_quota` and surface in UI. |
| **Disclosures** | First SMS step auto-appends "Reply STOP to opt out" if `business.region IN ('US','CA')` and template doesn't already contain it. |

---

## 10. Analytics

### 10.1 Per-step KPIs (Phase 1)

For each `(campaign, step)`:
- Eligible (entered step), sent, delivered, opened, clicked, terminated, failed.
- Conversion to review (single-touch and multi-touch).
- Avg latency to engagement.

Implementation: materialized view `campaign_step_stats` refreshed via `pg_cron` every 5 min (or compute on read for low traffic).

### 10.2 Conversion attribution

- **Single-touch:** review attributed to the **last** step the customer received before leaving the review (`last_step_run.completed_at < review.created_at`).
- **Multi-touch:** linear split across all received steps.
- Surfaced in `/campaigns/:id` analytics view + the existing `/requests` and `/analytics` pages.

---

## 11. Phased delivery

Each phase ends with a demo-able outcome. Don't merge to `main` until exit criteria pass.

### Phase 0 — Foundation (Week 1, ~3 dev-days)

**Goal:** make existing follow-up not lie. Ship even if Phase 1 slips.

- [ ] Migration: rename internal `follow_up_*` to be a single Step 2 record (no schema change, mapper only).
- [ ] Fix worker filter: respect `clicked_at IS NOT NULL` as smart-skip (current code only filters by status).
- [ ] Add business-level `quiet_hours_send_start/end` columns + UI in Settings → Notifications.
- [ ] Add `daily_contact_cap` setting (default 1 / 12h).
- [ ] Honor cap + quiet hours in `processScheduledReviewRequest` AND `followUpWorker`.

**Exit criteria:**
- The UI promise ("Sent to contacts who haven't opened/clicked") is true.
- Sends never happen outside business quiet hours.
- All existing tests still pass + 3 new unit tests for skip logic.

### Phase 1 — Multi-step linear drip MVP (Weeks 2–3, ~7 dev-days)

**Goal:** match the screenshot. Linear N-step (max 6), smart-skip on by default.

- [ ] Migrations: `campaign_steps`, `campaign_step_runs`, `review_requests` additions, RLS.
- [ ] Backfill job: for every existing campaign, create Step 1 (initial send) + optional Step 2 (existing follow-up). Idempotent.
- [ ] API: `GET/PUT /api/campaigns/:id/steps` + `POST .../send` updates.
- [ ] Worker: `dripStepWorker` (replaces `followUpWorker` after dual-write window).
- [ ] Engagement listener: hook Resend/Twilio webhooks to publish `drip/step.engagement`.
- [ ] UI builder (linear): StepCard, WaitConnector, AddStepMenu, StepEditor.
- [ ] Analytics: per-step counts in `/campaigns/:id`.
- [ ] Tests: 12+ unit tests (state machine, smart-skip matrix, quiet-hour reschedule, fallback channel, idempotent retry).

**Exit criteria:**
- A user can build the exact screenshot (SMS → 2d → Email → 2d → Email → 2d → Email).
- Engagement at any step terminates downstream sends.
- Migration is reversible (down migration tested in staging).
- p95 step execution latency < 30s after scheduled_for.

### Phase 2 — Visual builder polish + branches + versioning (Weeks 4–5, ~6 dev-days)

**Goal:** delight + power.

- [ ] Drag-to-reorder steps.
- [ ] Branch node: "if opened then X else Y" (one level deep).
- [ ] Campaign versioning: editing a live drip clones into v2 instead of mutating v1.
- [ ] Template library: pre-built sequences (Restaurant 3-step, Service 4-step, Re-engagement 2-step).
- [ ] CSV import column → `language` for multi-lingual templates per recipient.

**Exit criteria:**
- 80%+ users picking a template in the new-campaign wizard within 7 days.

### Phase 3 — Adaptive AI (Weeks 6–8, ~10 dev-days)

**Goal:** the "advanced" angle competitors lack.

- [ ] **AI copywriter** in `StepEditor`: "rewrite warmer", "shorter", "add urgency". Uses existing Vertex AI integration.
- [ ] **Channel recommender**: per recipient, recommend best channel based on prior open rate.
- [ ] **Send-time optimizer**: model trained on opens/clicks predicts best 1-hour window per recipient; baked into `wait_minutes` rescheduling.
- [ ] **A/B testing**: step can hold 2 variants; auto-promotes winner after 100 sends with 95% confidence.
- [ ] **AI follow-up generator**: if recipient ignores step N, auto-draft a shorter step N+1 in a different tone.

**Exit criteria:**
- A/B-tested step 2 lifts click rate by ≥10% on the largest customer.

### Phase 4 — POS / segment triggers (Weeks 9–10, ~6 dev-days)

**Goal:** automation at the source.

- [ ] Trigger: `pos.payment_completed` (Toast already in the connector list) → start drip.
- [ ] Segment trigger: customer attribute change (e.g. tag added) → start drip.
- [ ] Zapier action: `Start Drip Campaign` with payload schema.
- [ ] Stop conditions: customer responds via call/email → end drip (CRM integrations).

---

## 12. Migration strategy (Phase 1 specifically)

**Dual-write window: 2 weeks.**

1. Deploy Phase 1 code with `FEATURE_DRIP_V2=false`. New tables exist; nothing reads them.
2. Backfill: create `campaign_steps` rows from existing `follow_up_*` columns.
3. Internal team flips flag for own org → smoke test.
4. Toggle flag per business (admin UI) for 10% of customers.
5. Compare metrics 7 days: review conversion, complaint volume, Twilio/Resend cost.
6. Roll to 100%; remove old `followUpWorker` and `follow_up_*` columns in Phase 2 cleanup.

Rollback: flag flip + Inngest pause on `dripStepWorker`. Existing `processScheduledReviewRequest` still owns initial sends.

---

## 13. Telemetry & success metrics

| Metric | Source | Target after Phase 1 (60 days) |
|---|---|---|
| Multi-step campaigns created | DB count | ≥30% of new campaigns |
| Median steps per campaign | DB | 3 |
| Review conversion lift vs single-send | A/B on first 100 customers | +15% |
| Steps wasted (sent after engagement) | `step_runs.status='sent' AND review_left=true` | <2% |
| Time-to-build a 3-step campaign | UX instrumentation | <90s p50 |
| Customer complaints / opt-outs | `customers.is_opted_out` rate | unchanged or lower |
| Inngest error rate on `dripStepWorker` | Inngest dash | <0.5% |

Add PostHog events: `campaign_step_added`, `campaign_step_removed`, `drip_instance_started`, `drip_instance_terminated{reason}`.

---

## 14. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Step-run table grows fast (N steps × M recipients) | High | Medium | Partition by `created_at` monthly after Phase 2; index hygiene |
| Inngest retries cause double sends | Medium | High | `UNIQUE (step_id, review_request_id)` + idempotency keys + status guard |
| Customer drowned in messages | Medium | Critical | Daily contact cap, smart-skip, quiet hours, STOP honored across campaigns |
| Editing live campaign breaks runs | Medium | Medium | Campaign versioning in Phase 2; freeze edits in Phase 1 with warning |
| Twilio cost spike | Medium | Medium | Plan quotas already enforced; per-business send budget alarm |
| Migration data drift | Medium | Medium | Dual-write window + read-side fall back to legacy `follow_up_*` |

---

## 15. Open product questions (decide before Phase 1)

1. Do we allow a **wait** at the very end of a sequence? (Recommendation: **no** — terminate when last action sends.)
2. Maximum allowed sequence length? (Recommendation: **6 in Phase 1**, **12 in Phase 2**.)
3. Should we **block** a user from making a campaign that violates plan quota at creation, or only at send time? (Recommendation: **soft warn at create, hard block at send**.)
4. Per-step template variables — do we add per-recipient custom variables (e.g. `{appointment_date}`)? (Recommendation: **Phase 2**.)
5. Do we expose the JSON export now or in Phase 3? (Recommendation: **Phase 2** — multi-location buyers ask for this often.)

---

## 16. Engineering deliverables checklist

Use this as the literal PR list.

### Backend
- [ ] Migration: create `campaign_steps`, `campaign_step_runs`.
- [ ] Migration: add `drip_*` columns to `review_requests`.
- [ ] RLS policies for new tables.
- [ ] `src/services/campaigns/steps-mapper.ts` (legacy ↔ new translator).
- [ ] `src/services/campaigns/drip-state-machine.ts` (pure, fully unit-tested).
- [ ] `src/services/inngest/drip-step-worker.ts` + register in `route.ts`.
- [ ] Resend webhook → `drip/step.engagement` publisher.
- [ ] Twilio inbound webhook → opt-out + termination.
- [ ] `/api/campaigns/[id]/steps` GET + PUT routes.
- [ ] `/api/campaigns/[id]/recipients/[rid]/stop` route.

### Frontend
- [ ] `components/campaigns/builder/*` (StepCard, WaitConnector, AddStepMenu, StepEditor, PreviewPane).
- [ ] Integrate builder into `/campaigns/new` (replaces existing Step 2 + Step 3).
- [ ] Builder in `/campaigns/[id]/edit` (new route).
- [ ] Per-step analytics in `/campaigns/[id]`.
- [ ] "Stuck drip" warning + manual stop button in recipient row.

### Ops
- [ ] PostHog dashboard for drip funnel.
- [ ] Better Stack monitor for `dripStepWorker` p95 latency.
- [ ] Vercel env doc updated.
- [ ] Internal runbook: "How to stop a runaway drip".

---

## 17. References

- Existing follow-up code: `src/services/inngest/sync-worker.ts` (`followUpWorker`).
- Existing send paths: `src/lib/review-requests/send-outbound.ts`, `src/lib/notifications/review-request.ts`.
- Existing templates: `src/lib/campaigns/templates.ts`.
- Cron entry: `src/app/api/cron/follow-up/route.ts`.
- Schema: `supabase/migrations/001_initial_schema.sql` (lines 192–246), `003_campaigns_alter.sql`, `20260304202800_audit_schema_fixes.sql`.

---

## 18. Estimated total effort

| Phase | Dev-days | Calendar weeks |
|---|---|---|
| Phase 0 | 3 | 1 |
| Phase 1 | 7 | 2 |
| Phase 2 | 6 | 1.5 |
| Phase 3 | 10 | 2 |
| Phase 4 | 6 | 1.5 |
| **Total** | **32** | **~8** with 1 backend + 1 frontend dev |

If only one engineer, plan **~10–12 weeks** with Phase 1 shipping in 3 weeks.
