import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { readRecommendationImpact } from "./recommendation-impact-view";

function Delta({ value, unit, label }: { value: number; unit: string; label: string }) {
    const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                value > 0 ? "bg-success/10 text-success" : value < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
            )}
        >
            <Icon className="size-3" aria-hidden />
            {value > 0 ? "+" : ""}
            {value}
            {unit} {label}
        </span>
    );
}

/** Result of an applied recommendation as up/down chips, measured against the day it was applied. */
export function RecommendationImpactChips({ impact }: { impact: unknown }) {
    const view = readRecommendationImpact(impact);
    if (view.kind === "pending") {
        return <p className="mt-1 text-xs text-muted-foreground">Measuring the result. Check back after the next AI check.</p>;
    }
    return (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {view.visibilityPts !== null ? <Delta value={view.visibilityPts} unit=" pts" label="AI mentions" /> : null}
            {/* Citations are only tracked for a target page, so 0 is usually "not tracked" rather than "no change". */}
            {view.citationDelta !== 0 ? (
                <Delta value={view.citationDelta} unit="" label={Math.abs(view.citationDelta) === 1 ? "citation" : "citations"} />
            ) : null}
            <span className="text-xs text-muted-foreground">
                vs before you applied it · last 30 days, {view.samples} AI {view.samples === 1 ? "check" : "checks"}
            </span>
        </div>
    );
}
