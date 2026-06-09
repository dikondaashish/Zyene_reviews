import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { isGoogleBusinessConnected } from "@/lib/google/is-google-connected";
import { resolveGoogleMapsListingUrl } from "@/lib/google/maps-listing-url";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "@/components/reviews/private-feedback-card";
import { loadReviewsPageList } from "./reviews-page-list-load";

export type ReviewsPageSearchParams = {
    status?: string;
    rating?: string;
    sort?: string;
    page?: string;
    type?: string;
};

export type ReviewsPageLoadResult =
    | { kind: "error"; message: string }
    | { kind: "no-business" }
    | {
          kind: "ok";
          businessId: string;
          googleMapsListingUrl: string | null;
          isDemo: boolean;
          isGoogleConnected: boolean;
          initialGoogleSyncStatus: string | null;
          initialGoogleLastSyncedAt: string | null;
          autoCommenterPlanOk: boolean;
          autoReplyInitial: {
              auto_reply_enabled: boolean;
              auto_reply_min_rating: 3 | 4 | 5;
              auto_reply_tone: "professional" | "friendly" | "concise";
          };
          initialReviews: ReviewManagementItem[] | PrivateFeedback[];
          initialCount: number;
          initialTotalPages: number;
          initialPage: number;
          initialPublicCount: number;
          initialPrivateCount: number;
          initialType: string;
          initialFilters: { status: string; rating: string; sort: string };
      };

export async function loadReviewsPageData(
    searchParams: ReviewsPageSearchParams
): Promise<ReviewsPageLoadResult> {
    const [supabase, { businessId, business, organization }] = await Promise.all([
        createClient(),
        getActiveBusinessId(),
    ]);

    const autoCommenterPlanOk = planAllowsAiReviewFeatures(
        organization?.plan ?? null,
        (organization as { plan_status?: string | null } | null)?.plan_status ?? null
    );

    if (!businessId) return { kind: "no-business" };

    const isGoogleConnected = isGoogleBusinessConnected(business?.review_platforms);
    const isDemo = !isGoogleConnected;

    const page = parseInt(searchParams.page || "1");
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ count: publicCount, error: publicCountErr }, { count: privateCount, error: privateCountErr }] =
        await Promise.all([
            supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .eq("is_visible", true),
            supabase
                .from("private_feedback")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId),
        ]);

    if (publicCountErr || privateCountErr) {
        logger.error({ err: publicCountErr || privateCountErr }, "[Reviews page] Count queries failed:");
        return {
            kind: "error",
            message: "We could not load review counts. Check your connection and try again.",
        };
    }

    const list = await loadReviewsPageList(businessId, searchParams, from, to);
    if (!list.ok) return { kind: "error", message: list.message };

    const googlePlatform = business?.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );

    return {
        kind: "ok",
        businessId,
        googleMapsListingUrl: resolveGoogleMapsListingUrl({
            googleReviewUrl:
                typeof business?.google_review_url === "string" ? business.google_review_url : null,
            platformExternalUrl:
                typeof googlePlatform?.external_url === "string" ? googlePlatform.external_url : null,
        }),
        isDemo,
        isGoogleConnected,
        initialGoogleSyncStatus:
            typeof googlePlatform?.sync_status === "string" ? googlePlatform.sync_status : null,
        initialGoogleLastSyncedAt:
            typeof googlePlatform?.last_synced_at === "string" ? googlePlatform.last_synced_at : null,
        autoCommenterPlanOk,
        autoReplyInitial: {
            auto_reply_enabled:
                autoCommenterPlanOk &&
                Boolean((business as { auto_reply_enabled?: boolean })?.auto_reply_enabled),
            auto_reply_min_rating: ((): 3 | 4 | 5 => {
                const r = (business as { auto_reply_min_rating?: number })?.auto_reply_min_rating;
                if (r === 3 || r === 4 || r === 5) return r;
                return 4;
            })(),
            auto_reply_tone: ((): "professional" | "friendly" | "concise" => {
                const t = (business as { auto_reply_tone?: string })?.auto_reply_tone;
                if (t === "friendly" || t === "concise" || t === "professional") return t;
                return "professional";
            })(),
        },
        initialReviews: list.reviews,
        initialCount: list.count,
        initialTotalPages: list.count ? Math.ceil(list.count / pageSize) : 0,
        initialPage: page,
        initialPublicCount: publicCount || 0,
        initialPrivateCount: privateCount || 0,
        initialType: searchParams.type || "public",
        initialFilters: {
            status: searchParams.status || "all",
            rating: searchParams.rating || "all",
            sort: searchParams.sort || "newest",
        },
    };
}
