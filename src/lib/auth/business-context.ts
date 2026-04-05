"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/db/supabase/server";
import type {
    BusinessContextBusiness,
    OrganizationMemberWithBusinesses,
} from "@/types/business-context";

const COOKIE_NAME = "active_business_id";

/**
 * Get the active business ID from cookie.
 * Validates that the business belongs to the current user's organization.
 * Falls back to the first business if no valid cookie is set.
 */
export async function getActiveBusinessId(): Promise<{
    businessId: string | null;
    business: BusinessContextBusiness | null;
    organization: OrganizationMemberWithBusinesses["organizations"];
    businesses: BusinessContextBusiness[];
}> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { businessId: null, business: null, organization: null, businesses: [] };
    }

    // ── Redis Caching for Business Context ──
    const cacheKey = `user_businesses:${user.id}`;
    let memberData: OrganizationMemberWithBusinesses | null = null;

    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            memberData = parsed as OrganizationMemberWithBusinesses;
        }
    } catch (e) {
        console.error("Redis cache error:", e);
    }

    if (!memberData) {
        // Fetch user's org with all businesses
        const { data } = await supabase
            .from("organization_members")
            .select(`
                organizations (
                    *,
                    businesses (
                        *,
                        review_platforms (*)
                    )
                )
            `)
            .eq("user_id", user.id)
            .single();

        memberData = data as OrganizationMemberWithBusinesses | null;

        if (memberData) {
            try {
                const { redis } = await import("@/lib/db/redis");
                await redis.set(cacheKey, JSON.stringify(memberData), { ex: 300 }); // 5 min TTL
            } catch (e) {
                console.error("Redis cache set error:", e);
            }
        }
    }

    const organization = memberData?.organizations || null;
    const allBusinesses = organization?.businesses || [];
    const businesses = allBusinesses.filter((business) => business.status !== "archived");

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
