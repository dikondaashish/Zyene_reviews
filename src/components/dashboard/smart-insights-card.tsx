"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Lightbulb, Loader2 } from "lucide-react";

interface InsightsData {
    themes: string[];
    suggestions: string[];
    reviewCount: number;
    message?: string;
}

export function SmartInsightsCard() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showAllThemes, setShowAllThemes] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    useEffect(() => {
        async function fetchInsights() {
            try {
                const res = await fetch("/api/smart/insights");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                // apiOk wraps as { success, data: { ... } }
                setData(json.data || json);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchInsights();
    }, []);

    if (error) return null; // Silently hide if AI fails
    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-foreground">Smart Review Insights</h3>
                        <p className="text-sm text-muted-foreground">Analyzing your reviews...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                </div>
            </div>
        );
    }

    if (!data || data.themes.length === 0) return null; // No insights available

    const visibleThemes = showAllThemes ? data.themes : data.themes.slice(0, 1);
    const visibleSuggestions = showAllSuggestions
        ? data.suggestions
        : data.suggestions.slice(0, 1);

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-foreground">Smart Review Insights</h3>
                        <p className="text-sm text-muted-foreground">
                            {data.reviewCount} reviews analyzed · all time
                        </p>
                    </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">
                    Smart
                </span>
            </div>

            {/* Key Themes */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Key Themes
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {visibleThemes.map((theme, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />
                            <span className="text-sm text-foreground leading-relaxed">{theme}</span>
                        </li>
                    ))}
                </ul>
                {data.themes.length > 1 && (
                    <button
                        type="button"
                        className="mt-3 text-sm text-primary hover:underline"
                        onClick={() => setShowAllThemes((prev) => !prev)}
                    >
                        {showAllThemes ? "Show less" : "Read more"}
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-5" />

            {/* Suggestions */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-chart-4" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Suggestions
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {visibleSuggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-chart-4 flex-shrink-0" />
                            <span className="text-sm text-foreground leading-relaxed">{suggestion}</span>
                        </li>
                    ))}
                </ul>
                {data.suggestions.length > 1 && (
                    <button
                        type="button"
                        className="mt-3 text-sm text-primary hover:underline"
                        onClick={() => setShowAllSuggestions((prev) => !prev)}
                    >
                        {showAllSuggestions ? "Show less" : "Read more"}
                    </button>
                )}
            </div>
        </div>
    );
}
