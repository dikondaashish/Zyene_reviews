"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";

import { pct } from "@/components/analytics/zyene-platform-analytics-math";

export type ZyeneFunnelStep = {
    label: string;
    count: number;
    icon: LucideIcon;
    color: string;
};

export function ZyenePlatformReviewRequestFunnelCard({
    dateRange,
    funnelSteps,
    totalSent,
}: {
    dateRange: string;
    funnelSteps: ZyeneFunnelStep[];
    totalSent: number;
}) {
    return (
        <Card className="bg-card/60 border-border/50 backdrop-blur-md overflow-hidden">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Review Request Funnel
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs text-muted-foreground font-medium">
                            Track every step from send to Google review — {dateRange}
                        </p>
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20"
                        >
                            Email + SMS only
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {funnelSteps.map((step, idx) => {
                        const previousCount = idx > 0 ? funnelSteps[idx - 1].count : 0;
                        const dropOff =
                            idx > 0 ? (previousCount > 0 ? pct(step.count, previousCount) : 0) : 100;
                        return (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                            >
                                <div className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all group">
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                                        style={{
                                            backgroundColor: `color-mix(in oklab, ${step.color} 18%, transparent)`,
                                        }}
                                    >
                                        <step.icon className="h-5 w-5" style={{ color: step.color }} />
                                    </div>
                                    <span className="text-2xl font-black tracking-tight">
                                        {step.count.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {step.label}
                                    </span>
                                    {idx > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[9px] font-bold px-1.5 py-0",
                                                dropOff >= 50
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : dropOff >= 20
                                                      ? "bg-chart-4/120/10 text-chart-4"
                                                      : "bg-sync-action/100/10 text-sync-action"
                                            )}
                                        >
                                            {dropOff}%
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-6 h-3 w-full bg-border rounded-full overflow-hidden flex">
                    {funnelSteps.map((step, idx) => {
                        const widthPct = totalSent > 0 ? (step.count / totalSent) * 100 : 0;
                        return (
                            <motion.div
                                key={step.label}
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPct}%` }}
                                transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                                className="h-full first:rounded-l-full last:rounded-r-full"
                                style={{
                                    backgroundColor: step.color,
                                    opacity: 1 - idx * 0.12,
                                }}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
