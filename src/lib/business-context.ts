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

    // Fetch user's org with all businesses
    const { data: memberData } = await supabase
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

    // @ts-ignore
    const organization = memberData?.organizations || null;
    // @ts-ignore
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
}
