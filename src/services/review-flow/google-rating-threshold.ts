import type { createAdminClient } from "@/lib/db/supabase/admin";
import { resolveMinStarsForGoogle } from "@/lib/review-flow/rating-tone";

/**
 * Whether this rating is one the business sends to Google, read from the business's own
 * min_stars_for_google (1-5) on the server; the client's threshold is never trusted.
 * Returns null when the setting cannot be read, so the caller fails closed.
 */
export async function ratingGoesToGoogle(
    supabase: ReturnType<typeof createAdminClient>,
    businessId: string,
    rating: number,
): Promise<boolean | null> {
    const { data, error } = await supabase
        .from("businesses")
        .select("min_stars_for_google")
        .eq("id", businessId)
        .maybeSingle();
    if (error || !data) return null;
    return rating >= resolveMinStarsForGoogle(data.min_stars_for_google);
}
