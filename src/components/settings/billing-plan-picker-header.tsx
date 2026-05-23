"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type BillingDict = Dictionary["billing"];

export function BillingPlanPickerHeader(props: {
    billing: BillingDict;
    interval: "month" | "year";
    setInterval: (v: "month" | "year") => void;
    hasPricedPlanOrEnterprise: boolean;
    yearlySavings: number;
}) {
    const { billing: b, interval, setInterval, hasPricedPlanOrEnterprise, yearlySavings } = props;

    return (
        <>
            <div className="mb-2">
                <h2 className="text-xl font-semibold">
                    {hasPricedPlanOrEnterprise ? b.change_plan_title : b.choose_plan_title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{b.plan_section_subtitle}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end mb-6">
                <div
                    className="inline-flex w-full sm:w-auto items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80"
                    role="tablist"
                    aria-label="Billing interval"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={interval === "month"}
                        onClick={() => setInterval("month")}
                        className={cn(
                            "flex-1 sm:flex-none rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                            interval === "month"
                                ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={interval === "year"}
                        onClick={() => setInterval("year")}
                        className={cn(
                            "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                            interval === "year"
                                ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
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
        </>
    );
}
