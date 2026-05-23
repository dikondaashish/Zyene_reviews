"use client";

import type { CompetitorsTableSectionProps } from "./competitors-types";
import { CompetitorsTableBenchmarkCard } from "./competitors-table-benchmark-card";
import { CompetitorsTrackedSection } from "./competitors-tracked-section";
import { CompetitorsTableMovementSection } from "./competitors-table-movement-section";
import { CompetitorsTableInsightsSection } from "./competitors-table-insights-section";
import { CompetitorsTableEventsSection } from "./competitors-table-events-section";

export function CompetitorsTableSection({
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
}: CompetitorsTableSectionProps) {
    return (
        <>
            <CompetitorsTableBenchmarkCard
                activeBenchmarkRange={activeBenchmarkRange}
                activeOwnBusinessInRange={activeOwnBusinessInRange}
                competitorsCount={competitors.length}
            />
            <CompetitorsTrackedSection
                competitors={competitors}
                activePlacesMetaByCompetitorId={activePlacesMetaByCompetitorId}
                latestSnapshotByCompetitor={latestSnapshotByCompetitor}
                isSyncing={isSyncing}
                isDeleting={isDeleting}
                onDeleteRequest={onDeleteRequest}
            />
            <CompetitorsTableMovementSection
                movementCards={movementCards}
                rangeLabel={rangeLabel}
            />
            <CompetitorsTableInsightsSection
                competitors={competitors}
                latestInsightByCompetitor={latestInsightByCompetitor}
            />
            <CompetitorsTableEventsSection
                competitors={competitors}
                activeEventRows={activeEventRows}
                rangeLabel={rangeLabel}
            />
        </>
    );
}
