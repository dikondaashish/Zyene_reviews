import { cn } from "@/lib/utils";
import { themeBarWidths, type Tone } from "@/lib/dashboard/dashboard-visuals";
import { TONE_BG } from "@/components/dashboard/dashboard-mini-visuals";
import type { SmartInsightsTheme } from "@/components/dashboard/smart-insights-card-types";

interface SmartInsightsCardThemesTabProps {
    themes: SmartInsightsTheme[];
    selectedThemeIndex: number;
    onSelectTheme: (index: number) => void;
    selectedTheme: SmartInsightsTheme;
}

function themeTone(sentiment: string): Tone {
    const s = (sentiment || "").toLowerCase();
    // Anything other than a clear positive/negative (neutral, "mixed", blank) reads as Mixed, never as praise.
    return s === "positive" ? "good" : s === "negative" ? "bad" : "ok";
}

const VERDICT: Record<Tone, { label: string; className: string }> = {
    good: { label: "Customers love it", className: "bg-success/10 text-success" },
    ok: { label: "Mixed", className: "bg-warning/10 text-warning-foreground" },
    bad: { label: "Needs fixing", className: "bg-destructive/10 text-destructive" },
    none: { label: "Mixed", className: "bg-muted text-muted-foreground" },
};

/** Bar length = how many reviews mention the theme; colour = whether they liked it. */
export function SmartInsightsCardThemesTab({
    themes,
    selectedThemeIndex,
    onSelectTheme,
    selectedTheme,
}: SmartInsightsCardThemesTabProps) {
    const widths = themeBarWidths(themes.map((t) => t.mentions || 0));
    const verdict = VERDICT[themeTone(selectedTheme.sentiment)];

    return (
        <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-5">
            <div className="flex flex-col gap-1 md:col-span-2">
                <p className="px-3 pb-1 text-xs text-muted-foreground">What customers talk about most</p>
                {themes.map((theme, i) => {
                    const selected = selectedThemeIndex === i;
                    return (
                        <button
                            type="button"
                            key={i}
                            aria-pressed={selected}
                            onClick={() => onSelectTheme(i)}
                            className={cn(
                                "w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                selected ? "border-primary bg-card" : "border-transparent hover:bg-secondary",
                            )}
                        >
                            <span className="flex items-baseline justify-between gap-3">
                                <span className="min-w-0 truncate text-[13px] font-bold text-foreground">{theme.name}</span>
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                    {theme.mentions}
                                    <span className="sr-only"> mentions</span>
                                </span>
                            </span>
                            <span aria-hidden className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <span className={cn("block h-full rounded-full", TONE_BG[themeTone(theme.sentiment)])} style={{ width: `${widths[i]}%` }} />
                            </span>
                        </button>
                    );
                })}
                <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3 pt-2 text-[11px] text-muted-foreground">
                    <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-success" />Liked</li>
                    <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-warning" />Mixed</li>
                    <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-destructive" />Disliked</li>
                </ul>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm md:col-span-3 lg:p-7">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", verdict.className)}>{verdict.label}</span>
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedTheme.mentions} mentions
                    </span>
                </div>

                <p className="mb-6 text-lg leading-snug text-foreground">&ldquo;{selectedTheme.summaryQuote}&rdquo;</p>

                {selectedTheme.customerQuotes?.length ? (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">What customers are saying</p>
                        {selectedTheme.customerQuotes.map((q, idx) => (
                            <blockquote key={idx} className="rounded-lg border border-border/60 bg-canvas-elevated p-3.5 text-[13px] leading-relaxed text-foreground/80">
                                {q}
                            </blockquote>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
