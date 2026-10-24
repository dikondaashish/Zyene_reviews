import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { loadRequestsPageData } from "./load-requests-page-data";
import { RequestsPageHeader } from "./requests-page-header";
import { GetReviewsTabs } from "@/components/dashboard/get-reviews-tabs";
import { RequestsStatsSection } from "./requests-stats-section";
import { RequestsListSection, type RequestListRow } from "./requests-list-section";
import { RequestsLinkStatsSection } from "./requests-link-stats-section";
import { RequestsViewTabs } from "./requests-view-tabs";

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; customer?: string; view?: string }>;
}) {
    const [sp, supabase] = await Promise.all([searchParams, createClient()]);
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const data = await loadRequestsPageData(sp);

    if (data.kind === "no-business") {
        return <div>Business not found. Please contact support.</div>;
    }

    if (data.kind === "error") {
        return (
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
                <DashboardFetchError
                    message="We could not load review requests. Check your connection and try again."
                    retryHref="/requests"
                />
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
            <GetReviewsTabs active="/requests" />
            <RequestsPageHeader
                businessId={data.business.id}
                businessSlug={data.business.slug || undefined}
                businessName={data.business.name || undefined}
                initialCustomer={data.initialCustomer}
            />
            <RequestsViewTabs view={data.view} sentCount={data.stats.totalSent} visitCount={data.linkStats.visits} />
            {data.view === "link" ? (
                <RequestsLinkStatsSection stats={data.linkStats} />
            ) : (
                <RequestsStatsSection stats={data.stats} />
            )}
            <RequestsListSection
                requests={data.requests as RequestListRow[]}
                page={data.page}
                pageSize={data.pageSize}
                customerQuery={data.customerQuery}
                view={data.view}
            />
        </div>
    );
}
