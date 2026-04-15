"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Minus, Trash2, ExternalLink, Star, Loader2 } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeAgo } from "@/components/ui/time-ago";
import { Database } from "@/lib/db/supabase/database.types";
import { useRouter, useSearchParams } from "next/navigation";

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
type RangeKey = "7d" | "30d" | "90d" | "12m";

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
    ownBusiness,
}: {
    businessId: string;
    initialCompetitors: Competitor[];
    range: RangeKey;
    snapshotRows: CompetitorSnapshot[];
    eventRows: CompetitorEvent[];
    insightRows: CompetitorInsight[];
    latestRun: CompetitorWatchRun | null;
    latestSuccessRun: CompetitorWatchRun | null;
    latestFailedRun: CompetitorWatchRun | null;
    ownBusiness: {
        name: string;
        averageRating: number;
        totalReviews: number;
    };
}) {
    const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
    }, []);

    const rangeOptions: Array<{ value: RangeKey; label: string }> = [
        { value: "7d", label: "7 Days" },
        { value: "30d", label: "30 Days" },
        { value: "90d", label: "90 Days" },
        { value: "12m", label: "12 Months" },
    ];

    const rangeLabel = rangeOptions.find((r) => r.value === range)?.label || "30 Days";

    const setRange = (nextRange: RangeKey) => {
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

    // Chart Data (exclude syncing competitors)
    const chartData = competitors
        .filter(c => !isSyncing(c))
        .map(c => ({
            name: c.name,
            rating: Number(c.average_rating) || 0,
            reviews: c.total_reviews || 0,
        }));

    const movementCards = useMemo(() => {
        const byCompetitor = new Map<string, CompetitorSnapshot[]>();
        for (const s of snapshotRows) {
            if (!byCompetitor.has(s.competitor_id)) byCompetitor.set(s.competitor_id, []);
            byCompetitor.get(s.competitor_id)!.push(s);
        }

        return competitors.map((c) => {
            const rows = (byCompetitor.get(c.id) || [])
                .slice()
                .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
            const first = rows[0];
            const last = rows[rows.length - 1];
            if (!first || !last) {
                return {
                    competitorId: c.id,
                    name: c.name,
                    ratingDelta: null as number | null,
                    reviewsDelta: null as number | null,
                    hasBaseline: false,
                };
            }
            return {
                competitorId: c.id,
                name: c.name,
                ratingDelta: Number(last.average_rating) - Number(first.average_rating),
                reviewsDelta: Number(last.total_reviews) - Number(first.total_reviews),
                hasBaseline: rows.length > 1,
            };
        });
    }, [competitors, snapshotRows]);

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

    const benchmark = useMemo(() => {
        if (competitors.length === 0) {
            return {
                marketAvgRating: 0,
                marketAvgReviews: 0,
                yourRatingDelta: 0,
                yourReviewDelta: 0,
                rank: null as number | null,
                total: 0,
            };
        }
        const ratingVals = competitors.map((c) => Number(c.average_rating || 0));
        const reviewVals = competitors.map((c) => Number(c.total_reviews || 0));
        const marketAvgRating = ratingVals.reduce((s, n) => s + n, 0) / ratingVals.length;
        const marketAvgReviews = reviewVals.reduce((s, n) => s + n, 0) / reviewVals.length;
        const yourRatingDelta = ownBusiness.averageRating - marketAvgRating;
        const yourReviewDelta = ownBusiness.totalReviews - marketAvgReviews;
        const allRatings = [ownBusiness.averageRating, ...ratingVals].slice().sort((a, b) => b - a);
        const rank = allRatings.findIndex((v) => v === ownBusiness.averageRating) + 1;
        return {
            marketAvgRating,
            marketAvgReviews,
            yourRatingDelta,
            yourReviewDelta,
            rank,
            total: allRatings.length,
        };
    }, [competitors, ownBusiness.averageRating, ownBusiness.totalReviews]);

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
                <AddCompetitorDialog
                    businessId={businessId}
                    onSuccess={(newCompetitor) => setCompetitors([newCompetitor, ...competitors])}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Last Sync Health</CardTitle>
                    <CardDescription>
                        Latest competitor-watch cron status for this business.
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
                            <CardTitle>Market Benchmark</CardTitle>
                            <CardDescription>
                                Your business versus tracked competitor averages in the selected market.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Your rank (rating)</p>
                                    <p className="text-xl font-semibold">
                                        {benchmark.rank ? `#${benchmark.rank}` : "—"}
                                        <span className="text-sm text-muted-foreground"> / {benchmark.total || "—"}</span>
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Rating vs market avg</p>
                                    <p className="text-xl font-semibold">
                                        {benchmark.yourRatingDelta > 0 ? "+" : ""}
                                        {benchmark.yourRatingDelta.toFixed(1)}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Reviews vs market avg</p>
                                    <p className="text-xl font-semibold">
                                        {benchmark.yourReviewDelta > 0 ? "+" : ""}
                                        {Math.round(benchmark.yourReviewDelta)}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">Market average rating</p>
                                    <p className="text-xl font-semibold">{benchmark.marketAvgRating.toFixed(1)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                            <CardDescription>
                                Your competitors' ratings and reviews. Stats are updated periodically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Competitor Name</TableHead>
                                        <TableHead>Avg Rating</TableHead>
                                        <TableHead>Total Reviews</TableHead>
                                        <TableHead>Google Link</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {competitors.map((competitor) => {
                                        const syncing = isSyncing(competitor);
                                        const updatedAt = competitor.updated_at 
                                            ? <TimeAgo date={competitor.updated_at} />
                                            : "—";
                                        
                                        return (
                                            <TableRow key={competitor.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {competitor.name}
                                                        {syncing && (
                                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Syncing...
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
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
                                                <TableCell>
                                                    {syncing ? <span className="text-muted-foreground">—</span> : competitor.total_reviews || 0}
                                                </TableCell>
                                                <TableCell>
                                                    {competitor.google_url ? (
                                                        <a
                                                            href={competitor.google_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-primary hover:underline"
                                                        >
                                                            View <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <div className="space-y-1">
                                                        <div>{updatedAt}</div>
                                                        <div className="text-[11px]">
                                                            Source:{" "}
                                                            {String(
                                                                latestSnapshotByCompetitor.get(competitor.id)?.metadata?.provider ||
                                                                    "db_fallback"
                                                            )}
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
                                    <CardDescription>Average rating across tracked competitors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-75 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="rating" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Volume Comparison Chart */}
                            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Review Volume Comparison</CardTitle>
                                    <CardDescription>Total number of reviews across tracked competitors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-75 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="reviews" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
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
