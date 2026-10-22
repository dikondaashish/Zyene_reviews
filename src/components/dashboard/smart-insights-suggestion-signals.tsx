import { Clock, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActNow } from "@/lib/dashboard/dashboard-visuals";
import type { SmartInsightsSuggestion } from "@/components/dashboard/smart-insights-card-types";

/** When to act (icon), the expected gain (up arrow), and the effort. */
export function SuggestionSignals({ suggestion }: { suggestion: SmartInsightsSuggestion }) {
    const now = isActNow(suggestion.urgency || "");
    return (
        <span className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-0.5",
                    now ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                )}
            >
                {now ? <Zap className="size-3" aria-hidden /> : <Clock className="size-3" aria-hidden />}
                {suggestion.urgency}
            </span>
            {suggestion.impact ? (
                <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-success">
                    <TrendingUp className="size-3" aria-hidden />
                    {suggestion.impact}
                </span>
            ) : null}
            {suggestion.effort ? (
                <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">Effort: {suggestion.effort}</span>
            ) : null}
        </span>
    );
}
