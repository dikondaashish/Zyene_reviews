"use server";
/** Resolves the current user's active business from the session cookie. */

import { logger } from "@/lib/logger";
import { cookies } from "next/headers";
import { createClient } from "@/lib/db/supabase/server";
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
} from "@/types/business-context";

const COOKIE_NAME = "active_business_id";

/**
 * Live read of `review_platforms.google_qa_unavailable` for the Google row.
 * Prefer this over `business.review_platforms` from {@link getActiveBusinessId} because that payload can be Redis-cached for several minutes.
 */
export async function getGoogleQaUnavailableForActiveBusiness(businessId: string | null): Promise<boolean> {
    if (!businessId) return false;
    const supabase = await createClient();
    const { data } = await supabase
        .from("review_platforms")
        .select("google_qa_unavailable")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    return data?.google_qa_unavailable === true;
}

/**
 * Whether the dashboard sidebar should show the Google Q&A (/questions) nav item.
 * Visible only when the business has at least one `gbp_questions` row and the Google platform
 * has a Q&A sync watermark (`google_qa_synced_at`), so first visit / in-flight phase2 stays hidden
 * without a "Syncing…" placeholder in the nav.
 */
export async function getGoogleQaSidebarNavVisible(businessId: string | null): Promise<boolean> {
    if (!businessId) return false;
    const supabase = await createClient();
    const { data: platform, error: platformError } = await supabase
        .from("review_platforms")
        .select("google_qa_synced_at")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    if (platformError || !platform) return false;

    const { count, error: countError } = await supabase
        .from("gbp_questions")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId);
    if (countError) return false;
    const n = count ?? 0;
    if (n < 1) return false;

    return platform.google_qa_synced_at != null;
}

/**
 * Get the active business ID from cookie.
 * Validates that the business belongs to the current user's organization.
 * Falls back to the first business if no valid cookie is set.
 */
export async function getActiveBusinessId(options?: {
    skipCache?: boolean;
}): Promise<{
    businessId: string | null;
    business: BusinessContextBusiness | null;
    organization: BusinessContextOrganization | null;
    businesses: BusinessContextBusiness[];
}> {
    const supabase = await createClient();
    const skipCache = options?.skipCache === true;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { businessId: null, business: null, organization: null, businesses: [] };
    }

    // ── Redis Caching for Business Context ──
    const cacheKey = `user_businesses:${user.id}`;
    let organization: BusinessContextOrganization | null = null;
    let businesses: BusinessContextBusiness[] = [];

    if (!skipCache) {
        try {
            const { redis } = await import("@/lib/db/redis");
            const cached = await redis.get(cacheKey);
            if (cached) {
                const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
                organization = (parsed.organization as BusinessContextOrganization | null) ?? null;
                businesses = (parsed.businesses as BusinessContextBusiness[]) ?? [];
            }
        } catch (e) {
            logger.error({ err: e }, "Redis cache error:");
        }
    }

    if (!organization || businesses.length === 0) {
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
            .eq("user_id", user.id);

        businesses =
            (memberBusinesses ?? [])
                .map((entry: { businesses?: BusinessContextBusiness | null }) => entry.businesses)
                .filter((b): b is BusinessContextBusiness => !!b)
                .filter((business) => business.status !== "archived");

        const primaryBusinessOrgId =
            businesses.length > 0
                ? String(
                      (businesses[0] as BusinessContextBusiness & { organization_id?: string })
                          .organization_id ?? ""
                  ).trim() || null
                : null;

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
            .eq("user_id", user.id)
            .eq("status", "active");

        type OrgMemberRow = {
            organization_id: string;
            organizations: BusinessContextOrganization | null;
        };
        const rows = (orgMemberRows ?? []) as OrgMemberRow[];

        if (primaryBusinessOrgId) {
            const match = rows.find((r) => r.organization_id === primaryBusinessOrgId);
            organization = match?.organizations ?? null;
        }
        if (!organization && rows.length > 0) {
            organization = rows[0].organizations ?? null;
        }

        // Backward-compat: org-only members until all users have business_members
        if (businesses.length === 0 && organization?.businesses?.length) {
            businesses = organization.businesses.filter((business) => business.status !== "archived");
        }

        if (organization && !skipCache) {
            try {
                const { redis } = await import("@/lib/db/redis");
                await redis.set(cacheKey, JSON.stringify({ organization, businesses }), { ex: 300 }); // 5 min TTL
            } catch (e) {
                logger.error({ err: e }, "Redis cache set error:");
            }
        }
    }

    if (businesses.length === 0) {
        return { businessId: null, business: null, organization, businesses: [] };
    }

    // Read cookie
    const cookieStore = await cookies();
    const savedId = cookieStore.get(COOKIE_NAME)?.value;

    // Validate that saved ID belongs to this user's org
    let activeBusiness: BusinessContextBusiness | null = savedId
        ? businesses.find((business) => business.id === savedId) || null
        : null;

    // Fallback to first business
    if (!activeBusiness) {
        activeBusiness = businesses[0];
    }

    return {
        businessId: activeBusiness.id,
        business: activeBusiness,
        organization,
        businesses,
    };
}

import { revalidatePath } from "next/cache";

/**
 * Set the active business ID cookie.
 * Called when user switches business via the BusinessSwitcher.
 */
export async function setActiveBusiness(businessId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", businessId)
        .maybeSingle();

    if (businessError || !business) {
        throw new Error("Business not found or access denied");
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, businessId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "lax",
    });

    // Purge the entire router cache to ensure all pages immediately reflect the new active business
    revalidatePath("/", "layout");
}
