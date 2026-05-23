import { CompetitorsList } from "./competitors-list";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { TrendingUp } from "lucide-react";
import { loadCompetitorsPageData } from "./load-competitors-page-data";
import { CompetitorsPageHeader } from "./competitors-page-header";

export default async function CompetitorsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const sp = await searchParams;
    const data = await loadCompetitorsPageData(sp.range);

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={TrendingUp}
                title="Add a business to track competitors"
                description="Competitor monitoring is scoped to your active business. Add a location or switch business in the header to continue."
            />
        );
    }

    if (data.kind === "error") {
        return (
            <div className="flex-1 space-y-6 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-6">
                <DashboardFetchError
                    message="We could not load competitors. Check your connection and try again."
                    retryHref="/competitors"
                />
            </div>
        );
    }

    return (
        <div className="min-w-0 flex-1 space-y-6 overflow-x-hidden p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-6">
            <CompetitorsPageHeader recentAlertsCount={data.recentAlertsCount} />
            <CompetitorsList {...data.listProps} />
        </div>
    );
}
