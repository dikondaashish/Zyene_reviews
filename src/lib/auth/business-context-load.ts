/**
 * Loads live org + business memberships. Authorization never uses Redis.
 *
 * Deliberately not a server action - it is an internal helper for
 * business-context.ts, which owns the "use server" boundary.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import type { Database } from "@/lib/db/supabase/database.types";
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
} from "@/types/business-context";
import { displayBusiness, displayOrganization } from "@/lib/auth/business-context-platforms";

export function businessContextCacheKey(userId: string): string {
    return `user_businesses:${userId}`;
}

export interface UserBusinessContext {
    organizations: BusinessContextOrganization[];
    businesses: BusinessContextBusiness[];
}

/** Clears the cached memberships for a user (call after a membership change). */
export async function clearBusinessContextCache(userId: string): Promise<void> {
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.del(businessContextCacheKey(userId));
    } catch (e) {
        logger.error({ err: e }, "Redis cache clear error on business switch:");
    }
}

/** Reads memberships straight from Postgres, bypassing any cache. */
async function fetchFromDatabase(
    supabase: SupabaseClient<Database>,
    userId: string,
): Promise<UserBusinessContext> {
    // Business-scoped memberships (source of truth for which org the user is working in)
    const { data: memberBusinesses, error: businessError } = await supabase
        .from("business_members")
        .select(`
            business_id,
            businesses (
                *,
                review_platforms (
                    id, platform, external_url, google_location_id, google_account_id,
                    granted_scopes, sync_status, last_synced_at, google_qa_unavailable,
                    google_lodging_health_score, google_lodging_available,
                    google_performance_synced_at, google_profile_health_score,
                    average_rating, total_reviews
                )
            )
        `)
        .eq("user_id", userId)
        .eq("status", "active");

    let businesses = (memberBusinesses ?? []).reduce<BusinessContextBusiness[]>(
        (acc, entry: { businesses?: BusinessContextBusiness | null }) => {
            const business = entry.businesses;
            if (business && business.status !== "archived") acc.push(business);
            return acc;
        },
        []
    );

    // All org memberships (invited teammates have organization_members + business_members; RLS requires org row)
    const { data: orgMemberRows, error: orgError } = await supabase
        .from("organization_members")
        .select(`
            role,
            organization_id,
            organizations (
                *,
                businesses (
                    *,
                    review_platforms (
                        id, platform, external_url, google_location_id, google_account_id,
                        granted_scopes, sync_status, last_synced_at, google_qa_unavailable,
                        google_lodging_health_score, google_lodging_available,
                        google_performance_synced_at, google_profile_health_score,
                        average_rating, total_reviews
                    )
                )
            )
        `)
        .eq("user_id", userId)
        .eq("status", "active");

    type OrgMemberRow = {
        role: string;
        organization_id: string;
        organizations: BusinessContextOrganization | null;
    };
    const rows = (orgMemberRows ?? []) as OrgMemberRow[];
    if (businessError || orgError) return { organizations: [], businesses: [] };
    const activeOrgIds = new Set(rows.map((row) => row.organization_id));
    businesses = businesses.filter((business) => activeOrgIds.has(String(business.organization_id ?? ""))).map(displayBusiness);
    for (const row of rows) {
        if (!["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"].includes(row.role)) continue;
        for (const business of row.organizations?.businesses ?? []) {
            if (business.status !== "archived" && !businesses.some((entry) => entry.id === business.id)) {
                businesses.push(displayBusiness(business));
            }
        }
    }
    const allowedIds = new Set(businesses.map((business) => business.id));
    const organizations = rows.map((row) => row.organizations)
        .filter((org): org is BusinessContextOrganization => Boolean(org?.id))
        .map((org) => displayOrganization({ ...org,
            businesses: org.businesses?.filter((business) => allowedIds.has(business.id)),
        }));
    return { organizations, businesses };
}

/**
 * Always resolves live memberships; the legacy argument is kept for callers.
 */
export async function loadUserBusinessContext(
    supabase: SupabaseClient<Database>,
    userId: string,
    _skipCache: boolean,
): Promise<UserBusinessContext> {
    return fetchFromDatabase(supabase, userId);
}
