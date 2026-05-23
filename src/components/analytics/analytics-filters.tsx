"use client";

import type { RangeKey } from "@/lib/query/date-range-keys";
import { AnalyticsFiltersRangeButtons } from "./analytics-filters-range-buttons";
import { useAnalyticsFilters } from "./use-analytics-filters";

export function AnalyticsFilters({
    businessId,
    range: controlledRange,
    platform: controlledPlatform,
    onRangeChange,
}: {
    businessId: string;
    /** When set with `onRangeChange`, range UI is fully client-controlled (no router navigation). */
    range?: RangeKey;
    platform?: string;
    onRangeChange?: (r: RangeKey) => void;
}) {
    const f = useAnalyticsFilters({
        businessId,
        range: controlledRange,
        platform: controlledPlatform,
        onRangeChange,
    });

    return (
        <AnalyticsFiltersRangeButtons
            ranges={f.ranges}
            displayRange={f.displayRange}
            onSelect={f.setRange}
        />
    );
}
