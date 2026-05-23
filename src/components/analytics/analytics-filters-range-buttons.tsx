import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { RangeKey } from "@/lib/query/date-range-keys";

export function AnalyticsFiltersRangeButtons({
    ranges,
    displayRange,
    onSelect,
}: {
    ranges: Array<{ label: string; value: RangeKey }>;
    displayRange: RangeKey;
    onSelect: (range: RangeKey) => void;
}) {
    return (
        <div className="flex items-center p-1 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/50">
            {ranges.map((range) => {
                const isActive = displayRange === range.value;
                return (
                    <button
                        key={range.value}
                        type="button"
                        onClick={() => onSelect(range.value)}
                        className={cn(
                            "relative px-4 py-1.5 text-xs font-bold transition-all rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-range"
                                className="absolute inset-0 bg-primary rounded-[6px]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{range.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
