"use client";

import { useMemo } from "react";
import { computeCompetitorMovementRows } from "@/lib/competitors/snapshot-movement";
import type {
    Competitor,
    CompetitorInsight,
    CompetitorSnapshot,
} from "./competitors-types";

type UseCompetitorsListMemosArgs = {
    competitors: Competitor[];
    activeSnapshotRows: CompetitorSnapshot[];
    activeInsightRows: CompetitorInsight[];
};

export function useCompetitorsListMemos({
    competitors,
    activeSnapshotRows,
    activeInsightRows,
}: UseCompetitorsListMemosArgs) {
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

    return {
        movementCards,
        latestSnapshotByCompetitor,
        latestInsightByCompetitor,
    };
}
