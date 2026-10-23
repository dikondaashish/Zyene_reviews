"use client";

import { CircleCheck, Sparkles } from "lucide-react";
import { TimeAgo } from "@/components/ui/time-ago";
import type { Scoreboard } from "@/lib/competitors/scoreboard";
import { groupAiIdeas } from "@/lib/competitors/ai-ideas";
import type { Competitor, CompetitorInsight } from "./competitors-types";
import { CompetitorsAiIdeaCard, Stat } from "./competitors-ai-idea-card";

/** Scan-first: what to act on, then one quiet line for every competitor that only needs watching. */
export function CompetitorsAiIdeas({ competitors, latestInsightByCompetitor, scoreboard, rangeLabel }: {
    competitors: Competitor[];
    latestInsightByCompetitor: Map<string, CompetitorInsight>;
    scoreboard: Scoreboard;
    rangeLabel: string;
}) {
    const inputs = competitors.flatMap((c) => {
        const i = latestInsightByCompetitor.get(c.id);
        return i ? [{
            id: i.id, competitorId: c.id, competitorName: c.name, priority: i.priority || "low", summary: i.summary,
            whyItMatters: i.why_it_matters ?? null, ownerSuggestion: i.owner_suggestion ?? null,
            actions: Array.isArray(i.actions) ? i.actions : [], recommendations: Array.isArray(i.recommendations) ? i.recommendations : [],
            confidence: i.confidence, createdAt: i.created_at,
        }] : [];
    });
    if (inputs.length === 0) return null;

    const { actNow, noAction } = groupAiIdeas(inputs);
    const row = (id: string) => scoreboard.rows.find((r) => r.id === id);
    const latest = inputs.map((i) => i.createdAt).sort().at(-1);

    return (
        <section aria-labelledby="ai-ideas-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <h2 id="ai-ideas-title" className="ui-section-title flex items-center gap-2 text-foreground">
                    <Sparkles className="size-4 text-primary" aria-hidden />Ideas from AI
                </h2>
                {latest ? <span className="text-xs text-muted-foreground">Updated <TimeAgo date={latest} /></span> : null}
            </header>

            <div className="space-y-4 p-5 sm:p-6">
                {actNow.length > 0 ? (
                    <ul className="grid gap-3 lg:grid-cols-2">
                        {actNow.map((idea) => (
                            <CompetitorsAiIdeaCard key={idea.id} idea={idea} rating={row(idea.competitorId)?.rating ?? null} newReviews={row(idea.competitorId)?.newReviews ?? null} period={rangeLabel} />
                        ))}
                    </ul>
                ) : null}

                {noAction.length > 0 ? (
                    <div className="rounded-lg bg-muted/40 px-4 py-3">
                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <CircleCheck className="size-4 text-success" aria-hidden />
                            {actNow.length === 0 ? "Nothing to act on from the latest daily check" : "No action needed for the rest"}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                            {noAction.map((idea) => (
                                <li key={idea.id} className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs" title={idea.headline}>
                                    <span className="font-medium text-foreground">{idea.competitorName}</span>
                                    <Stat rating={row(idea.competitorId)?.rating ?? null} newReviews={row(idea.competitorId)?.newReviews ?? null} period={rangeLabel} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
