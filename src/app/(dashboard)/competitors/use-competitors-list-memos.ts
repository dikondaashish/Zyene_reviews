"use client";

import { useMemo } from "react";
import { isCompetitorAlertEventType } from "@/lib/competitors/range-benchmark";
import { computeCompetitorMovementRows } from "@/lib/competitors/snapshot-movement";
import { competitorsListIsSyncing } from "./competitors-list-is-syncing";
import type {
    Competitor,
    CompetitorChartDataEntry,
    CompetitorEvent,
    CompetitorInsight,
    CompetitorSnapshot,
    CompetitorsListProps,
} from "./competitors-types";

function truncateLabel(s: string, max = 16) {
    const t = s.trim();
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

type UseCompetitorsListMemosArgs = {
    competitors: Competitor[];
    mounted: boolean;
    ownBusinessChart: CompetitorsListProps["ownBusinessChart"];
    activeSnapshotRows: CompetitorSnapshot[];
    activeInsightRows: CompetitorInsight[];
    activeEventRows: CompetitorEvent[];
};

export function useCompetitorsListMemos({
    competitors,
    mounted,
    ownBusinessChart,
    activeSnapshotRows,
    activeInsightRows,
    activeEventRows,
}: UseCompetitorsListMemosArgs) {
    const chartData = useMemo((): CompetitorChartDataEntry[] => {
        const ownName = (ownBusinessChart.name || "Your business").trim();
        const ownRow = {
            name: truncateLabel(ownName, 18),
            fullName: ownName,
            rating: ownBusinessChart.averageRating != null ? Number(ownBusinessChart.averageRating) : 0,
            reviews: ownBusinessChart.totalReviews != null ? Number(ownBusinessChart.totalReviews) : 0,
            isOwn: true,
        };
        const compRows = competitors.reduce<
            Array<{
                name: string;
                fullName: string;
                rating: number;
                reviews: number;
                isOwn: false;
            }>
        >((acc, c) => {
            if (competitorsListIsSyncing(c, mounted)) return acc;
            acc.push({
                name: truncateLabel(c.name, 18),
                fullName: c.name,
                rating: Number(c.average_rating) || 0,
                reviews: c.total_reviews || 0,
                isOwn: false,
            });
            return acc;
        }, []);
        return [ownRow, ...compRows];
    }, [competitors, ownBusinessChart, mounted]);

    const movementCards = useMemo(
        () =>
            computeCompetitorMovementRows(
                competitors.map((c) => ({ id: c.id, name: c.name })),
                activeSnapshotRows
            ),
        [competitors, activeSnapshotRows]
    );

    const latestSnapshotByCompetitor = useMemo(() => {
        const map = new Map<string, CompetitorSnapshot>();
        for (const row of activeSnapshotRows) {
            const existing = map.get(row.competitor_id);
            if (!existing) {
                map.set(row.competitor_id, row);
                continue;
            }
            if (new Date(row.captured_at).getTime() > new Date(existing.captured_at).getTime()) {
                map.set(row.competitor_id, row);
            }
        }
        return map;
    }, [activeSnapshotRows]);

    const latestInsightByCompetitor = useMemo(() => {
        const byCompetitor = new Map<string, CompetitorInsight>();
        for (const row of activeInsightRows) {
            const current = byCompetitor.get(row.competitor_id);
            if (!current) {
                byCompetitor.set(row.competitor_id, row);
                continue;
            }
            if (new Date(row.created_at).getTime() > new Date(current.created_at).getTime()) {
                byCompetitor.set(row.competitor_id, row);
            }
        }
        return byCompetitor;
    }, [activeInsightRows]);

    const alertEvents = useMemo(
        () => activeEventRows.filter((e) => isCompetitorAlertEventType(e.event_type)),
        [activeEventRows]
    );

    return {
        chartData,
        movementCards,
        latestSnapshotByCompetitor,
        latestInsightByCompetitor,
        alertEvents,
    };
}
