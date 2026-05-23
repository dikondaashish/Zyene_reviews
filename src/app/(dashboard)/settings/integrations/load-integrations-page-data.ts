import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";

export type VisibleReviewRollup = {
    totalVisible?: number;
    googleRowCount?: number;
    googleVisibleCount?: number;
    googleAverageRating?: number | null;
    yelpRowCount?: number;
    yelpVisibleCount?: number;
    facebookRowCount?: number;
    facebookVisibleCount?: number;
    facebookAverageRating?: number | null;
};

export type IntegrationsPageData =
    | { kind: "no-business" }
    | {
          kind: "ok";
          business: {
              id: string;
              name: string | null;
              slug: string | null;
              review_platforms?: Array<Record<string, unknown>>;
          };
          googlePlatform: Record<string, unknown> | undefined;
          yelpPlatform: Record<string, unknown> | undefined;
          facebookPlatform: Record<string, unknown> | undefined;
          apiKey: string | null;
          connectedCount: number;
          canUsePublicWidget: boolean;
          totalReviews: number;
          visibleRollup: VisibleReviewRollup | undefined;
      };

export async function loadIntegrationsPageData(): Promise<IntegrationsPageData> {
    const { business, organization } = await getActiveBusinessId();

    if (!business) {
        return { kind: "no-business" };
    }

    const platforms = (business as { review_platforms?: Array<Record<string, unknown>> })?.review_platforms || [];

    const googlePlatform = platforms.find((p) => p.platform === "google");
    const yelpPlatform = platforms.find((p) => p.platform === "yelp");
    const facebookPlatform = platforms.find((p) => p.platform === "facebook");
    const apiPlatform = platforms.find((p) => p.platform === "api");
    const apiKey = (apiPlatform?.external_id as string | undefined) || null;

    const connectedPlatforms = [googlePlatform, yelpPlatform, facebookPlatform].filter((p) => !!p);
    const canUsePublicWidget = planAllowsPublicReviewWidget(
        (organization as { plan?: string | null; plan_status?: string | null } | null)?.plan ?? null,
        (organization as { plan?: string | null; plan_status?: string | null } | null)?.plan_status ?? null
    );
    const connectedCount = connectedPlatforms.length;

    const supabase = await createClient();
    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [business.id]);
    const visibleRollup = visibleRollupMap.get(business.id);
    const totalReviews = visibleRollup?.totalVisible ?? 0;

    return {
        kind: "ok",
        business: {
            id: business.id,
            name: business.name ?? null,
            slug: business.slug ?? null,
            review_platforms: platforms,
        },
        googlePlatform,
        yelpPlatform,
        facebookPlatform,
        apiKey,
        connectedCount,
        canUsePublicWidget,
        totalReviews,
        visibleRollup,
    };
}
