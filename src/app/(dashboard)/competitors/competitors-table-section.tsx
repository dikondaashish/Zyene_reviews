"use client";

import {
    ArrowDown,
    ArrowUp,
    Minus,
    Trash2,
    ExternalLink,
    Star,
    Loader2,
    Globe,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorsTableSectionProps } from "./competitors-types";

function priorityBadgeVariant(priority: string): "destructive" | "secondary" | "outline" {
    const p = String(priority || "").toLowerCase();
    if (p === "high") return "destructive";
    if (p === "medium") return "secondary";
    return "outline";
}

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
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Market Benchmark ({activeBenchmarkRange.label})</CardTitle>
                    <CardDescription>
                        Your average rating uses reviews received in this period. Competitors use the latest
                        snapshot in this period (or current totals if no snapshot yet).{" "}
                        {!activeBenchmarkRange.marketBenchmarkAvailable && competitors.length > 0 ? (
                            <span className="text-chart-4 dark:text-chart-4">
                                Competitor ratings are not loaded yet — run Sync from Google or wait for the
                                next sync.
                            </span>
                        ) : activeBenchmarkRange.marketEndUsedFallback ? (
                            "Some competitors fell back to live totals where snapshots were missing."
                        ) : null}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
                        <div className="min-w-0 rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Your rank (by period rating)</p>
                            <p className="text-xl font-semibold">
                                {activeBenchmarkRange.rank ? `#${activeBenchmarkRange.rank}` : "—"}
                                <span className="text-sm text-muted-foreground">
                                    {" "}
                                    / {activeBenchmarkRange.totalRanked || "—"}
                                </span>
                            </p>
                        </div>
                        <div className="min-w-0 rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Your avg rating ({activeBenchmarkRange.label})</p>
                            <p className="text-xl font-semibold">
                                {activeOwnBusinessInRange.avgRating !== null
                                    ? activeOwnBusinessInRange.avgRating.toFixed(1)
                                    : "—"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {activeOwnBusinessInRange.reviewCount} reviews in period
                            </p>
                        </div>
                        <div className="min-w-0 rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">You vs market end (rating)</p>
                            <p className="text-xl font-semibold">
                                {activeBenchmarkRange.yourAvgVsMarketEnd === null
                                    ? "—"
                                    : `${activeBenchmarkRange.yourAvgVsMarketEnd > 0 ? "+" : ""}${activeBenchmarkRange.yourAvgVsMarketEnd.toFixed(1)}`}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {activeBenchmarkRange.marketBenchmarkAvailable ? (
                                    <>Market end avg {activeBenchmarkRange.marketEndAvgRating.toFixed(1)}</>
                                ) : (
                                    <>Market average unavailable until competitor data syncs</>
                                )}
                            </p>
                        </div>
                        <div className="min-w-0 rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Avg competitor review gain</p>
                            <p className="text-xl font-semibold">
                                {activeBenchmarkRange.marketAvgReviewGain === null
                                    ? "—"
                                    : `${activeBenchmarkRange.marketAvgReviewGain > 0 ? "+" : ""}${Math.round(activeBenchmarkRange.marketAvgReviewGain)}`}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Mean first→last snapshot in {activeBenchmarkRange.label}
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
                <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3 lg:hidden">
                        {competitors.map((competitor) => {
                            const syncing = isSyncing(competitor);
                            const updatedAt = competitor.updated_at ? (
                                <TimeAgo date={competitor.updated_at} />
                            ) : (
                                "—"
                            );
                            const places = activePlacesMetaByCompetitorId[competitor.id];
                            const snap = latestSnapshotByCompetitor.get(competitor.id);
                            const meta = snap?.metadata as
                                | { provider?: string; seeded_on_create?: boolean }
                                | null
                                | undefined;
                            const sourceLabel = (() => {
                                if (meta?.provider) return String(meta.provider);
                                if (snap?.source === "google_places") return "google_places";
                                if (snap?.source === "manual" && meta?.seeded_on_create) return "Pending sync";
                                return snap?.source || "—";
                            })();

                            return (
                                <div
                                    key={`card-${competitor.id}`}
                                    className="min-w-0 rounded-lg border bg-card p-3 shadow-sm sm:p-4"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold leading-snug break-words">
                                                    {competitor.name}
                                                </p>
                                                {syncing ? (
                                                    <Badge variant="secondary" className="flex shrink-0 items-center gap-1">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Syncing…
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            {places?.summary ? (
                                                <p
                                                    className="text-xs leading-relaxed text-muted-foreground"
                                                    title={places.summary}
                                                >
                                                    {places.summary}
                                                </p>
                                            ) : null}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isDeleting === competitor.id}
                                            onClick={() => onDeleteRequest(competitor.id)}
                                            className="mt-0.5 shrink-0 self-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            aria-label={`Remove ${competitor.name}`}
                                        >
                                            {isDeleting === competitor.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-sm">
                                        <div>
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Category
                                            </dt>
                                            <dd className="mt-0.5 text-muted-foreground">
                                                {syncing ? (
                                                    "—"
                                                ) : places?.primaryType ? (
                                                    <span title={places.typesPreview ?? undefined}>
                                                        {places.primaryType}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Avg rating
                                            </dt>
                                            <dd className="mt-0.5">
                                                {syncing ? (
                                                    <span className="text-muted-foreground">—</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Star className="h-3.5 w-3.5 shrink-0 fill-chart-4 text-chart-4" />
                                                        {competitor.average_rating || "—"}
                                                    </span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Reviews
                                            </dt>
                                            <dd className="mt-0.5">
                                                {syncing ? (
                                                    <span className="text-muted-foreground">—</span>
                                                ) : (
                                                    (competitor.total_reviews || 0).toLocaleString()
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Updated
                                            </dt>
                                            <dd className="mt-0.5 text-xs text-muted-foreground">{updatedAt}</dd>
                                        </div>
                                    </dl>
                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                                        {!syncing && places?.websiteUrl ? (
                                            <a
                                                href={places.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                            >
                                                <Globe className="h-3.5 w-3.5 shrink-0" />
                                                Website
                                            </a>
                                        ) : null}
                                        {competitor.google_url ? (
                                            <a
                                                href={competitor.google_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                            >
                                                Maps
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">Maps: N/A</span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        Source: {sourceLabel}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="hidden overflow-x-auto lg:block">
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
                                const places = activePlacesMetaByCompetitorId[competitor.id];
                                
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
                                                        <Star className="h-4 w-4 text-chart-4 fill-chart-4 mr-1" />
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
                                                onClick={() => onDeleteRequest(competitor.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                    </div>
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
                    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-3">
                        {movementCards.map((m) => {
                            const hasData = m.hasBaseline && m.ratingDelta !== null && m.reviewsDelta !== null;
                            const ratingUp = (m.ratingDelta ?? 0) > 0;
                            const reviewsUp = (m.reviewsDelta ?? 0) > 0;
                            return (
                                <div key={m.competitorId} className="min-w-0 rounded-lg border bg-card p-3">
                                    <p className="mb-2 break-words text-sm font-semibold">{m.name}</p>
                                    {!hasData ? (
                                        <p className="text-xs text-muted-foreground">
                                            Need at least two snapshots in this range to compute movement.
                                        </p>
                                    ) : (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Rating change</span>
                                                <span className="inline-flex items-center gap-1 font-medium">
                                                    {ratingUp ? <ArrowUp className="h-3 w-3 text-chart-2" /> : (m.ratingDelta ?? 0) < 0 ? <ArrowDown className="h-3 w-3 text-sync-action" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                                                    {(m.ratingDelta ?? 0).toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Review change</span>
                                                <span className="inline-flex items-center gap-1 font-medium">
                                                    {reviewsUp ? <ArrowUp className="h-3 w-3 text-chart-2" /> : (m.reviewsDelta ?? 0) < 0 ? <ArrowDown className="h-3 w-3 text-sync-action" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
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

            {latestInsightByCompetitor.size > 0 && (
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>AI Competitor Insights</CardTitle>
                    <CardDescription>
                        Latest AI-generated insights from recent competitor movement.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {competitors
                                .map((c) => ({ competitor: c, insight: latestInsightByCompetitor.get(c.id) }))
                                .filter((row) => !!row.insight)
                                .map(({ competitor, insight }) => {
                                    if (!insight) return null;
                                    return (
                                        <div key={insight.id} className="min-w-0 rounded-lg border bg-card p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="break-words text-sm font-semibold">{competitor.name}</p>
                                                <Badge variant={priorityBadgeVariant(insight.priority)} className="w-fit shrink-0">
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
                </CardContent>
            </Card>
            )}

            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Competitor Events ({rangeLabel})</CardTitle>
                    <CardDescription>
                        Event timeline generated from competitor monitoring workflows.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeEventRows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No events recorded in this period yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {activeEventRows.slice(0, 20).map((event) => {
                                const competitorName =
                                    competitors.find((c) => c.id === event.competitor_id)?.name || "Competitor";
                                return (
                                    <div key={event.id} className="min-w-0 rounded-lg border p-3">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                                            <p className="min-w-0 flex-1 break-words text-sm font-medium leading-snug">
                                                {event.title || event.event_type}
                                            </p>
                                            <span className="shrink-0 text-xs text-muted-foreground">
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
        </>
    );
}
