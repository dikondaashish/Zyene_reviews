"use server";
/** Resolves the current user's active business from the session cookie. */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/supabase/server";
import type {
    BusinessContextBusiness,
    BusinessContextOrganization,
} from "@/types/business-context";

import { clearBusinessContextCache, loadUserBusinessContext } from "./business-context-load";
import {
    readGoogleQaSidebarNavVisible,
    readGoogleQaUnavailable,
} from "./business-context-google-qa";

const COOKIE_NAME = "active_business_id";

/**
 * Re-exported from business-context-google-qa for import stability. Written as
 * wrappers rather than `export … from` because a "use server" module may only
 * export functions the compiler can verify are async.
 */
export async function getGoogleQaUnavailableForActiveBusiness(
    businessId: string | null,
): Promise<boolean> {
    return readGoogleQaUnavailable(businessId);
}

export async function getGoogleQaSidebarNavVisible(businessId: string | null): Promise<boolean> {
    return readGoogleQaSidebarNavVisible(businessId);
}

function businessOrgId(business: BusinessContextBusiness): string | null {
    const id = String(
        (business as BusinessContextBusiness & { organization_id?: string }).organization_id ?? ""
    ).trim();
    return id || null;
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
    organizations: BusinessContextOrganization[];
    businesses: BusinessContextBusiness[];
    allBusinesses: BusinessContextBusiness[];
}> {
    const supabase = await createClient();
    const empty = {
        businessId: null,
        business: null,
        organization: null,
        organizations: [] as BusinessContextOrganization[],
        businesses: [] as BusinessContextBusiness[],
        allBusinesses: [] as BusinessContextBusiness[],
    };

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return empty;

    const { organizations, businesses } = await loadUserBusinessContext(
        supabase,
        user.id,
        options?.skipCache === true,
    );

    if (businesses.length === 0) {
        return {
            ...empty,
            organization: organizations[0] ?? null,
            organizations,
        };
    }

    const cookieStore = await cookies();
    const savedId = cookieStore.get(COOKIE_NAME)?.value;

    // Validate that saved ID belongs to this user, else fall back to the first.
    const activeBusiness =
        (savedId ? businesses.find((business) => business.id === savedId) : null) ?? businesses[0];

    const activeOrgId = businessOrgId(activeBusiness);
    const organization =
        (activeOrgId ? organizations.find((org) => org.id === activeOrgId) : null) ??
        organizations[0] ??
        null;

    // Scope switcher list to the active organization (cross-org via org switcher)
    const scopedBusinesses = activeOrgId
        ? businesses.filter((b) => businessOrgId(b) === activeOrgId)
        : businesses;

    return {
        businessId: activeBusiness.id,
        business: activeBusiness,
        organization,
        organizations,
        businesses: scopedBusinesses.length > 0 ? scopedBusinesses : businesses,
        allBusinesses: businesses,
    };
}

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

    await clearBusinessContextCache(user.id);

    // Purge the entire router cache to ensure all pages immediately reflect the new active business
    revalidatePath("/", "layout");
}
