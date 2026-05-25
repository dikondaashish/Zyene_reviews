# GEO owner final checklist

One ordered list for GEO closeout. Check boxes only when **done with evidence**.

**Status:** Engineering Phases 1–4 complete. Phases 0, 5–8 need owner execution.

---

## Phase 0 — Baseline

- [ ] Create Google Cloud **Desktop OAuth** client (Search Console API enabled)
- [ ] Add `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` to `.env.local` (unset `GOOGLE_APPLICATION_CREDENTIALS`)
- [ ] Run `pnpm geo:gsc-baseline` (try `GSC_SITE_URL="sc-domain:zyenereviews.com"` if needed)
- [ ] Confirm files in `reports/gsc/` (JSON + CSV + summary)
- [ ] Link or paste GSC results into [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md)
- [ ] Complete AI citation log (7 queries × 5 platforms) in [GEO_BASELINE_AUDIT.md](./GEO_BASELINE_AUDIT.md) §4a
- [ ] Save screenshots to `reports/ai-citations/` (optional, gitignored)

---

## Phase 5 — Leads & nurture

- [ ] Read [LEAD_NURTURE_QA_RUNBOOK.md](./LEAD_NURTURE_QA_RUNBOOK.md)
- [ ] Run `node scripts/qa-lead-magnet-flow.mjs` (dry-run)
- [ ] Run `--execute` on **staging/local** only (never production list spam)
- [ ] Verify Resend: pack email vs welcome email by source
- [ ] Verify Inngest: nurture **skipped** for template pack + QA UTM
- [ ] Log into `/growth` — template pack + local SEO funnel sections
- [ ] Run cleanup SQL for QA rows (runbook)

---

## Phase 6 — Distribution

- [ ] Read [GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md](./GEO_DISTRIBUTION_OWNER_POSTING_PLAN.md)
- [ ] Post Week 1 sequence (LinkedIn, X/Threads, email) — **manual only**
- [ ] Paste **real post URLs** into [GEO_DISTRIBUTION_EXECUTION_TRACKER.md](./GEO_DISTRIBUTION_EXECUTION_TRACKER.md)
- [ ] Record impressions/clicks after 24h and 7d

---

## Phase 8 — Weekly measurement

- [ ] `pnpm geo:weekly-report` → fill `reports/geo-weekly/week-<date>.md`
- [ ] `node scripts/validate-geo-faq-production.mjs` after deploys that touch FAQ/schema
- [ ] `pnpm indexnow:ping` only when public marketing URLs change

---

## Phase 7 — Proof & profiles (ongoing)

- [ ] [GEO_EXTERNAL_PROFILE_CHECKLIST.md](./GEO_EXTERNAL_PROFILE_CHECKLIST.md) — G2, Capterra, LinkedIn, etc.
- [ ] [GEO_PROOF_COLLECTION_RUNBOOK.md](./GEO_PROOF_COLLECTION_RUNBOOK.md) — verified metrics only
- [ ] Do **not** publish `/research/2026-local-reviews-benchmark` until real data exists

---

## Sign-off rules

- [ ] I did **not** invent GSC, AI, funnel, or distribution metrics
- [ ] I did **not** mark distribution complete without post URLs
- [ ] I understand **engineering closeout ≠ all GEO phases complete**

When Phase 0 + first weekly report are real: update [GEO_CLOSEOUT_STATUS.md](./GEO_CLOSEOUT_STATUS.md) manually.
