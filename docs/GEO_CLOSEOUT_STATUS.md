# GEO closeout status

**Last updated:** 2026-05-25

**Summary:** Engineering and documentation closeout is complete. Manual execution, real data, and weekly measurement are still pending.

**Owner one-pager:** [GEO_OWNER_FINAL_CHECKLIST.md](./GEO_OWNER_FINAL_CHECKLIST.md) · [GEO_OWNER_FINAL_ACTIONS.md](./GEO_OWNER_FINAL_ACTIONS.md)

---

## Phase status

| Phase | Scope | Engineering | Owner / external |
|-------|--------|-------------|------------------|
| **1** | Content & on-page GEO | **Complete** | — |
| **2** | Schema, FAQs, internal links | **Complete** | — |
| **3** | Distribution copy & UTMs (repo) | **Complete** | Posts + URLs **pending** |
| **4** | Lead magnets, nurture, `/growth` | **Complete** | QA execution **pending** |
| **0** | GSC export + AI citation baseline | Script + docs **ready** | OAuth run + AI log **pending** |
| **5** | Lead/nurture QA + subscriber tracking | Tracking + runbook **ready** | Resend/Inngest/Supabase verify **pending** |
| **6** | Distribution posting | Posting plan + tracker **ready** | Real posts **pending** |
| **7** | Proof + external profiles | Runbooks **ready** | Case studies, listings **pending** |
| **8** | First weekly report | Template + `geo:weekly-report` **ready** | Fill with real numbers **pending** |

**Counts (honest):**

- Engineering complete: **Phases 1–4** (+ automation/docs for 0, 5–8)
- Manual execution pending: **Phases 0, 5, 6, 7, 8**
- External platform pending: GSC property access, G2/Capterra/Crunchbase, social posts, customer permission for proof

---

## What engineering shipped

| Area | Deliverable |
|------|-------------|
| GSC | `pnpm geo:gsc-baseline` — OAuth primary, SA fallback; `reports/gsc/*` outputs |
| Weekly | `pnpm geo:weekly-report` — dated file from template; optional GSC + funnel pull |
| QA | `scripts/qa-lead-magnet-flow.mjs` — dry-run default; [LEAD_NURTURE_QA_RUNBOOK.md](./LEAD_NURTURE_QA_RUNBOOK.md) |
| `/growth` | Template pack + local SEO checklist sections; report APIs (auth required) |
| Docs | Owner actions, checklist, distribution plan, proof runbook, external profiles |
| Validation | `validate-geo-faq-build.mjs`, `validate-geo-faq-production.mjs` |

---

## Owner next actions (ordered)

1. **GSC OAuth** — `pnpm geo:gsc-baseline` ([GEO_OWNER_FINAL_ACTIONS.md](./GEO_OWNER_FINAL_ACTIONS.md) §1).
2. **AI citation baseline** — fill §4a in [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) (7 queries × 5 platforms).
3. **Lead/nurture QA** — [LEAD_NURTURE_QA_RUNBOOK.md](./LEAD_NURTURE_QA_RUNBOOK.md) + `node scripts/qa-lead-magnet-flow.mjs`.
4. **Week 1 distribution** — [GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md](./GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md); paste URLs in [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md).
5. **First weekly report** — `pnpm geo:weekly-report` → edit `reports/geo-weekly/week-<date>.md`.
6. **External profiles** — [GEO_EXTERNAL_PROFILE_CHECKLIST.md](./GEO_EXTERNAL_PROFILE_CHECKLIST.md).
7. **Real proof** — [GEO_PROOF_COLLECTION_RUNBOOK.md](./GEO_PROOF_COLLECTION_RUNBOOK.md); no benchmark page until data exists.

---

## Weekly command checklist

```bash
pnpm geo:gsc-baseline                                    # if new week / refresh GSC
pnpm geo:weekly-report                                   # create dated report file
node scripts/qa-lead-magnet-flow.mjs                     # dry-run QA
# With GROWTH_DASHBOARD_SECRET in .env.local:
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://www.zyenereviews.com/api/internal/marketing/template-pack-report?days=7"
curl -s -H "Authorization: Bearer $GROWTH_DASHBOARD_SECRET" \
  "https://www.zyenereviews.com/api/internal/marketing/local-seo-checklist-report?days=7"
node scripts/validate-geo-faq-production.mjs             # after deploy
pnpm indexnow:ping                                       # only if public marketing URLs changed
```

Then: fill AI citation log, paste social/email URLs, complete weekly report sections.

---

## Sign-off rules

- **Do not** mark baseline complete in the playbook until GSC has real export data and AI log is filled.
- **Do not** mark distribution complete without real **final posted URL** values.
- **Do not** say “all GEO phases are complete.”

**Production GEO QA (last known):** FAQ validator 7/7 on `www.zyenereviews.com`; smoke URLs 200. Re-run after each GEO deploy.
