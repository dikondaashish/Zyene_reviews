"use client";

import { useEffect, useState } from "react";
import type { RangeKey } from "@/lib/query/date-range-keys";
import { useCompetitorsFullRangeQuery } from "@/hooks/use-range-queries";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import { competitorsListIsSyncing } from "./competitors-list-is-syncing";
import { useCompetitorsListHandlers } from "./use-competitors-list-handlers";
import { useCompetitorsListMemos } from "./use-competitors-list-memos";
import { useCompetitorsListRange } from "./use-competitors-list-range";
import type {
    Competitor,
    CompetitorInsight,
    CompetitorSnapshot,
    CompetitorsListProps,
} from "./competitors-types";

export function useCompetitorsList({
    businessId,
    initialCompetitors,
    range,
    snapshotRows,
    eventRows,
    insightRows,
    ownBusinessInRange,
    benchmarkRange,
    ownSearchKeywords,
    keywordDiscoverySplit,
    placesMetaByCompetitorId,
    ownBusinessChart,
}: CompetitorsListProps) {
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [syncWatchLoading, setSyncWatchLoading] = useState(false);
    const [briefGenLoading, setBriefGenLoading] = useState(false);

    const { optimisticRange, setRange, rangeLabel, rangeOptions } = useCompetitorsListRange(
        businessId,
        range
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setCompetitors(initialCompetitors);
    }, [initialCompetitors]);

    const { data: fullRangeData } = useCompetitorsFullRangeQuery(businessId, optimisticRange as RangeKey);
    const activeSnapshotRows =
        (fullRangeData?.snapshotRows as CompetitorSnapshot[] | undefined) ?? snapshotRows;
    const activeEventRows =
        (fullRangeData?.eventRows as typeof eventRows | undefined) ?? eventRows;
    const activeInsightRows =
        (fullRangeData?.insightRows as CompetitorInsight[] | undefined) ?? insightRows;
    const activeOwnBusinessInRange = fullRangeData?.ownBusinessInRange ?? ownBusinessInRange;
    const activeBenchmarkRange =
        (fullRangeData?.benchmarkRange as typeof benchmarkRange | undefined) ?? benchmarkRange;
    const activeOwnSearchKeywords = fullRangeData?.ownSearchKeywords ?? ownSearchKeywords;
    const activeKeywordDiscoverySplit =
        fullRangeData?.keywordDiscoverySplit ?? keywordDiscoverySplit;
    const activePlacesMetaByCompetitorId =
        (fullRangeData?.placesMetaByCompetitorId as Record<string, CompetitorPlacesRowMeta> | undefined) ??
        placesMetaByCompetitorId;

    useEffect(() => {
        const incoming = fullRangeData?.initialCompetitors as Competitor[] | undefined;
        if (incoming) setCompetitors(incoming);
    }, [fullRangeData]);

    const {
        handleGenerateMarketBrief,
        handleSyncCompetitorWatch,
        handleDelete,
        handleAddCompetitor,
    } = useCompetitorsListHandlers({
        businessId,
        competitors,
        setCompetitors,
        setIsDeleting,
        setDeleteConfirm,
        setSyncWatchLoading,
        setBriefGenLoading,
    });

    const {
        chartData,
        movementCards,
        latestSnapshotByCompetitor,
        latestInsightByCompetitor,
        alertEvents,
    } = useCompetitorsListMemos({
        competitors,
        mounted,
        ownBusinessChart,
        activeSnapshotRows,
        activeInsightRows,
        activeEventRows,
    });

    const isSyncing = (competitor: Competitor) => competitorsListIsSyncing(competitor, mounted);

    return {
        competitors,
        isDeleting,
        deleteConfirm,
        setDeleteConfirm,
        syncWatchLoading,
        briefGenLoading,
        optimisticRange,
        setRange,
        rangeLabel,
        rangeOptions,
        activeOwnSearchKeywords,
        activeKeywordDiscoverySplit,
        activeBenchmarkRange,
        activeOwnBusinessInRange,
        activePlacesMetaByCompetitorId,
        latestSnapshotByCompetitor,
        latestInsightByCompetitor,
        movementCards,
        activeEventRows,
        alertEvents,
        chartData,
        isSyncing,
        handleGenerateMarketBrief,
        handleSyncCompetitorWatch,
        handleDelete,
        handleAddCompetitor,
    };
}
