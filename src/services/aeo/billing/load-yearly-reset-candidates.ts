import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "./billing-constants";
import { isDueForMonthlyReset } from "./yearly-credit-reset-eligibility";

type Admin = SupabaseClient<Database>;

export type YearlyResetCandidate = { organizationId: string; grantedMicroUsd: number };

const YEARLY_PLAN_IDS = Object.keys(PLAN_CREDIT_GRANTS_MICRO_USD).filter((id) => id.endsWith("_yearly"));

/**
 * Two plain queries joined in JS, deliberately not one query with an embedded
 * PostgREST filter — the join condition here decides whether a real card gets
 * charged... no, decides whether real credit gets granted, and a query whose
 * correctness can be read at a glance beats one that is merely shorter.
 *
 * Only orgs with an EXISTING aeo_credit_balances row are candidates: no row
 * means checkout's initial grant has not landed yet, so there is no anchor day
 * to check against and nothing for this cron to refresh.
 */
export async function loadYearlyResetCandidates(
    db: Admin,
    today: Date
): Promise<YearlyResetCandidate[]> {
    if (YEARLY_PLAN_IDS.length === 0) return [];

    const { data: orgs, error: orgsError } = await db
        .from("organizations")
        .select("id, plan")
        .in("plan", YEARLY_PLAN_IDS)
        .in("plan_status", ["active", "trialing"]);

    if (orgsError) throw new Error(`loadYearlyResetCandidates orgs query failed: ${orgsError.message}`);
    if (!orgs || orgs.length === 0) return [];

    const { data: balances, error: balancesError } = await db
        .from("aeo_credit_balances")
        .select("organization_id, cycle_reset_at")
        .in("organization_id", orgs.map((o) => o.id));

    if (balancesError) {
        throw new Error(`loadYearlyResetCandidates balances query failed: ${balancesError.message}`);
    }

    const cycleResetAtByOrg = new Map((balances ?? []).map((b) => [b.organization_id, b.cycle_reset_at]));

    const candidates: YearlyResetCandidate[] = [];
    for (const org of orgs) {
        const cycleResetAt = cycleResetAtByOrg.get(org.id);
        if (!cycleResetAt) continue;

        const grantedMicroUsd = org.plan ? PLAN_CREDIT_GRANTS_MICRO_USD[org.plan] : undefined;
        if (grantedMicroUsd === undefined) continue;

        if (isDueForMonthlyReset(new Date(cycleResetAt), today)) {
            candidates.push({ organizationId: org.id, grantedMicroUsd });
        }
    }

    return candidates;
}
