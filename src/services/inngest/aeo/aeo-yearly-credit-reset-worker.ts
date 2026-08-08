import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { SupabaseCreditLedgerStore } from "@/services/aeo/billing/supabase-credit-ledger-store";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";

/**
 * E-9.1: one yearly-plan org's monthly credit refresh.
 *
 * Calls the SAME aeo_reset_credit_grant the monthly webhook path calls — no
 * new reset logic, only a new trigger. This function's only job is deciding
 * WHEN to call it; aeo_reset_credit_grant's own same-calendar-day guard is
 * what actually protects against a duplicate dispatch double-granting.
 */
export const aeoYearlyCreditResetWorker = inngest.createFunction(
    {
        id: "aeo-yearly-credit-reset-worker",
        // One in-flight reset per org. Two concurrent resets for the same org
        // would both pass the SQL guard's same-day check before either commits
        // if they raced inside the same transaction window; this makes that
        // race structurally impossible rather than relying on the guard alone.
        concurrency: { key: "event.data.organizationId", limit: 1 },
        retries: 2,
    },
    { event: "aeo/credit-reset.requested" },
    async ({ event, step }) => {
        if (!isMeteredBillingLive()) {
            return { skipped: "metered_billing_disabled" as const };
        }

        const { organizationId, grantedMicroUsd } = event.data;
        const ledger = new SupabaseCreditLedgerStore(createAdminClient());

        await step.run("reset-yearly-credit", () =>
            ledger.resetGrant({ organizationId, grantedMicroUsd })
        );

        return { organizationId, grantedMicroUsd };
    }
);
