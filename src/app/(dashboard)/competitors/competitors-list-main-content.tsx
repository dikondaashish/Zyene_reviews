"use client";

import { CompetitorsChartsSection } from "./competitors-charts-section";
import { CompetitorsTableSection } from "./competitors-table-section";
import type {
    Competitor,
    CompetitorChartDataEntry,
    CompetitorEvent,
    CompetitorInsight,
    CompetitorSnapshot,
    CompetitorWatchBenchmarkRange,
} from "./competitors-types";
import type { CompetitorMovementRow } from "@/lib/competitors/snapshot-movement";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";

type CompetitorsListMainContentProps = {
    competitors: Competitor[];
    activeBenchmarkRange: CompetitorWatchBenchmarkRange;
    activeOwnBusinessInRange: { avgRating: number | null; reviewCount: number };
    activePlacesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta>;
    latestSnapshotByCompetitor: Map<string, CompetitorSnapshot>;
    latestInsightByCompetitor: Map<string, CompetitorInsight>;
    movementCards: CompetitorMovementRow[];
    activeEventRows: CompetitorEvent[];
    rangeLabel: string;
    isSyncing: (competitor: Competitor) => boolean;
    isDeleting: string | null;
    onDeleteRequest: (id: string) => void;
    chartData: CompetitorChartDataEntry[];
};

export function CompetitorsListMainContent({
    competitors,
    activeBenchmarkRange,
    activeOwnBusinessInRange,
    activePlacesMetaByCompetitorId,
    latestSnapshotByCompetitor,
    latestInsightByCompetitor,
    movementCards,
    activeEventRows,
    rangeLabel,
    isSyncing,
    isDeleting,
    onDeleteRequest,
    chartData,
}: CompetitorsListMainContentProps) {
    return (
                <div className="grid gap-6 md:grid-cols-2">
                    <CompetitorsTableSection
                        competitors={competitors}
                        activeBenchmarkRange={activeBenchmarkRange}
                        activeOwnBusinessInRange={activeOwnBusinessInRange}
                        activePlacesMetaByCompetitorId={activePlacesMetaByCompetitorId}
                        latestSnapshotByCompetitor={latestSnapshotByCompetitor}
                        latestInsightByCompetitor={latestInsightByCompetitor}
                        movementCards={movementCards}
                        activeEventRows={activeEventRows}
                        rangeLabel={rangeLabel}
                        isSyncing={isSyncing}
                        isDeleting={isDeleting}
                        onDeleteRequest={onDeleteRequest}
                    />
                    {chartData.length > 0 && (
                        <CompetitorsChartsSection chartData={chartData} />
                    )}
                </div>
    );
}
