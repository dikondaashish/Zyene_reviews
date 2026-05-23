import type { CompetitorRangeKey } from "@/lib/competitors/date-range";

export const COMPETITORS_LIST_RANGE_OPTIONS: Array<{ value: CompetitorRangeKey; label: string }> = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "12m", label: "12 Months" },
];
