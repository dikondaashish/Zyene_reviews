import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import { isCloverConfigured } from "@/services/clover/config";
import { isSquareConfigured } from "@/services/square/config";
import type { CloverConnectionSummary } from "@/components/integrations/clover-card";
import type { SquareConnectionSummary } from "@/components/integrations/square-card";
import type { PublicApiKey } from "@/lib/api-keys/credentials";
import { canManageApiKeys } from "@/lib/api-keys/scopes";
import { loadActiveApiKeySummary } from "@/services/api-keys/manage-api-keys";

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
          apiKey: PublicApiKey | null;
          canManageApiKeys: boolean;
          connectedCount: number;
          canUsePublicWidget: boolean;
          totalReviews: number;
          visibleRollup: VisibleReviewRollup | undefined;
          cloverConnection: CloverConnectionSummary;
          cloverConfigured: boolean;
          squareConnection: SquareConnectionSummary;
          squareConfigured: boolean;
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
    const connectedPlatforms = [googlePlatform, yelpPlatform, facebookPlatform].filter((p) => !!p);
    const canUsePublicWidget = planAllowsPublicReviewWidget(
        (organization as { plan?: string | null; plan_status?: string | null } | null)?.plan ?? null,
        (organization as { plan?: string | null; plan_status?: string | null } | null)?.plan_status ?? null
    );
    const connectedCount = connectedPlatforms.length;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const [visibleRollupMap, cloverResult, squareResult, squareLastEventResult, apiKey, member] =
        await Promise.all([
            fetchVisibleReviewRollupsByBusinessIds(supabase, [business.id]),
            supabase
                .from("clover_connections")
                .select("merchant_id, environment, connected_at")
                .eq("business_id", business.id)
                .maybeSingle(),
            supabase
                .from("square_connections")
                .select("merchant_id, environment, connected_at, auto_send_enabled")
                .eq("business_id", business.id)
                .is("disconnected_at", null)
                .maybeSingle(),
            supabase
                .from("square_payment_events")
                .select("status, customer_email, created_at")
                .eq("business_id", business.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            loadActiveApiKeySummary(supabase, business.id, "review_requests:write"),
            supabase
                .from("business_members")
                .select("role")
                .eq("business_id", business.id)
                .eq("user_id", user?.id ?? "")
                .eq("status", "active")
                .maybeSingle(),
        ]);
    const visibleRollup = visibleRollupMap.get(business.id);
    const totalReviews = visibleRollup?.totalVisible ?? 0;

    const cloverRow = cloverResult.data;
    const cloverConnection: CloverConnectionSummary = cloverRow
        ? {
              merchantId: cloverRow.merchant_id,
              environment: cloverRow.environment,
              connectedAt: cloverRow.connected_at,
          }
        : null;

    const squareRow = squareResult.data;
    const lastEventRow = squareLastEventResult.data;
    const squareConnection: SquareConnectionSummary = squareRow
        ? {
              merchantId: squareRow.merchant_id,
              environment: squareRow.environment,
              connectedAt: squareRow.connected_at,
              autoSendEnabled: squareRow.auto_send_enabled,
              lastEvent: lastEventRow
                  ? {
                        status: lastEventRow.status,
                        customerEmail: lastEventRow.customer_email,
                        createdAt: lastEventRow.created_at,
                    }
                  : null,
          }
        : null;

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
        canManageApiKeys: canManageApiKeys(member.data?.role),
        connectedCount,
        canUsePublicWidget,
        totalReviews,
        visibleRollup,
        cloverConnection,
        cloverConfigured: isCloverConfigured(),
        squareConnection,
        squareConfigured: isSquareConfigured(),
    };
}
