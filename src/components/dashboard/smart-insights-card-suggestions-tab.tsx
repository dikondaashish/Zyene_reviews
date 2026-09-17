import { useId } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import type { SmartInsightsSuggestion } from "@/components/dashboard/smart-insights-card-types";

interface SmartInsightsCardSuggestionsTabProps {
    suggestions: SmartInsightsSuggestion[];
    dismissedIndices: Set<number>;
    expandedSuggestion: number | null;
    onSuggestionHeaderClick: (index: number) => void;
    onTakeAction: (e: React.MouseEvent, title: string) => void;
    onSeeExamples: (e: React.MouseEvent, suggestion: SmartInsightsSuggestion) => void;
    onDismiss: (e: React.MouseEvent, index: number) => void;
}

export function SmartInsightsCardSuggestionsTab({
    suggestions,
    dismissedIndices,
    expandedSuggestion,
    onSuggestionHeaderClick,
    onTakeAction,
    onSeeExamples,
    onDismiss,
}: SmartInsightsCardSuggestionsTabProps) {
    const panelId = useId();
    return (
        <div className="flex flex-col gap-3 h-full">
            {suggestions.map((suggestion, i) => {
                if (dismissedIndices.has(i)) return null;
                const isExpanded = expandedSuggestion === i;
                return (
                    <div
                        key={i}
                        className={`w-full text-left bg-card rounded-[16px] border border-border/40 transition-all overflow-hidden ${
                            isExpanded ? "shadow-md" : "hover:shadow-sm"
                        }`}
                    >
                        <div className="p-5">
                            <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={`${panelId}-${i}`}
                                className="flex w-full text-left flex-col sm:flex-row sm:items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
                                onClick={() => onSuggestionHeaderClick(i)}
                            >
                                <span className="shrink-0 pt-0.5">
                                    <span className="rounded-lg bg-primary/10 flex items-center justify-center size-8">
                                        <Sparkles
                                            className={`${ (suggestion.urgency || "").toLowerCase().includes("now") ? "text-primary" : "text-foreground" } size-4`}
                                        />
                                    </span>
                                </span>
                                <span className="flex-1 space-y-2">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-tight ${
                                                (suggestion.urgency || "").toLowerCase().includes("now")
                                                    ? "bg-destructive/10 text-destructive"
                                                    : "bg-muted text-foreground"
                                            }`}
                                        >
                                            {suggestion.urgency}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-success/10 text-success">
                                            {suggestion.impact}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-tight bg-muted text-muted-foreground">
                                            Effort: {suggestion.effort}
                                        </span>
                                    </span>
                                    <span className="flex items-center justify-between">
                                        <span className="text-[15px] font-bold text-foreground">{suggestion.title}</span>
                                        <ChevronDown
                                            className={`text-muted-foreground transition-transform duration-200 ${ isExpanded ? "rotate-180" : "" } size-4`}
                                        />
                                    </span>
                                </span>
                            </button>

                            <div
                                id={`${panelId}-${i}`}
                                inert={!isExpanded}
                                aria-hidden={!isExpanded}
                                className={`grid transition-all duration-300 ease-in-out ${
                                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="text-[13px] text-foreground/80 leading-relaxed sm:pl-11 pr-4">
                                        {suggestion.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 sm:pl-11 mt-4">
                                        <button
                                            type="button"
                                            onClick={(e) => onTakeAction(e, suggestion.title)}
                                            className="bg-primary hover:shadow-sm text-primary-foreground min-h-11 text-xs font-semibold px-4 py-2 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-lg transition-colors active:scale-95"
                                        >
                                            Take action
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => onSeeExamples(e, suggestion)}
                                            className="bg-transparent hover:bg-secondary border border-border/50 text-foreground min-h-11 text-xs font-semibold px-4 py-2 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-lg transition-colors active:scale-95"
                                        >
                                            See examples
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => onDismiss(e, i)}
                                            className="text-muted-foreground min-h-11 text-xs font-medium px-2 py-2 focus-visible:outline-2 focus-visible:outline-ring hover:text-primary transition-colors"
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
    );
}
