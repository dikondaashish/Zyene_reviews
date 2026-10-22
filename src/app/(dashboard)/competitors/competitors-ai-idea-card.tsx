"use client";

import { ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiIdea } from "@/lib/competitors/ai-ideas";

const LEVEL = {
    high: { label: "Act soon", dot: "bg-destructive", text: "text-destructive" },
    medium: { label: "Worth a look", dot: "bg-warning", text: "text-warning-foreground" },
    low: { label: "No action", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
} as const;

function titleCase(value: string): string {
    const v = value.trim().toLowerCase();
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
}

export function Stat({ rating, newReviews, period }: { rating: number | null; newReviews: number | null; period: string }) {
    return (
        <span className="inline-flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
            {rating ? (
                <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                    <Star className="size-3 fill-current text-warning" strokeWidth={0} aria-hidden />
                    {rating.toFixed(1)}
                </span>
            ) : null}
            {newReviews != null ? <span>{newReviews > 0 ? `+${newReviews}` : newReviews} in {period.toLowerCase()}</span> : null}
        </span>
    );
}

/** One competitor move: what happened in a line, the one thing to do, everything else folded. */
export function CompetitorsAiIdeaCard({ idea, rating, newReviews, period }: { idea: AiIdea; rating: number | null; newReviews: number | null; period: string }) {
    const level = LEVEL[idea.level];
    const hasMore = Boolean(idea.whyItMatters || idea.moreSteps.length || idea.ownerSuggestion);
    return (
        <li className="min-w-0 rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", level.text)}>
                    <span className={cn("size-2 rounded-full", level.dot)} aria-hidden />
                    {level.label}
                </span>
                <span className="ui-card-title text-foreground">{idea.competitorName}</span>
                <Stat rating={rating} newReviews={newReviews} period={period} />
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground">{idea.headline}</p>
            {idea.doThis ? (
                <p className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm font-medium text-foreground">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {idea.doThis}
                </p>
            ) : null}
            {hasMore ? (
                <details className="group mt-2 text-sm">
                    <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Why, and more steps</span>
                        <span className="hidden group-open:inline">Hide details</span>
                    </summary>
                    <div className="mt-2 space-y-2 text-muted-foreground">
                        {idea.whyItMatters ? <p>{idea.whyItMatters}</p> : null}
                        {idea.moreSteps.length ? (
                            <ul className="list-disc space-y-1 pl-5">{idea.moreSteps.map((s) => <li key={s}>{s}</li>)}</ul>
                        ) : null}
                        {idea.ownerSuggestion ? <p className="text-xs">Best handled by: {titleCase(idea.ownerSuggestion)}</p> : null}
                    </div>
                </details>
            ) : null}
        </li>
    );
}
