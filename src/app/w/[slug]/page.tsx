import { createClient } from "@/lib/supabase/server";
import { ReviewCarousel } from "@/components/widgets/review-carousel";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Find business by slug
    const { data: business } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("slug", slug)
        .single();

    if (!business) {
        notFound();
    }

    // 2. Fetch top reviews (4+ stars)
    const { data: reviews } = await supabase
        .from("reviews")
        .select(`
            id,
            rating,
            content,
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

    // Format for component
    const formattedReviews = (reviews || []).map((r: any) => ({
        id: r.id,
        author_name: r.author_name || "Customer",
        rating: r.rating || 5,
        content: r.content || "Excellent service!",
        platform: r.review_platforms?.platform || "Direct",
        created_at: r.created_at
    }));

    return (
        <div className="w-full h-full min-h-[100px] bg-white overflow-hidden m-0 p-0">
            <ReviewCarousel reviews={formattedReviews} businessName={business.name} />
        </div>
    );
}
