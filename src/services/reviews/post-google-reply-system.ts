import { createAdminClient } from "@/lib/db/supabase/admin";
import { listAccounts, replyToReview } from "@/services/google/business-profile";
import { getValidGoogleToken } from "@/services/google/sync-service";

/**
 * Post a reply to Google and mark the review as responded (Zyene source).
 * For background jobs — no end-user session; uses service role.
 */
export async function postGoogleReplySystem(reviewId: string, text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error("Reply text is empty");

    const admin = createAdminClient();
    const { data: review, error } = await admin
        .from("reviews")
        .select("id, platform, platform_id, external_id")
        .eq("id", reviewId)
        .single();

    if (error || !review) {
        throw new Error("Review not found");
    }

    if (review.platform !== "google") {
        throw new Error("Only Google reviews support auto-reply");
    }
    if (!review.platform_id || !review.external_id) {
        throw new Error("Review missing platform or external id");
    }

    const { accessToken, platform } = await getValidGoogleToken(review.platform_id as string);
    const locationId = platform.external_id as string | null;
    if (!locationId) throw new Error("Platform location ID missing");

    const accounts = await listAccounts(accessToken!);
    const account = accounts.find((a) => a.type === "ORGANIZATION") || accounts[0];
    if (!account) throw new Error("No Google Business Account found");

    const accountId = account.name.split("/")[1];
    await replyToReview(accessToken!, accountId, locationId, review.external_id as string, trimmed);

    const { error: updateError } = await admin
        .from("reviews")
        .update({
            response_status: "responded",
            response_text: trimmed,
            responded_at: new Date().toISOString(),
            response_source: "zyene",
        })
        .eq("id", review.id);

    if (updateError) throw updateError;
}
