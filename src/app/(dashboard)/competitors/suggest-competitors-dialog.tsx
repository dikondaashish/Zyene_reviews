"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Competitor } from "./competitors-types";
import { CompetitorSuggestionsList } from "./competitor-suggestions-list";
import { useCompetitorSuggestions } from "./use-competitor-suggestions";

/** For owners already tracking someone: more nearby businesses like theirs, loaded when first opened. */
export function SuggestCompetitorsDialog({ businessId, onAddCompetitor }: {
    businessId: string; onAddCompetitor: (newCompetitor: Competitor) => void;
}) {
    const [open, setOpen] = useState(false);
    const { state, load, track, trackingId } = useCompetitorSuggestions(businessId, onAddCompetitor);

    return (
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) void load(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Sparkles className="md:mr-2 size-4" aria-hidden="true" />
                    Suggest competitors
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Businesses like yours nearby</DialogTitle>
                    <DialogDescription>Same Google category, most-reviewed first. Ones you already track are left out.</DialogDescription>
                </DialogHeader>
                <div className="border-t border-border">
                    <CompetitorSuggestionsList state={state} trackingId={trackingId} onTrack={track} onRetry={() => void load(true)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
