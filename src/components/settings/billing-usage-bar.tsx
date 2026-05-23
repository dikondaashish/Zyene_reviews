"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UsageStat } from "@/components/settings/billing-client-types";

export function UsageBar({ label, stat, icon }: { label: string; stat: UsageStat; icon?: ReactNode }) {
    const isUnlimited = stat.max === -1;
    const percentage = isUnlimited ? 0 : stat.max > 0 ? Math.min((stat.used / stat.max) * 100, 100) : 0;
    const isNearLimit = !isUnlimited && percentage >= 80;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                    {icon}
                    {label}
                </span>
                <span className="font-medium tabular-nums">
                    {stat.used.toLocaleString()}
                    {isUnlimited ? " used" : ` / ${stat.max.toLocaleString()}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all",
                            isNearLimit ? "bg-primary" : "bg-primary/70"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
            {isUnlimited && (
                <div className="h-2 rounded-full bg-gradient-to-r from-chart-2/20 to-chart-2/5" />
            )}
        </div>
    );
}
