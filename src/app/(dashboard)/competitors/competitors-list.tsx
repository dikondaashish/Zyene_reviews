"use client";

import { CompetitorsListAlertsCard } from "./competitors-list-alerts-card";
import { CompetitorsListDeleteDialog } from "./competitors-list-delete-dialog";
import { CompetitorsListEmptyState } from "./competitors-list-empty-state";
import { CompetitorsListKeywordsCard } from "./competitors-list-keywords-card";
import { CompetitorsListMainContent } from "./competitors-list-main-content";
import { CompetitorsListMarketBriefCard } from "./competitors-list-market-brief-card";
import { CompetitorsListSyncHealthCard } from "./competitors-list-sync-health-card";
import { CompetitorsListToolbar } from "./competitors-list-toolbar";
import type { CompetitorsListProps } from "./competitors-types";
import { useCompetitorsList } from "./use-competitors-list";

export type {
    CompetitorMarketBriefLatest,
    CompetitorWatchBenchmarkRange,
} from "./competitors-types";

export function CompetitorsList(props: CompetitorsListProps) {
    const {
        businessId,
        latestRun,
        latestSuccessRun,
        latestFailedRun,
        marketBriefLatest,
    } = props;

    const list = useCompetitorsList(props);

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden sm:space-y-8">
            <CompetitorsListToolbar
                rangeOptions={list.rangeOptions}
                optimisticRange={list.optimisticRange}
                setRange={list.setRange}
                competitors={list.competitors}
                syncWatchLoading={list.syncWatchLoading}
                onSyncCompetitorWatch={list.handleSyncCompetitorWatch}
                businessId={businessId}
                onAddCompetitor={list.handleAddCompetitor}
            />

            <CompetitorsListKeywordsCard
                activeOwnSearchKeywords={list.activeOwnSearchKeywords}
                activeKeywordDiscoverySplit={list.activeKeywordDiscoverySplit}
            />

            <CompetitorsListMarketBriefCard
                competitors={list.competitors}
                marketBriefLatest={marketBriefLatest}
                briefGenLoading={list.briefGenLoading}
                onGenerateMarketBrief={list.handleGenerateMarketBrief}
            />

            <CompetitorsListSyncHealthCard
                latestRun={latestRun}
                latestSuccessRun={latestSuccessRun}
                latestFailedRun={latestFailedRun}
            />

            <CompetitorsListAlertsCard
                alertEvents={list.alertEvents}
                rangeLabel={list.rangeLabel}
            />

            {list.competitors.length === 0 ? (
                <CompetitorsListEmptyState
                    businessId={businessId}
                    onAddCompetitor={list.handleAddCompetitor}
                />
            ) : (
                <CompetitorsListMainContent
                    competitors={list.competitors}
                    activeBenchmarkRange={list.activeBenchmarkRange}
                    activeOwnBusinessInRange={list.activeOwnBusinessInRange}
                    activePlacesMetaByCompetitorId={list.activePlacesMetaByCompetitorId}
                    latestSnapshotByCompetitor={list.latestSnapshotByCompetitor}
                    latestInsightByCompetitor={list.latestInsightByCompetitor}
                    movementCards={list.movementCards}
                    activeEventRows={list.activeEventRows}
                    rangeLabel={list.rangeLabel}
                    isSyncing={list.isSyncing}
                    isDeleting={list.isDeleting}
                    onDeleteRequest={list.setDeleteConfirm}
                    chartData={list.chartData}
                />
            )}

            <CompetitorsListDeleteDialog
                competitors={list.competitors}
                deleteConfirm={list.deleteConfirm}
                setDeleteConfirm={list.setDeleteConfirm}
                isDeleting={list.isDeleting}
                onDelete={list.handleDelete}
            />
        </div>
    );
}
