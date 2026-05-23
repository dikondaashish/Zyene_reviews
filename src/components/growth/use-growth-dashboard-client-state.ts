"use client";

import { useMemo, useState } from "react";
import type { GrowthKpiSnapshot } from "@/lib/growth/kpi-metrics";
import { buildGrowthPageInventory, summarizePageInventory } from "@/lib/growth/page-inventory";
import { GROWTH_IMPLEMENTATION_MATRIX, summarizeImplementationMatrix } from "@/lib/growth/implementation-matrix";
import type { GrowthDashboardTabId } from "./growth-dashboard-client-types";

export function useGrowthDashboardClientState(snapshot: GrowthKpiSnapshot) {
    const [tab, setTab] = useState<GrowthDashboardTabId>("kpis");
    const [pageFilter, setPageFilter] = useState<"all" | "live" | "sitemap">("all");

    const metricById = useMemo(
        () => Object.fromEntries(snapshot.metrics.map((m) => [m.id, m])),
        [snapshot.metrics],
    );

    const pages = useMemo(() => buildGrowthPageInventory(), []);
    const pageSummary = useMemo(() => summarizePageInventory(pages), [pages]);
    const matrixSummary = useMemo(() => summarizeImplementationMatrix(GROWTH_IMPLEMENTATION_MATRIX), []);

    const filteredPages = useMemo(() => {
        if (pageFilter === "live") return pages.filter((p) => p.status === "live");
        if (pageFilter === "sitemap") return pages.filter((p) => p.inSitemap);
        return pages;
    }, [pages, pageFilter]);

    return {
        tab,
        setTab,
        pageFilter,
        setPageFilter,
        metricById,
        pages,
        pageSummary,
        matrixSummary,
        filteredPages,
        snapshot,
    };
}
