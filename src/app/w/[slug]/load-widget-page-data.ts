import { createAdminClient } from "@/lib/db/supabase/admin";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";

export type WidgetReview = {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    platform: string;
    created_at: string;
};

export type WidgetPageData =
    | { kind: "not-found" }
    | { kind: "subscription"; businessName: string }
    | {
          kind: "ok";
          businessName: string;
          hideBranding: boolean;
          widgetType: string;
          reviewCount: number;
          averageRating: number;
          formattedReviews: WidgetReview[];
      };

export async function loadWidgetPageData(
    slug: string,
    widgetType: string
): Promise<WidgetPageData> {
    const admin = createAdminClient();

    const { data: business } = await admin
        .from("businesses")
        .select(`
            id,
            name,
            hide_branding,
            organization:organizations (
                plan,
                plan_status
            )
        `)
        .eq("slug", slug)
        .maybeSingle();

    if (!business) {
        return { kind: "not-found" };
    }

    const org = (
        business as { organization?: { plan?: string | null; plan_status?: string | null } }
    ).organization;

    if (!planAllowsPublicReviewWidget(org?.plan ?? null, org?.plan_status ?? null)) {
        return { kind: "subscription", businessName: business.name ?? "Business" };
    }

    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(admin, [business.id]);
    const vr = visibleRollupMap.get(business.id)!;

    const { data: reviews } = await admin
        .from("reviews")
        .select(`
            id,
            rating,
            text,
            author_name,
            created_at,
            review_platforms (
                platform
            )
        `)
        .eq("business_id", business.id)
        .eq("is_visible", true)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(20);

    const formattedReviews: WidgetReview[] = (reviews ?? []).map((r) => ({
        id: r.id,
        author_name: r.author_name || "Customer",
        rating: r.rating ?? 5,
        content: (r.text || "").trim() || "Excellent service!",
        platform: r.review_platforms?.platform || "Direct",
        created_at: r.created_at ?? "",
    }));

    const reviewCount = vr.totalVisible;
    const rawAverage =
        vr.totalVisible > 0
            ? vr.averageRatingVisible
            : formattedReviews.length > 0
              ? formattedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
                formattedReviews.length
              : 5;
    const averageRating = Number.isFinite(rawAverage) ? rawAverage : 5;

    return {
        kind: "ok",
        businessName: business.name ?? "Reviews",
        hideBranding: !!(business as { hide_branding?: boolean | null }).hide_branding,
        widgetType,
        reviewCount,
        averageRating,
        formattedReviews,
    };
}
