"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CompetitorMovementRow } from "@/lib/competitors/snapshot-movement";

export function CompetitorsTableMovementSection({
    movementCards,
    rangeLabel,
}: {
    movementCards: CompetitorMovementRow[];
    rangeLabel: string;
}) {
    return (
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
                        const hasData =
                            m.hasBaseline && m.ratingDelta !== null && m.reviewsDelta !== null;
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
                                                {ratingUp ? (
                                                    <ArrowUp className="h-3 w-3 text-chart-2" />
                                                ) : (m.ratingDelta ?? 0) < 0 ? (
                                                    <ArrowDown className="h-3 w-3 text-sync-action" />
                                                ) : (
                                                    <Minus className="h-3 w-3 text-muted-foreground" />
                                                )}
                                                {(m.ratingDelta ?? 0).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Review change</span>
                                            <span className="inline-flex items-center gap-1 font-medium">
                                                {reviewsUp ? (
                                                    <ArrowUp className="h-3 w-3 text-chart-2" />
                                                ) : (m.reviewsDelta ?? 0) < 0 ? (
                                                    <ArrowDown className="h-3 w-3 text-sync-action" />
                                                ) : (
                                                    <Minus className="h-3 w-3 text-muted-foreground" />
                                                )}
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
    );
}
