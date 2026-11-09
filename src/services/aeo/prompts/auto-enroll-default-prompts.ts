import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { getGoogleLocation } from "@/services/google/listing-information";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { activateDefaultPrompts } from "./activate-default-prompts";
import { hasPromptEnrollmentHistory } from "./prompt-enrollment-history";
import { selectDefaultSuggestions } from "./default-prompt-enrollment";
import { suggestPrompts } from "./suggest-prompts";
import { storeSuggestedPrompts } from "./store-suggested-prompts";

type Admin = SupabaseClient<Database>;

export type AutoEnrollDefaultPromptsResult = {
    activated: number;
    skipped: "existing_prompt_history" | "google_profile_unavailable" | "google_category_unavailable" | null;
};

/**
 * Seeds only a business whose owner has never made an AEO prompt choice (see
 * hasPromptEnrollmentHistory: the durable choice marker, a past run, or any
 * prompt that is not an untouched suggestion). Re-activating defaults after an
 * owner paused or deleted prompts would restart paid sampling they switched
 * off. The worker's own inert suggestion rows do not count, so a retry after a
 * partial write still finishes enrollment. Prompt wording
 * comes from its live GBP primary category, never the generic local category
 * field, so the global launch does not create paid tracking for "other".
 */
export async function autoEnrollDefaultPrompts(
    db: Admin,
    businessId: string
): Promise<AutoEnrollDefaultPromptsResult> {
    const [{ data: business, error: businessError }, hasHistory, { data: platform, error: platformError }] = await Promise.all([
        db.from("businesses").select("name, city").eq("id", businessId).maybeSingle(),
        hasPromptEnrollmentHistory(db, businessId),
        db.from("review_platforms").select("id, google_location_id").eq("business_id", businessId).eq("platform", "google").maybeSingle(),
    ]);

    if (businessError) throw new Error(`business read failed: ${businessError.message}`);
    if (platformError) throw new Error(`Google platform read failed: ${platformError.message}`);
    if (!business) throw new Error("business not found");
    if (hasHistory) return { activated: 0, skipped: "existing_prompt_history" };
    if (!platform?.google_location_id) return { activated: 0, skipped: "google_profile_unavailable" };

    let accessToken: string | null;
    try {
        ({ accessToken } = await getValidGoogleToken(platform.id));
    } catch {
        return { activated: 0, skipped: "google_profile_unavailable" };
    }
    if (!accessToken) return { activated: 0, skipped: "google_profile_unavailable" };

    const location = await getGoogleLocation(accessToken, platform.google_location_id);
    const category = location.categories?.primaryCategory?.displayName ?? null;
    const suggestions = suggestPrompts({
        businessName: business.name,
        category,
        city: location.storefrontAddress?.locality ?? business.city,
    });
    if (suggestions.length === 0) return { activated: 0, skipped: "google_category_unavailable" };

    await storeSuggestedPrompts(db, businessId, suggestions);
    const activation = await activateDefaultPrompts(db, businessId, selectDefaultSuggestions(suggestions, 0));
    return { activated: activation.activated, skipped: null };
}
