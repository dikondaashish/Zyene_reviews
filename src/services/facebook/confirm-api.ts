import { createClient } from "@/lib/db/supabase/server";
import { getPageDetails } from "@/services/facebook/adapter";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import type { MemberOrgContext } from "@/types/member-context";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { facebookConfirmSchema, type FbConnectCookieData } from "./confirm-schema";

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
        const fbDataRaw = cookieStore.get("fb_connect_data")?.value;

        if (!fbDataRaw) {
            return apiError("Facebook connection data expired. Please reconnect.", { status: 400, details: requestId });
        }

        const fbData = JSON.parse(fbDataRaw) as FbConnectCookieData;
        const selectedPage = fbData.pages.find((p) => p.pageId === pageId);

        if (!selectedPage) {
            return apiError("Selected page not found", { status: 400, details: requestId });
        }

        const businessId = fbData.businessId;

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

        const { data: encAccess } = await supabase.rpc("encrypt_token", { plaintext: selectedPage.pageAccessToken });

        const { data: platform, error } = await supabase
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
            .select()
            .single();

        if (error) {
            logger.error({ err: error }, "[Facebook Confirm] Upsert error:");
            Sentry.captureException(error, { tags: { route: "facebook-confirm", step: "upsert_platform" } });
            return apiError("Failed to save Facebook connection", { status: 500, details: requestId });
        }

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
