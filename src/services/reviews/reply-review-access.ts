import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { deleteReviewReply, replyToReview, listAccounts } from "@/services/google/business-profile";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { apiError } from "@/app/api/_shared/responses";

type ReviewRow = {
    id: string;
    platform: string;
    platform_id: string | null;
    external_id: string | null;
    business_id?: string | null;
};

export async function fetchAuthorizedGoogleReview(reviewId: string, userId: string) {
    const supabase = await createClient();

    const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select(`
                *,
                businesses!inner(
                    organizations!inner(
                        organization_members!inner(user_id)
                    )
                )
            `)
        .eq("id", reviewId)
        .eq("businesses.organizations.organization_members.user_id", userId)
        .single();

    if (reviewError || !review) {
        logger.error({ err: reviewError }, "Review Fetch Error or Not Found:");
        return { ok: false as const, response: apiError("Review not found or unauthorized", { status: 404 }) };
    }

    const row = review as ReviewRow;

    if (row.platform !== "google") {
        return { ok: false as const, response: apiError("Only Google reviews supported currently", { status: 400 }) };
    }

    if (!row.platform_id) {
        return { ok: false as const, response: apiError("Review is missing platform connection", { status: 500 }) };
    }

    if (!row.external_id) {
        return { ok: false as const, response: apiError("Review external ID missing", { status: 500 }) };
    }

    return { ok: true as const, review: row, supabase };
}

export async function resolveGoogleReplyContext(platformId: string) {
    const { accessToken, platform } = await getValidGoogleToken(platformId);

    const locationId = platform.google_location_id ?? platform.external_id;
    if (!locationId) throw new Error("Platform location ID missing");

    const accounts = await listAccounts(accessToken!);
    const account = accounts.find((a) => a.type === "ORGANIZATION") || accounts[0];
    if (!account) throw new Error("No Google Business Account found");

    const accountId = account.name.split("/")[1];

    return { accessToken: accessToken!, accountId, locationId };
}

export async function postGoogleReviewReply(
    platformId: string,
    externalReviewId: string,
    text: string
) {
    const { accessToken, accountId, locationId } = await resolveGoogleReplyContext(platformId);
    await replyToReview(accessToken, accountId, locationId, externalReviewId, text);
}

export async function deleteGoogleReviewReply(platformId: string, externalReviewId: string) {
    const { accessToken, accountId, locationId } = await resolveGoogleReplyContext(platformId);
    await deleteReviewReply(accessToken, accountId, locationId, externalReviewId);
}

export function mapReviewReplyError(error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message.includes("Google connection expired") || message.includes("reconnect") || message.includes("invalid_grant")) {
        return apiError("Google connection expired. Please reconnect your account.", { status: 401 });
    }

    if (message.includes("rate limit") || message.includes("Quota")) {
        return apiError("Google API quota exceeded. Please wait a few minutes.", { status: 429 });
    }

    return apiError(message, { status: 500 });
}
