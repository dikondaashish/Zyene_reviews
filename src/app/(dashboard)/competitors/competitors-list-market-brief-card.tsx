"use client";

import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/ui/time-ago";
import { BRIEF_STALE_DAYS, briefAgeDays } from "@/lib/competitors/ai-ideas";
import type { Scoreboard } from "@/lib/competitors/scoreboard";
import { CompetitorsBriefGlance } from "./competitors-brief-glance";
import type { Competitor, CompetitorMarketBriefLatest } from "./competitors-types";

type CompetitorsListMarketBriefCardProps = {
    competitors: Competitor[];
    marketBriefLatest: CompetitorMarketBriefLatest | null;
    briefGenLoading: boolean;
    onGenerateMarketBrief: () => void;
    scoreboard: Scoreboard;
    keywordDiscoverySplit: { discoveryPct: number; directPct: number };
};

/** Numbers first, then the AI's moves; its full reasoning is one click away for whoever wants it. */
export function CompetitorsListMarketBriefCard({
    competitors, marketBriefLatest: brief, briefGenLoading, onGenerateMarketBrief, scoreboard, keywordDiscoverySplit,
}: CompetitorsListMarketBriefCardProps) {
    if (competitors.length === 0) return null;
    const stale = brief ? briefAgeDays(brief.created_at, new Date()) > BRIEF_STALE_DAYS : false;
    const generate = (
        <Button type="button" variant={stale || !brief ? "default" : "secondary"} size="sm" className="shrink-0"
            disabled={briefGenLoading} onClick={() => void onGenerateMarketBrief()}>
            {briefGenLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {brief ? "Refresh summary" : "Write my summary"}
        </Button>
    );

    return (
        <section aria-labelledby="brief-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                    <h2 id="brief-title" className="ui-section-title text-foreground">How you stand out</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Where you win, where they lead, and what to try next.</p>
                </div>
                {generate}
            </header>

            <div className="space-y-5 p-5 sm:p-6">
                <CompetitorsBriefGlance scoreboard={scoreboard} split={keywordDiscoverySplit} />

                {!brief ? (
                    <p className="text-sm text-muted-foreground">Ask AI to turn these numbers into a few concrete moves for your business.</p>
                ) : (
                    <>
                        {stale ? (
                            <p className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                                <span>This AI summary was written <TimeAgo date={brief.created_at} />, so its numbers may be out of date. Refresh it for today&apos;s picture.</span>
                            </p>
                        ) : null}

                        {brief.opportunity_actions.length > 0 ? (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try this</p>
                                <ol className="mt-2 grid gap-3 md:grid-cols-2">
                                    {brief.opportunity_actions.map((a, i) => (
                                        <li key={`${brief.id}-a-${i}`} className="flex gap-3 rounded-lg border bg-card p-3">
                                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-hidden>{i + 1}</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                                                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{a.detail}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ) : null}

                        {/* Open by default so the reasoning is visible; the owner can still hide it. */}
                        <details open className="group rounded-lg bg-muted/40 px-4 py-3 text-sm">
                            <summary className="cursor-pointer list-none font-medium text-foreground [&::-webkit-details-marker]:hidden">
                                <span className="group-open:hidden">Read the AI&apos;s reasoning</span>
                                <span className="hidden group-open:inline">Hide the AI&apos;s reasoning</span>
                            </summary>
                            <div className="mt-3 space-y-3 text-muted-foreground">
                                <p className="font-medium text-foreground">{brief.headline}</p>
                                <p>{brief.overview}</p>
                                {brief.positioning_bullets.length > 0 ? (
                                    <ul className="list-disc space-y-1 pl-5">
                                        {brief.positioning_bullets.map((b, i) => <li key={`${brief.id}-b-${i}`}>{b}</li>)}
                                    </ul>
                                ) : null}
                            </div>
                        </details>

                        <p className="text-xs text-muted-foreground">
                            Written by AI <TimeAgo date={brief.created_at} /> from public Google listings and your own search terms. Check it against what you know.
                        </p>
                    </>
                )}
            </div>
        </section>
    );
}
