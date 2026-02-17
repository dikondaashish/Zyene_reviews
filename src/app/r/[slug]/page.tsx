
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicReviewFlow } from "./review-flow";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Share Your Experience",
    description: "We'd love to hear about your experience. Your feedback helps us improve.",
};

export default async function RequestPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ ref?: string }>;
}) {
    const supabase = await createClient();
    const { ref: requestId } = await searchParams;
    const { slug } = await params;

    console.log(`[RequestPage] Lookup slug: ${slug}`);

    // 1. Look up business by slug (include category for tag selection)
    const { data: business, error } = await supabase
        .from("businesses")
        .select("id, name, slug, category")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`[RequestPage] Error looking up business: ${error.message}`);
    }

    if (!business) {
        console.warn(`[RequestPage] Business not found for slug: ${slug}`);
        return notFound();
    }

    // 2. Look up Google Review URL
    const { data: platform } = await supabase
        .from("review_platforms")
        .select("external_url")
        .eq("business_id", business.id)
        .eq("platform", "google")
        .single();

    // 3. Look up Request (if ref provided) & Log Click
    if (requestId) {
        const { data: request } = await supabase
            .from("review_requests")
            .select("status")
            .eq("id", requestId)
            .eq("business_id", business.id)
            .single();

        if (request && request.status !== "review_left" && request.status !== "completed") {
            await supabase
                .from("review_requests")
                .update({
                    status: "clicked",
                    clicked_at: new Date().toISOString(),
                })
                .eq("id", requestId);
        }
    }

    return (
        <div className="review-page-wrapper">
            <PublicReviewFlow
                businessId={business.id}
                businessName={business.name}
                businessCategory={business.category || "other"}
                requestId={requestId}
                googleUrl={platform?.external_url}
            />
        </div>
    );
}
