import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { loadRequestsPageData } from "./load-requests-page-data";
import { RequestsPageHeader } from "./requests-page-header";
import { RequestsStatsSection } from "./requests-stats-section";
import { RequestsListSection, type RequestListRow } from "./requests-list-section";

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; customer?: string }>;
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
            <div className="flex flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
                <DashboardFetchError
                    message="We could not load review requests. Check your connection and try again."
                    retryHref="/requests"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
            <RequestsPageHeader
                businessId={data.business.id}
                businessSlug={data.business.slug || undefined}
                businessName={data.business.name || undefined}
                initialCustomer={data.initialCustomer}
            />
            <RequestsStatsSection stats={data.stats} />
            <RequestsListSection
                requests={data.requests as RequestListRow[]}
                page={data.page}
                pageSize={data.pageSize}
                customerQuery={data.customerQuery}
            />
        </div>
    );
}
