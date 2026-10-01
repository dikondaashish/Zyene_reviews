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
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                    {icon}
                    {label}
                </span>
                <span className="font-medium tabular-nums">
                    {stat.used.toLocaleString()}
                    {isUnlimited ? " used · Unlimited" : ` / ${stat.max.toLocaleString()}`}
                </span>
            </div>
            {!isUnlimited && (
                <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-valuetext={`${stat.used} of ${stat.max} used`} className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full",
                            isNearLimit ? "bg-warning" : "bg-primary/70"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
            {isUnlimited && (
                <div className="h-1.5 rounded-full bg-muted" />
            )}
        </div>
    );
}
