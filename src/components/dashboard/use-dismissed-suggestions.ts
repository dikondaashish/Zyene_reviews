"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safe-storage";

/** Dismissed suggestion titles, kept in this browser so they stay hidden after a reload. */
const DISMISSED_KEY = "zyene:smart-insights:dismissed";
const MAX_DISMISSED = 100;

function readDismissed(): string[] {
    try {
        const parsed: unknown = JSON.parse(safeLocalStorageGet(DISMISSED_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
    } catch {
        return [];
    }
}

/** Indices of `suggestions` the user dismissed, and a handler that dismisses one by index. */
export function useDismissedSuggestions(suggestions: ReadonlyArray<{ title: string }> | undefined) {
    // Suggestions are fetched client-side after mount, so the server render never shows
    // any and reading storage up front cannot cause a hydration mismatch.
    const [dismissedTitles, setDismissedTitles] = useState<Set<string>>(
        () => new Set(typeof window === "undefined" ? [] : readDismissed()),
    );

    const dismissedIndices = useMemo(() => {
        const indices = new Set<number>();
        (suggestions ?? []).forEach((suggestion, i) => {
            if (dismissedTitles.has(suggestion.title)) indices.add(i);
        });
        return indices;
    }, [suggestions, dismissedTitles]);

    const handleDismiss = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const title = suggestions?.[index]?.title;
        if (!title) return;
        setDismissedTitles((prev) => {
            const next = new Set(prev);
            next.add(title);
            safeLocalStorageSet(DISMISSED_KEY, JSON.stringify([...next].slice(-MAX_DISMISSED)));
            return next;
        });
        toast.success("Suggestion dismissed", { description: "It won't show again on this device." });
    };

    return { dismissedIndices, handleDismiss };
}
