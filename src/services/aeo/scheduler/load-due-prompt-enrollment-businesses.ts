import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { logger } from "@/lib/logger";
import { PROMPT_CHOICE_COLUMN } from "@/services/aeo/prompts/prompt-enrollment-history";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "../billing/billing-constants";

type Admin = SupabaseClient<Database>;

export type DuePromptEnrollmentBusiness = { businessId: string; organizationId: string };

const AEO_ELIGIBLE_PLAN_IDS = Object.keys(PLAN_CREDIT_GRANTS_MICRO_USD);
const PAGE_SIZE = 1000;
const ID_CHUNK_SIZE = 150;

/**
 * Paid businesses with grant history whose owner has never made an AEO prompt
 * choice (businesses.aeo_prompt_choice_at is null) are enrolled on the next
 * scheduler pass. Pausing, deleting or adding any prompt stamps that marker, so
 * an owner who switched sampling off is never re-enrolled. One indexed filter
 * per page replaces scanning every prompt library each hour. Every all-tenant
 * read is paged so the PostgREST 1000-row cap cannot silently drop businesses.
 */
export async function loadDuePromptEnrollmentBusinesses(
    db: Admin
): Promise<DuePromptEnrollmentBusiness[]> {
    const { data: orgs, error: orgsError } = await fetchAllReviewRowsPaginated<{ id: string }>(
        PAGE_SIZE,
        (from, to) =>
            db
                .from("organizations")
                .select("id")
                .in("plan", AEO_ELIGIBLE_PLAN_IDS)
                .in("plan_status", ["active", "trialing"])
                .order("id", { ascending: true })
                .range(from, to)
    );
    if (orgsError) throw new Error(`prompt enrollment orgs query failed: ${orgsError.message}`);
    if (!orgs.length) return [];

    const creditOrgs = new Set<string>();
    const businesses: { id: string; organization_id: string }[] = [];
    const orgIds = orgs.map((org) => org.id);
    for (let start = 0; start < orgIds.length; start += ID_CHUNK_SIZE) {
        const chunk = orgIds.slice(start, start + ID_CHUNK_SIZE);
        const { data: balances, error: balancesError } = await db
            .from("aeo_credit_balances")
            .select("organization_id")
            .in("organization_id", chunk);
        if (balancesError) throw new Error(`prompt enrollment credits query failed: ${balancesError.message}`);
        for (const balance of balances ?? []) creditOrgs.add(balance.organization_id);

        const eligible = chunk.filter((id) => creditOrgs.has(id));
        if (eligible.length === 0) continue;
        const { data: rows, error: businessesError } = await fetchAllReviewRowsPaginated<{ id: string; organization_id: string }>(
            PAGE_SIZE,
            (from, to) =>
                db
                    .from("businesses")
                    .select("id, organization_id")
                    .in("organization_id", eligible)
                    .is(PROMPT_CHOICE_COLUMN, null)
                    .order("id", { ascending: true })
                    .range(from, to)
        );
        if (businessesError?.message.includes(PROMPT_CHOICE_COLUMN)) {
            // Choice-marker migration not applied yet: never fail the shared hourly fan-out (it also dispatches paid sampling runs).
            logger.warn("[aeo-prompt-enrollment] choice marker column missing; skipping enrollment");
            return [];
        }
        if (businessesError) throw new Error(`prompt enrollment businesses query failed: ${businessesError.message}`);
        businesses.push(...rows);
    }
    return businesses.map((business) => ({ businessId: business.id, organizationId: business.organization_id }));
}
