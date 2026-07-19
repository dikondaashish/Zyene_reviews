# Zyene Reviews — platform features

> Doc classification: lightweight product index. Shipped features point at code; unbuilt work is detailed under Planned. Full map: `docs/INDEX.md`. Unbuilt specs: `docs/ROADMAP.md`.

Reputation management SaaS for local businesses (multi-tenant Next.js + Supabase).

## Shipped

One line per capability. Code is the source of truth — do not expand here.

| Area | Pointer |
|------|---------|
| Onboarding (Org → Business → Category → Plan → All Set) | `src/app/onboarding/` |
| Google / Yelp / Facebook review sync | `src/services/{google,yelp,facebook}/` |
| Review inbox, reply, export, status | `src/app/(dashboard)/reviews/`, `src/services/reviews/` |
| AI analysis & draft replies (Google GenAI) | `src/domains/ai/` |
| Negative Feedback Shield + private feedback | `src/app/r/[slug]/`, `src/services/reviews/private-feedback-api.ts` |
| Campaigns: `manual_batch` / `scheduled` + SMS/email | `src/services/campaigns/`, `src/app/(dashboard)/campaigns/` |
| Optional single follow-up | `src/services/inngest/` (`follow-up-worker`) |
| Stripe subscriptions & plan limits | `src/services/stripe/` |
| Team roles & invites | `src/services/team/`, `src/app/(dashboard)/settings/team/` |
| Competitors + watch cron | `src/services/competitors/`, `src/app/api/cron/competitor-watch/` |
| Local SEO / GBP performance & AEO | `src/app/(dashboard)/google-seo-aeo/`, Google performance workers |
| Public review page & embed widget | `src/app/r/[slug]/`, `src/app/w/[slug]/` |
| Developer API + generic webhooks | `src/app/api/v1/`, `src/app/api/webhooks/generic/` |
| Background jobs (Inngest) + Redis rate limits | `src/app/api/inngest/`, `src/lib/db/redis.ts` |
| Demo overlays when Google not connected | dashboard/reviews loaders under `src/app/(dashboard)/` |

## Planned / Not Implemented

Status tags: **Planned** | **Coming Soon** | **Partially Implemented**.

### Campaign `pos_payment` trigger — Coming Soon

- **Intent:** Auto-send a review request after a POS payment (Square / Clover / Toast).
- **Today:** Trigger enum exists; campaign builder locks the option (`available: false` in `new-campaign-basics-step.tsx`). Integrations UI shows `PlaceholderCard` only (`integrations-pos-developer-sections.tsx`).
- **Missing:** Live POS OAuth/webhooks, payment→request pipeline, production send path.
- **Spec detail:** `docs/ROADMAP.md` (POS row + related drip/POS phases).

### Multi-step drip campaigns — Planned (proposal)

- **Intent:** Visual multi-step SMS/email sequences with smart-skip and per-step attribution.
- **Today:** Single-step campaigns + optional one follow-up only.
- **Missing:** Drip builder UI, step schema/tables, `dripStepWorker` (or equivalent).
- **Full design:** `docs/ROADMAP.md` § Multi-step drip campaigns.

### Zapier marketplace app — Planned

- **Intent:** Public Zapier app listing (triggers/actions in Zapier directory).
- **Today:** REST `api/v1/*` + generic inbound webhooks (Zapier-compatible DIY wiring).
- **Missing:** Official Zapier app submission, maintained Zapier integration package.

### TripAdvisor sync — Coming Soon

- **Intent:** Sync TripAdvisor reviews like other platforms.
- **Today:** Placeholder card on integrations UI only.
- **Missing:** Adapter, OAuth/API client, sync worker, inbox mapping.

### Physical QR order fulfillment — Coming Soon

- **Intent:** Customers order printed QR materials from the product.
- **Today:** QR **generate** API exists (`src/app/api/businesses/[id]/qr-code/`); UI still toasts order-as-coming-soon.
- **Missing:** Order/checkout/fulfillment flow.

### SSO (SAML/OIDC) — Planned

- **Intent:** Enterprise IdP login.
- **Today:** Sales/enterprise page copy only; no SAML/OIDC implementation in `src/`.
- **Missing:** IdP config, auth callbacks, org SSO enforcement. Pricing/SLA TBD (sales).

---

Stack (shipped): Next.js, Supabase, Stripe Subscriptions, Inngest, Twilio, Resend, Upstash, Google GenAI. Design tokens: `docs/DESIGN.md`.
