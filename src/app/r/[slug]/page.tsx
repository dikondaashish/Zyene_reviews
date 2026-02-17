
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicReviewFlow } from "./review-flow";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Share Your Experience",
    description: "We'd love to hear about your experience. Your feedback helps us improve.",
};

import { AccessError } from "@/components/public/access-error";

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

    // 1. Look up business by slug + check subscription
    const { data: business, error } = await supabase
        .from("businesses")
        .select(`
            id, 
            name, 
            slug, 
            category,
            organization:organizations (
                plan,
                plan_status
            )
        `)
        .eq("slug", slug)
        .single();

    if (error || !business) {
        return notFound();
    }

    // Access Control 1: Subscription Check
    // If plan is 'free' OR status is not 'active'
    const org = business.organization as any;
    const hasActiveSubscription = org?.plan && org.plan !== "free" && org.plan_status === "active";

    if (!hasActiveSubscription) {
        return <AccessError type="subscription" businessName={business.name} />;
    }

    // 2. Look up Google Review Platform
    const { data: platform, error: platformError } = await supabase
        .from("review_platforms")
        .select("external_url")
        .eq("business_id", business.id)
        .eq("platform", "google")
        .maybeSingle(); // Don't throw if not found

    // Access Control 2: Google Profile Connected
    if (!platform || platformError) {
        return <AccessError type="platform" businessName={business.name} />;
    }

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
