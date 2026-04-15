"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowDown,
    ArrowUp,
    Minus,
    Trash2,
    ExternalLink,
    Star,
    Loader2,
    Download,
    RefreshCw,
    Hash,
    Globe,
    Sparkles,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { TimeAgo } from "@/components/ui/time-ago";
import { Database } from "@/lib/db/supabase/database.types";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isCompetitorAlertEventType } from "@/lib/competitors/range-benchmark";
import type { CompetitorRangeKey } from "@/lib/competitors/date-range";
import { computeCompetitorMovementRows } from "@/lib/competitors/snapshot-movement";
import { syncCompetitorWatchNow } from "@/app/actions/competitor-watch-sync";
import { generateCompetitorMarketBriefNow } from "@/app/actions/competitor-market-brief";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";

type Competitor = Database["public"]["Tables"]["competitors"]["Row"];
type CompetitorSnapshot = {
    id: string;
    competitor_id: string;
    business_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
    source: string;
    metadata: Record<string, unknown> | null;
};
type CompetitorEvent = {
    id: string;
    competitor_id: string;
    business_id: string;
    event_type: string;
    title: string;
    summary: string | null;
    event_value: number | null;
    event_delta: number | null;
    created_at: string;
};
type CompetitorInsight = {
    id: string;
    competitor_id: string;
    business_id: string;
    range_key: string;
    summary: string;
    why_it_matters?: string | null;
    owner_suggestion?: string | null;
    actions?: Array<{ title?: string; impact?: string; effort?: string; priority?: string }> | null;
    priority: string;
    confidence: number | null;
    recommendations: string[] | null;
    model: string | null;
    created_at: string;
};
type CompetitorWatchRun = {
    id: string;
    run_id: string;
    business_id: string;
    status: string;
    scanned: number;
    external_updates: number;
    snapshots_created: number;
    events_created: number;
    insights_created: number;
    error_message: string | null;
    started_at: string;
    finished_at: string;
    created_at: string;
};

export type CompetitorMarketBriefLatest = {
    id: string;
    headline: string;
    overview: string;
    positioning_bullets: string[];
    opportunity_actions: Array<{ title: string; detail: string }>;
    data_limitations: string | null;
    model: string | null;
    created_at: string;
};

export type CompetitorWatchBenchmarkRange = {
    label: string;
    marketEndAvgRating: number;
    marketEndUsedFallback: boolean;
    marketBenchmarkAvailable: boolean;
    yourRatingForRank: number;
    rank: number | null;
    totalRanked: number;
    yourAvgVsMarketEnd: number | null;
    yourReviewsInRange: number;
    marketAvgReviewGain: number | null;
};

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
}: {
    businessId: string;
    initialCompetitors: Competitor[];
    range: CompetitorRangeKey;
    snapshotRows: CompetitorSnapshot[];
    eventRows: CompetitorEvent[];
    insightRows: CompetitorInsight[];
    latestRun: CompetitorWatchRun | null;
    latestSuccessRun: CompetitorWatchRun | null;
    latestFailedRun: CompetitorWatchRun | null;
    ownBusinessInRange: {
        avgRating: number | null;
        reviewCount: number;
    };
    benchmarkRange: CompetitorWatchBenchmarkRange;
    ownSearchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }>;
    keywordDiscoverySplit: { discoveryPct: number; directPct: number };
    placesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta>;
    marketBriefLatest: CompetitorMarketBriefLatest | null;
    /** Stored listing aggregates for the active business (same basis as competitor totals from Places). */
    ownBusinessChart: {
        name: string;
        averageRating: number | null;
        totalReviews: number | null;
    };
}) {
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [syncWatchLoading, setSyncWatchLoading] = useState(false);
    const [briefGenLoading, setBriefGenLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setCompetitors(initialCompetitors);
    }, [initialCompetitors]);

    const rangeOptions: Array<{ value: CompetitorRangeKey; label: string }> = [
        { value: "7d", label: "7 Days" },
        { value: "30d", label: "30 Days" },
        { value: "90d", label: "90 Days" },
        { value: "12m", label: "12 Months" },
    ];

    const rangeLabel = rangeOptions.find((r) => r.value === range)?.label || "30 Days";

    const setRange = (nextRange: CompetitorRangeKey) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", nextRange);
        router.push(`?${params.toString()}`, { scroll: false });
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
                snapshotRows
            ),
        [competitors, snapshotRows]
    );

    const latestSnapshotByCompetitor = useMemo(() => {
        const map = new Map<string, CompetitorSnapshot>();
        for (const row of snapshotRows) {
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
    }, [snapshotRows]);

    const latestInsightByCompetitor = useMemo(() => {
        const byCompetitor = new Map<string, CompetitorInsight>();
        for (const row of insightRows) {
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
    }, [insightRows]);

    const priorityBadgeVariant = (priority: string): "destructive" | "secondary" | "outline" => {
        const p = String(priority || "").toLowerCase();
        if (p === "high") return "destructive";
        if (p === "medium") return "secondary";
        return "outline";
    };

    const runStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
        const s = String(status || "").toLowerCase();
        if (s === "failed") return "destructive";
        if (s === "success") return "default";
        return "secondary";
    };

    const alertEvents = useMemo(
        () => eventRows.filter((e) => isCompetitorAlertEventType(e.event_type)),
        [eventRows]
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1 w-fit">
                    {rangeOptions.map((opt) => {
                        const active = range === opt.value;
                        return (
                            <Button
                                key={opt.value}
                                size="sm"
                                variant={active ? "default" : "ghost"}
                                onClick={() => setRange(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {competitors.length > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={syncWatchLoading}
                            onClick={() => void handleSyncCompetitorWatch()}
                        >
                            {syncWatchLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                            ) : (
                                <RefreshCw className="h-4 w-4 sm:mr-2" />
                            )}
                            <span className="hidden sm:inline">Sync from Google</span>
                        </Button>
                    ) : null}
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={`/api/competitors/export?range=${range}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </a>
                    </Button>
                    <AddCompetitorDialog
                        businessId={businessId}
                        onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        Your Google search terms
                    </CardTitle>
                    <CardDescription>
                        Monthly search impressions for <strong>your</strong> listing (from Google Business Profile
                        Performance). Rival businesses do not share their private search-keyword data; compare using
                        categories and positioning below instead.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {ownSearchKeywords.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No keyword data yet. Connect Google and run a performance sync from Integrations, or open{" "}
                            <Link href="/analytics" className="text-primary underline underline-offset-2">
                                Analytics
                            </Link>{" "}
                            after data has synced.
                        </p>
                    ) : (
                        <>
                            {keywordDiscoverySplit.directPct + keywordDiscoverySplit.discoveryPct > 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Rough split (by impressions):{" "}
                                    <span className="font-medium text-foreground">
                                        {keywordDiscoverySplit.discoveryPct}% discovery
                                    </span>{" "}
                                    vs{" "}
                                    <span className="font-medium text-foreground">
                                        {keywordDiscoverySplit.directPct}% name/brand
                                    </span>{" "}
                                    — heuristic based on whether the query contains your business name tokens.
                                </p>
                            ) : null}
                            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {ownSearchKeywords.slice(0, 12).map((k) => (
                                    <li
                                        key={`${k.monthStart}-${k.keyword}`}
                                        className="flex items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm"
                                    >
                                        <span className="truncate font-medium" title={k.keyword}>
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
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            AI market positioning brief
                        </CardTitle>
                        <CardDescription>
                            Gemini synthesizes your Google search-term data and public competitor listing fields we
                            store. It cannot access competitors&apos; private Business Profile analytics.
                        </CardDescription>
                    </div>
                    {competitors.length > 0 ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="shrink-0"
                            disabled={briefGenLoading}
                            onClick={() => void handleGenerateMarketBrief()}
                        >
                            {briefGenLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 sm:mr-2" />
                            )}
                            <span className="hidden sm:inline">
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
                                <p className="text-sm text-muted-foreground mt-2">{marketBriefLatest.overview}</p>
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
                                                className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                                            >
                                                <span className="font-medium">{a.title}</span>
                                                <p className="text-xs text-muted-foreground mt-1">{a.detail}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {marketBriefLatest.data_limitations ? (
                                <p className="text-[11px] text-muted-foreground border-t pt-3">
                                    {marketBriefLatest.data_limitations}
                                </p>
                            ) : null}
                            <p className="text-[11px] text-muted-foreground">
                                {marketBriefLatest.model ? `${marketBriefLatest.model} · ` : null}
                                Generated <TimeAgo date={marketBriefLatest.created_at} />
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
                            <div className="flex items-center gap-2">
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
                            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                                <div className="rounded border p-2">
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
                                <p className="text-xs text-rose-700 dark:text-rose-300">
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
                                <li key={ev.id} className="flex flex-col gap-0.5 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                    <span className="font-medium">{ev.title}</span>
                                    <span className="text-xs text-muted-foreground">
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
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/10 dark:bg-amber-900/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-8 rotate-2 transform transition-transform hover:rotate-0 duration-500">
                            <Star className="h-10 w-10 text-white fill-white" />
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

                        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Star className="h-4 w-4" /></div>
                                Rating Tracking
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><BarChart className="h-4 w-4" /></div>
                                Volume Growth
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><CartesianGrid className="h-4 w-4" /></div>
                                Market Share
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><ExternalLink className="h-4 w-4" /></div>
                                Direct Links
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Data Table */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Market Benchmark ({benchmarkRange.label})</CardTitle>
                            <CardDescription>
                                Your average rating uses reviews received in this period. Competitors use the latest
                                snapshot in this period (or current totals if no snapshot yet).{" "}
                                {!benchmarkRange.marketBenchmarkAvailable && competitors.length > 0 ? (
                                    <span className="text-amber-700 dark:text-amber-300">
                                        Competitor ratings are not loaded yet — run Sync from Google or wait for the
                                        next sync.
                                    </span>
                                ) : benchmarkRange.marketEndUsedFallback ? (
                                    "Some competitors fell back to live totals where snapshots were missing."
                                ) : null}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Your rank (by period rating)</p>
                                    <p className="text-xl font-semibold">
                                        {benchmarkRange.rank ? `#${benchmarkRange.rank}` : "—"}
                                        <span className="text-sm text-muted-foreground">
                                            {" "}
                                            / {benchmarkRange.totalRanked || "—"}
                                        </span>
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Your avg rating ({benchmarkRange.label})</p>
                                    <p className="text-xl font-semibold">
                                        {ownBusinessInRange.avgRating !== null
                                            ? ownBusinessInRange.avgRating.toFixed(1)
                                            : "—"}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {ownBusinessInRange.reviewCount} reviews in period
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">You vs market end (rating)</p>
                                    <p className="text-xl font-semibold">
                                        {benchmarkRange.yourAvgVsMarketEnd === null
                                            ? "—"
                                            : `${benchmarkRange.yourAvgVsMarketEnd > 0 ? "+" : ""}${benchmarkRange.yourAvgVsMarketEnd.toFixed(1)}`}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        {benchmarkRange.marketBenchmarkAvailable ? (
                                            <>Market end avg {benchmarkRange.marketEndAvgRating.toFixed(1)}</>
                                        ) : (
                                            <>Market average unavailable until competitor data syncs</>
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Avg competitor review gain</p>
                                    <p className="text-xl font-semibold">
                                        {benchmarkRange.marketAvgReviewGain === null
                                            ? "—"
                                            : `${benchmarkRange.marketAvgReviewGain > 0 ? "+" : ""}${Math.round(benchmarkRange.marketAvgReviewGain)}`}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Mean first→last snapshot in {benchmarkRange.label}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                            <CardDescription>
                                Ratings and reviews from Google Places. Primary category, website, and short
                                description come from public listing data after sync — not competitors&apos; private
                                search-keyword reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[140px]">Competitor Name</TableHead>
                                        <TableHead className="min-w-[120px]">Primary category</TableHead>
                                        <TableHead>Avg Rating</TableHead>
                                        <TableHead>Total Reviews</TableHead>
                                        <TableHead className="min-w-[90px]">Website</TableHead>
                                        <TableHead className="min-w-[90px]">Maps</TableHead>
                                        <TableHead className="min-w-[120px]">Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {competitors.map((competitor) => {
                                        const syncing = isSyncing(competitor);
                                        const updatedAt = competitor.updated_at 
                                            ? <TimeAgo date={competitor.updated_at} />
                                            : "—";
                                        const places = placesMetaByCompetitorId[competitor.id];
                                        
                                        return (
                                            <TableRow key={competitor.id}>
                                                <TableCell className="font-medium align-top">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            {competitor.name}
                                                            {syncing && (
                                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                    Syncing...
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {places?.summary ? (
                                                            <p
                                                                className="text-[11px] font-normal text-muted-foreground line-clamp-2 max-w-[280px]"
                                                                title={places.summary}
                                                            >
                                                                {places.summary}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top text-sm text-muted-foreground">
                                                    {syncing ? (
                                                        "—"
                                                    ) : places?.primaryType ? (
                                                        <span title={places.typesPreview ?? undefined}>
                                                            {places.primaryType}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    <div className="flex items-center text-sm">
                                                        {syncing ? (
                                                            <span className="text-muted-foreground">—</span>
                                                        ) : (
                                                            <>
                                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                                                {competitor.average_rating || "—"}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {syncing ? <span className="text-muted-foreground">—</span> : competitor.total_reviews || 0}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {!syncing && places?.websiteUrl ? (
                                                        <a
                                                            href={places.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                                                        >
                                                            <Globe className="h-3.5 w-3.5 shrink-0" />
                                                            Site
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {competitor.google_url ? (
                                                        <a
                                                            href={competitor.google_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-primary hover:underline text-xs"
                                                        >
                                                            View <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground align-top">
                                                    <div className="space-y-1">
                                                        <div>{updatedAt}</div>
                                                        <div className="text-[11px]">
                                                            Source:{" "}
                                                            {(() => {
                                                                const snap = latestSnapshotByCompetitor.get(
                                                                    competitor.id
                                                                );
                                                                const meta = snap?.metadata as
                                                                    | { provider?: string; seeded_on_create?: boolean }
                                                                    | null
                                                                    | undefined;
                                                                if (meta?.provider) return String(meta.provider);
                                                                if (snap?.source === "google_places")
                                                                    return "google_places";
                                                                if (snap?.source === "manual" && meta?.seeded_on_create) {
                                                                    return "Pending sync";
                                                                }
                                                                return snap?.source || "—";
                                                            })()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting === competitor.id}
                                                        onClick={() => setDeleteConfirm(competitor.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        {isDeleting === competitor.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Market Movement ({rangeLabel})</CardTitle>
                            <CardDescription>
                                Rating and review-count movement based on recorded competitor snapshots.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {movementCards.map((m) => {
                                    const hasData = m.hasBaseline && m.ratingDelta !== null && m.reviewsDelta !== null;
                                    const ratingUp = (m.ratingDelta ?? 0) > 0;
                                    const reviewsUp = (m.reviewsDelta ?? 0) > 0;
                                    return (
                                        <div key={m.competitorId} className="rounded-lg border p-3 bg-card">
                                            <p className="font-semibold text-sm mb-2 truncate">{m.name}</p>
                                            {!hasData ? (
                                                <p className="text-xs text-muted-foreground">
                                                    Need at least two snapshots in this range to compute movement.
                                                </p>
                                            ) : (
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Rating change</span>
                                                        <span className="inline-flex items-center gap-1 font-medium">
                                                            {ratingUp ? <ArrowUp className="h-3 w-3 text-emerald-600" /> : (m.ratingDelta ?? 0) < 0 ? <ArrowDown className="h-3 w-3 text-rose-600" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                                                            {(m.ratingDelta ?? 0).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Review change</span>
                                                        <span className="inline-flex items-center gap-1 font-medium">
                                                            {reviewsUp ? <ArrowUp className="h-3 w-3 text-emerald-600" /> : (m.reviewsDelta ?? 0) < 0 ? <ArrowDown className="h-3 w-3 text-rose-600" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                                                            {(m.reviewsDelta ?? 0) > 0 ? "+" : ""}
                                                            {m.reviewsDelta ?? 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>AI Competitor Insights</CardTitle>
                            <CardDescription>
                                Latest Gemini-generated insights from recent competitor movement.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {latestInsightByCompetitor.size === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Insights will appear automatically after movement is detected.
                                </p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {competitors
                                        .map((c) => ({ competitor: c, insight: latestInsightByCompetitor.get(c.id) }))
                                        .filter((row) => !!row.insight)
                                        .map(({ competitor, insight }) => {
                                            if (!insight) return null;
                                            return (
                                                <div key={insight.id} className="rounded-lg border p-4 bg-card">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold text-sm">{competitor.name}</p>
                                                        <Badge variant={priorityBadgeVariant(insight.priority)}>
                                                            {String(insight.priority || "low").toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm mt-2">{insight.summary}</p>
                                                    {insight.why_it_matters ? (
                                                        <p className="text-xs mt-2 text-muted-foreground">
                                                            Why it matters: {insight.why_it_matters}
                                                        </p>
                                                    ) : null}
                                                    {insight.owner_suggestion ? (
                                                        <p className="text-xs mt-1 text-muted-foreground">
                                                            Suggested owner: {String(insight.owner_suggestion).toUpperCase()}
                                                        </p>
                                                    ) : null}
                                                    {Array.isArray(insight.actions) &&
                                                    insight.actions.length > 0 ? (
                                                        <div className="mt-2 space-y-2">
                                                            {insight.actions.slice(0, 3).map((action, idx: number) => (
                                                                <div
                                                                    key={`${insight.id}-action-${idx}`}
                                                                    className="rounded border p-2 bg-muted/20"
                                                                >
                                                                    <p className="text-xs font-medium">{action.title}</p>
                                                                    <p className="text-[11px] text-muted-foreground mt-1">
                                                                        Impact: {action.impact}
                                                                    </p>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        Effort: {String(action.effort || "").toUpperCase()} • Priority:{" "}
                                                                        {String(action.priority || "").toUpperCase()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    {Array.isArray(insight.recommendations) &&
                                                    insight.recommendations.length > 0 ? (
                                                        <div className="mt-2 space-y-1">
                                                            {insight.recommendations.slice(0, 3).map((rec, idx) => (
                                                                <p key={`${insight.id}-${idx}`} className="text-xs text-muted-foreground">
                                                                    - {rec}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    <p className="text-[11px] text-muted-foreground mt-3">
                                                        Confidence {Math.round((insight.confidence ?? 0.5) * 100)}% •{" "}
                                                        <TimeAgo date={insight.created_at} />
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Recent Competitor Events ({rangeLabel})</CardTitle>
                            <CardDescription>
                                Event timeline generated from competitor monitoring workflows.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {eventRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No events recorded in this period yet.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {eventRows.slice(0, 20).map((event) => {
                                        const competitorName =
                                            competitors.find((c) => c.id === event.competitor_id)?.name || "Competitor";
                                        return (
                                            <div key={event.id} className="rounded-lg border p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-medium">{event.title || event.event_type}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        <TimeAgo date={event.created_at} />
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {competitorName}
                                                </p>
                                                {event.summary ? (
                                                    <p className="text-sm mt-1">{event.summary}</p>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chart Component */}
                    {chartData.length > 0 && (
                        <>
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Rating Comparison</CardTitle>
                                    <CardDescription>
                                        Your business vs tracked competitors (stored average ratings, typically from
                                        Google).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[11px] text-muted-foreground mb-2">
                                        <span className="inline-block h-2 w-2 rounded-sm bg-primary align-middle mr-1" />{" "}
                                        Your business ·{" "}
                                        <span className="inline-block h-2 w-2 rounded-sm bg-amber-500 align-middle mx-1" />{" "}
                                        Competitors
                                    </p>
                                    <div className="h-75 w-full min-h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData}
                                                margin={{ top: 12, right: 12, left: 0, bottom: 28 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={0}
                                                    tick={{ fontSize: 11 }}
                                                    height={40}
                                                />
                                                <YAxis
                                                    domain={[0, 5]}
                                                    ticks={[1, 2, 3, 4, 5]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: "transparent" }}
                                                    content={({ active, payload }) => {
                                                        if (!active || !payload?.length) return null;
                                                        const row = payload[0].payload as {
                                                            fullName?: string;
                                                            name: string;
                                                            rating: number;
                                                            isOwn?: boolean;
                                                        };
                                                        const label = row.fullName || row.name;
                                                        return (
                                                            <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                                                                <p className="font-semibold">
                                                                    {label}
                                                                    {row.isOwn ? (
                                                                        <span className="font-normal text-muted-foreground">
                                                                            {" "}
                                                                            (your business)
                                                                        </span>
                                                                    ) : null}
                                                                </p>
                                                                <p className="text-muted-foreground text-xs mt-0.5">
                                                                    Avg rating: {Number(row.rating).toFixed(1)}
                                                                </p>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                                <Bar dataKey="rating" radius={[4, 4, 0, 0]} maxBarSize={52}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`rating-${index}`}
                                                            fill={entry.isOwn ? "hsl(var(--primary))" : "#f59e0b"}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Volume Comparison Chart */}
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Review Volume Comparison</CardTitle>
                                    <CardDescription>
                                        Your total Google reviews vs competitors (public totals from sync).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[11px] text-muted-foreground mb-2">
                                        <span className="inline-block h-2 w-2 rounded-sm bg-primary align-middle mr-1" />{" "}
                                        Your business ·{" "}
                                        <span className="inline-block h-2 w-2 rounded-sm bg-amber-500 align-middle mx-1" />{" "}
                                        Competitors
                                    </p>
                                    <div className="h-75 w-full min-h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData}
                                                margin={{ top: 12, right: 12, left: 0, bottom: 28 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={0}
                                                    tick={{ fontSize: 11 }}
                                                    height={40}
                                                />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: "transparent" }}
                                                    content={({ active, payload }) => {
                                                        if (!active || !payload?.length) return null;
                                                        const row = payload[0].payload as {
                                                            fullName?: string;
                                                            name: string;
                                                            reviews: number;
                                                            isOwn?: boolean;
                                                        };
                                                        const label = row.fullName || row.name;
                                                        return (
                                                            <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                                                                <p className="font-semibold">
                                                                    {label}
                                                                    {row.isOwn ? (
                                                                        <span className="font-normal text-muted-foreground">
                                                                            {" "}
                                                                            (your business)
                                                                        </span>
                                                                    ) : null}
                                                                </p>
                                                                <p className="text-muted-foreground text-xs mt-0.5">
                                                                    Total reviews:{" "}
                                                                    {Number(row.reviews).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                                <Bar dataKey="reviews" radius={[4, 4, 0, 0]} maxBarSize={52}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`reviews-${index}`}
                                                            fill={entry.isOwn ? "hsl(var(--primary))" : "#f59e0b"}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {competitors.find(c => c.id === deleteConfirm)?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
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
