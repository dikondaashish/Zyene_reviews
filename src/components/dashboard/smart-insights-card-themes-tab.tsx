import { ChevronRight } from "lucide-react";
import type { SmartInsightsTheme } from "./smart-insights-card-types";

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
                        onClick={() => onSelectTheme(i)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                            selectedThemeIndex === i
                                ? "bg-white border-primary/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] dark:bg-[rgb(51,65,85)] dark:border-primary/35"
                                : "bg-white/40 border-transparent hover:bg-white/60 dark:bg-[rgb(30,41,59)]/80 dark:hover:bg-[rgb(51,65,85)]"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-full shrink-0 ${ (theme.sentiment || "").toLowerCase() === "negative" ? "bg-[rgb(218,84,59)]" : (theme.sentiment || "").toLowerCase() === "neutral" ? "bg-[rgb(216,163,108)]" : "bg-[rgb(64,86,66)]" } size-2`}
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

            <div className="md:col-span-3 bg-white rounded-[20px] p-6 lg:p-7 shadow-sm border border-border/40 dark:bg-[rgb(30,41,59)] dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            (selectedTheme.sentiment || "").toLowerCase() === "negative"
                                ? "bg-[rgba(218,84,59,0.1)] text-[rgb(218,84,59)]"
                                : (selectedTheme.sentiment || "").toLowerCase() === "neutral"
                                  ? "bg-[rgba(216,163,108,0.1)] text-[rgb(216,163,108)]"
                                  : "bg-[rgba(64,86,66,0.1)] text-[rgb(64,86,66)]"
                        }`}
                    >
                        {(selectedTheme.sentiment || "").toLowerCase() === "negative"
                            ? "Needs fixing"
                            : (selectedTheme.sentiment || "").toLowerCase() === "neutral"
                              ? "Mixed"
                              : "Guests love it"}
                    </span>
                    <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(203,213,225)]">
                        {selectedTheme.mentions} mentions
                    </span>
                </div>

                <p className="text-lg font-serif text-foreground leading-snug mb-8">
                    &ldquo;{selectedTheme.summaryQuote}&rdquo;
                </p>

                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    WHAT GUESTS ARE SAYING
                </p>

                <div className="space-y-3">
                    {selectedTheme.customerQuotes?.map((q, idx) => (
                        <div
                            key={idx}
                            className="bg-[rgb(252,250,247)] border-l-[3px] border-[rgba(64,86,66,0.4)] rounded-r-lg p-3.5 pr-4 pl-4 text-[13px] text-foreground/80 leading-relaxed shadow-sm dark:bg-[rgb(15,23,42)] dark:border-[rgba(148,163,184,0.5)] dark:text-[rgb(226,232,240)]"
                        >
                            {q}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
