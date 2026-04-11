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
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-slate-900">Smart Review Insights</h3>
                        <p className="text-sm text-slate-400">Analyzing your reviews...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
            </div>
        );
    }

    if (!data || data.themes.length === 0) return null; // No insights available

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-slate-900">Smart Review Insights</h3>
                        <p className="text-sm text-slate-400">
                            {data.reviewCount} reviews analyzed · all time
                        </p>
                    </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                    Smart
                </span>
            </div>

            {/* Key Themes */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Key Themes
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {data.themes.map((theme, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 leading-relaxed">{theme}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-5" />

            {/* Suggestions */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Suggestions
                    </span>
                </div>
                <ul className="space-y-2.5">
                    {data.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 leading-relaxed">{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
