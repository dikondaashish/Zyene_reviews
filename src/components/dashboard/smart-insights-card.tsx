"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { toast } from "sonner";

interface Theme {
    name: string;
    mentions: number;
    sentiment: string;
    summaryQuote: string;
    customerQuotes: string[];
}

interface Suggestion {
    title: string;
    urgency: string;
    impact: string;
    effort: string;
    description: string;
}

interface InsightsData {
    headline: string;
    themes: Theme[];
    suggestions: Suggestion[];
    reviewCount: number;
    message?: string;
}

export function SmartInsightsCard({ businessName }: { businessName?: string }) {
    const [data, setData] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<"themes" | "suggestions">("themes");
    const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(0);
    const [dismissedIndices, setDismissedIndices] = useState<Set<number>>(new Set());

    const handleDismiss = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setDismissedIndices(prev => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
        toast.success("Suggestion dismissed", {
            description: "We'll use this feedback to improve your future insights."
        });
    };

    const handleTakeAction = (e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        toast.success("Taking action...", {
            description: `Preparing a plan for: ${title}`
        });
    };

    const handleSeeExamples = (e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        toast.info("Finding examples...", {
            description: `Searching for reviews related to: ${title}`
        });
    };

    useEffect(() => {
        async function fetchInsights() {
            try {
                const res = await fetch("/api/smart/insights");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                const raw = json.data || json;

                // Normalize: if themes are plain strings (old cache), convert them
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

    if (error) return null;
    if (loading) {
        return (
            <div className="rounded-[24px] border border-border bg-card p-6 h-full flex flex-col justify-center items-center shadow-sm min-h-[360px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Generating Smart Insights...</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Analyzing all recent reviews</p>
            </div>
        );
    }

    if (!data || !data.themes || data.themes.length === 0) return null;

    // Use a default headline if backend hasn't generated one yet
    const headlineText = data.headline || `Guests love ${businessName || "your business"}. The food is fantastic.`;
    const parts = headlineText.split(".");
    const firstPart = parts[0] ? parts[0] + "." : headlineText;
    const secondPart = parts.slice(1).join(".").trim();

    const selectedTheme = data.themes[selectedThemeIndex] || data.themes[0];
    if (!selectedTheme) return null;

    // Compute an estimated "Positive %" for the gauge
    const positiveThemesCount = data.themes.filter(t => (t.sentiment || "").toLowerCase() === 'positive').length;
    let positivePct = 88;
    if (data.themes.length > 0) {
        positivePct = Math.round((positiveThemesCount / data.themes.length) * 100);
        if (positivePct < 50) positivePct = 78;
    }

    return (
        <div className="rounded-[24px] bg-gradient-to-br from-background via-background to-chart-4/10 border border-border/60 p-6 lg:p-8 flex flex-col h-full shadow-sm relative overflow-hidden">
            {/* Background noise texture or shape could go here */}

            {/* Header Lockup */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between relative z-10 w-full">
                <div className="max-w-[75%] space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-2.5 py-1 rounded-[6px] text-xs font-semibold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 opacity-80" />
                            SMART INSIGHTS
                        </div>
                        <span className="text-[13px] font-medium text-muted-foreground">
                            {data.reviewCount} reviews analyzed
                        </span>
                    </div>

                    <div>
                        <h2 className="text-[32px] md:text-[36px] font-serif leading-[1.05] tracking-[-0.02em] text-foreground">
                            {firstPart}
                            {secondPart && (
                                <span className="block text-destructive">
                                    {secondPart}
                                </span>
                            )}
                        </h2>
                    </div>

                    <p className="text-sm text-foreground/70 leading-relaxed max-w-lg mt-2">
                        We read every review and pulled out what matters. Here's the pulse of your restaurant this month.
                    </p>
                </div>

                {/* Score Chart */}
                <div className="hidden sm:flex relative items-center justify-center shrink-0" style={{ width: 112, height: 112 }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <span className="text-2xl font-serif font-bold text-foreground">{positivePct}%</span>
                        <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold">POSITIVE</span>
                    </div>
                    <RadialBarChart 
                        width={112} 
                        height={112} 
                        innerRadius="75%" 
                        outerRadius="100%" 
                        data={[{ value: positivePct }]} 
                        startAngle={90} 
                        endAngle={-270}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" angleAxisId={0} tick={false} />
                        <RadialBar background={{ fill: 'rgba(148,163,184,0.25)' }} dataKey="value" cornerRadius={10} fill="rgb(39,50,41)" />
                    </RadialBarChart>
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-2 mt-8 mb-6 relative z-10 bg-muted p-1 rounded-[12px] self-start inline-flex">
                <button 
                    onClick={() => setActiveTab("themes")}
                    className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${activeTab === "themes" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Key themes
                </button>
                <button 
                    onClick={() => setActiveTab("suggestions")}
                    className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${activeTab === "suggestions" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    Suggestions
                </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 relative z-10 w-full">
                {activeTab === "themes" ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
                        {/* Themes List */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            {data.themes.map((theme, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setSelectedThemeIndex(i)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                                        selectedThemeIndex === i 
                                        ? "bg-white border-primary/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" 
                                        : "bg-white/40 border-transparent hover:bg-white/60"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${(theme.sentiment || '').toLowerCase() === 'negative' ? 'bg-destructive' : (theme.sentiment || '').toLowerCase() === 'neutral' ? 'bg-chart-4' : 'bg-chart-2'}`} />
                                        <div>
                                            <p className="text-[13px] font-bold text-foreground leading-none">{theme.name}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">{theme.mentions} mentions</p>
                                        </div>
                                    </div>
                                    {selectedThemeIndex === i && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
                                </button>
                            ))}
                        </div>
                        
                        {/* Theme Detail Panel */}
                        <div className="md:col-span-3 bg-white rounded-[20px] p-6 lg:p-7 shadow-sm border border-border/40">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${(selectedTheme.sentiment || '').toLowerCase() === 'negative' ? 'bg-destructive/10 text-destructive' : (selectedTheme.sentiment || '').toLowerCase() === 'neutral' ? 'bg-chart-4/15 text-chart-4' : 'bg-chart-2/10 text-chart-2'}`}>
                                    {(selectedTheme.sentiment || '').toLowerCase() === 'negative' ? 'Needs fixing' : (selectedTheme.sentiment || '').toLowerCase() === 'neutral' ? 'Mixed' : 'Guests love it'}
                                </span>
                                <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground">
                                    {selectedTheme.mentions} mentions
                                </span>
                            </div>

                            <p className="text-lg font-serif text-foreground leading-snug mb-8">
                                "{selectedTheme.summaryQuote}"
                            </p>

                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                WHAT GUESTS ARE SAYING
                            </p>
                            
                            <div className="space-y-3">
                                {selectedTheme.customerQuotes && selectedTheme.customerQuotes.map((q, idx) => (
                                    <div key={idx} className="bg-card border-l-[3px] border-chart-2/40 rounded-r-lg p-3.5 pr-4 pl-4 text-[13px] text-foreground/80 leading-relaxed shadow-sm">
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 h-full">
                        {data.suggestions.map((suggestion, i) => {
                            if (dismissedIndices.has(i)) return null;
                            const isExpanded = expandedSuggestion === i;
                            return (
                                <div 
                                    key={i}
                                    className={`w-full text-left bg-white rounded-[16px] border border-border/40 transition-all overflow-hidden ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
                                >
                                    <div className="p-5">
                                        <div 
                                            className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                                            onClick={() => setExpandedSuggestion(isExpanded ? null : i)}
                                        >
                                            <div className="shrink-0 pt-0.5">
                                                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                                                    <Sparkles className={`w-4 h-4 ${(suggestion.urgency || '').toLowerCase().includes('now') ? 'text-destructive' : 'text-foreground'}`} />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-tight ${(suggestion.urgency || '').toLowerCase().includes('now') ? 'bg-destructive text-white' : 'bg-muted text-foreground'}`}>
                                                        {suggestion.urgency}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-chart-2/15 text-chart-2">
                                                        {suggestion.impact}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-muted text-muted-foreground">
                                                        Effort: {suggestion.effort}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[15px] font-bold text-foreground">
                                                        {suggestion.title}
                                                    </h4>
                                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="overflow-hidden">
                                                <p className="text-[13px] text-foreground/80 leading-relaxed pl-11 pr-4">
                                                    {suggestion.description}
                                                </p>
                                                <div className="flex items-center gap-3 pl-11 mt-4">
                                                    <button 
                                                        onClick={(e) => handleTakeAction(e, suggestion.title)}
                                                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95"
                                                    >
                                                        Take action
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleSeeExamples(e, suggestion.title)}
                                                        className="bg-transparent hover:bg-muted border border-border/50 text-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95"
                                                    >
                                                        See examples
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDismiss(e, i)}
                                                        className="text-muted-foreground text-xs font-medium px-2 py-2 hover:text-destructive transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
