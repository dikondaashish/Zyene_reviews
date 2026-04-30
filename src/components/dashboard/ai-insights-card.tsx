"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Lightbulb, Loader2 } from "lucide-react";

interface InsightsData {
    themes: string[];
    suggestions: string[];
    reviewCount: number;
    message?: string;
}

export function AiInsightsCard() {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchInsights() {
            try {
                const res = await fetch("/api/ai/insights");
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
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">AI Review Insights</h3>
                        <p className="text-sm text-muted-foreground">Analyzing your reviews...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!data || data.themes.length === 0) return null; // No insights available

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">AI Review Insights</h3>
                        <p className="text-sm text-muted-foreground">
                            {data.reviewCount} reviews analyzed · all time
                        </p>
                    </div>
                </div>
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    AI
                </span>
            </div>

            {/* Key Themes */}
            <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Key Themes
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {data.themes.map((theme, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-chart-1" />
                            <span className="text-sm leading-relaxed text-foreground">{theme}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Divider */}
            <div className="my-5 border-t border-border" />

            {/* Suggestions */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Suggestions
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {data.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-chart-4" />
                            <span className="text-sm leading-relaxed text-foreground">{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
