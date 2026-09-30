# Reviews Workspace: Phased Implementation Plan

- Created: September 29, 2026
- Status: Planning complete; implementation not started
- Primary surface: `https://app.zyenereviews.com/reviews`
- Planning baseline: repository commit `216125dc` and the September 29 live-page audit
- Scope: All Reviews-page recommendations from the owner-needs research, including later differentiators.

## 1. Product outcome

Give a business owner a dependable daily workflow that answers four questions:

1. What needs my attention?
2. What should I say or do next?
3. Who is responsible for the follow-up?
4. Was the response published and was the customer's problem resolved?

Success means less time spent finding work, fewer unanswered reviews, fewer lost drafts, and visible ownership of customer issues. Measure those outcomes directly. Do not represent reply counts as recovered customers or infer revenue without transaction evidence.

### Scope boundaries

- Focus implementation on Reviews and the supporting services, notifications, settings, widgets, and Analytics needed by these workflows.
- Preserve both light and dark modes and the established app palette in `src/app/dashboard-colors.css`.
- Preserve original platform logos and available reviewer avatars.
- Keep the homepage welcome/business heading, Smart Insights, and Customer Portal sections in their existing design and placement, as previously requested.
- Reuse current review syncing, reply publishing, AI generation, business membership, notifications, and widget capabilities.
- Native publishing is currently implemented for Google. Other sources must expose their actual capabilities; do not display a working in-app publish action without a verified provider integration.
- Do not add a new review platform, native mobile app, complete helpdesk, or revenue-attribution system as an incidental part of this roadmap.
- The document specifies future work. Its estimates, proposed filenames, schemas, and endpoints are implementation proposals, not capabilities already shipped.

## 2. Evidence and current baseline

### Research that informs priority

| Evidence | Product implication | Source |
|---|---|---|
| 54% of surveyed SMB owners manage marketing themselves; 778 US owners/managers participated. | Make frequent work fast and interruption-tolerant. | [BrightLocal SMB Marketing Report 2025](https://www.brightlocal.com/research/smb-marketing-2025/) |
| 81% of consumers expect a response within a week; 50% say generic replies make them unlikely to choose a business. The study surveyed 1,002 US adults. | Surface waiting time and preserve quality when automating replies. | [BrightLocal Consumer Review Survey 2026](https://www.brightlocal.com/research/local-consumer-review-survey/) |
| Saved review views, labels, response approvals, and review-to-ticket workflows exist in established products. | These are useful workflow precedents, with a simpler implementation suitable for local businesses. | [Sprout Reviews](https://support.sproutsocial.com/hc/en-us/articles/360031168531-Reviews), [Yext labels](https://help.yext.com/hc/en-us/articles/115005973763-Review-Labels), [Birdeye approvals](https://support.birdeye.com/en/articles/12829765-how-to-set-up-and-use-review-response-approvals), [Birdeye ticketing](https://support.birdeye.com/en/articles/16890868-how-to-automate-tickets-from-online-reviews-and-survey-responses) |

Research supports these priorities but does not establish demand or willingness to pay among Zyene customers. Validate workflow decisions with a small pilot. Source details and provider capabilities must be rechecked when the relevant phase begins.

### Observed product state

At the time of the live audit, the selected business showed 329 public reviews, one needing a reply, zero private-feedback entries, and automatic Google replies enabled for new reviews rated four stars and above. These are a point-in-time observation, never seed data or values to hardcode.

| Capability | Existing foundation | Actual improvement needed |
|---|---|---|
| Review inbox | Search, status, single-rating filter, sorting, pagination, compact rows | Workload summary, richer filters, saved views, review deep links |
| Replies | Manual replies, three AI tones, editing/deleting Google replies | Persistent drafts, snippets, business context, reliable publishing states |
| Automation | Google auto-replies with rating/tone/time eligibility | Draft-only mode, complaint exceptions, approvals, visible execution history |
| Team | Business membership and roles | Per-review assignment, private notes, ownership and due dates |
| Private feedback | Open, contacted, resolved, available contact details | Follow-up ownership, reminders, resolution evidence, consistent detail workflow |
| Public review status | Pending, responded, ignored | Separate operational issue lifecycle |
| Analysis | Sentiment, urgency, themes, homepage insights, Analytics | Review-level filtering, evidence drill-down, actions derived from themes |
| Notifications | Email/SMS review alerts and weekly digest in code | Exact-review links, aging reminders, location-scoped recipient checks |
| Sync | Status and last-sync fields, background sync and progress | Visible freshness and recovery on the Reviews page |
| Export | Public/private CSV export | Current filters, selected rows, complete pagination, response fields |
| Social proof | Existing review widgets | Select a review for reuse and generate an attributed share graphic |

Existing code is not proof that every external delivery succeeds in production. Verify actual notification delivery and source synchronization during their phases.

## 3. Schedule, staffing, and release milestones

### Planning assumptions

- One full-time senior fullstack engineer, with approximately one day per week of design/product input and one to two days per week of QA support.
- A working non-production environment, test Google Business Profile connection, email/SMS test setup, and database migration workflow are available.
- Weeks are relative to the implementation kickoff. Week 1 starts when implementation begins; this document does not commit the team to a calendar start date.
- One week means five working days. Estimates include implementation, review, focused tests, and phase-level validation.
- This is a 20-week baseline, approximately 100 working days. Allow another 2–4 weeks if provider restrictions, schema discrepancies, or limited QA availability require it. Re-estimate after Phase 1.
- A phase completes only when its acceptance criteria and release gate pass. A target week is not a reason to skip validation.

### Master phase schedule

| Phase | Target window | Complete by | Main deliverable | Depends on |
|---|---|---|---|---|
| 1. Contracts and foundations | Week 1 | End of Week 1 | State definitions, shared filters/access, fixtures, feature controls | Current audit |
| 2. Actionable inbox and trustworthy data | Weeks 2–3 | End of Week 3 | Workload counts, filters, exports, sync health, review detail route | Phase 1 |
| 3. Drafts, saved views, and reply efficiency | Weeks 4–5 | End of Week 5 | Persistent drafts, saved views, snippets, efficient detail panel | Phase 2 |
| 4. Team ownership and customer follow-up | Weeks 6–8 | End of Week 8 | Assignments, notes, due dates, public issue resolution | Phases 1–3 |
| 5. Controlled AI and publishing | Weeks 9–11 | End of Week 11 | Brand guidance, draft-only mode, approvals, publish ledger | Phases 3–4 |
| 6. Alerts and follow-up reminders | Week 12 | End of Week 12 | Exact-review alerts, overdue reminders, escalation | Phases 2, 4–5 |
| 7. Evidence-based insights and outcomes | Weeks 13–14 | End of Week 14 | Theme drill-down, action creation, workflow metrics | Phases 4–6 |
| 8. Translation, sharing, and reporting | Weeks 15–16 | End of Week 16 | Language tools, review reuse, policy-report tracking | Phases 3, 5 |
| 9. Multiple-location operations | Weeks 17–18 | End of Week 18 | Permission-scoped combined inbox and location comparison | Phases 4–7 |
| 10. Pilot evaluation and general rollout | Weeks 19–20 | End of Week 20 | Completed product pilot, performance checks, release evidence | Phases 1–9 |

### Incremental releases

- **Release A, end of Week 3:** Useful daily inbox with workload counts, richer filters, accurate exports, and sync freshness.
- **Release B, end of Week 5:** Core owner workflow complete with persistent drafts and saved views.
- **Release C, end of Week 8:** Team follow-up and issue resolution available to pilot businesses.
- **Release D, end of Week 12:** Controlled automation and reminders available to pilot businesses.
- **Release E, end of Week 18:** Insights and advanced workflows ready for the final rollout gate.
- **General availability, end of Week 20:** All accepted capabilities released according to validated entitlements.

Run usability checks at every release. Phase 10 consolidates evidence and broadens rollout; it is not the first time real users see the work.

## 4. Technical decisions shared by all phases

### 4.1 Separate the three kinds of state

| State | Meaning | Proposed values |
|---|---|---|
| Response state | Whether the public review has a published response or is intentionally set aside | Retain `pending`, `responded`, `ignored` |
| Issue state | Whether the operational problem is being handled | No issue, `open`, `in_progress`, `resolved` |
| Draft/publishing state | Progress of a particular reply revision | `draft`, `awaiting_approval`, `rejected`, `approved`, `publishing`, `published`, `failed`, `superseded` |

- Publishing a reply must not resolve an issue automatically.
- Ignoring a review must not resolve or delete an existing follow-up.
- A review can have a published reply and an open issue at the same time.
- Private feedback retains its existing `open/contacted/resolved` values. The UI may label `contacted` as in progress, but there must be one authoritative stored status for that feedback record.
- Show "Resolved" when staff record resolution. Show a recovered-customer outcome only when separately confirmed, with a date and optional note.

### 4.2 Shared query and count rules

- Build a shared Zod filter schema and query helper used by server rendering, client list requests, counts, and exports.
- Keep existing `type`, `status`, `rating`, `sort`, `q`, and `page` URLs working. Add versioned normalization for newer array filters and saved views.
- Define date filtering in the business timezone with an inclusive start and exclusive end. Use the existing effective-review-date conventions where appropriate.
- Use deterministic ordering with an ID tie-breaker. Test identical review dates and ratings across page boundaries.
- Workload totals are for the accessible business and selected visibility type. Label them clearly when they are not narrowed by search filters.
- Status-tab counts apply the other active filters but exclude the active response-status filter. List result count applies every active filter.
- Count visible public reviews consistently with existing visibility rules. Do not compute totals from the current 20-row page.
- Reset pagination on filter changes. Preserve it when returning from a detail panel where the result set is unchanged.
- Prevent a stale request from another business or an earlier filter selection from replacing the current result.
- Cache keys must include access scope, business, normalized filters, and relevant version. Mutations invalidate list, count, detail, and dashboard caches that depend on them.

### 4.3 Proposed data model

Inspect the deployed schema and existing migrations before creating these structures. Names below are proposed. Add each structure in the phase that needs it, not all at once.

| Structure | Purpose and key constraints | First phase |
|---|---|---|
| `business_review_workflow_settings` | Response target hours, workflow defaults; unique business | 2 |
| `review_reply_drafts` | Business/review/user, body, revision, base provider-response fingerprint, state, saved timestamp; private draft per author until submitted | 3 |
| `review_saved_views` | Owner, business, name, versioned filter JSON; start personal, extend to shared later | 3 |
| `review_response_templates` | Business snippets, title, body, approved variable list, author, revision | 3 |
| `review_cases` | Public review issue; business/review unique, status, assignee, due date, resolution details, revision | 4 |
| Existing `private_feedback` additions | Assignee, due date, resolution metadata, revision; preserve its status as authoritative | 4 |
| `review_internal_notes` | Public review or private feedback reference, author, text, timestamps; exactly one subject | 4 |
| `review_activity_events` | Append-only record of state transitions and actors; minimal payload, never a client-authored audit log | 4 |
| `business_reply_profiles` | Preferred tone, language, approved facts/contact details, instruction revision | 5 |
| `review_reply_approvals` | Exact draft revision, submitter, approver, decision, reason, timestamps | 5 |
| `review_reply_operations` | Publishing attempts, idempotency key, payload revision/hash, provider outcome, error category, retry state | 5 |
| `review_notification_deliveries` | Recipient/channel/event identity, claim status, attempt/provider ID, delivered/failed state | 6 |
| `review_topic_actions` | Topic, business, period, evidence review references, assignee/status; links to cases where relevant | 7 |
| `review_translations` | Subject, source-content hash, target language, translated text, model/version, timestamp | 8 |
| `review_report_records` | Review, platform, reason, external reporting link, owner-recorded status/evidence | 8 |
| Widget selection or share metadata | Extend current widget config when possible; store review selection and attribution rather than duplicate review bodies | 8 |

For note/activity subjects, use real foreign keys and a check requiring exactly one of `review_id` or `private_feedback_id`; do not rely on an unconstrained generic string ID. Ensure the referenced record belongs to the same business using composite constraints or an equivalent enforced invariant.

Proposed indexes include business plus status/due-date for work queues, business plus review for detail fetches, user plus business for drafts/views, and unique operation/delivery keys. Validate indexes against actual query plans and existing indexes.

### 4.4 Authorization and privacy

- Authenticate with `supabase.auth.getUser()` and resolve access on the server.
- Check active organization membership and the current business access model for every read and mutation. Organization membership alone must not accidentally grant access to every location.
- Reuse and consolidate existing access helpers. Review `src/services/reviews/reply-review-access.ts` during Phase 1 because current reply lookup joins organization membership, while the product also has business-specific roles.
- Recommended role contract: viewers read permitted reviews; members draft and contribute to assigned follow-up; managers manage local assignments and approvals; owners/admins manage workflow settings and location access. Preserve or explicitly migrate legitimate existing publishing permissions after the access audit.
- Define internal-note visibility separately from public review visibility. Never expose notes, drafts, contact details, or activity metadata in public widgets, graphics, public APIs, or marketing analytics.
- New exposed tables require explicit grants and RLS. Test allowed and denied operations, including attempts to change `business_id` or attach another tenant's review.
- Background jobs recheck current membership/settings where relevant. Server-side service credentials do not replace tenant validation.
- Regenerate database types using the existing project workflow; never hand-edit `database.types.ts`.
- Add new migrations only. Do not edit applied migrations. Rehearse additive migrations and rollback behavior on non-production data.

Reference: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [API security](https://supabase.com/docs/guides/api/securing-your-api). Check current documentation again before implementation.

### 4.5 UI structure and component boundaries

- Header: business context, workload summary, source freshness, Request review shortcut, export actions.
- Filter area: status tabs with counts, search, saved view picker, expandable advanced filters, visible active filter chips.
- List: compact reviewer identity, real source logo, rating/date, text preview, response status, and optional assignee/due information.
- Desktop detail panel: full review plus Reply, Internal notes, and Activity. Keep the list's position and selection.
- Mobile: full-screen detail view with an obvious back action, saved draft state, and reachable publish controls.
- Add Internal notes and Activity tabs only when implemented and available to that user. No decorative disabled features.
- Reuse existing primitives without editing `src/components/ui/`. Keep new components at or under 150 lines, services/libs at or under 200, and pages/routes thin and at or under 100, respecting the existing size ratchet.
- Use shared types under `src/types/`, `@/` imports, server components by default, and client components only for interaction.

## 5. Phase 1: Contracts and foundations

**Window:** Week 1. **Owner:** engineering lead with product/design. **Dependency:** audit baseline.

### Work

- [ ] Confirm live schema, source capabilities, role behavior, and existing notification delivery paths against the code baseline.
- [ ] Write shared filter definitions, response/issue state definitions, and count semantics from Section 4 into testable contracts.
- [ ] Resolve the canonical access helper for review reads, replies, exports, future drafts, and multi-location access.
- [ ] Specify supported actions per platform: read, native reply, edit/delete reply, external-source link, and reporting link.
- [ ] Establish a small feature-control mechanism using existing infrastructure where available. If absent, add a server-controlled environment switch and organization allowlist, without adding a feature-flag vendor solely for this roadmap.
- [ ] Define minimal workflow telemetry and baseline queries. Keep review text, reviewer names, notes, and contact details out of product-event payloads.
- [ ] Create non-production fixtures: no reviews, one review, 50 reviews, 5,000+ reviews, mixed platforms, long names/text, missing photos, edited/deleted reviews, expired integration, and multiple businesses with different access.
- [ ] Validate the core flow with 3–5 representative owners/managers where available; use findings to adjust ordering, not as an excuse to stop independent technical preparation.
- [ ] Prepare desktop/mobile wireframes within the current color and typography system.

### Code entry points

`src/app/(dashboard)/reviews/`, `src/services/reviews/reviews-list-api.ts`, `src/lib/reviews/`, `src/lib/auth/business-context.ts`, `src/lib/team/business-team.ts`, `src/services/reviews/reply-review-access.ts`.

Proposed additions: `src/lib/reviews/review-filter-schema.ts`, `src/services/reviews/review-access.ts`, `src/types/review-workflow.ts`.

### Completion gate

- Shared definitions cover existing behavior without breaking old URLs.
- Access tests cover revoked/suspended users and users with access to only one location.
- Baseline response-time, unanswered-count, error-rate, and sync-freshness definitions are recorded, even where values are initially unavailable.
- Each later phase has a feature control and clear acceptance owner. Revised estimates are recorded here.

## 6. Phase 2: Actionable inbox and trustworthy data

**Window:** Weeks 2–3. **Owner:** fullstack engineer, design, QA. **Dependency:** Phase 1.

### Work

- [ ] Add workload counts for Needs reply and Past response target, and show the oldest unanswered review. Add Needs follow-up only in Phase 4 when real issue data exists.
- [ ] Use a proposed default response target of 48 elapsed hours, configurable by a manager. Label it as the business's target, not a platform requirement. Do not send reminders until Phase 6.
- [ ] Show historical review age separately from discovery time. An old imported review can appear in the backlog, but later reminders must not suddenly notify owners about their entire imported history.
- [ ] Add date range, platform, multi-rating, sentiment/theme, and response-source filters where source data is available. Treat unavailable analysis as unknown, not positive/neutral.
- [ ] Add counts to status tabs, clear-filter controls, and consistent loading/error/empty states.
- [ ] Show last successful sync and connection state using existing sync fields. Never call an in-progress sync a successful sync.
- [ ] Introduce an authorized exact-review deep link and detail loader. Opening a review must work even when it is outside the current list page or filters.
- [ ] Build the initial detail panel/full-screen mobile view using existing reply components.
- [ ] Add filtered, selected, and all-result exports. Reuse query contracts and include response text/date/source where available.
- [ ] Ensure export pagination retrieves all requested rows beyond PostgREST page limits. Use deterministic chunking, CSV formula escaping, explicit errors, and an asynchronous export path if volume exceeds synchronous limits.
- [ ] Add an existing Review Requests destination shortcut; do not recreate the request-sending system.

### Code entry points

`reviews-page-client-header.tsx`, `reviews-filters.tsx`, `reviews-page-client-public-panel.tsx`, `reviews-page-client-types.ts`, list hooks under `src/components/reviews/`, `src/app/(dashboard)/reviews/reviews-page-list-load.ts`, `src/services/reviews/reviews-list-api.ts`, `src/services/reviews/export-api.ts`, and `src/lib/reviews/fetch-reviews-paginated.ts`.

### Acceptance and tests

- [ ] Counts agree with list queries for every filter combination; inactive/hidden reviews follow the documented rules.
- [ ] New and legacy URLs survive reload/back/forward navigation.
- [ ] A selected export contains exactly the authorized selected records; a filtered export matches all matching pages, not just the visible page.
- [ ] A 5,000-row fixture exports completely without truncation or formula execution in spreadsheet software.
- [ ] Detail navigation does not change the active business silently or leak a different tenant's data.
- [ ] Sync failures show an actionable state while previously loaded reviews remain available.
- [ ] Desktop, 390px mobile, keyboard, light/dark, and reduced-motion checks pass.

**Release gate:** Release A to pilot locations. No change to automatic-publishing settings.

## 7. Phase 3: Drafts, saved views, and reply efficiency

**Window:** Weeks 4–5. **Owner:** fullstack engineer and QA. **Dependency:** Phase 2.

### Work

- [ ] Persist drafts per user/business/review, with a revision number and saved timestamp.
- [ ] Autosave after a short idle interval, proposed 750ms, and on normal blur. Show Saving, Saved, Unsaved changes, and Save failed explicitly.
- [ ] Restore server drafts on return. Do not depend on browser unload requests to save text; warn on navigation when an unsaved draft cannot be persisted.
- [ ] Handle concurrent tabs with optimistic revision checks. Return a conflict response instead of overwriting a newer draft.
- [ ] If the review or existing provider response changed, ask the author to review the new context before publishing the old draft.
- [ ] Create personal saved views with a versioned filter payload, rename/delete support, and a clear default view.
- [ ] Add business response snippets, safe variables, preview, and insertion into an editable draft. Do not publish a snippet automatically.
- [ ] Add compact Reply and AI Suggest actions, Next/Previous review controls, and return-to-list position restoration.
- [ ] Make star-only reviews explain that there is no written content in both collapsed and expanded views.
- [ ] Add bulk tagging/assignment actions later in Phase 4; retain current bulk status actions and clarify their selection scope now.

### Code entry points

`use-review-card-reply.ts`, `review-card-composer.tsx`, `compact-review-row.tsx`, `review-management.tsx`, `bulk-review-action-bar.tsx`, and `src/services/reviews/`.

Proposed additions: a draft hook, draft service/API, saved-view picker/service/API, response-template picker/service/API, and phase-specific migrations.

### Acceptance and tests

- [ ] A saved draft survives reload, navigation, and browser restart and is unavailable to an unauthorized user.
- [ ] Two-tab edits cannot silently overwrite each other. Network errors leave typed text intact.
- [ ] Switching business never displays a draft or saved view from the previous business.
- [ ] Publishing a reply archives or marks the submitted draft appropriately; another user's stale draft is warned, not silently published.
- [ ] Saved views preserve supported filters and gracefully migrate or reject obsolete filter versions.
- [ ] No note/private-field variable can be inserted accidentally into a public reply.

**Release gate:** Release B. Owners can complete the daily review workflow without losing their work.

## 8. Phase 4: Team ownership and customer follow-up

**Window:** Weeks 6–8. **Owner:** fullstack engineer, product, QA. **Dependencies:** Phases 1–3.

### Work

- [ ] Add a public-review case with Open, In progress, Resolved, assignee, due date, and resolution note.
- [ ] Extend private feedback with equivalent ownership/due-date metadata while retaining its existing canonical status.
- [ ] Add internal notes and an immutable activity timeline for assignment, note changes, status changes, and resolution.
- [ ] Permit assignment only to active users authorized for that business. Show unassigned work and reassignment needs when a user loses access.
- [ ] Add My work, Unassigned, and Needs follow-up views and workload counts.
- [ ] Add manual labels and label filtering. Keep business labels distinct from AI-generated themes.
- [ ] Add bounded bulk assignment/tag operations with authorization per record, explicit partial-failure results, and a clearly stated selected-record count.
- [ ] Support reopening a resolved issue with a reason; retain resolution history.
- [ ] Record optional confirmed customer outcome separately from issue status. Use available contact information; do not guess a public reviewer's CRM identity from their name.
- [ ] Add team-shared saved views if the pilot demonstrates a need; personal views remain the default.

### Code entry points

`private-feedback-card-header.tsx`, `private-feedback-card-body.tsx`, `use-private-feedback-card.ts`, `src/services/reviews/private-feedback-api.ts`, `src/app/api/reviews/private/[id]/status/route.ts`, `bulk-review-action-bar.tsx`, and the new detail panel.

### Acceptance and tests

- [ ] Replying leaves an open case open; ignoring a review does not mark the case resolved.
- [ ] Public and private workflows show one consistent, authoritative status after reload.
- [ ] Members cannot assign records to users outside the permitted location or mutate another tenant's case.
- [ ] Notes never appear in public replies, widgets, public exports, or graphics.
- [ ] Concurrent assignment/status updates are revision-checked and represented accurately in activity history.
- [ ] Bulk actions report exact successes/failures and do not partially claim success as a complete operation.

**Release gate:** Release C with selected teams. Confirm they can hand work to another person and trace its outcome.

## 9. Phase 5: Controlled AI and publishing

**Window:** Weeks 9–11. **Owner:** fullstack engineer, product, QA. **Dependencies:** Phases 3–4.

### Work

- [ ] Add a business reply profile: preferred wording, contact details, tone, language, approved facts, and instructions to avoid unsupported promises.
- [ ] Add explicit modes: manual suggestions, generate drafts for review, and automatic publishing within allowed rules. Preserve current businesses' explicit settings during migration.
- [ ] Add complaint/risk exceptions to automatic publishing. Rating alone is insufficient; a four-star complaint may need review.
- [ ] Route ambiguous content to manual review. Start with conservative tested rules and validate any model classifier using a labeled set; do not imply a model score is guaranteed confidence.
- [ ] Add preview/test mode that evaluates rules and produces drafts without publishing.
- [ ] Add a one-step approval workflow with designated local approvers, rejection reasons, and resubmission. Multi-stage enterprise approvals are outside the initial scope.
- [ ] Bind approvals to the exact draft revision and source context. Editing an approved response invalidates approval.
- [ ] Add a durable publishing-operation ledger for manual and automated responses and expose pending/published/failed/skipped history with useful reasons.
- [ ] Recheck access, plan entitlement, automation mode, review state, and approval immediately before the external publishing call.
- [ ] Use per-review execution control and idempotency. If Google accepts a reply but local persistence times out, reconcile provider state before retrying.
- [ ] Provide retry only for recoverable failures; surface reconnect and quota errors distinctly. Never let a retry overwrite a different response subsequently posted on Google.
- [ ] Give managers a kill switch that stops queued automatic publication as well as new enqueueing.

### Code entry points

`auto-reply-toolbar-controls.tsx`, `use-auto-reply-toolbar.ts`, `src/services/reviews/auto-reply-eligibility.ts`, `src/services/inngest/functions/process-auto-reply-review-function.ts`, `src/services/reviews/post-google-reply-system.ts`, `src/services/reviews/reply-api.ts`, and `src/domains/ai/services/generate-reply-draft.ts`.

### Acceptance and tests

- [ ] Draft-only mode never invokes external publishing.
- [ ] Complaint examples that meet the star threshold can still be held for review.
- [ ] Changing text or source context prevents an old approval from authorizing new content.
- [ ] Disabling automation prevents queued jobs from publishing at their final execution check.
- [ ] Retries, duplicate jobs, stale drafts, provider timeouts, and externally edited responses do not create an unintended overwrite.
- [ ] Native publish success is based on confirmed provider behavior, not completion of AI text generation.
- [ ] Existing new-review/time-cutoff protections remain covered by regression tests.

**Release gate:** Draft-only/approval modes enter pilot first. Expand automatic-publishing rules only after their test cases and pilot review pass.

## 10. Phase 6: Alerts and follow-up reminders

**Window:** Week 12. **Owner:** fullstack engineer and QA. **Dependencies:** Phases 2, 4–5.

### Work

- [ ] Update existing review alerts to open the exact authorized review or private-feedback record.
- [ ] Preserve intended destination through login and show the business clearly before any mutation.
- [ ] Audit recipients using active location access. Do not send location-only information to every organization member automatically.
- [ ] Add owner-configurable unanswered-review and overdue-follow-up reminders, with an escalation recipient and frequency cap.
- [ ] Reuse notification preferences, business timezone, and quiet-hours behavior. A quiet-hours deferral should be re-evaluated later rather than sent as a burst of stale alerts.
- [ ] Define historical import suppression, deduplication, resolved-case suppression, and reply-before-send cancellation.
- [ ] Extend the existing weekly digest with unanswered aging, open follow-up, publishing failures, and direct action links.
- [ ] Persist delivery claims/results, handle retries, and reconcile ambiguous provider outcomes. Do not promise exactly-once email/SMS delivery where the provider cannot support it.

### Code entry points

`src/lib/notifications/review-alert.ts`, `src/lib/notifications/quiet-hours.ts`, `src/services/inngest/sync-workers/weekly-digest-worker.ts`, notification settings/components, and Resend templates.

### Acceptance and tests

- [ ] Links open the correct record for the correct business after login.
- [ ] Recipients who lose access stop receiving new alerts.
- [ ] A review answered before execution produces no overdue reminder.
- [ ] A repeated scheduler run does not create duplicate claimed deliveries.
- [ ] Quiet hours, daylight-saving transitions, opt-outs, retries, and import suppression are tested.

**Release gate:** Release D with test-channel evidence, then opted-in pilot recipients.

## 11. Phase 7: Evidence-based insights and outcomes

**Window:** Weeks 13–14. **Owner:** fullstack engineer and product/QA. **Dependencies:** Phases 4–6.

### Work

- [ ] Add a compact Reviews insight summary using existing analyzed themes and sentiment.
- [ ] Compare defined equivalent periods. Display numerator, denominator, analyzed coverage, and freshness.
- [ ] Count unique reviews per theme and keep links to the supporting records. Multiple themes per review are allowed and must be explained.
- [ ] Require a minimum sample, proposed five distinct reviews per comparison period, before displaying a trend. Show insufficient evidence when the threshold is not met.
- [ ] Allow owners to filter to a theme, correct a categorization, and create an operational action with an assignee and due date.
- [ ] Add response-time distribution, unanswered aging, overdue workload, and follow-up completion metrics to the existing Analytics surface.
- [ ] Separate manual and automatic replies. Exclude unknown dates from timing calculations and disclose coverage rather than inventing zeros.
- [ ] Report confirmed recovery outcomes separately from issue closure; do not estimate revenue from rating changes.

### Code entry points

`src/components/reviews/review-card-body.tsx`, `src/services/smart/`, `src/lib/analytics/`, `src/components/analytics/`, and workflow activity data from Phase 4.

### Acceptance and tests

- [ ] Every insight opens its supporting authorized review set.
- [ ] Empty/small samples, edited reviews, duplicate theme labels, and partial AI coverage do not produce misleading percentages.
- [ ] Creating an action records ownership and evidence without modifying the original review.
- [ ] Metrics use documented timestamps and populations and reconcile with underlying records.

**Release gate:** Owners can move from a recurring complaint to evidence and a tracked action. Homepage protected sections remain unchanged.

## 12. Phase 8: Translation, sharing, and reporting

**Window:** Weeks 15–16. **Owner:** fullstack engineer with design/QA. **Dependencies:** Phases 3 and 5.

### Workstream A: Language support

- [ ] Detect/allow selection of source language; preserve original text and display translation as a labeled alternate view.
- [ ] Cache translations by source-content hash and target language; invalidate on review edits.
- [ ] Let the owner draft in the customer's language and inspect a back-translation when useful.
- [ ] Rate-limit generation and apply existing plan rules. Language controls must not auto-publish a response.
- [ ] Test mixed-language text, Google-provided original/translated content, names, emoji, and non-Latin scripts.

Reference: [Birdeye multilingual review workflow](https://support.birdeye.com/en/articles/12654832-how-do-i-read-and-respond-to-reviews-that-are-not-in-english).

### Workstream B: Review reuse

- [ ] Add a shortlist/favorite action and an Add to widget action using existing widget configuration where possible.
- [ ] Add a share-graphic preview and download using existing rendering/export libraries where suitable.
- [ ] Preserve quote meaning, source attribution, date, and rating. Label excerpts, and avoid implying that a selected testimonial is the business's complete review distribution.
- [ ] Verify applicable source/asset-use requirements before supporting each source. Keep private feedback and internal notes out of this flow.
- [ ] If a review is deleted or hidden at source, remove it from live widget selections when synchronized; explain that already downloaded graphics cannot be recalled.

### Workstream C: Reporting assistance

- [ ] Provide source-specific instructions and an external reporting link for policy violations.
- [ ] Let an owner record the reason, submission date, pending decision, decision, and appeal/follow-up note.
- [ ] Mark status as owner-recorded unless a verified integration can retrieve it. Do not invent a reporting API or promise removal.
- [ ] Keep legitimate negative feedback in the review workflow. Reporting is not a way to silently delete it from the product.

Reference: [Google review reporting guidance](https://support.google.com/business/answer/4596773?hl=en).

### Acceptance and tests

- [ ] Original and translated text remain distinguishable and changing language never changes source content.
- [ ] A generated graphic contains only selected public fields and accurate attribution.
- [ ] Widget changes respect existing entitlements and business boundaries.
- [ ] Reporting opens the supported provider destination and records only facts the owner supplied or an integration confirmed.

**Release gate:** All three workstreams may ship independently behind separate controls when accepted.

## 13. Phase 9: Multiple-location operations

**Window:** Weeks 17–18. **Owner:** fullstack engineer and QA. **Dependencies:** Phases 4–7.

### Work

- [ ] Add an explicit All permitted locations scope alongside the current single-business scope.
- [ ] Resolve the accessible business set on the server. Never treat a client-supplied list of business IDs as authorization.
- [ ] Label every review with its location and show that context in the detail panel, composer, approvals, and bulk-action preview.
- [ ] Add location filters and organization-level shared views with access applied at read time.
- [ ] Aggregate unanswered, overdue, response-time, and follow-up metrics from authorized locations only.
- [ ] Use a stable merged ordering and scalable pagination. Establish query/index performance using representative multi-location fixtures.
- [ ] For bulk actions, validate permissions and assignee eligibility per record and return individual failures clearly.
- [ ] Scope CSV exports and reporting to the same authorized location set.

### Acceptance and tests

- [ ] A manager permitted at one location cannot discover counts, labels, drafts, notes, or reviews from another.
- [ ] Revoked access is respected by cached views, bookmarked URLs, queued exports, and mutations.
- [ ] Replying from the combined inbox uses the review's actual location and provider connection.
- [ ] Location comparisons disclose period and sample size and do not rank zero-data locations as best/worst.

**Release gate:** Release E to multi-location pilot teams with explicit role tests.

## 14. Phase 10: Pilot evaluation and general rollout

**Window:** Weeks 19–20. **Owner:** product lead, engineer, QA. **Dependency:** Phases 1–9.

### Work

- [ ] Run complete daily workflows with 5–10 pilot businesses, including at least two multi-location/team cases if available.
- [ ] Observe find-review, resume-draft, reply, assign, resolve, export, and reconnect tasks on desktop and mobile.
- [ ] Compare workflow measures against the Phase 1 baseline and document limitations of a small pilot.
- [ ] Run permissions, migration, retry, large-volume, accessibility, light/dark, and reduced-motion release checks.
- [ ] Validate keyboard focus on detail open/close, screen-reader labels, touch targets, empty states, and error recovery.
- [ ] Verify all background workers, scheduler registrations, environment settings, and provider callbacks in the deployment environment.
- [ ] Document onboarding, settings, support troubleshooting, source capability differences, and feature entitlements.
- [ ] Roll out progressively to pilot, a small eligible cohort, then all eligible businesses after observation windows of at least two business days per step.
- [ ] Record deployment/commit IDs, migration IDs, smoke-test evidence, metrics, and rollback instructions.

### General availability gate

- No unresolved cross-tenant access defect, draft-loss defect, or unintended-publishing defect.
- No known regression in existing review sync, manual replies, automatic eligibility, private feedback, widgets, or protected homepage sections.
- Feature-off rollback is rehearsed; queued jobs respect the disabled state.
- Core flows succeed in the deployed environment, not only in a fixture or build.
- Documentation and support instructions describe only released capabilities.

## 15. API and background-job work inventory

These are suggested contracts, finalized in the owning phase. All inputs require Zod validation, server-side access resolution, structured errors, and appropriate limits.

| Contract | Behavior | Phase |
|---|---|---|
| Existing `GET /api/reviews` | Shared filters, stable pagination, explicit counts | 2 |
| Review summary/detail reads | Authorized workload and exact-review detail independent of list page | 2 |
| Existing review export route | Filtered/all export; selected export can use a validated POST job contract for larger selections | 2 |
| Draft read/write | Author-scoped draft; conditional revision update; conflict response | 3 |
| Saved-view/template CRUD | Owner/business scope and versioned filters/variables | 3 |
| Case/note/assignment endpoints | Role-checked mutation plus transactionally recorded activity | 4 |
| Approval endpoints | Revision-specific submit, approve, reject, resubmit | 5 |
| Reply operation endpoint | Idempotent publish request and operation result | 5 |
| Reply execution worker | Final eligibility check, provider write, reconciliation, ledger update | 5 |
| Reminder/digest worker | Due-work selection, recipient eligibility, deduplication, preference checks | 6 |
| Insights/action endpoints | Evidence-backed summaries and linked operational actions | 7 |
| Translation/share/report endpoints | On-demand generation or owner-recorded reporting; explicit privacy boundaries | 8 |
| Combined inbox endpoints | Server-derived permitted locations, merged pagination and aggregates | 9 |

Prefer extending cohesive existing services over creating parallel implementations. Keep external publishing and notification effects behind durable operation records. Do not claim a distributed provider write and a local database write are one atomic transaction.

## 16. Test and verification strategy

### Tests by risk

| Area | Essential coverage |
|---|---|
| Filters/counts | Old URLs, date/timezone bounds, null dates, multi-rating, hidden rows, tab semantics, stable pagination |
| Tenant/role access | Different organizations; same organization/different permitted businesses; viewer/member/manager; revoked membership |
| Drafts | Restore, failed save, unsaved navigation, concurrent tab conflict, stale provider response |
| Follow-up | Reply versus resolution independence, assignment revocation, reopening, activity integrity |
| AI/publishing | Draft-only guarantees, rule exceptions, revision approvals, final checks, duplicated jobs, provider timeout reconciliation |
| Notifications | Recipient scope, preferences, quiet hours/DST, retries, suppression, no duplicate claims |
| Exports | Filters/selection parity, 5,000+ rows, CSV escaping, sensitive fields, failure handling |
| Insights | Unique-review evidence, sample thresholds, coverage, null timestamps, correct denominator |
| Advanced tools | Translation cache invalidation, graphic attribution, public/private boundary, source reporting limitations |
| UI | Light/dark, mobile/desktop, keyboard, focus return, reduced motion, loading/error/empty/offline states |

### Repository checks

- Run `pnpm verify:fast` and focused Vitest tests for ordinary implementation increments.
- Run `npx react-doctor@latest --verbose --diff` when React structure/hooks change and before UI commits as required by repository guidance.
- Run `pnpm check:colors` for dashboard visual changes.
- Run `pnpm check:migrations` and database allow/deny tests when migrations change.
- Run `pnpm build` for route, API contract, configuration, middleware, or compile-sensitive changes.
- Run `pnpm test` when shared libraries affect multiple test suites.
- At release gates run `pnpm verify && pnpm build`, then deployed smoke tests. Do not repeat the full production build after every small UI edit.
- Add Playwright coverage under the existing test setup for critical user flows. Use non-production data for publish/send verification; never send test replies to real customers.
- If a verification command fails, resolve it or document the concrete blocker before declaring the phase complete.

## 17. Success metrics and proposed targets

Targets below are hypotheses for the pilot, not current product performance or marketing claims. Record the baseline in Phase 1 and adjust targets transparently.

| Metric | Definition | Initial target |
|---|---|---|
| Time to find actionable work | Time from opening Reviews to opening a review requiring action in a usability task | Median under 15 seconds |
| Reply preparation time | Active time from opening composer to publish request, separated by manual/AI | 25% lower than baseline |
| On-time reply rate | Reviews answered within the configured response target divided by eligible reviews whose target has elapsed; ignored reviews remain disclosed | Improvement over baseline, segmented by source and manual/auto |
| Unanswered backlog | Visible unanswered reviews older than target, split into imported backlog and newly received reviews | Reduction in newly received overdue backlog |
| Draft recovery | Previously saved draft restored correctly during tested return sessions | 100% in defined regression scenarios; zero known lost saved drafts |
| Follow-up completion | Cases resolved by due date divided by cases due in the period | Improvement over baseline after Phase 4 |
| Publishing reliability | Provider-confirmed successful operations divided by attempted operations, with retries reconciled | Proposed 99% excluding documented provider outages; show outages separately |
| Data freshness | Time since last successful source sync | Within documented source schedule; notify only after a justified threshold |
| Usability completion | Pilot users completing core tasks without assistance | At least 90% across defined tasks |
| Permissions | Unauthorized reads/writes in tenant/role regression suite | Zero successful unauthorized operations |

Do not fabricate historical response times, saved drafts, assignments, or recovery outcomes. Start measuring at release when reliable history does not exist. Telemetry must use allowlisted identifiers/states and follow the app's privacy/retention policy.

Proposed performance budgets to validate in Phase 1: p95 server list/summary reads under 800ms on representative indexed fixtures; filter-to-result under 1.5 seconds on the documented test connection; no horizontal overflow at 390px. Measure cold and warm paths separately and revise with evidence if necessary.

## 18. Rollout, migration, and rollback rules

1. Deploy additive schema changes and policies before code that requires them. Rehearse against representative data and verify migration/type generation.
2. Release read paths before new writes where possible; backfill in resumable bounded batches with a version marker.
3. Preserve legacy filters, response states, notification preferences, and existing explicit auto-reply settings.
4. Do not enable new auto-publish rules, reminder channels, or shared-note visibility merely because code deployed.
5. Gate each phase independently. A translation issue should not require disabling the core inbox.
6. On publishing problems, stop job execution through the final eligibility check, not only by hiding UI controls.
7. Prefer disabling new code paths over dropping tables during rollback. Preserve drafts, cases, and audit history.
8. For ambiguous external results, reconcile before retrying. Record the last known outcome and useful next action.
9. Validate flag-off behavior against newly created data before rollout. Where legacy UI cannot show new data, provide a safe read-only recovery path.
10. Watch errors, job backlog, query latency, provider failures, and notification volume during each observation window.

## 19. Decisions and dependencies to resolve during implementation

| Decision/dependency | Proposed starting point | Resolve by |
|---|---|---|
| Business access and publishing permissions | Consolidate current business/organization checks; establish a tested role matrix | Phase 1 exit |
| Response target | Configurable 48 elapsed hours; historical backlog labeled separately | Phase 2 |
| Draft ownership | Private per author until submitted for review | Phase 3 |
| Supported source actions | Google native reply; explicit external handoff for unsupported sources | Phase 1, revalidate per source |
| Plan entitlements | Reuse current checks; do not invent or silently change paid-plan limits | Before each gated capability ships |
| Data retention | Align with existing policy; define archive/purge behavior for drafts, notes, translations, operations | Before each new data structure ships |
| Shared views | Personal first; team sharing only with location access applied at read time | Phase 4 |
| AI exceptions | Tested conservative rules, manual fallback; no reliability claim from model score alone | Phase 5 |
| Approval policy | One-step manager/owner approval tied to exact revision | Phase 5 |
| Pilot recruitment | 5–10 businesses, including team/multiple-location examples | Begin Phase 1, complete before Phase 10 |
| Provider reporting/asset permissions | Verify supported links, attribution, image use, and actual APIs | Phase 8 |
| Analytics event destination | Reuse an appropriate existing system; do not put private workflow content in marketing events | Phase 1 |

These are phase-level decisions, not reasons to delay unrelated work. Record confirmed decisions and revise the corresponding acceptance criteria.

## 20. First implementation checklist and progress ledger

### Start here

1. Read this plan, `AGENTS.md`, `PRODUCT.md`, and current relevant design documentation.
2. Inspect Git state and ongoing work. Account for unrelated files before choosing a branch or checkout.
3. Create a `codex/` branch for Phase 1 and confirm the current baseline against the implementation files listed above.
4. Complete the filter/state/access contracts and meaningful regression tests first.
5. Establish fixtures and baseline observations; finalize Phase 1 estimates and wireframes.
6. Implement Phase 2 as small reviewable changes: shared query contract, summary/counts, filters, detail navigation, exports, then sync health.
7. Update this ledger at each accepted release with commit/PR, migration, test, and deployed verification evidence.

### Feature coverage map

| Recommendation | Implementation phase |
|---|---|
| Workload counts, waiting time, priority views | 2; issue counts in 4 |
| Public problem-resolution lifecycle | 4 |
| Assignments, internal notes, activity | 4 |
| Persistent reply drafts | 3 |
| Advanced filters and saved views | 2–3 |
| AI controls, brand guidance, approvals | 5 |
| Sync and publishing health | 2 and 5 |
| Themes linked to evidence/actions | 7 |
| Accurate filtered/selected exports | 2; location scope in 9 |
| Exact-review alerts and reminders | Deep links in 2; delivery/reminders in 6 |
| Response snippet library | 3; business guidance in 5 |
| Translation and multilingual drafting | 8 |
| Review reporting assistance | 8 |
| Widget selection and share graphics | 8 |
| Combined location inbox | 9 |
| Response/follow-up/outcome metrics | Baseline in 1; instrumentation per phase; reporting in 7 |
| Premium desktop/mobile workflow | 2–3, validated throughout and in 10 |

| Phase | Status | Target completion | Actual completion | Evidence |
|---|---|---|---|---|
| 1 | Not started | Week 1 | — | — |
| 2 | Not started | Week 3 | — | — |
| 3 | Not started | Week 5 | — | — |
| 4 | Not started | Week 8 | — | — |
| 5 | Not started | Week 11 | — | — |
| 6 | Not started | Week 12 | — | — |
| 7 | Not started | Week 14 | — | — |
| 8 | Not started | Week 16 | — | — |
| 9 | Not started | Week 18 | — | — |
| 10 | Not started | Week 20 | — | — |

For each phase, completion evidence must contain the acceptance-checklist result, changed files, relevant migration IDs, test output summary, deployed smoke-test result, and any remaining known limitations. Move a phase to Complete only when that evidence exists.
