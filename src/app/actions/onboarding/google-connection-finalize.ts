"use server";

import { revalidatePath } from "next/cache";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { parseGoogleLocationResourceIds } from "@/services/google/business-profile";

import { enqueueGooglePostConnectSync } from "./types";
import { mapGoogleCategory } from "./google-category-map";
import { storeGooglePlatformCredentials } from "./google-platform-credentials";
import {
    resolveStorefrontAddress,
    type GoogleLocationInput,
} from "./google-oauth-helpers";

/** Best-effort review totals for a location; zeroes if the call fails. */
async function fetchReviewSummary(locationName: string | undefined, accessToken: string) {
    const empty = { reviewCount: 0, averageRating: 0 };
    if (!locationName) return empty;

    try {
        const reviewsResponse = await fetch(
            `https://mybusiness.googleapis.com/v4/${locationName}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!reviewsResponse.ok) return empty;

        const reviewsData = await reviewsResponse.json();
        return {
            reviewCount: reviewsData.metrics?.totalSummary?.reviewCount || 0,
            averageRating: reviewsData.metrics?.totalSummary?.averageRating || 0,
        };
    } catch (reviewErr) {
        logger.error({ err: reviewErr }, "[Google API] Could not fetch review count");
        return empty;
    }
}

/**
 * Finalizes the Google Business Profile connection after selection (or auto-selection).
 */
export async function finalizeGoogleConnection(
    businessId: string,
    location: GoogleLocationInput,
    tokens: { accessToken: string; refreshToken?: string; expiresIn: number },
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return { success: false, error: "You do not have access to this business." };
        }

        const { accessToken, refreshToken, expiresIn } = tokens;

        const loc = location;
        const addr = resolveStorefrontAddress(loc);
        const phone = ("phoneNumbers" in loc && loc.phoneNumbers?.primaryPhone) || loc.phone;

        const categoryDisplay =
            "categories" in loc && loc.categories?.primaryCategory?.displayName
                ? loc.categories.primaryCategory.displayName
                : loc.category ?? "";
        const mappedCategory = mapGoogleCategory(categoryDisplay);

        const reviewData = await fetchReviewSummary(loc.name, accessToken);

        // Extract Review URL and Place ID
        const metadata = "metadata" in loc ? loc.metadata : undefined;
        let googleReviewUrl = metadata?.newReviewUri || metadata?.mapsUri || null;
        if (metadata?.placeId) {
            googleReviewUrl = `https://search.google.com/local/writereview?placeid=${metadata.placeId}`;
        }

        // Update business record
        const displayName = ("title" in loc && loc.title) || loc.businessName || "";
        const slug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        await supabase
            .from("businesses")
            .update({
                name: displayName || undefined,
                address_line1: addr?.addressLines?.[0] ?? null,
                city: addr?.locality || loc.city || null,
                state: addr?.administrativeArea || loc.state || null,
                zip: addr?.postalCode || null,
                phone: phone || null,
                website: ("websiteUri" in loc && loc.websiteUri) || null,
                email: user.email || null,
                category: mappedCategory || "other",
                google_review_url: googleReviewUrl,
                updated_at: new Date().toISOString(),
                ...(slug ? { slug } : {}),
            })
            .eq("id", businessId);

        // Store platform tokens + GBP resource IDs (required for sync without listAccounts)
        const { googleAccountId, googleLocationId } = parseGoogleLocationResourceIds(
            typeof loc.name === "string" ? loc.name : null,
        );

        const stored = await storeGooglePlatformCredentials({
            businessId,
            accessToken,
            refreshToken,
            expiresIn,
            googleAccountId,
            googleLocationId,
            googleReviewUrl,
            reviewCount: reviewData.reviewCount,
            averageRating: reviewData.averageRating,
        });

        if (!stored.ok) {
            return { success: false, error: stored.error };
        }

        let googleSyncWarning: string | undefined;

        if (stored.platformId) {
            const syncOutcome = await enqueueGooglePostConnectSync(stored.platformId);
            if (syncOutcome.mode === "failed") {
                logger.error(
                    { err: syncOutcome.error },
                    "[Onboarding] Google review sync could not be started after connect",
                );
                googleSyncWarning =
                    "Google is connected, but starting the review import failed. Use Sync on Integrations or Reviews in a few minutes.";
            }

            // Pub/Sub registration deliberately NOT awaited here. `enqueueGooglePostConnectSync`
            // above already runs prepareGoogleSync, which registers the same account for the same
            // topic — so this call was duplicate work that ran twice per connect. Worse, it was
            // awaited inside the server action the user is waiting on: 2 attempts, a 2s sleep
            // between them, each wrapping fetchWithRetry(retries=3, backoff 2s→4s→8s) — up to
            // ~30s of spinner for a background concern the user never sees.
            //
            // Coverage without it: every subsequent sync re-registers via prepareGoogleSync, and
            // /api/cron/register-google-pubsub-notifications exists as the standing backstop.
        }

        revalidatePath("/onboarding");

        return {
            success: true,
            reviewData,
            googleSyncWarning,
            locationInfo: {
                businessName: displayName || loc.businessName,
                address: addr?.addressLines?.join(", ") ?? undefined,
                city: addr?.locality || loc.city,
                state: addr?.administrativeArea || loc.state,
                phone,
                category: mappedCategory,
            },
        };
    } catch (err) {
        logger.error({ err }, "finalizeGoogleConnection error");
        return { success: false, error: "Failed to finalize connection" };
    }
}
