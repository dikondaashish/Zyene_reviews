import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "../billing/billing-constants";
import { isBusinessDueNow } from "./is-business-due-now";

type Admin = SupabaseClient<Database>;

export type DueBusiness = { businessId: string; organizationId: string };

const AEO_ELIGIBLE_PLAN_IDS = Object.keys(PLAN_CREDIT_GRANTS_MICRO_USD);

/**
 * Businesses whose E-10 slot is right now, that have at least one active
 * prompt, whose org is on a plan this feature is actually billed for, AND
 * whose org has grant history — an aeo_credit_balances row, from at least one
 * prior checkout or renewal.
 *
 * That last filter is what closes the gap Wolfpack BBQ sat in on 2026-08-09: a
 * real Starter customer, real card on file, active prompts, but no
 * aeo_credit_balances row at all because their subscription predated the
 * grant wiring. Nothing in the prompt library gates prompt creation or
 * activation by plan or by grant history, so this loader is the only place
 * that can catch it before a real run is even dispatched — bill-test.ts's own
 * hasGrantHistory check is the second, independent layer that protects the
 * CUSTOMER side of this regardless of what triggered the sample; this one
 * additionally protects the VENDOR side, by not spending on the run at all.
 *
 * See sampling-slot.ts for the (day, hour) assignment and DEFAULT_SLOT_HOURS
 * for why this only ever fires within 1–8 UTC.
 *
 * Four plain queries joined in JS, matching load-yearly-reset-candidates.ts: a
 * query whose correctness can be read at a glance beats one that is merely
 * shorter, doubly so for the query deciding who spends real vendor budget and
 * real customer credit today.
 */
export async function loadDueBusinesses(db: Admin, now: Date): Promise<DueBusiness[]> {
    const { data: orgs, error: orgsError } = await db
        .from("organizations")
        .select("id")
        .in("plan", AEO_ELIGIBLE_PLAN_IDS)
        .in("plan_status", ["active", "trialing"]);

    if (orgsError) throw new Error(`loadDueBusinesses orgs query failed: ${orgsError.message}`);
    if (!orgs || orgs.length === 0) return [];

    const { data: grantedOrgs, error: grantedError } = await db
        .from("aeo_credit_balances")
        .select("organization_id")
        .in("organization_id", orgs.map((o) => o.id));

    if (grantedError) throw new Error(`loadDueBusinesses grant-history query failed: ${grantedError.message}`);

    const withGrantHistory = new Set((grantedOrgs ?? []).map((g) => g.organization_id));
    const eligibleOrgIds = orgs.map((o) => o.id).filter((id) => withGrantHistory.has(id));
    if (eligibleOrgIds.length === 0) return [];

    const { data: businesses, error: businessesError } = await db
        .from("businesses")
        .select("id, organization_id")
        .in("organization_id", eligibleOrgIds);

    if (businessesError) {
        throw new Error(`loadDueBusinesses businesses query failed: ${businessesError.message}`);
    }
    if (!businesses || businesses.length === 0) return [];

    const { data: activePrompts, error: promptsError } = await db
        .from("aeo_prompts")
        .select("business_id")
        .eq("is_active", true)
        .in("business_id", businesses.map((b) => b.id));

    if (promptsError) throw new Error(`loadDueBusinesses prompts query failed: ${promptsError.message}`);

    const withActivePrompts = new Set((activePrompts ?? []).map((p) => p.business_id));

    return businesses
        .filter((b) => withActivePrompts.has(b.id))
        .filter((b) => isBusinessDueNow(b.id, now))
        .map((b) => ({ businessId: b.id, organizationId: b.organization_id }));
}
