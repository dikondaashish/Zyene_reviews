import { createClient } from "@/lib/db/supabase/server";
import { ValueSummaryCard } from "@/components/dashboard/value-summary-card";
import { currentMonthPeriod, loadValueSummary } from "@/services/dashboard/load-value-summary";
import type { DashboardViewProps } from "./types";

/** Streams in after the rest of the dashboard; shows nothing if the numbers fail to load. */
export async function DashboardViewValueSummary({
    businessId,
    organization,
}: {
    businessId: string;
    organization: DashboardViewProps["organization"];
}) {
    const supabase = await createClient();
    const period = currentMonthPeriod();
    const summary = await loadValueSummary(supabase, businessId, organization, period);
    if (!summary) return null;
    const monthLabel = period.start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    return <ValueSummaryCard summary={summary} monthLabel={monthLabel} />;
}
