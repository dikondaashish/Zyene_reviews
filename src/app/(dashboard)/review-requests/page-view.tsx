import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { Send } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { ReviewRequestsStatsSection } from "./review-requests-stats-section";
import { ReviewRequestsTabs } from "./review-requests-tabs";
import { ReviewRequestsListSection } from "./review-requests-list-section";
import { ReviewRequestsEmptyState } from "./review-requests-empty-state";
import { loadReviewRequestsPageData } from "./load-review-requests-page-data";
import { ReviewRequestsPageHeader } from "./review-requests-page-header";

export default async function ReviewRequestsPage(props: {
    searchParams: Promise<{ status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const filterStatus = searchParams.status || "all";

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const data = await loadReviewRequestsPageData(filterStatus);

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Send}
                title="Add a business to send review requests"
                description="Review request history and sending are tied to your active business. Create a business first, then return here."
            />
        );
    }

    if (data.kind === "error") {
        return (
            <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                <DashboardFetchError
                    message="We could not load review requests. Check your connection and try again."
                    retryHref="/review-requests"
                />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-6 h-full overflow-x-hidden">
            <ReviewRequestsPageHeader totalSent={data.totalSent} />
            {data.totalSent === 0 ? (
                <ReviewRequestsEmptyState />
            ) : (
                <>
                    <ReviewRequestsStatsSection
                        totalSent={data.totalSent}
                        totalOpened={data.totalOpened}
                        totalClicked={data.totalClicked}
                        totalConverted={data.totalConverted}
                    />
                    <ReviewRequestsTabs
                        filterStatus={data.filterStatus}
                        totalSent={data.totalSent}
                        totalOpened={data.totalOpened}
                        totalClicked={data.totalClicked}
                        totalConverted={data.totalConverted}
                    />
                    <ReviewRequestsListSection filteredRequests={data.filteredRequests} />
                </>
            )}
        </div>
    );
}
