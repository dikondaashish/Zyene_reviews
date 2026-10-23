/**
 * Loads live org + business memberships. Authorization never uses Redis.
 *
 * Deliberately not a server action - it is an internal helper for
 * business-context.ts, which owns the "use server" boundary.
 */
import { cache } from "react";
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
    // Business-scoped memberships (source of truth for which org the user is working in), and
    // all org memberships (invited teammates have organization_members + business_members; RLS
    // requires the org row). Independent, so both queries run at once.
    const [{ data: memberBusinesses, error: businessError }, { data: orgMemberRows, error: orgError }] = await Promise.all([
        supabase
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
        .eq("status", "active"),
        supabase
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
        .eq("status", "active"),
    ]);

    let businesses = (memberBusinesses ?? []).reduce<BusinessContextBusiness[]>(
        (acc, entry: { businesses?: BusinessContextBusiness | null }) => {
            const business = entry.businesses;
            if (business && business.status !== "archived") acc.push(business);
            return acc;
        },
        []
    );

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
 * Live memberships, loaded once per server request: the layout, settings access and the page
 * all ask for them while rendering one page. Nothing is kept between requests, so a switch or a
 * membership change shows on the very next request.
 */
/** One slot per user per request; the user id is the cache key. */
const requestSlot = cache((userId: string): { userId: string; load: Promise<UserBusinessContext> | null } => ({ userId, load: null }));

/** Always resolves live memberships; `skipCache` re-reads even within the same request. */
export async function loadUserBusinessContext(
    supabase: SupabaseClient<Database>,
    userId: string,
    skipCache: boolean,
): Promise<UserBusinessContext> {
    if (skipCache) return fetchFromDatabase(supabase, userId);
    // Outside a React render (route handlers, scripts) `cache` hands out a fresh slot each call.
    const slot = requestSlot(userId);
    slot.load ??= fetchFromDatabase(supabase, userId);
    return slot.load;
}
