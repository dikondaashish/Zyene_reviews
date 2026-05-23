import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { ReviewRequestsStatsSection } from "./review-requests-stats-section";
import { ReviewRequestsTabs } from "./review-requests-tabs";
import { ReviewRequestsListSection } from "./review-requests-list-section";
import { ReviewRequestsEmptyState } from "./review-requests-empty-state";
import { getRequestStatus, type ReviewRequestRow } from "./review-requests-page-utils";

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

    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={Send}
                title="Add a business to send review requests"
                description="Review request history and sending are tied to your active business. Create a business first, then return here."
            />
        );
    }

    const { data: allRequests, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("sent_at", { ascending: false });

    if (error) {
        logger.error({ err: error }, "Error fetching review requests:");
        return (
            <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                <DashboardFetchError
                    message="We could not load review requests. Check your connection and try again."
                    retryHref="/review-requests"
                />
            </div>
        );
    }

    const requests = (allRequests || []) as ReviewRequestRow[];
    const totalSent = requests.length;
    const totalOpened = requests.filter((r) => r.opened_at).length;
    const totalClicked = requests.filter((r) => r.clicked_at).length;
    const totalConverted = requests.filter((r) => r.completed_at).length;

    const filteredRequests =
        filterStatus === "all"
            ? requests
            : requests.filter(
                  (r) => getRequestStatus(r.opened_at, r.clicked_at, r.completed_at) === filterStatus
              );

    return (
        <div className="flex min-w-0 flex-col gap-6 h-full overflow-x-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                        Review Requests
                        <span className="rounded-full bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
                            {totalSent || 0}
                        </span>
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Track all review requests sent to your customers.
                    </p>
                </div>
                <Button asChild className="w-full shrink-0 sm:w-auto">
                    <Link href="/campaigns" className="flex w-full items-center justify-center">
                        <Send className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Link>
                </Button>
            </div>

            {totalSent === 0 ? (
                <ReviewRequestsEmptyState />
            ) : (
                <>
                    <ReviewRequestsStatsSection
                        totalSent={totalSent}
                        totalOpened={totalOpened}
                        totalClicked={totalClicked}
                        totalConverted={totalConverted}
                    />
                    <ReviewRequestsTabs
                        filterStatus={filterStatus}
                        totalSent={totalSent}
                        totalOpened={totalOpened}
                        totalClicked={totalClicked}
                        totalConverted={totalConverted}
                    />
                    <ReviewRequestsListSection filteredRequests={filteredRequests} />
                </>
            )}
        </div>
    );
}
