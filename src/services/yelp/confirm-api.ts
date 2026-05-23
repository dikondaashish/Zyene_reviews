import { createClient } from "@/lib/db/supabase/server";
import { getBusiness } from "@/services/yelp/adapter";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import * as Sentry from "@sentry/nextjs";
import type { MemberOrgContext } from "@/types/member-context";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { yelpConfirmSchema } from "./confirm-schema";

export async function handleYelpConfirm(req: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/integrations/yelp/confirm");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    try {
        const parsed = yelpConfirmSchema.safeParse(await req.json());
        if (!parsed.success) {
            return apiError("Yelp business ID and business ID are required", { status: 400, details: requestId });
        }

        const { yelpBusinessId, businessId } = parsed.data;

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

        const yelpBusiness = await getBusiness(yelpBusinessId);

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .upsert(
                {
                    business_id: businessId,
                    platform: "yelp",
                    external_id: yelpBusinessId,
                    external_url: yelpBusiness.yelpUrl,
                    sync_status: "active",
                    total_reviews: yelpBusiness.reviewCount,
                    average_rating: yelpBusiness.rating,
                },
                { onConflict: "business_id, platform" }
            )
            .select()
            .single();

        if (error) {
            logger.error({ err: error }, "[Yelp Confirm] Upsert error:");
            Sentry.captureException(error, { tags: { route: "yelp-confirm", step: "upsert_platform" } });
            return apiError("Failed to save Yelp connection", { status: 500, details: requestId });
        }

        try {
            const syncResult = await syncYelpReviewsForPlatform(platform.id);
            logger.info({ userId: user.id, businessId, yelpBusinessId, platformId: platform.id }, "Yelp business confirmed");
            return apiOk({
                success: true,
                platform,
                syncResult,
                requestId,
                business: {
                    name: yelpBusiness.name,
                    rating: yelpBusiness.rating,
                    reviewCount: yelpBusiness.reviewCount,
                },
            });
        } catch (syncError: unknown) {
            Sentry.captureException(syncError, { tags: { route: "yelp-confirm", step: "initial_sync" } });
            return apiOk({
                success: true,
                platform,
                syncResult: null,
                requestId,
                warning: "Connected but initial sync failed. It will retry automatically.",
                business: {
                    name: yelpBusiness.name,
                    rating: yelpBusiness.rating,
                    reviewCount: yelpBusiness.reviewCount,
                },
            });
        }
    } catch (error: unknown) {
        logger.error({ err: error }, "[Yelp Confirm] Error:");
        Sentry.captureException(error, { tags: { route: "yelp-confirm" } });
        return apiError("Internal Server Error", { status: 500, details: requestId });
    }
}
