# Landing page feature accuracy audit — 2026-10-15

Founder's feature list (as described) checked against the app code, then against the public marketing site.

Legend — **App**: ✅ built · 🟡 partly built / differs · ❌ not found. **Site (before)**: what the marketing site said before this pass.

## 1. Feature-by-feature

| # | Feature (founder) | App | What the code actually does | Site (before) | Changed in this pass |
|---|---|---|---|---|---|
| 1 | Organization → many businesses | ✅ | Org switcher + business switcher; business count capped by plan (Starter 1, Pro 3, Enterprise unlimited) | Covered (Pro 3 / Enterprise unlimited) | Home "workspace" section names it |
| 2 | QR code, Print + Download, unique link | ✅ | Dashboard card: Copy, Download, Print poster; `/r/[slug]` link, editable slug | QR mentioned; print/download not | Added |
| 3 | Customizable review page → AI-drafted review → copy & paste to Google | ✅ | Rating → "What did you like most?" chips (+ staff) → Gemini draft (editable) → "Copy & Go to Google". Nothing posted for the customer. Below threshold → private feedback. Customisable in Settings → Public Profile (Rating / Tags / Review Site / Feedback / Success / Branding) | **Not explained anywhere** (only "AI customer review drafts" as a plan allowance) | New home section + review-collection pillar + FAQ |
| 4 | Buy NFC cards in the portal | 🟡 | Product is an **NFC Review Stand**, $4.99 each (1–20), shipping $4.99/$6.99, Stripe checkout. After payment only a DB row is written — **no team notification or admin view** | Not mentioned | Added (as "NFC review stands") |
| 5 | Smart Insights (themes, suggestions, projected lift) | 🟡 | 3–5 themes with counts/quotes, 2–3 suggestions tagged urgency/effort/impact. Impact is an AI-written label, **no calculated rating projection** | Not mentioned | Added (no projection claims) |
| 6 | Broken place links on GBP | ✅ | Dashboard card checks up to 12 GBP action links per sync | Not mentioned | Added |
| 7 | Review volume | ✅ | Dashboard + Analytics | Covered | — |
| 8 | Customers CRM (name, email, phone, notes, import/export) | ✅ | Also tags, merge, bulk actions, timeline, segments | Partly (notes missing) | Added |
| 9 | Campaigns (audience, message, schedule, review, send; templates) | 🟡 | Wizard Basics → Message → Timing → Review & Launch. Templates: **Post-Visit Review, Appointment Follow-up, Customer Re-engagement** (3). Timing = delay (now / 1h / 2h / 4h / 1 day) + day 7/14 reminders. **No date/time picker for campaigns**; audience is picked on Customers page | "Scheduled campaigns" | Copy says "send now or after a delay" for campaigns; template names added |
| 10 | Competitors | ✅ | Google search terms, AI market positioning brief, sync health, rating-surge / review-spike threshold alerts, market benchmark + movement, recent competitor events, rating + review volume comparison | Partly. Features index claimed **"up to 10 competitors"** and **"response rate" comparison — neither exists** | Fixed + expanded |
| 11 | Reviews inbox + manual reply + AI suggestions (Professional / Friendly / Concise) | ✅ | Google + Facebook replies; Yelp is read-only (3 reviews via Fusion API) | Covered | — |
| 12 | Auto-reply by star threshold + tone | ✅ | Google only, 3+ / 4+ / 5 only, tones **Professional / Friendly / Concise** (founder said "Concern" — the app says Concise). Fully automatic, no approval queue | Covered | — |
| 13 | Review requests (SMS / Email / Both, pick customer, preview) | ✅ | Plus "Schedule for later" date/time on single requests; 30-day re-ask guard | SMS/email yes; "Both" and preview not | Added |
| 14 | Analytics | ✅ | New reviews, avg rating, response rate, requests sent; funnel Sent → Delivered → Opened → Clicked → Completed → Google handoff; channel split SMS / Email / Link; CSV + PDF. **QR scans and link clicks are one "Link" channel** | Covered except QR/link | Added funnel detail |
| 15 | Google SEO & AEO | 🟡 | Profile score + audit, AI prompt tracking (ChatGPT, Perplexity, Gemini, Google AI Overviews/Mode where keys exist; **scheduled runs use Gemini only**), share of voice, content optimiser, advanced tools (Copilot*, Answer volatility, Citation traffic, Competitor pages, Prompt demand, llms.txt, NAP directories). **Geo-grid estimated surfaces off by default; Technical audit and Alerts tabs behind the `isLiveCrawlingEnabled` / `AEO_LIVE_ALERTING` flags** | **AEO not on site at all**; local-seo index card claimed "Photo, post, and Q&A management" and "Local pack ranking estimation" | Local-SEO pillar rewritten as "Google SEO & AI Visibility"; geo-grid / technical audit / alerts left out until flags are confirmed ON in production |
| 16 | Integrations: Google, Yelp, Facebook | ✅ | Google + Facebook OAuth; Yelp via business search + API | Covered | — |
| 17 | POS: Clover, Square, Toast, Zapier with "send after 1–2 h" | 🟡 | Square: OAuth + auto-send (early access). **Clover: early access, logs payments, does not send requests.** Toast: placeholder. Zapier: generic webhook, not a Zapier app. **The "Delay (minutes)" setting is not applied by the Square/Clover path — requests send on payment** | Clover card claimed "Native Clover app marketplace" and "Works with all Clover hardware" | Clover/Toast copy softened; delay not claimed |
| 18 | Public API | ✅ | `/api/v1/requests/send`, `/reviews`, `/analytics` documented | Covered | — |
| 19 | Website widgets, 20 templates | ✅ | Exactly 20 templates, builder, iframe embed, paid plans | "carousel or badge" only | "20 ready-made templates" added |

\* Copilot needs `AEO_ENABLE_COPILOT_PREVIEW`.

## 2. Wrong claims fixed

- Features index (`features-data.ts`) had drifted from the pillar pages: "Track up to 10 competitors", "response rate" comparison, "Photo, post, and Q&A management", "Local pack ranking estimation". The index now reads from the pillar source, so it cannot drift again.
- Industry pricing reminder listed **Competitor tracking as Professional-only**; plan catalog includes it in Starter.
- SoftwareApplication JSON-LD said "Auto-commenter" and "Zapier integration"; now "Automatic Google replies" and "Zapier-compatible webhooks", plus the review-page, NFC, insights, AEO and widget features.
- Clover "Native Clover app marketplace integration / Works with all Clover hardware" removed.
- Hero mock sidebar now uses the real app navigation labels.

## 3. App gaps (marketing deliberately does not claim these)

1. POS send delay is stored but not applied for Square/Clover payment triggers.
2. Clover does not send review requests yet; Toast is a placeholder.
3. Campaigns have no "send at date/time" — only a delay.
4. NFC orders: no fulfilment notification or admin view.
5. Smart Insights has no measured "projected rating lift".
6. QR scans are not separated from link clicks in analytics.
7. Review draft API only accepts 4–5 stars; a 3-star threshold breaks the draft step.
8. Help article `help-articles-analytics.ts` says PDF is not offered, but the app exports PDF. Help `help-articles-integrations.ts` documents `POST /v1/requests` + Bearer auth, while the real API is `POST /api/v1/requests/send` + `X-API-Key`.

## 4. Before adding more AEO claims

Confirm in production: `AEO_LIVE_SAMPLING`, the crawling flag (Technical audit tab), `AEO_LIVE_ALERTING` (Alerts tab), and whether geo-grid shows measured data. Once on, add "geo-grid", "technical audit" and "visibility alerts" to the `local-seo` pillar in `src/lib/growth/feature-pillars.ts`.

## 5. Additional findings from the per-feature pages (second pass)

One page per feature now lives at `/features/<slug>` (17 pages, catalog in `src/lib/growth/feature-pillars-catalog-*.ts`, bodies in `src/components/marketing/feature-landing/content/`). Writing them surfaced these app/catalog mismatches. Marketing copy was written to match the code, not these claims:

| # | Area | What the code does | Impact |
|---|---|---|---|
| 1 | Review replies | Only Google replies publish (`reply-review-access.ts` → "Only Google reviews supported currently"). Facebook shows the reply box and AI tones but Post fails. | Facebook reply UI should be hidden or wired up. |
| 2 | AI reply quota | `suggest-reply-api.ts` / `suggest-qa-answer-api.ts` call `checkLimit(orgId, "smart_replies")`, which counts *customer review drafts*. Once that allowance is used, business reply suggestions are refused. | Plans promise unlimited business replies. Bug. |
| 3 | Professional limits | `check-limits.ts` multiplies the base allowance by location count into one org-wide pool; `smart_replies` (AI review drafts) is **not** multiplied. Seats are checked per business, not per org. | `plan-catalog.ts` says "2,000 AI drafts per location" and "limits applied per location". Pricing copy or code needs to change. |
| 4 | Campaigns | Basics step shows a selectable "Scheduled" trigger that has no date/time behaviour; template reminder delays (24–72h) are ignored (drip is always 7 days); Re-engagement reminder text has no `{review_link}`. `plan-catalog.ts` lists "Scheduled campaigns". | Fix the trigger or remove it; fix the template. |
| 5 | Customers import | The Customers page "Import CSV" opens a fixed-column modal; the column-mapping page `/customers/import` exists but nothing links to it. | Link it or remove it. |
| 6 | Review emails | Request emails have no unsubscribe link (SMS has STOP). | Compliance risk (CAN-SPAM). |
| 7 | Smart Insights card | The "positive %" ring is not computed from reviews (defaults to 88%, shows 78% below 50%). "Take action" only shows a toast; "Dismiss" is browser-only but says it improves future insights. Reads at most 200 reviews while the card says it reads every review. | Misleading UI inside the app. |
| 8 | Competitor refresh | `/api/cron/competitor-watch` is not in `vercel.json` crons, though settings call it a "daily competitor job". | Confirm scheduling. |
| 9 | Widgets | Design changes require replacing the embed code (new reviews update automatically). | Copy says so. |
| 10 | Yearly plans | AEO credit is granted once per billing cycle, so yearly plans get it once a year. | Pricing copy says "per billing cycle". |
| 11 | AEO in production | Prompt tracking only runs with `AEO_LIVE_SAMPLING=true`; charges only with `AEO_METERED_BILLING_LIVE=true`. | Confirm both before promoting `/features/ai-visibility`. |
