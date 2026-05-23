import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { BarChart3 } from "lucide-react";
import { buildAnalyticsRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string; platform?: string }>;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const [{ businessId, business }, sp] = await Promise.all([
        getActiveBusinessId(),
        searchParams,
    ]);
    const range = sp.range || "30d";
    const platform = sp.platform || "all";

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={BarChart3}
                title="Add a business to view analytics"
                description="Charts, exports, and reports use your active business. Create a location or switch business in the header when you have one."
            />
        );
    }

    const result = await buildAnalyticsRangePayload(supabase, {
        businessId,
        business,
        rangeRaw: range,
        platform,
    });

    if ("error" in result) {
        logger.error("[Analytics page] Data fetch failed");
        return (
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <DashboardFetchError
                    message="We could not load analytics for this business. Check your connection and try again."
                    retryHref="/analytics"
                />
            </div>
        );
    }

    return (
        <AnalyticsPageClient
            businessId={businessId}
            businessName={business?.name ?? ""}
            businessSlug={(business as { slug?: string })?.slug ?? ""}
            initialPayload={result}
        />
    );
}
