"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { suggestPrompts } from "@/services/aeo/prompts/suggest-prompts";
import { storeSuggestedPrompts } from "@/services/aeo/prompts/store-suggested-prompts";

/**
 * F4.2 — fills the prompt library from the business's real Google category and
 * city. Creates nothing active, so it spends no quota (criterion #21).
 */

const schema = z.object({ businessId: z.string().uuid() });

export type SuggestPromptsResult =
    | { ok: true; inserted: number; skipped: number }
    | { ok: false; error: string };

export async function generateSuggestedPrompts(input: unknown): Promise<SuggestPromptsResult> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid request" };

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const allowed = await userCanAccessBusiness(supabase, user.id, parsed.data.businessId);
    if (!allowed) return { ok: false, error: "You do not have access to this business." };

    const { data: business } = await supabase
        .from("businesses")
        .select("name, city")
        .eq("id", parsed.data.businessId)
        .maybeSingle();

    const { data: platform } = await supabase
        .from("review_platforms")
        .select("id, google_location_id")
        .eq("business_id", parsed.data.businessId)
        .eq("platform", "google")
        .maybeSingle();

    // The GBP primary category is the field every template leans on. Read it
    // live rather than from our own mirror: a category the merchant changed on
    // Google is the one their customers' questions will use.
    let category: string | null = null;
    let city: string | null = business?.city ?? null;
    if (platform?.id && platform.google_location_id) {
        try {
            const { accessToken } = await getValidGoogleToken(platform.id);
            if (accessToken) {
                const location = await getGoogleLocation(accessToken, platform.google_location_id);
                category = location.categories?.primaryCategory?.displayName ?? null;
                city = location.storefrontAddress?.locality ?? city;
            }
        } catch (error) {
            logger.error({ err: error }, "[AEO] suggestion category lookup failed");
        }
    }

    if (!category) {
        return {
            ok: false,
            error: "We could not read a primary category from your Google Business Profile, so there is nothing to base suggestions on yet.",
        };
    }

    const suggestions = suggestPrompts({
        businessName: business?.name ?? "",
        category,
        city,
    });

    try {
        const result = await storeSuggestedPrompts(
            createAdminClient(),
            parsed.data.businessId,
            suggestions
        );
        revalidatePath("/google-seo-aeo/prompts");
        return { ok: true, inserted: result.inserted, skipped: result.skippedAsDuplicate };
    } catch (error) {
        logger.error({ err: error }, "[AEO] storing suggested prompts failed");
        return { ok: false, error: "Could not save suggestions." };
    }
}
