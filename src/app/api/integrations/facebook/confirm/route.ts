import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getPageDetails } from "@/services/facebook/adapter";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import type { MemberOrgContext } from "@/types/member-context";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const confirmSchema = z.object({
    pageId: z.string().min(1).max(200),
});

/**
 * POST: Confirm Facebook page connection.
 * Reads from the fb_connect_data cookie set during the OAuth callback,
 * saves the selected page to review_platforms, and triggers initial sync.
 */
export async function POST(req: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/integrations/facebook/confirm");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    try {
        const parsed = confirmSchema.safeParse(await req.json());
        if (!parsed.success) {
            return apiError("Page ID is required", { status: 400, details: requestId });
        }
        const { pageId } = parsed.data;

        // Read connect data from cookie
        const cookieStore = await cookies();
        const fbDataRaw = cookieStore.get("fb_connect_data")?.value;

        if (!fbDataRaw) {
            return apiError("Facebook connection data expired. Please reconnect.", { status: 400, details: requestId });
        }

        const fbData = JSON.parse(fbDataRaw) as {
            businessId: string;
            tokenExpiresIn?: number;
            pages: Array<{ pageId: string; pageName: string; pageAccessToken: string }>;
        };
        const selectedPage = fbData.pages.find(
            (p) => p.pageId === pageId
        );

        if (!selectedPage) {
            return apiError("Selected page not found", { status: 400, details: requestId });
        }

        const businessId = fbData.businessId;

        // Verify user owns this business
        const { data: member } = await supabase
            .from("organization_members")
            .select("organizations ( businesses ( id ) )")
            .eq("user_id", user.id)
            .single();

        const memberTyped = member as unknown as MemberOrgContext;
        const businesses = memberTyped?.organizations?.businesses || [];
        const ownsBusiness = businesses.some((b) => b.id === businessId);

        if (!ownsBusiness) {
            return apiError("Unauthorized", { status: 403, details: requestId });
        }

        // Get page details for metadata
        let pageDetails;
        try {
            pageDetails = await getPageDetails(
                selectedPage.pageId,
                selectedPage.pageAccessToken
            );
        } catch {
            pageDetails = {
                name: selectedPage.pageName,
                overallStarRating: 0,
                ratingCount: 0,
                link: `https://facebook.com/${selectedPage.pageId}`,
            };
        }

        // Save to review_platforms
        const tokenExpiry = new Date(
            Date.now() + (fbData.tokenExpiresIn || 5184000) * 1000
        );

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .upsert(
                {
                    business_id: businessId,
                    platform: "facebook",
                    external_id: selectedPage.pageId,
                    external_url: pageDetails.link,
                    access_token: selectedPage.pageAccessToken,
                    token_expires_at: tokenExpiry.toISOString(),
                    sync_status: "active",
                    total_reviews: pageDetails.ratingCount,
                    average_rating: pageDetails.overallStarRating,
                },
                { onConflict: "business_id, platform" }
            )
            .select()
            .single();

        if (error) {
            console.error("[Facebook Confirm] Upsert error:", error);
            Sentry.captureException(error, { tags: { route: "facebook-confirm", step: "upsert_platform" } });
            return apiError("Failed to save Facebook connection", { status: 500, details: requestId });
        }

        // Clear the cookie
        const response = apiOk({
            success: true,
            platform,
            requestId,
            page: {
                name: selectedPage.pageName,
                rating: pageDetails.overallStarRating,
                reviewCount: pageDetails.ratingCount,
            },
        });

        response.cookies.set("fb_connect_data", "", {
            maxAge: 0,
            path: "/",
        });

        // Trigger initial sync in the background
        try {
            await syncFacebookReviewsForPlatform(platform.id);
        } catch (syncError: unknown) {
            console.error(
                "[Facebook Confirm] Initial sync error:",
                syncError
            );
            Sentry.captureException(syncError, { tags: { route: "facebook-confirm", step: "initial_sync" } });
            // Connection saved, sync will retry on next cron
        }

        logger.info({ userId: user.id, platformId: platform.id, pageId }, "Facebook page confirmed");

        return response;
    } catch (error: unknown) {
        console.error("[Facebook Confirm] Error:", error);
        Sentry.captureException(error, { tags: { route: "facebook-confirm" } });
        return apiError("Internal Server Error", { status: 500, details: requestId });
    }
}
