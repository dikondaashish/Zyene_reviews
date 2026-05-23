import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { MessageSquareQuote } from "lucide-react";
import { loadReviewsPageData } from "./load-reviews-page-data";

export default async function ReviewsPage(props: {
    searchParams: Promise<{ status?: string; rating?: string; sort?: string; page?: string; type?: string }>;
}) {
    const [searchParams, supabase] = await Promise.all([props.searchParams, createClient()]);
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const data = await loadReviewsPageData(searchParams);

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={MessageSquareQuote}
                title="Add a business to see reviews"
                description="Review inbox, private feedback, and replies are tied to a business location. Create one or pick an existing business from the header."
            />
        );
    }

    if (data.kind === "error") {
        return (
            <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                <DashboardFetchError message={data.message} retryHref="/reviews" />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden h-full">
            {data.isDemo && <DemoModeBanner className="mb-2" />}
            <ReviewsPageClient
                businessId={data.businessId}
                googleMapsListingUrl={data.googleMapsListingUrl}
                isDemo={data.isDemo}
                isGoogleConnected={data.isGoogleConnected}
                initialGoogleSyncStatus={data.initialGoogleSyncStatus}
                initialGoogleLastSyncedAt={data.initialGoogleLastSyncedAt}
                autoCommenterPlanOk={data.autoCommenterPlanOk}
                autoReplyInitial={data.autoReplyInitial}
                initialReviews={data.initialReviews}
                initialCount={data.initialCount}
                initialTotalPages={data.initialTotalPages}
                initialPage={data.initialPage}
                initialPublicCount={data.initialPublicCount}
                initialPrivateCount={data.initialPrivateCount}
                initialType={data.initialType}
                initialFilters={data.initialFilters}
            />
        </div>
    );
}
