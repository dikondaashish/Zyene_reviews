"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeAgo } from "@/components/ui/time-ago";
import type { Competitor, CompetitorInsight } from "./competitors-types";
import { priorityBadgeVariant } from "./competitors-table-priority-badge";

export function CompetitorsTableInsightsSection({
    competitors,
    latestInsightByCompetitor,
}: {
    competitors: Competitor[];
    latestInsightByCompetitor: Map<string, CompetitorInsight>;
}) {
    if (latestInsightByCompetitor.size === 0) {
        return null;
    }

    return (
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
                                        <p className="break-words text-sm font-semibold">
                                            {competitor.name}
                                        </p>
                                        <Badge
                                            variant={priorityBadgeVariant(insight.priority)}
                                            className="w-fit shrink-0"
                                        >
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
                                            Suggested owner:{" "}
                                            {String(insight.owner_suggestion).toUpperCase()}
                                        </p>
                                    ) : null}
                                    {Array.isArray(insight.actions) && insight.actions.length > 0 ? (
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
                                                        Effort: {String(action.effort || "").toUpperCase()}{" "}
                                                        • Priority:{" "}
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
                                                <p
                                                    key={`${insight.id}-${idx}`}
                                                    className="text-xs text-muted-foreground"
                                                >
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
    );
}
