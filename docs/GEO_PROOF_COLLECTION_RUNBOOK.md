# GEO proof collection runbook

How to collect **real** product and customer proof for marketing and GEO. No fabricated stats.

**Related:** [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md)

---

## Acceptable proof

| Type | Acceptable when |
|------|-----------------|
| Named case study | Written permission + verified numbers |
| Anonymized case study | Permission + labeled “anonymized”; ranges OK |
| Product screenshots | PII blurred; real UI |
| Aggregated benchmark | Methodology doc + minimum sample size agreed internally |
| Competitive pricing | Public sources + date checked |

---

## Not acceptable

- Invented review counts, click rates, or “average results”
- Fake logos or testimonials
- “Google approved” or “guaranteed AI Overview” claims
- Benchmark page with placeholder percentages
- Screenshots of other companies’ dashboards presented as yours

---

## Verified customer metrics (internal)

Pull only from production with privacy review:

| Field | Notes |
|-------|-------|
| customer/business name | Only if permission granted |
| industry | e.g. dental, HVAC |
| location | City/state if allowed |
| baseline review count | Point-in-time |
| baseline rating | Google average |
| after review count | After program window |
| after rating | After window |
| time period | e.g. 90 days |
| review request volume | SMS/email sends |
| click rate | If tracked |
| conversion rate | Reviews / clicks if known |
| permission status | `granted` / `pending` / `declined` |
| source evidence | Link to export, ticket, or signed form |

Store working notes in a private sheet — not committed to git unless sanitized.

---

## Composite / illustrative stories

If you lack permission for names:

- Label clearly: **“Illustrative example — not a specific customer.”**
- Use round ranges, not precise fake decimals
- Do not imply a real business unless disclosed

---

## Testimonials & permission

1. Email customer success template: what we may publish (name, logo, metrics).
2. Store signed reply or ticket ID.
3. No logo on site until written approval.

---

## Screenshots safely

1. Use staging or demo business with fake data, **or** prod with blur tool.
2. Remove emails, phone numbers, addresses.
3. Prefer Shield flow, review inbox, SMS send — not billing.

---

## Future benchmark report

**URL (planned):** `/research/2026-local-reviews-benchmark`

**Blocked until:**

- Legal/privacy sign-off on aggregation
- Real anonymized dataset (minimum N TBD by leadership)
- Methodology section written

Do **not** ship the route with invented charts. See [GEO_PRODUCT_PROOF_ROADMAP.md](./GEO_PRODUCT_PROOF_ROADMAP.md).

---

## Next proof assets (priority)

1. One permission-based case study  
2. Blurred product screenshot pack for compare/pricing pages  
3. Benchmark only when data + methodology exist
