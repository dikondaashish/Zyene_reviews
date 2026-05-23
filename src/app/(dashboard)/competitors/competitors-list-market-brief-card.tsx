"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TimeAgo } from "@/components/ui/time-ago";
import type { Competitor, CompetitorMarketBriefLatest } from "./competitors-types";

type CompetitorsListMarketBriefCardProps = {
    competitors: Competitor[];
    marketBriefLatest: CompetitorMarketBriefLatest | null;
    briefGenLoading: boolean;
    onGenerateMarketBrief: () => void;
};

export function CompetitorsListMarketBriefCard({
    competitors,
    marketBriefLatest,
    briefGenLoading,
    onGenerateMarketBrief,
}: CompetitorsListMarketBriefCardProps) {
    return (
            <Card className="min-w-0 border-border bg-canvas-elevated text-foreground">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                    <div className="min-w-0 space-y-1.5">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-chart-4 size-5" />
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
                            onClick={() => void onGenerateMarketBrief()}
                        >
                            {briefGenLoading ? (
                                <Loader2 className="animate-spin md:mr-2 size-4" />
                            ) : (
                                <Sparkles className="md:mr-2 size-4" />
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
    );
}
