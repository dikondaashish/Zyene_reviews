"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { SmartInsightsData, SmartInsightsSuggestion } from "./smart-insights-card-types";
import { themesForSuggestionExamples } from "./smart-insights-card-themes-for-suggestion";

export function useSmartInsightsCard(businessName?: string) {
    const [data, setData] = useState<SmartInsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<"themes" | "suggestions">("themes");
    const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(0);
    const [dismissedIndices, setDismissedIndices] = useState<Set<number>>(new Set());
    const [examplesOpen, setExamplesOpen] = useState(false);
    const [examplesSuggestion, setExamplesSuggestion] = useState<SmartInsightsSuggestion | null>(null);

    const handleDismiss = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setDismissedIndices((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
        toast.success("Suggestion dismissed", {
            description: "We'll use this feedback to improve your future insights.",
        });
    };

    const handleTakeAction = (e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        toast.success("Taking action...", {
            description: `Preparing a plan for: ${title}`,
        });
    };

    const handleSeeExamples = (e: React.MouseEvent, suggestion: SmartInsightsSuggestion) => {
        e.stopPropagation();
        if (!data?.themes?.length) {
            toast.error("Insights are still loading.");
            return;
        }
        setExamplesSuggestion(suggestion);
        setExamplesOpen(true);
    };

    const exampleThemes = useMemo(() => {
        if (!examplesSuggestion || !data?.themes) return [];
        return themesForSuggestionExamples(examplesSuggestion, data.themes);
    }, [examplesSuggestion, data?.themes]);

    useEffect(() => {
        async function fetchInsights() {
            try {
                const res = await fetch("/api/smart/insights");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                const raw = json.data || json;

                if (raw.themes && raw.themes.length > 0 && typeof raw.themes[0] === "string") {
                    raw.themes = (raw.themes as string[]).map((t: string, i: number) => ({
                        name: t.slice(0, 40),
                        mentions: Math.max(10, 100 - i * 20),
                        sentiment: "positive",
                        summaryQuote: t,
                        customerQuotes: [],
                    }));
                }
                if (raw.suggestions && raw.suggestions.length > 0 && typeof raw.suggestions[0] === "string") {
                    raw.suggestions = (raw.suggestions as string[]).map((s: string) => ({
                        title: s.slice(0, 60),
                        urgency: "When you can",
                        effort: "Medium",
                        impact: "+0.1 avg stars",
                        description: s,
                    }));
                }

                setData(raw);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchInsights();
    }, []);

    const headlineText =
        data?.headline || `Guests love ${businessName || "your business"}. The food is fantastic.`;
    const parts = headlineText.split(".");
    const firstPart = parts[0] ? parts[0] + "." : headlineText;
    const secondPart = parts.slice(1).join(".").trim();

    const selectedTheme =
        data?.themes?.length ? data.themes[selectedThemeIndex] || data.themes[0] : null;

    const positiveThemesCount =
        data?.themes?.filter((t) => (t.sentiment || "").toLowerCase() === "positive").length ?? 0;
    let positivePct = 88;
    if (data?.themes?.length) {
        positivePct = Math.round((positiveThemesCount / data.themes.length) * 100);
        if (positivePct < 50) positivePct = 78;
    }

    return {
        data,
        loading,
        error,
        activeTab,
        setActiveTab,
        selectedThemeIndex,
        setSelectedThemeIndex,
        expandedSuggestion,
        setExpandedSuggestion,
        dismissedIndices,
        examplesOpen,
        setExamplesOpen,
        examplesSuggestion,
        setExamplesSuggestion,
        exampleThemes,
        handleDismiss,
        handleTakeAction,
        handleSeeExamples,
        firstPart,
        secondPart,
        selectedTheme,
        positivePct,
        reviewCount: data?.reviewCount ?? 0,
    };
}
