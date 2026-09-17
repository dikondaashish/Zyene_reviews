import { ChevronRight } from "lucide-react";
import type { SmartInsightsTheme } from "@/components/dashboard/smart-insights-card-types";

interface SmartInsightsCardThemesTabProps {
    themes: SmartInsightsTheme[];
    selectedThemeIndex: number;
    onSelectTheme: (index: number) => void;
    selectedTheme: SmartInsightsTheme;
}

export function SmartInsightsCardThemesTab({
    themes,
    selectedThemeIndex,
    onSelectTheme,
    selectedTheme,
}: SmartInsightsCardThemesTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
            <div className="md:col-span-2 flex flex-col gap-2">
                {themes.map((theme, i) => (
                    <button
                        type="button"
                        key={i}
                        aria-pressed={selectedThemeIndex === i}
                        onClick={() => onSelectTheme(i)}
                        className={`w-full text-left p-3.5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-xl border transition-all flex items-center justify-between ${
                            selectedThemeIndex === i
                                ? "bg-card border-primary shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]"
                                : "bg-transparent border-transparent hover:bg-secondary"
                        }`}
                    >
                        <div className="flex items-center gap-3 flex-wrap">
                            <div
                                className={`rounded-full shrink-0 ${ (theme.sentiment || "").toLowerCase() === "negative" ? "bg-destructive" : (theme.sentiment || "").toLowerCase() === "neutral" ? "bg-warning" : "bg-success" } size-2`}
                            />
                            <div>
                                <p className="text-[13px] font-bold text-foreground leading-none">{theme.name}</p>
                                <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">
                                    {theme.mentions} mentions
                                </p>
                            </div>
                        </div>
                        {selectedThemeIndex === i && <ChevronRight className="text-muted-foreground/50 size-4" />}
                    </button>
                ))}
            </div>

            <div className="md:col-span-3 bg-card rounded-xl p-6 lg:p-7 shadow-sm border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            (selectedTheme.sentiment || "").toLowerCase() === "negative"
                                ? "bg-destructive/10 text-destructive"
                                : (selectedTheme.sentiment || "").toLowerCase() === "neutral"
                                  ? "bg-warning/10 text-warning-foreground"
                                  : "bg-success/10 text-success"
                        }`}
                    >
                        {(selectedTheme.sentiment || "").toLowerCase() === "negative"
                            ? "Needs fixing"
                            : (selectedTheme.sentiment || "").toLowerCase() === "neutral"
                              ? "Mixed"
                              : "Guests love it"}
                    </span>
                    <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground">
                        {selectedTheme.mentions} mentions
                    </span>
                </div>

                <p className="text-lg font-sans text-foreground leading-snug mb-8">
                    &ldquo;{selectedTheme.summaryQuote}&rdquo;
                </p>

                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    WHAT GUESTS ARE SAYING
                </p>

                <div className="space-y-3">
                    {selectedTheme.customerQuotes?.map((q, idx) => (
                        <div
                            key={idx}
                            className="bg-canvas-elevated border border-border/60 rounded-lg p-3.5 pr-4 pl-4 text-[13px] text-foreground/80 leading-relaxed shadow-sm"
                        >
                            {q}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
