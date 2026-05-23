"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Star,
    Loader2,
    Download,
    RefreshCw,
    Hash,
    Sparkles,
    ExternalLink,
    BarChart,
    PieChart,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import { deleteCompetitor } from "@/app/actions/competitor";
import { toast } from "sonner";
import { TimeAgo } from "@/components/ui/time-ago";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { isCompetitorAlertEventType } from "@/lib/competitors/range-benchmark";
import type { CompetitorRangeKey } from "@/lib/competitors/date-range";
import { computeCompetitorMovementRows } from "@/lib/competitors/snapshot-movement";
import { syncCompetitorWatchNow } from "@/app/actions/competitor-watch-sync";
import { generateCompetitorMarketBriefNow } from "@/app/actions/competitor-market-brief";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import { dateRangeKeys, type RangeKey } from "@/lib/query/date-range-keys";
import { useCompetitorsFullRangeQuery } from "@/hooks/use-range-queries";
import { CompetitorsTableSection } from "./competitors-table-section";
import { CompetitorsChartsSection } from "./competitors-charts-section";
import type {
    Competitor,
    CompetitorInsight,
    CompetitorSnapshot,
    CompetitorsListProps,
} from "./competitors-types";

export type {
    CompetitorMarketBriefLatest,
    CompetitorWatchBenchmarkRange,
} from "./competitors-types";

async function prefetchCompetitorsRange(range: CompetitorRangeKey) {
    const response = await fetch(`/api/competitors/range-meta?range=${range}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch competitors range");
    }
    return response.json();
}

export function CompetitorsList({
    businessId,
    initialCompetitors,
    range,
    snapshotRows,
    eventRows,
    insightRows,
    latestRun,
    latestSuccessRun,
    latestFailedRun,
    ownBusinessInRange,
    benchmarkRange,
    ownSearchKeywords,
    keywordDiscoverySplit,
    placesMetaByCompetitorId,
    marketBriefLatest,
    ownBusinessChart,
}: CompetitorsListProps) {
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [syncWatchLoading, setSyncWatchLoading] = useState(false);
    const [briefGenLoading, setBriefGenLoading] = useState(false);
    const [optimisticRange, setOptimisticRange] = useState<CompetitorRangeKey>(range);
    const rangeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setCompetitors(initialCompetitors);
    }, [initialCompetitors]);

    useEffect(() => {
        setOptimisticRange(range);
    }, [range]);

    useEffect(() => {
        return () => {
            if (rangeDebounceRef.current) {
                clearTimeout(rangeDebounceRef.current);
            }
        };
    }, []);

    const rangeOptions: Array<{ value: CompetitorRangeKey; label: string }> = [
        { value: "7d", label: "7 Days" },
        { value: "30d", label: "30 Days" },
        { value: "90d", label: "90 Days" },
        { value: "12m", label: "12 Months" },
    ];

    const rangeLabel = rangeOptions.find((r) => r.value === optimisticRange)?.label || "30 Days";
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

    useEffect(() => {
        for (const option of rangeOptions) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("range", option.value);
            router.prefetch(`?${params.toString()}`);
            void queryClient.prefetchQuery({
                queryKey: dateRangeKeys.competitors(businessId, option.value as RangeKey),
                queryFn: () => prefetchCompetitorsRange(option.value),
                staleTime: 60_000,
            });
        }
    }, [router, searchParams, queryClient, businessId]);

    const setRange = (nextRange: CompetitorRangeKey) => {
        setOptimisticRange(nextRange);
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", nextRange);
        void queryClient.prefetchQuery({
            queryKey: dateRangeKeys.competitors(businessId, nextRange as RangeKey),
            queryFn: () => prefetchCompetitorsRange(nextRange),
            staleTime: 60_000,
        });
        if (rangeDebounceRef.current) clearTimeout(rangeDebounceRef.current);
        rangeDebounceRef.current = setTimeout(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        }, 120);
    };

    const isSyncing = (competitor: Competitor): boolean => {
        if (competitor.average_rating !== 0 && competitor.average_rating !== null) return false;
        if (competitor.total_reviews !== 0) return false;
        
        // During hydration, return a stable value (false) to match server
        if (!mounted) return false;

        // Consider it syncing if created less than 2 minutes ago
        const createdAt = new Date(competitor.created_at || "");
        const now = new Date();
        const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        return minutesAgo < 2;
    };

    const handleGenerateMarketBrief = async () => {
        setBriefGenLoading(true);
        try {
            const result = await generateCompetitorMarketBriefNow(businessId);
            if (result.success) {
                toast.success("Market positioning brief saved.");
                router.refresh();
            } else {
                toast.error(result.error || "Could not generate brief.");
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Could not generate brief.");
        } finally {
            setBriefGenLoading(false);
        }
    };

    const handleSyncCompetitorWatch = async () => {
        setSyncWatchLoading(true);
        try {
            const result = await syncCompetitorWatchNow(businessId);
            if (result.success) {
                toast.success(
                    `Synced ${result.scanned ?? 0} competitor(s)${
                        result.snapshots != null ? ` · ${result.snapshots} new snapshot(s)` : ""
                    }.`
                );
                router.refresh();
            } else {
                toast.error(result.error || "Sync failed.");
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Sync failed.");
        } finally {
            setSyncWatchLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deleteCompetitor(id, businessId);
            if (result.success) {
                setCompetitors(competitors.filter(c => c.id !== id));
                toast.success("Competitor removed successfully.");
            } else {
                toast.error(result.error || "Failed to remove competitor.");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to remove competitor.");
        } finally {
            setIsDeleting(null);
            setDeleteConfirm(null);
        }
    };

    const truncateLabel = (s: string, max = 16) => {
        const t = s.trim();
        return t.length > max ? `${t.slice(0, max - 1)}…` : t;
    };

    const chartData = useMemo(() => {
        const ownName = (ownBusinessChart.name || "Your business").trim();
        const ownRow = {
            name: truncateLabel(ownName, 18),
            fullName: ownName,
            rating: ownBusinessChart.averageRating != null ? Number(ownBusinessChart.averageRating) : 0,
            reviews: ownBusinessChart.totalReviews != null ? Number(ownBusinessChart.totalReviews) : 0,
            isOwn: true,
        };
        const compRows = competitors
            .filter((c) => !isSyncing(c))
            .map((c) => ({
                name: truncateLabel(c.name, 18),
                fullName: c.name,
                rating: Number(c.average_rating) || 0,
                reviews: c.total_reviews || 0,
                isOwn: false,
            }));
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

    const runStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
        const s = String(status || "").toLowerCase();
        if (s === "failed") return "destructive";
        if (s === "success") return "default";
        return "secondary";
    };

    const alertEvents = useMemo(
        () => activeEventRows.filter((e) => isCompetitorAlertEventType(e.event_type)),
        [activeEventRows]
    );

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden sm:space-y-8">
            <div className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full min-w-0 items-stretch gap-1 rounded-lg border bg-muted/30 p-1 sm:max-w-md lg:w-fit lg:max-w-none lg:items-center">
                    {rangeOptions.map((opt) => {
                        const active = optimisticRange === opt.value;
                        return (
                            <Button
                                key={opt.value}
                                size="sm"
                                variant={active ? "default" : "ghost"}
                                className="min-w-0 flex-1 px-2 sm:px-3 lg:flex-none lg:px-3"
                                onClick={() => setRange(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        );
                    })}
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                    {competitors.length > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={syncWatchLoading}
                            className="w-full sm:w-auto"
                            onClick={() => void handleSyncCompetitorWatch()}
                        >
                            {syncWatchLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
                            ) : (
                                <RefreshCw className="h-4 w-4 md:mr-2" />
                            )}
                            <span className="md:hidden">Sync</span>
                            <span className="hidden md:inline">Sync from Google</span>
                        </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                        <a
                            href={`/api/competitors/export?range=${optimisticRange}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center"
                        >
                            <Download className="h-4 w-4 md:mr-2" />
                            <span className="md:hidden">CSV</span>
                            <span className="hidden md:inline">Export CSV</span>
                        </a>
                    </Button>
                    <div className="col-span-2 w-full sm:col-span-1 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
                        <AddCompetitorDialog
                            businessId={businessId}
                            onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                        />
                    </div>
                </div>
            </div>

            {activeOwnSearchKeywords.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        Your Google search terms
                    </CardTitle>
                    <CardDescription>
                        Monthly search impressions for your listing from Google Business Profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeKeywordDiscoverySplit.directPct + activeKeywordDiscoverySplit.discoveryPct > 0 ? (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {activeKeywordDiscoverySplit.discoveryPct}% discovery
                            </span>{" "}
                            vs{" "}
                            <span className="font-medium text-foreground">
                                {activeKeywordDiscoverySplit.directPct}% name/brand
                            </span>
                        </p>
                    ) : null}
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {activeOwnSearchKeywords.slice(0, 12).map((k) => (
                            <li
                                key={`${k.monthStart}-${k.keyword}`}
                                className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                            >
                                <span className="break-words font-medium" title={k.keyword}>
                                    {k.keyword}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                    {k.impressions.toLocaleString()} imp.
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/analytics" className="text-primary underline underline-offset-2">
                            View full keyword list in Analytics
                        </Link>
                    </p>
                </CardContent>
            </Card>
            )}

            <Card className="min-w-0 border-border bg-canvas-elevated text-foreground">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="min-w-0 space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-chart-4" />
                            AI market positioning brief
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Competitive analysis based on your search terms and public listing data.
                        </CardDescription>
                    </div>
                    {competitors.length > 0 ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="w-full shrink-0 sm:w-auto"
                            disabled={briefGenLoading}
                            onClick={() => void handleGenerateMarketBrief()}
                        >
                            {briefGenLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 md:mr-2" />
                            )}
                            <span className="md:hidden">{marketBriefLatest ? "Regenerate" : "Brief"}</span>
                            <span className="hidden md:inline">
                                {marketBriefLatest ? "Regenerate brief" : "Generate brief"}
                            </span>
                        </Button>
                    ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                    {competitors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Add tracked competitors to generate a positioning brief.
                        </p>
                    ) : !marketBriefLatest ? (
                        <p className="text-sm text-muted-foreground">
                            Run once to get a concise comparison of how you show up versus competitors, grounded in
                            ratings, reviews, categories, and your top search queries.
                        </p>
                    ) : (
                        <>
                            <div>
                                <h4 className="text-lg font-semibold leading-snug">{marketBriefLatest.headline}</h4>
                                <p className="mt-2 text-sm text-foreground/90">{marketBriefLatest.overview}</p>
                            </div>
                            {marketBriefLatest.positioning_bullets.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                    {marketBriefLatest.positioning_bullets.map((b, i) => (
                                        <li key={`${marketBriefLatest.id}-b-${i}`}>{b}</li>
                                    ))}
                                </ul>
                            ) : null}
                            {marketBriefLatest.opportunity_actions.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Suggested moves
                                    </p>
                                    <ul className="space-y-2">
                                        {marketBriefLatest.opportunity_actions.map((a, i) => (
                                            <li
                                                key={`${marketBriefLatest.id}-a-${i}`}
                                                className="rounded-lg border border-border bg-muted/80 px-3 py-2 text-sm"
                                            >
                                                <span className="font-medium">{a.title}</span>
                                                <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            <p className="border-t border-border pt-3 text-[11px] text-muted-foreground">
                                AI Brief · Generated <TimeAgo date={marketBriefLatest.created_at} />
                                {marketBriefLatest.data_limitations ? (
                                    <span
                                        className="ml-1.5 cursor-help border-b border-dotted border-border/70"
                                        title={marketBriefLatest.data_limitations}
                                    >
                                        ℹ limitations
                                    </span>
                                ) : null}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Last Sync Health</CardTitle>
                    <CardDescription>
                        Scheduled job status for this business. Use &quot;Sync from Google&quot; above to refresh
                        ratings without waiting for the schedule (requires a server Google Maps API key).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!latestRun ? (
                        <p className="text-sm text-muted-foreground">
                            No sync run has been logged yet for this business.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <Badge variant={runStatusVariant(latestRun.status)}>
                                    {String(latestRun.status || "unknown").toUpperCase()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Finished <TimeAgo date={latestRun.finished_at} />
                                </span>
                                {latestSuccessRun ? (
                                    <span className="text-xs text-muted-foreground">
                                        Last success <TimeAgo date={latestSuccessRun.finished_at} />
                                    </span>
                                ) : null}
                                {latestFailedRun ? (
                                    <span className="text-xs text-muted-foreground">
                                        Last failure <TimeAgo date={latestFailedRun.finished_at} />
                                    </span>
                                ) : null}
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                <div className="min-w-0 rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Scanned</p>
                                    <p className="font-semibold">{latestRun.scanned}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">External updates</p>
                                    <p className="font-semibold">{latestRun.external_updates}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Snapshots</p>
                                    <p className="font-semibold">{latestRun.snapshots_created}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Events</p>
                                    <p className="font-semibold">{latestRun.events_created}</p>
                                </div>
                                <div className="rounded border p-2">
                                    <p className="text-muted-foreground text-xs">Insights</p>
                                    <p className="font-semibold">{latestRun.insights_created}</p>
                                </div>
                            </div>
                            {latestRun.error_message ? (
                                <p className="text-xs text-sync-action dark:text-sync-action">
                                    {latestRun.error_message}
                                </p>
                            ) : null}
                            {latestSuccessRun ? (
                                <p className="text-xs text-muted-foreground">
                                    Data freshness: latest successful sync was <TimeAgo date={latestSuccessRun.finished_at} />.
                                    {Date.now() - new Date(latestSuccessRun.finished_at).getTime() > 24 * 60 * 60 * 1000
                                        ? " Data may be stale (>24h)."
                                        : ""}
                                </p>
                            ) : null}
                        </div>
                    )}
                </CardContent>
            </Card>

            {alertEvents.length > 0 ? (
                <Card id="competitor-alerts">
                    <CardHeader>
                        <CardTitle>Threshold alerts ({rangeLabel})</CardTitle>
                        <CardDescription>
                            Fired when a competitor crosses your{" "}
                            <Link href="/settings/competitor-alerts" className="text-primary underline underline-offset-2">
                                alert thresholds
                            </Link>
                            . Emails go to team members with email notifications enabled.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {alertEvents.slice(0, 15).map((ev) => (
                                <li key={ev.id} className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                    <span className="break-words font-medium">{ev.title}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground sm:text-right">
                                        <TimeAgo date={ev.created_at} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : null}

            {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-background to-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-4/18/10 dark:bg-chart-4/15 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-8 rotate-2 transform transition-transform hover:rotate-0 duration-500">
                            <Star className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                            See how you stack up against the competition
                        </h3>
                        
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Monitor your competitors' ratings and review volume in real-time. Gain insights into their performance and stay ahead in your local market.
                        </p>

                        <AddCompetitorDialog
                            businessId={businessId}
                            onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                        />

                        <div className="mt-10 grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-[400px]:grid-cols-4 min-[400px]:gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Star className="h-4 w-4" /></div>
                                Rating Tracking
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-chart-4/120/10 rounded-lg text-chart-4"><BarChart className="h-4 w-4" /></div>
                                Volume Growth
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><PieChart className="h-4 w-4" /></div>
                                Market Share
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-chart-2/10 rounded-lg text-chart-2"><ExternalLink className="h-4 w-4" /></div>
                                Direct Links
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
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
                        onDeleteRequest={setDeleteConfirm}
                    />
                    {chartData.length > 0 && (
                        <CompetitorsChartsSection chartData={chartData} />
                    )}
                </div>
            )}

            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {competitors.find(c => c.id === deleteConfirm)?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="w-full bg-destructive hover:bg-destructive/90 sm:w-auto"
                            disabled={isDeleting === deleteConfirm}
                            onClick={() => handleDelete(deleteConfirm!)}
                        >
                            {isDeleting === deleteConfirm ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                "Remove"
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
