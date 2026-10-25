import { createClient } from "@/lib/db/supabase/server";
import { ValueSummaryCard } from "@/components/dashboard/value-summary-card";
import { currentMonthPeriod, loadValueSummary } from "@/services/dashboard/load-value-summary";
import type { DashboardViewProps } from "./types";

/** Streams in after the rest of the dashboard; shows nothing if the numbers fail to load. */
export async function DashboardViewValueSummary({
    businessId,
    businessName,
    organization,
}: {
    businessId: string;
    businessName: string;
    organization: DashboardViewProps["organization"];
}) {
    const supabase = await createClient();
    const period = currentMonthPeriod();
    const loaded = await loadValueSummary(supabase, businessId, organization, period);
    if (!loaded) return null;
    const monthLabel = period.start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    return (
        <ValueSummaryCard
            businessId={businessId}
            businessName={businessName.trim() || "there"}
            monthLabel={monthLabel}
            summary={loaded.summary}
            averageSale={loaded.averageSale}
            reviewValue={loaded.reviewValue}
        />
    );
}
