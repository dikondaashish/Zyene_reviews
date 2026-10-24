"use client";

import { useEffect, useState } from "react";
import type { BusinessPlaceMatch } from "@/services/places/places-business-search";

export const BUSINESS_SEARCH_MIN_CHARS = 3;
const DEBOUNCE_MS = 350;

/** Google matches for what the owner is typing; waits for a pause so each word isn't a request. */
export function useBusinessPlaceSearch(query: string, country: string, enabled: boolean) {
    const [matches, setMatches] = useState<BusinessPlaceMatch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const q = query.trim();
    const active = enabled && q.length >= BUSINESS_SEARCH_MIN_CHARS;

    useEffect(() => {
        if (!active) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            fetch(`/api/places/business-search?q=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}`, { signal: controller.signal })
                .then(async (res) => {
                    const body = (await res.json().catch(() => ({}))) as { matches?: BusinessPlaceMatch[]; error?: string };
                    setMatches(res.ok ? body.matches ?? [] : []);
                    setError(res.ok ? null : body.error || "Search is unavailable right now.");
                })
                .catch((err: unknown) => {
                    if (err instanceof DOMException && err.name === "AbortError") return;
                    setError("Search is unavailable right now.");
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, DEBOUNCE_MS);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [active, q, country]);

    return { matches: active ? matches : [], loading: active && loading, error: active ? error : null };
}
