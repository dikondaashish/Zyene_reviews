"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function UpgradeModalIntervalToggle({
    interval,
    yearlySavings,
    onIntervalChange,
}: {
    interval: "month" | "year";
    yearlySavings: number;
    onIntervalChange: (interval: "month" | "year") => void;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center mb-6">
            <div
                className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80"
                role="tablist"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={interval === "month"}
                    onClick={() => onIntervalChange("month")}
                    className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        interval === "month"
                            ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
                    )}
                >
                    Monthly
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={interval === "year"}
                    onClick={() => onIntervalChange("year")}
                    className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        interval === "year"
                            ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
                    )}
                >
                    Yearly
                    <Badge
                        variant="secondary"
                        className="text-xs bg-chart-2/15 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30"
                    >
                        Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                    </Badge>
                </button>
            </div>
        </div>
    );
}
