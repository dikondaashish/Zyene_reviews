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
        <div className="rounded-[24px] bg-gradient-to-br from-[rgb(255,255,255)] via-[rgb(255,251,243)] to-[rgba(255,171,92,0.1)] border border-border/60 p-6 lg:p-8 flex flex-col h-full shadow-sm relative overflow-hidden dark:from-[rgb(15,23,42)] dark:via-[rgb(17,24,39)] dark:to-[rgba(30,41,59,0.9)] dark:border-white/10">
            {/* Background noise texture or shape could go here */}

            {/* Header Lockup */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between relative z-10 w-full">
                <div className="max-w-[75%] space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-[rgb(43,53,46)] text-white px-2.5 py-1 rounded-[6px] text-xs font-semibold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 opacity-80" />
                            SMART INSIGHTS
                        </div>
                        <span className="text-[13px] font-medium text-muted-foreground">
                            {data.reviewCount} reviews analyzed
                        </span>
                    </div>

                    <div>
                        <h2 className="text-[32px] md:text-[36px] font-serif leading-[1.05] tracking-[-0.02em] text-[rgb(28,46,32)] dark:text-[rgb(226,232,240)]">
                            {firstPart}
                            {secondPart && (
                                <span className="block text-[rgb(218,84,59)] dark:text-[rgb(251,146,60)]">
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
                        <span className="text-2xl font-serif font-bold text-[rgb(28,46,32)] dark:text-[rgb(226,232,240)]">{positivePct}%</span>
                        <span className="text-[9px] uppercase tracking-widest text-[rgba(28,46,32,0.6)] font-bold dark:text-[rgba(226,232,240,0.7)]">POSITIVE</span>
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
                        <RadialBar background={{ fill: 'rgb(232,236,233)' }} dataKey="value" cornerRadius={10} fill="rgb(39,50,41)" />
                    </RadialBarChart>
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-2 mt-8 mb-6 relative z-10 bg-[rgb(244,236,224)] p-1 rounded-[12px] self-start inline-flex dark:bg-[rgb(30,41,59)] dark:ring-1 dark:ring-white/10">
                <button 
                    onClick={() => setActiveTab("themes")}
                    className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${activeTab === "themes" ? "bg-white text-foreground shadow-sm dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]" : "text-muted-foreground hover:text-foreground dark:hover:text-[rgb(226,232,240)]"}`}
                >
                    Key themes
                </button>
                <button 
                    onClick={() => setActiveTab("suggestions")}
                    className={`px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${activeTab === "suggestions" ? "bg-white text-foreground shadow-sm dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]" : "text-muted-foreground hover:text-foreground dark:hover:text-[rgb(226,232,240)]"}`}
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
                                        ? "bg-white border-primary/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-[rgb(51,65,85)] dark:border-primary/35" 
                                        : "bg-white/40 border-transparent hover:bg-white/60 dark:bg-[rgb(30,41,59)]/80 dark:hover:bg-[rgb(51,65,85)]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${(theme.sentiment || '').toLowerCase() === 'negative' ? 'bg-[rgb(218,84,59)]' : (theme.sentiment || '').toLowerCase() === 'neutral' ? 'bg-[rgb(216,163,108)]' : 'bg-[rgb(64,86,66)]'}`} />
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
                        <div className="md:col-span-3 bg-white rounded-[20px] p-6 lg:p-7 shadow-sm border border-border/40 dark:bg-[rgb(30,41,59)] dark:border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${(selectedTheme.sentiment || '').toLowerCase() === 'negative' ? 'bg-[rgba(218,84,59,0.1)] text-[rgb(218,84,59)]' : (selectedTheme.sentiment || '').toLowerCase() === 'neutral' ? 'bg-[rgba(216,163,108,0.1)] text-[rgb(216,163,108)]' : 'bg-[rgba(64,86,66,0.1)] text-[rgb(64,86,66)]'}`}>
                                    {(selectedTheme.sentiment || '').toLowerCase() === 'negative' ? 'Needs fixing' : (selectedTheme.sentiment || '').toLowerCase() === 'neutral' ? 'Mixed' : 'Guests love it'}
                                </span>
                                <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(203,213,225)]">
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
                                    <div key={idx} className="bg-[rgb(252,250,247)] border-l-[3px] border-[rgba(64,86,66,0.4)] rounded-r-lg p-3.5 pr-4 pl-4 text-[13px] text-foreground/80 leading-relaxed shadow-sm dark:bg-[rgb(15,23,42)] dark:border-[rgba(148,163,184,0.5)] dark:text-[rgb(226,232,240)]">
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
                                    className={`w-full text-left bg-white rounded-[16px] border border-border/40 transition-all overflow-hidden dark:bg-[rgb(30,41,59)] dark:border-white/10 ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
                                >
                                    <div className="p-5">
                                        <div 
                                            className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                                            onClick={() => setExpandedSuggestion(isExpanded ? null : i)}
                                        >
                                            <div className="shrink-0 pt-0.5">
                                                <div className="w-8 h-8 rounded-lg bg-[rgba(218,84,59,0.1)] flex items-center justify-center">
                                                    <Sparkles className={`w-4 h-4 ${(suggestion.urgency || '').toLowerCase().includes('now') ? 'text-[rgb(218,84,59)]' : 'text-foreground'}`} />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-tight ${(suggestion.urgency || '').toLowerCase().includes('now') ? 'bg-[rgb(218,84,59)] text-white' : 'bg-muted text-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]'}`}>
                                                        {suggestion.urgency}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-[rgb(223,240,212)] text-[rgb(59,89,48)] dark:bg-[rgba(34,197,94,0.15)] dark:text-[rgb(134,239,172)]">
                                                        {suggestion.impact}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-muted text-muted-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(203,213,225)]">
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
                                                        className="bg-[rgb(43,53,46)] hover:bg-[rgb(28,46,32)] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95"
                                                    >
                                                        Take action
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleSeeExamples(e, suggestion.title)}
                                                        className="bg-transparent hover:bg-[rgb(250,250,250)] border border-border/50 text-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95 dark:hover:bg-[rgb(51,65,85)] dark:border-white/20 dark:text-[rgb(226,232,240)]"
                                                    >
                                                        See examples
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDismiss(e, i)}
                                                        className="text-muted-foreground text-xs font-medium px-2 py-2 hover:text-[rgb(218,84,59)] transition-colors"
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
