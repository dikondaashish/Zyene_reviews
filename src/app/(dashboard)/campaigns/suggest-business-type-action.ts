"use server";

import { z } from "zod";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { businessTypeFromGoogleCategory, type BusinessType } from "@/lib/campaigns/business-types";

const schema = z.object({ businessId: z.uuid() });

export type BusinessTypeSuggestion = { type: BusinessType; googleCategory: string } | null;

/**
 * Template suggestions for businesses saved as "other" or with no category:
 * reads Google's primary category for the listing and maps it to a type.
 * Read-only; nothing is saved. Any failure returns null and the page shows
 * every template.
 */
export async function suggestBusinessTypeFromGoogle(input: unknown): Promise<BusinessTypeSuggestion> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return null;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        if (!(await userCanAccessBusiness(supabase, user.id, parsed.data.businessId))) return null;

        const { data: platform } = await supabase
            .from("review_platforms")
            .select("id, google_location_id")
            .eq("business_id", parsed.data.businessId)
            .eq("platform", "google")
            .maybeSingle();
        if (!platform?.id || !platform.google_location_id) return null;

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) return null;
        const location = await getGoogleLocation(accessToken, platform.google_location_id);
        const googleCategory = location.categories?.primaryCategory?.displayName?.trim() ?? "";
        const type = businessTypeFromGoogleCategory(googleCategory);
        return type ? { type, googleCategory } : null;
    } catch (error) {
        logger.warn({ err: error, businessId: parsed.data.businessId }, "[Campaign templates] Google category lookup failed");
        return null;
    }
}
