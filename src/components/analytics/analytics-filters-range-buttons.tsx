import { cn } from "@/lib/utils";
import type { RangeKey } from "@/lib/query/date-range-keys";

export function AnalyticsFiltersRangeButtons({ ranges, displayRange, onSelect }: {
    ranges: Array<{ label: string; value: RangeKey }>;
    displayRange: RangeKey; onSelect: (range: RangeKey) => void;
}) {
    return (
        <div role="group" aria-label="Analytics date range" className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
            {ranges.map(range => (
                <button key={range.value} type="button" aria-pressed={displayRange === range.value} onClick={() => onSelect(range.value)}
                    className={cn("min-h-11 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-9",
                        displayRange === range.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                    {range.label}
                </button>
            ))}
        </div>
    );
}
