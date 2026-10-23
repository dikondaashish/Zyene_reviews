"use client";

import { useEffect } from "react";
import { Target } from "lucide-react";
import { AddCompetitorDialog } from "@/app/(dashboard)/competitors/add-competitor-dialog";
import type { Competitor } from "@/app/(dashboard)/competitors/competitors-types";
import { CompetitorSuggestionsList } from "./competitor-suggestions-list";
import { useCompetitorSuggestions } from "./use-competitor-suggestions";

/** No competitors yet: suggest nearby businesses like this one, so owners who don't know who to track can start in one click. */
export function CompetitorsListEmptyState({ businessId, onAddCompetitor }: {
    businessId: string; onAddCompetitor: (newCompetitor: Competitor) => void;
}) {
    const { state, load, track, trackingId } = useCompetitorSuggestions(businessId, onAddCompetitor);
    useEffect(() => { void load(); }, [load]);

    return (
        <section className="min-w-0 rounded-2xl border border-border bg-card px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Target aria-hidden="true" className="size-6" />
                </div>
                <h2 className="ui-section-title text-foreground">Compare your business with the local competition</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Track nearby businesses to compare ratings, review volume, and recent growth.
                </p>
            </div>
            <div className="mx-auto mt-6 w-full max-w-2xl">
                <h3 className="ui-card-title text-foreground">Businesses like yours nearby</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Same Google category, most-reviewed first.</p>
                <div className="mt-2 border-t border-border">
                    <CompetitorSuggestionsList state={state} trackingId={trackingId} onTrack={track} onRetry={() => void load(true)} limit={3} />
                </div>
                <div className="mt-4 flex flex-col items-center gap-3 border-t border-border pt-5 text-center sm:flex-row sm:justify-between sm:text-left">
                    <p className="text-sm text-muted-foreground">Know who you compete with?</p>
                    <AddCompetitorDialog businessId={businessId} onSuccess={onAddCompetitor} />
                </div>
            </div>
        </section>
    );
}
