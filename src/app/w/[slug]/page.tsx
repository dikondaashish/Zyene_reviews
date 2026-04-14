import { createAdminClient } from "@/lib/db/supabase/admin";
import { ReviewCarousel } from "@/components/widgets/review-carousel";
import { notFound } from "next/navigation";
import { AccessError } from "@/components/public/access-error";

export const dynamic = "force-dynamic";

/**
 * Embeddable widget: loaded in third-party iframes without auth.
 * Uses service role only to read public review data (RLS requires org membership for anon).
 */
export default async function WidgetPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
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

    const org = (business as any).organization;
    const paidPlans = ["starter", "professional", "enterprise"];
    const hasEmbedAccess =
        paidPlans.includes(org?.plan) &&
        ["active", "trialing"].includes(org?.plan_status);

    if (!hasEmbedAccess) {
        return <AccessError type="subscription" businessName={business.name} />;
    }

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

    return (
        <div className="w-full h-full min-h-25 bg-background overflow-hidden m-0 p-0">
            <ReviewCarousel reviews={formattedReviews} businessName={business.name ?? "Reviews"} />
        </div>
    );
}
