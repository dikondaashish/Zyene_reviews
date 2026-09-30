import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getPageDetails } from "@/services/facebook/adapter";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { cookies } from "next/headers";
import { FB_CONNECT_COOKIE, consumeFacebookConnectData } from "@/services/facebook/connect-session";
import { facebookCookieOptions } from "@/services/facebook/oauth-state";
import * as Sentry from "@sentry/nextjs";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { facebookConfirmSchema } from "./confirm-schema";

export async function handleFacebookConfirm(req: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/integrations/facebook/confirm");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    try {
        const parsed = facebookConfirmSchema.safeParse(await req.json());
        if (!parsed.success) {
            return apiError("Page ID is required", { status: 400, details: requestId });
        }
        const { pageId } = parsed.data;

        const cookieStore = await cookies();
        const nonce = cookieStore.get(FB_CONNECT_COOKIE)?.value;

        if (!nonce) {
            return apiError("Facebook connection data expired. Please reconnect.", { status: 400, details: requestId });
        }

        const fbData = await consumeFacebookConnectData(nonce);
        if (!fbData || fbData.userId !== user.id) {
            return apiError("Facebook connection data expired. Please reconnect.", { status: 403, details: requestId });
        }
        const selectedPage = fbData.pages.find((p) => p.pageId === pageId);

        if (!selectedPage) {
            return apiError("Selected page not found", { status: 400, details: requestId });
        }

        const businessId = fbData.businessId;

        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return apiError("Unauthorized", { status: 403, details: requestId });
        }

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

        const tokenExpiry = new Date(
            Date.now() + (fbData.tokenExpiresIn || 5184000) * 1000
        );

        const admin = createAdminClient();
        const { data: encAccess, error: encError } = await admin.rpc("encrypt_token", {
            plaintext: selectedPage.pageAccessToken,
        });

        if (encError || !encAccess) {
            logger.error({ err: encError }, "[Facebook Confirm] Token encryption failed:");
            Sentry.captureException(encError ?? new Error("encrypt_token returned empty"), {
                tags: { route: "facebook-confirm", step: "encrypt_token" },
            });
            return apiError("Failed to secure Facebook connection", { status: 500, details: requestId });
        }

        const { data: platform, error } = await admin
            .from("review_platforms")
            .upsert(
                {
                    business_id: businessId,
                    platform: "facebook",
                    external_id: selectedPage.pageId,
                    external_url: pageDetails.link,
                    access_token: encAccess,
                    token_expires_at: tokenExpiry.toISOString(),
                    sync_status: "active",
                    total_reviews: pageDetails.ratingCount,
                    average_rating: pageDetails.overallStarRating,
                },
                { onConflict: "business_id, platform" }
            )
            .select("id")
            .single();

        if (error) {
            logger.error({ err: error }, "[Facebook Confirm] Upsert error:");
            Sentry.captureException(error, { tags: { route: "facebook-confirm", step: "upsert_platform" } });
            return apiError("Failed to save Facebook connection", { status: 500, details: requestId });
        }

        const response = apiOk({
            success: true,
            requestId,
            page: {
                name: selectedPage.pageName,
                rating: pageDetails.overallStarRating,
                reviewCount: pageDetails.ratingCount,
            },
        });

        response.cookies.set(FB_CONNECT_COOKIE, "",
            facebookCookieOptions("/api/integrations/facebook", 0));

        try {
            await syncFacebookReviewsForPlatform(platform.id);
        } catch (syncError: unknown) {
            logger.error({ err: syncError }, "[Facebook Confirm] Initial sync error:");
            Sentry.captureException(syncError, { tags: { route: "facebook-confirm", step: "initial_sync" } });
        }

        logger.info({ userId: user.id, platformId: platform.id, pageId }, "Facebook page confirmed");

        return response;
    } catch (error: unknown) {
        logger.error({ err: error }, "[Facebook Confirm] Error:");
        Sentry.captureException(error, { tags: { route: "facebook-confirm" } });
        return apiError("Internal Server Error", { status: 500, details: requestId });
    }
}
