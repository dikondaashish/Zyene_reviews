
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicReviewFlow } from "./review-flow";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Review Your Experience",
    description: "Please rate your recent experience.",
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

    // 1. Look up business by slug
    const { data: business } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("slug", slug)
        .single();

    if (!business) {
        return notFound();
    }

    // 2. Look up Google Review URL
    const { data: platform } = await supabase
        .from("review_platforms")
        .select("external_url")
        .eq("business_id", business.id)
        .eq("platform_name", "google")
        .single();

    // If no google URL, we can't redirect happy customers.
    // We should probably show a generic "Thanks" or just fallback to generic logic.
    // Assuming it exists for this feature to make sense.

    // 3. Look up Request (if ref provided) & Log Click
    if (requestId) {
        // Verify it belongs to business?
        // Check if already clicked? - "Update status to clicked" implies we update it.
        const { data: request } = await supabase
            .from("review_requests")
            .select("status")
            .eq("id", requestId)
            .eq("business_id", business.id) // Security check
            .single();

        if (request && request.status !== "review_left") {
            // Update to 'clicked' if not already review_left. 
            // We can overwrite 'sent' or 'delivered'.
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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-md text-center space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{business.name}</h1>
                    <p className="text-slate-600">We value your feedback.</p>
                </div>

                <PublicReviewFlow
                    businessId={business.id}
                    requestId={requestId}
                    googleUrl={platform?.external_url}
                />
            </main>
        </div>
    );
}
