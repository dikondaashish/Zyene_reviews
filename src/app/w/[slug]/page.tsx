import { createAdminClient } from "@/lib/db/supabase/admin";
import { ReviewCarousel } from "@/components/widgets/review-carousel";
import { ReviewBadge } from "@/components/widgets/review-badge";
import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";
import { planAllowsPublicReviewWidget } from "@/services/stripe/plans";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";

export const dynamic = "force-dynamic";

/**
 * Embeddable widget: loaded in third-party iframes without auth.
 * Uses service role only to read public review data (RLS requires org membership for anon).
 */
export default async function WidgetPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ type?: string }>;
}) {
    const { slug } = await params;
    const resolvedSearch = searchParams ? await searchParams : undefined;
    const widgetType = (resolvedSearch?.type || "carousel").toLowerCase();
    const admin = createAdminClient();

    const { data: business } = await admin
        .from("businesses")
        .select(`
            id,
            name,
            organization:organizations (
                plan,
                plan_status
            )
        `)
        .eq("slug", slug)
        .maybeSingle();

    if (!business) {
        notFound();
    }

    const org = (business as { organization?: { plan?: string | null; plan_status?: string | null } }).organization;

    if (!planAllowsPublicReviewWidget(org?.plan ?? null, org?.plan_status ?? null)) {
        return <AccessError type="subscription" businessName={business.name} />;
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

    const formattedReviews = (reviews ?? []).map((r) => ({
        id: r.id,
        author_name: r.author_name || "Customer",
        rating: r.rating ?? 5,
        content: (r.text || "").trim() || "Excellent service!",
        platform: r.review_platforms?.platform || "Direct",
        created_at: r.created_at,
    }));

    const reviewCount = vr.totalVisible;
    const averageRating =
        vr.totalVisible > 0
            ? vr.averageRatingVisible
            : formattedReviews.length > 0
              ? formattedReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / formattedReviews.length
              : 5;

    return (
        <div className="w-full h-full min-h-25 bg-background overflow-hidden m-0 p-0">
            {widgetType === "badge" ? (
                <ReviewBadge
                    businessName={business.name ?? "Reviews"}
                    avgRating={averageRating}
                    totalReviews={reviewCount}
                />
            ) : (
                <ReviewCarousel reviews={formattedReviews} businessName={business.name ?? "Reviews"} />
            )}
        </div>
    );
}
