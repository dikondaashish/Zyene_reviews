import { ChevronDown, Sparkles } from "lucide-react";
import type { SmartInsightsSuggestion } from "./smart-insights-card-types";

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
    return (
        <div className="flex flex-col gap-3 h-full">
            {suggestions.map((suggestion, i) => {
                if (dismissedIndices.has(i)) return null;
                const isExpanded = expandedSuggestion === i;
                return (
                    <div
                        key={i}
                        className={`w-full text-left bg-white rounded-[16px] border border-border/40 transition-all overflow-hidden dark:bg-[rgb(30,41,59)] dark:border-white/10 ${
                            isExpanded ? "shadow-md" : "hover:shadow-sm"
                        }`}
                    >
                        <div className="p-5">
                            <div
                                className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                                onClick={() => onSuggestionHeaderClick(i)}
                            >
                                <div className="shrink-0 pt-0.5">
                                    <div className="rounded-lg bg-[rgba(218,84,59,0.1)] flex items-center justify-center size-8">
                                        <Sparkles
                                            className={`w-4 h-4 ${
                                                (suggestion.urgency || "").toLowerCase().includes("now")
                                                    ? "text-[rgb(218,84,59)]"
                                                    : "text-foreground"
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-tight ${
                                                (suggestion.urgency || "").toLowerCase().includes("now")
                                                    ? "bg-[rgb(218,84,59)] text-white"
                                                    : "bg-muted text-foreground dark:bg-[rgb(51,65,85)] dark:text-[rgb(226,232,240)]"
                                            }`}
                                        >
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
                                        <h4 className="text-[15px] font-bold text-foreground">{suggestion.title}</h4>
                                        <ChevronDown
                                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                                                isExpanded ? "rotate-180" : ""
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${
                                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="text-[13px] text-foreground/80 leading-relaxed pl-11 pr-4">
                                        {suggestion.description}
                                    </p>
                                    <div className="flex items-center gap-3 pl-11 mt-4">
                                        <button
                                            type="button"
                                            onClick={(e) => onTakeAction(e, suggestion.title)}
                                            className="bg-[rgb(43,53,46)] hover:bg-[rgb(28,46,32)] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95"
                                        >
                                            Take action
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => onSeeExamples(e, suggestion)}
                                            className="bg-transparent hover:bg-[rgb(250,250,250)] border border-border/50 text-foreground text-xs font-semibold px-4 py-2 rounded-lg transition-colors active:scale-95 dark:hover:bg-[rgb(51,65,85)] dark:border-white/20 dark:text-[rgb(226,232,240)]"
                                        >
                                            See examples
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => onDismiss(e, i)}
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
    );
}
