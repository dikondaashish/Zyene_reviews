"use client";

import { Users, Percent, MessageCircleOff, BarChart3 } from "lucide-react";
import type { CustomerManagementStats } from "@/components/customers/customer-management-constants";

export function CustomerManagementStatsGrid({ stats }: { stats: CustomerManagementStats | null }) {
    return (
        <div className="mb-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Total Customers
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">{stats?.totalCustomers ?? "—"}</h3>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                    <Percent className="h-4 w-4 text-chart-2" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Review conversion
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">
                        {stats != null ? `${stats.reviewConversionPercent}%` : "—"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">Of those who got a request</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                    <MessageCircleOff className="h-4 w-4 text-chart-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Never reviewed
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">{stats?.neverReviewedCount ?? "—"}</h3>
                    <p className="text-[10px] text-muted-foreground">Got a request, no review yet</p>
                </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-4/15">
                    <BarChart3 className="h-4 w-4 text-chart-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Avg requests sent
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">
                        {stats != null ? stats.avgRequestsSent : "—"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">Per customer (all contacts)</p>
                </div>
            </div>
        </div>
    );
}
