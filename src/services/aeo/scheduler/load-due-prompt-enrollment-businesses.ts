import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "../billing/billing-constants";
import { isBusinessDueNow } from "./is-business-due-now";

type Admin = SupabaseClient<Database>;

export type DuePromptEnrollmentBusiness = { businessId: string; organizationId: string };

const AEO_ELIGIBLE_PLAN_IDS = Object.keys(PLAN_CREDIT_GRANTS_MICRO_USD);

/**
 * Paid businesses with grant history but no active prompt get one attempt in
 * their normal sampling slot. Reusing the slot prevents an all-customer launch
 * from creating an external Google API burst or a future test-charge herd.
 */
export async function loadDuePromptEnrollmentBusinesses(
    db: Admin,
    now: Date
): Promise<DuePromptEnrollmentBusiness[]> {
    const { data: orgs, error: orgsError } = await db
        .from("organizations")
        .select("id")
        .in("plan", AEO_ELIGIBLE_PLAN_IDS)
        .in("plan_status", ["active", "trialing"]);
    if (orgsError) throw new Error(`prompt enrollment orgs query failed: ${orgsError.message}`);
    if (!orgs?.length) return [];

    const { data: balances, error: balancesError } = await db
        .from("aeo_credit_balances")
        .select("organization_id")
        .in("organization_id", orgs.map((org) => org.id));
    if (balancesError) throw new Error(`prompt enrollment credits query failed: ${balancesError.message}`);

    const creditOrgs = new Set((balances ?? []).map((balance) => balance.organization_id));
    const eligibleOrgIds = orgs.map((org) => org.id).filter((id) => creditOrgs.has(id));
    if (eligibleOrgIds.length === 0) return [];

    const { data: businesses, error: businessesError } = await db
        .from("businesses")
        .select("id, organization_id")
        .in("organization_id", eligibleOrgIds);
    if (businessesError) throw new Error(`prompt enrollment businesses query failed: ${businessesError.message}`);
    if (!businesses?.length) return [];

    const { data: activePrompts, error: promptsError } = await db
        .from("aeo_prompts")
        .select("business_id")
        .eq("is_active", true)
        .in("business_id", businesses.map((business) => business.id));
    if (promptsError) throw new Error(`prompt enrollment active prompts query failed: ${promptsError.message}`);

    const withActivePrompts = new Set((activePrompts ?? []).map((prompt) => prompt.business_id));
    return businesses
        .filter((business) => !withActivePrompts.has(business.id))
        .filter((business) => isBusinessDueNow(business.id, now))
        .map((business) => ({ businessId: business.id, organizationId: business.organization_id }));
}
