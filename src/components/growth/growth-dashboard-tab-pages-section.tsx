"use client";

import { cn } from "@/lib/utils";
import type { GrowthPageEntry } from "@/lib/growth/page-inventory";
import { GrowthDashboardPageRow } from "./growth-dashboard-page-row";

interface GrowthDashboardTabPagesSectionProps {
    pageSummary: { total: number; inSitemap: number; live: number };
    pageFilter: "all" | "live" | "sitemap";
    onPageFilter: (f: "all" | "live" | "sitemap") => void;
    filteredPages: GrowthPageEntry[];
}

export function GrowthDashboardTabPagesSection({
    pageSummary,
    pageFilter,
    onPageFilter,
    filteredPages,
}: GrowthDashboardTabPagesSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                    {pageSummary.total} routes · {pageSummary.inSitemap} in sitemap
                </span>
                {(["all", "live", "sitemap"] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => onPageFilter(f)}
                        className={cn(
                            "px-3 py-1 rounded-full border text-xs",
                            pageFilter === f ? "border-primary bg-primary/10" : "border-border",
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/80 shadow-sm max-h-[70vh]">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                        <tr className="text-xs uppercase text-muted-foreground">
                            <th className="py-2 px-3">Path</th>
                            <th className="py-2 px-2">Phase</th>
                            <th className="py-2 px-2">Priority</th>
                            <th className="py-2 px-2">Type</th>
                            <th className="py-2 px-2">Status</th>
                            <th className="py-2 px-2">Sitemap</th>
                            <th className="py-2 px-3">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPages.map((p) => (
                            <GrowthDashboardPageRow key={p.path} page={p} />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
