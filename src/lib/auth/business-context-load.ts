/**
 * Loads a user's org + business memberships, with a short Redis cache.
 *
 * Deliberately not a server action — it is an internal helper for
 * business-context.ts, which owns the "use server" boundary.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import type { Database } from "@/lib/db/supabase/database.types";
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
} from "@/types/business-context";

const CACHE_TTL_SECONDS = 300;

export function businessContextCacheKey(userId: string): string {
    return `user_businesses:${userId}`;
}

export interface UserBusinessContext {
    organizations: BusinessContextOrganization[];
    businesses: BusinessContextBusiness[];
}

/** Returns cached memberships, or empty arrays when absent/unusable. */
async function readCache(cacheKey: string): Promise<UserBusinessContext> {
    const empty: UserBusinessContext = { organizations: [], businesses: [] };
    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get(cacheKey);
        if (!cached) return empty;

        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        const businesses = (parsed.businesses as BusinessContextBusiness[]) ?? [];
        const organizations = (parsed.organizations as BusinessContextOrganization[]) ?? [];

        // Legacy cache stored a single `organization` — ignore so multi-org users refresh
        if (organizations.length === 0) return empty;
        return { organizations, businesses };
    } catch (e) {
        logger.error({ err: e }, "Redis cache error:");
        return empty;
    }
}

async function writeCache(cacheKey: string, value: UserBusinessContext): Promise<void> {
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.set(cacheKey, JSON.stringify(value), { ex: CACHE_TTL_SECONDS });
    } catch (e) {
        logger.error({ err: e }, "Redis cache set error:");
    }
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
    const { data: memberBusinesses } = await supabase
        .from("business_members")
        .select(`
            business_id,
            businesses (
                *,
                review_platforms (*)
            )
        `)
        .eq("user_id", userId);

    let businesses = (memberBusinesses ?? []).reduce<BusinessContextBusiness[]>(
        (acc, entry: { businesses?: BusinessContextBusiness | null }) => {
            const business = entry.businesses;
            if (business && business.status !== "archived") acc.push(business);
            return acc;
        },
        []
    );

    // All org memberships (invited teammates have organization_members + business_members; RLS requires org row)
    const { data: orgMemberRows } = await supabase
        .from("organization_members")
        .select(`
            organization_id,
            organizations (
                *,
                businesses (
                    *,
                    review_platforms (*)
                )
            )
        `)
        .eq("user_id", userId)
        .eq("status", "active");

    type OrgMemberRow = {
        organization_id: string;
        organizations: BusinessContextOrganization | null;
    };
    const rows = (orgMemberRows ?? []) as OrgMemberRow[];
    const organizations = rows
        .map((r) => r.organizations)
        .filter((org): org is BusinessContextOrganization => Boolean(org?.id));

    // Backward-compat: org-only members until all users have business_members
    if (businesses.length === 0 && organizations[0]?.businesses?.length) {
        businesses = organizations[0].businesses.filter(
            (business) => business.status !== "archived"
        );
    }

    return { organizations, businesses };
}

/**
 * Resolves the user's organizations and businesses, preferring the Redis cache
 * unless `skipCache` is set. Writes the cache back on a database read.
 */
export async function loadUserBusinessContext(
    supabase: SupabaseClient<Database>,
    userId: string,
    skipCache: boolean,
): Promise<UserBusinessContext> {
    const cacheKey = businessContextCacheKey(userId);

    if (!skipCache) {
        const cached = await readCache(cacheKey);
        if (cached.organizations.length > 0 && cached.businesses.length > 0) {
            return cached;
        }
    }

    const fresh = await fetchFromDatabase(supabase, userId);

    if (fresh.organizations.length > 0 && !skipCache) {
        await writeCache(cacheKey, fresh);
    }

    return fresh;
}
