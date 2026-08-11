/**
 * E-9 pricing constants — confirmed 2026-08-08, not derived from engine cost.
 *
 * $2.50/test carries a large, deliberate margin over the underlying vendor
 * cost (measured $0.002–$0.035 per engine sample, so 71x–1,250x depending on
 * engine). That gap was surfaced and accepted explicitly, not assumed.
 */

/** One "test" = one dispatch unit that reached `status: "ok"` (engine-types.ts `isObservation`). */
export const ONE_TEST_MICRO_USD = 2_500_000;

/**
 * Per-cycle credit grant by Stripe plan id (plan-catalog.ts). Zeroed, not
 * added to, at each reset — unused credit does not roll over.
 *
 * YEARLY PLANS ARE UNRESOLVED. `invoice.payment_succeeded` with
 * `billing_reason: "subscription_cycle"` fires once per Stripe billing
 * PERIOD, which for a yearly subscription is once a year — there is no
 * monthly signal to reset a yearly org's balance against today. Grants are
 * listed for both plan ids so a yearly org still gets ONE reset at renewal
 * rather than silently falling through to zero credit for a year; the
 * granted amount lasts a year, not a month, until a monthly trigger exists
 * (the repo's cron pattern in scripts/ensure-cron-job-monthly-newsletter.mjs
 * is the natural template).
 */
export const PLAN_CREDIT_GRANTS_MICRO_USD: Readonly<Record<string, number>> = {
    starter_monthly: 5_000_000,
    starter_yearly: 5_000_000,
    professional_monthly: 10_000_000,
    professional_yearly: 10_000_000,
};
