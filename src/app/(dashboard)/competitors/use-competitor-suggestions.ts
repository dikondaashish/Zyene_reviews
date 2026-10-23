"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { addCompetitor } from "@/app/actions/competitor";
import type { CompetitorSuggestion, CompetitorSuggestionsResponse } from "@/lib/competitors/competitor-suggestion-types";
import type { Competitor } from "./competitors-types";

export type SuggestionsState =
    | { status: "idle" } | { status: "loading" } | { status: "error" }
    | { status: "ready"; suggestions: CompetitorSuggestion[]; reason?: CompetitorSuggestionsResponse["reason"] };

/** Loads nearby look-alike businesses once, and tracks one with a click. */
export function useCompetitorSuggestions(businessId: string, onAddCompetitor: (competitor: Competitor) => void) {
    const [state, setState] = useState<SuggestionsState>({ status: "idle" });
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const inFlight = useRef(false);
    const loaded = useRef(false);

    // Stable on purpose: an effect can call it on mount without re-running after every result,
    // so a failed load waits for "Try again" instead of retrying in a loop.
    const load = useCallback(async (force = false) => {
        if (inFlight.current || (loaded.current && !force)) return;
        inFlight.current = true;
        setState({ status: "loading" });
        try {
            const res = await fetch("/api/competitors/suggestions", { cache: "no-store" });
            if (!res.ok) throw new Error(String(res.status));
            const data = (await res.json()) as CompetitorSuggestionsResponse;
            loaded.current = true;
            setState({ status: "ready", suggestions: data.suggestions ?? [], reason: data.reason });
        } catch {
            setState({ status: "error" });
        } finally {
            inFlight.current = false;
        }
    }, []);

    const track = useCallback(async (suggestion: CompetitorSuggestion) => {
        if (trackingId) return;
        setTrackingId(suggestion.placeId);
        try {
            const result = await addCompetitor(businessId, suggestion.name, suggestion.mapsUrl);
            if (!result.success || !result.data) {
                toast.error(result.error || result.fieldError?.message || "Couldn't add competitor. Please try again.");
                return;
            }
            setState((prev) => prev.status === "ready"
                ? { ...prev, suggestions: prev.suggestions.filter((s) => s.placeId !== suggestion.placeId) }
                : prev);
            toast.success(`Now tracking ${suggestion.name}`);
            onAddCompetitor(result.data);
        } finally {
            setTrackingId(null);
        }
    }, [businessId, onAddCompetitor, trackingId]);

    return { state, load, track, trackingId };
}
