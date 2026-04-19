"use client";

import { motion } from "framer-motion";
import { Eye, MapPin, MousePointer2, Phone } from "lucide-react";

interface EngagementFunnelCardProps {
    profileViews: number;
    websiteClicks: number;
    callClicks: number;
    directionRequests: number;
}

type Step = {
    label: string;
    value: number;
    icon: typeof Eye;
    iconClass: string;
    barClass: string;
};

export function EngagementFunnelCard({
    profileViews,
    websiteClicks,
    callClicks,
    directionRequests,
}: EngagementFunnelCardProps) {
    const funnelSteps: Step[] = [
        {
            label: "Profile views",
            value: profileViews,
            icon: Eye,
            iconClass: "bg-chart-5/15 text-chart-5 dark:text-chart-5",
            barClass: "bg-chart-5 dark:bg-chart-5",
        },
        {
            label: "Website clicks",
            value: websiteClicks,
            icon: MousePointer2,
            iconClass: "bg-sync-action/15 text-sync-action dark:text-sync-action",
            barClass: "bg-sync-action/100 dark:bg-sync-action/100",
        },
        {
            label: "Direction requests",
            value: directionRequests,
            icon: MapPin,
            iconClass: "bg-chart-4/120/15 text-chart-4 dark:text-chart-4",
            barClass: "bg-chart-4/120 dark:bg-chart-4/120",
        },
        {
            label: "Call clicks",
            value: callClicks,
            icon: Phone,
            iconClass: "bg-chart-2/15 text-chart-2 dark:text-chart-2",
            barClass: "bg-chart-2/100 dark:bg-chart-2/100",
        },
    ];

    const maxVal = Math.max(...funnelSteps.map((s) => s.value), 1);

    return (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <p className="mb-4 text-xs font-medium text-muted-foreground">
                Totals for the selected period. Bars show each metric relative to the strongest one in this group (not Google’s UI percentages).
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {funnelSteps.map((step, idx) => {
                    const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
                    return (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="flex min-h-[140px] min-w-0 flex-col rounded-xl border border-border/40 bg-background/60 p-4 transition-colors hover:border-border hover:bg-background/80"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${step.iconClass}`}
                                    aria-hidden
                                >
                                    <step.icon className="size-5" strokeWidth={2} />
                                </div>
                                <span className="text-right text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                                    {step.value.toLocaleString()}
                                </span>
                            </div>

                            <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">{step.label}</h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">{pct}%</span>
                                <span className="mx-1.5 text-border">·</span>
                                <span>of peak in this set</span>
                            </p>

                            <div className="mt-3 h-2 w-full shrink-0 overflow-hidden rounded-full bg-muted/80">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.85, delay: 0.2 + idx * 0.06, ease: "easeOut" }}
                                    className={`h-full rounded-full ${step.barClass}`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
