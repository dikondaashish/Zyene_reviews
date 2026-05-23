"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Step4SubscriptionIntervalToggleProps {
    interval: "month" | "year";
    onIntervalChange: (v: "month" | "year") => void;
    yearlySavings: number;
}

export function Step4SubscriptionIntervalToggle({
    interval,
    onIntervalChange,
    yearlySavings,
}: Step4SubscriptionIntervalToggleProps) {
    return (
        <div
            className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80 self-start sm:self-auto"
            role="tablist"
            aria-label="Billing interval"
        >
            <button
                type="button"
                role="tab"
                aria-selected={interval === "month"}
                onClick={() => onIntervalChange("month")}
                className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
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
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
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
    );
}
