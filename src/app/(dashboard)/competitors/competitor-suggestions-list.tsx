"use client";

import { ExternalLink, Loader2, MapPin, Plus, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompetitorSuggestion } from "@/lib/competitors/competitor-suggestion-types";
import type { SuggestionsState } from "./use-competitor-suggestions";

export function suggestionMeta(s: CompetitorSuggestion): string[] {
    const parts = [`${s.reviews.toLocaleString("en-US")} ${s.reviews === 1 ? "review" : "reviews"}`];
    if (s.distanceMiles !== null) parts.push(s.distanceMiles < 0.1 ? "Next door" : `${s.distanceMiles} mi away`);
    return parts;
}

function SuggestionRow({ s, busy, disabled, onTrack }: {
    s: CompetitorSuggestion; busy: boolean; disabled: boolean; onTrack: () => void;
}) {
    return (
        <li className="flex min-w-0 items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden="true">
                <MapPin className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
                <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-foreground hover:text-primary hover:underline">
                    <span className="truncate">{s.name}</span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">(opens Google Maps)</span>
                </a>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {s.rating !== null && <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                        <Star className="size-3 text-chart-4" aria-hidden="true" />{s.rating.toFixed(1)}
                    </span>}
                    {suggestionMeta(s).map((part) => <span key={part}>{part}</span>)}
                </p>
                {s.address && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={s.address}>{s.address}</p>}
            </div>
            <Button size="sm" className="shrink-0" onClick={onTrack} disabled={disabled} aria-label={`Track ${s.name}`}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                {busy ? "Adding…" : "Track"}
            </Button>
        </li>
    );
}

const MESSAGES = {
    no_listing: "Connect your Google Business Profile or add your Google review link in Settings, and we'll suggest businesses like yours nearby.",
    unavailable: "Suggestions aren't available right now. You can still add a competitor by name.",
    empty: "We couldn't find more businesses like yours nearby. You can still add one by name.",
};

/** Nearby look-alike businesses with a one-click Track button; loading, error and empty states included. */
export function CompetitorSuggestionsList({ state, trackingId, onTrack, onRetry, limit }: {
    state: SuggestionsState;
    trackingId: string | null;
    onTrack: (s: CompetitorSuggestion) => void;
    onRetry: () => void;
    limit?: number;
}) {
    if (state.status === "idle" || state.status === "loading") {
        return (
            <ul aria-busy="true" aria-label="Finding businesses like yours" className="divide-y divide-border">
                {Array.from({ length: limit ?? 3 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                        <Skeleton className="size-10 rounded-lg" />
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                        <Skeleton className="h-8 w-20" />
                    </li>
                ))}
            </ul>
        );
    }
    if (state.status === "error") {
        return (
            <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-muted-foreground">
                <p>We couldn&apos;t load suggestions.</p>
                <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Try again</Button>
            </div>
        );
    }
    const shown = state.suggestions.slice(0, limit);
    if (shown.length === 0) {
        return <p className="py-6 text-center text-sm text-muted-foreground">{MESSAGES[state.reason ?? "empty"]}</p>;
    }
    return (
        <ul className="divide-y divide-border" aria-label="Suggested competitors">
            {shown.map((s) => (
                <SuggestionRow key={s.placeId} s={s} busy={trackingId === s.placeId} disabled={trackingId !== null} onTrack={() => onTrack(s)} />
            ))}
        </ul>
    );
}
