"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerManagementStats } from "@/components/customers/customer-management-constants";
import type { SmartSegmentTab } from "@/components/customers/customer-segment-tabs";

type FigureProps = { label: string; value: string | number; hint: string; onClick?: () => void; emphasis?: boolean };

function Figure({ label, value, hint, onClick, emphasis }: FigureProps) {
    const body = (
        <>
            <span className="block text-xs font-medium text-muted-foreground">{label}</span>
            <span className={cn("mt-1 block text-2xl font-semibold tabular-nums tracking-tight", emphasis ? "text-warning-foreground" : "text-foreground")}>
                {value}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                {hint}
                {onClick ? <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden /> : null}
            </span>
        </>
    );
    const base = "group min-w-0 bg-card px-5 py-4 text-left";
    return onClick ? (
        <button type="button" onClick={onClick} className={cn(base, "transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none")}>
            {body}
        </button>
    ) : (
        <div className={base}>{body}</div>
    );
}

/** Four plain numbers; the one that implies work opens the list of people behind it. */
export function CustomerManagementStatsGrid({ stats, onSelectSegment }: {
    stats: CustomerManagementStats | null;
    onSelectSegment: (tab: SmartSegmentTab) => void;
}) {
    const waiting = stats?.neverReviewedCount ?? 0;
    return (
        <section aria-label="Customer summary" className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 lg:grid-cols-4">
            <Figure label="Customers" value={stats?.totalCustomers ?? "-"} hint="Test contacts are not counted" />
            <Figure
                label="Response rate"
                value={stats != null ? `${stats.reviewConversionPercent}%` : "-"}
                hint="Of people asked, how many acted"
            />
            <Figure
                label="Asked, no response yet"
                value={stats?.neverReviewedCount ?? "-"}
                hint={waiting > 0 ? "See who to remind" : "Nobody is waiting"}
                emphasis={waiting > 0}
                onClick={waiting > 0 ? () => onSelectSegment("never_reviewed") : undefined}
            />
            <Figure
                label="Requests per customer"
                value={stats != null ? stats.avgRequestsSent : "-"}
                hint="Average, including reminders"
            />
        </section>
    );
}
