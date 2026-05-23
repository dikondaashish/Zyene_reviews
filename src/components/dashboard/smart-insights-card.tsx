"use client";

import { useSmartInsightsCard } from "./use-smart-insights-card";
import { SmartInsightsCardLoading } from "./smart-insights-card-loading";
import { SmartInsightsCardHeader } from "./smart-insights-card-header";
import { SmartInsightsCardTabToggle } from "./smart-insights-card-tab-toggle";
import { SmartInsightsCardThemesTab } from "./smart-insights-card-themes-tab";
import { SmartInsightsCardSuggestionsTab } from "./smart-insights-card-suggestions-tab";
import { SmartInsightsCardExamplesDialog } from "./smart-insights-card-examples-dialog";

export function SmartInsightsCard({ businessName }: { businessName?: string }) {
    const s = useSmartInsightsCard(businessName);

    if (s.error) return null;
    if (s.loading) return <SmartInsightsCardLoading />;
    if (!s.data || !s.data.themes || s.data.themes.length === 0) return null;
    if (!s.selectedTheme) return null;

    return (
        <div className="rounded-[24px] bg-gradient-to-br from-[rgb(255,255,255)] via-[rgb(255,251,243)] to-[rgba(255,171,92,0.1)] border border-border/60 p-6 lg:p-8 flex flex-col h-full shadow-sm relative overflow-hidden dark:from-[rgb(15,23,42)] dark:via-[rgb(17,24,39)] dark:to-[rgba(30,41,59,0.9)] dark:border-white/10">
            <SmartInsightsCardHeader
                reviewCount={s.data.reviewCount}
                firstPart={s.firstPart}
                secondPart={s.secondPart}
                positivePct={s.positivePct}
            />

            <SmartInsightsCardTabToggle activeTab={s.activeTab} onTabChange={s.setActiveTab} />

            <div className="flex-1 relative z-10 w-full">
                {s.activeTab === "themes" ? (
                    <SmartInsightsCardThemesTab
                        themes={s.data.themes}
                        selectedThemeIndex={s.selectedThemeIndex}
                        onSelectTheme={s.setSelectedThemeIndex}
                        selectedTheme={s.selectedTheme}
                    />
                ) : (
                    <SmartInsightsCardSuggestionsTab
                        suggestions={s.data.suggestions}
                        dismissedIndices={s.dismissedIndices}
                        expandedSuggestion={s.expandedSuggestion}
                        onSuggestionHeaderClick={(i) =>
                            s.setExpandedSuggestion(s.expandedSuggestion === i ? null : i)
                        }
                        onTakeAction={s.handleTakeAction}
                        onSeeExamples={s.handleSeeExamples}
                        onDismiss={s.handleDismiss}
                    />
                )}
            </div>

            <SmartInsightsCardExamplesDialog
                open={s.examplesOpen}
                onOpenChange={(open) => {
                    s.setExamplesOpen(open);
                    if (!open) s.setExamplesSuggestion(null);
                }}
                examplesSuggestion={s.examplesSuggestion}
                exampleThemes={s.exampleThemes}
            />
        </div>
    );
}
