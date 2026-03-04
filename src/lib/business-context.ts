"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "active_business_id";

/**
 * Get the active business ID from cookie.
 * Validates that the business belongs to the current user's organization.
 * Falls back to the first business if no valid cookie is set.
 */
export async function getActiveBusinessId(): Promise<{
    businessId: string | null;
    business: any | null;
    organization: any | null;
    businesses: any[];
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
    let memberData: any = null;

    try {
        const { redis } = await import("@/lib/redis");
        const cached = await redis.get(cacheKey);
        if (cached) {
            memberData = typeof cached === "string" ? JSON.parse(cached) : cached;
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

        memberData = data;

        if (memberData) {
            try {
                const { redis } = await import("@/lib/redis");
                await redis.set(cacheKey, JSON.stringify(memberData), { ex: 300 }); // 5 min TTL
            } catch (e) {
                console.error("Redis cache set error:", e);
            }
        }
    }

    interface MemberDataWithOrg {
        organizations: Record<string, unknown> & {
            businesses: Array<Record<string, unknown> & { id: string }>;
        };
    }
    const memberTyped = memberData as unknown as MemberDataWithOrg | null;
    const organization = memberTyped?.organizations || null;
    const businesses: any[] = organization?.businesses || [];

    if (businesses.length === 0) {
        return { businessId: null, business: null, organization, businesses: [] };
    }

    // Read cookie
    const cookieStore = await cookies();
    const savedId = cookieStore.get(COOKIE_NAME)?.value;

    // Validate that saved ID belongs to this user's org
    let activeBusiness = savedId
        ? businesses.find((b: any) => b.id === savedId)
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
