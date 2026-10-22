"use client";

import { useMemo } from "react";
import { buildScoreboard } from "@/lib/competitors/scoreboard";
import { buildChangeFeed } from "@/lib/competitors/change-feed";
import { CompetitorsChangesCard } from "./competitors-changes-card";
import { CompetitorsListDeleteDialog } from "./competitors-list-delete-dialog";
import { CompetitorsListEmptyState } from "./competitors-list-empty-state";
import { CompetitorsListKeywordsCard } from "./competitors-list-keywords-card";
import { CompetitorsListMarketBriefCard } from "./competitors-list-market-brief-card";
import { CompetitorsListToolbar } from "./competitors-list-toolbar";
import { CompetitorsScoreboard } from "./competitors-scoreboard";
import { CompetitorsSyncStatus } from "./competitors-sync-status";
import { CompetitorsTableInsightsSection } from "./competitors-table-insights-section";
import { CompetitorsTrackedSection } from "./competitors-tracked-section";
import type { CompetitorsListProps } from "./competitors-types";
import { useCompetitorsList } from "./use-competitors-list";

export type {
    CompetitorMarketBriefLatest,
    CompetitorWatchBenchmarkRange,
} from "./competitors-types";

/** Reads top to bottom as: where do I stand, who am I watching, what changed, what could I do. */
export function CompetitorsList(props: CompetitorsListProps) {
    const { businessId, latestRun, latestSuccessRun, marketBriefLatest, ownBusinessChart } = props;
    const list = useCompetitorsList(props);

    const scoreboard = useMemo(() => {
        const gained = new Map(list.movementCards.map((m) => [m.competitorId, m.hasBaseline ? m.reviewsDelta : null]));
        return buildScoreboard({
            own: {
                name: (ownBusinessChart.name || "Your business").trim(),
                rating: ownBusinessChart.averageRating != null ? Number(ownBusinessChart.averageRating) : null,
                totalReviews: ownBusinessChart.totalReviews != null ? Number(ownBusinessChart.totalReviews) : null,
                newReviews: list.activeOwnBusinessInRange.reviewCount,
            },
            competitors: list.competitors.map((c) => ({
                id: c.id,
                name: c.name,
                rating: c.average_rating != null && Number(c.average_rating) > 0 ? Number(c.average_rating) : null,
                totalReviews: c.total_reviews ?? null,
                newReviews: gained.get(c.id) ?? null,
            })),
        }, list.rangeLabel);
    }, [list.movementCards, list.competitors, list.activeOwnBusinessInRange.reviewCount, list.rangeLabel, ownBusinessChart]);

    const changes = useMemo(
        () => buildChangeFeed(list.activeEventRows, new Map(list.competitors.map((c) => [c.id, c.name]))),
        [list.activeEventRows, list.competitors],
    );

    const hasCompetitors = list.competitors.length > 0;

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden">
            <div className="space-y-3">
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
                {hasCompetitors ? <CompetitorsSyncStatus latestRun={latestRun} latestSuccessRun={latestSuccessRun} /> : null}
            </div>

            {!hasCompetitors ? (
                <CompetitorsListEmptyState businessId={businessId} onAddCompetitor={list.handleAddCompetitor} />
            ) : (
                <>
                    <CompetitorsScoreboard scoreboard={scoreboard} rangeLabel={list.rangeLabel} />
                    <CompetitorsTrackedSection
                        competitors={list.competitors}
                        activePlacesMetaByCompetitorId={list.activePlacesMetaByCompetitorId}
                        latestSnapshotByCompetitor={list.latestSnapshotByCompetitor}
                        isSyncing={list.isSyncing}
                        isDeleting={list.isDeleting}
                        onDeleteRequest={list.setDeleteConfirm}
                    />
                    <CompetitorsChangesCard items={changes} rangeLabel={list.rangeLabel} />
                    <CompetitorsTableInsightsSection
                        competitors={list.competitors}
                        latestInsightByCompetitor={list.latestInsightByCompetitor}
                    />
                    <CompetitorsListMarketBriefCard
                        competitors={list.competitors}
                        marketBriefLatest={marketBriefLatest}
                        briefGenLoading={list.briefGenLoading}
                        onGenerateMarketBrief={list.handleGenerateMarketBrief}
                    />
                </>
            )}

            <CompetitorsListKeywordsCard
                activeOwnSearchKeywords={list.activeOwnSearchKeywords}
                activeKeywordDiscoverySplit={list.activeKeywordDiscoverySplit}
            />

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
