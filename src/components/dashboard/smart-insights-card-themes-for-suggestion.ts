import type { SmartInsightsSuggestion, SmartInsightsTheme } from "./smart-insights-card-types";

function normalizeWords(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
}

/** Match a suggestion to themes so we can show real guest quotes in the examples dialog. */
export function themesForSuggestionExamples(
    suggestion: SmartInsightsSuggestion,
    themes: SmartInsightsTheme[],
): SmartInsightsTheme[] {
    const suggestionBlob = `${suggestion.title} ${suggestion.description}`;
    const sugWords = new Set(normalizeWords(suggestionBlob));

    const scored = themes.map((theme) => {
        const themeBlob = `${theme.name} ${theme.summaryQuote}`;
        let score = 0;
        for (const w of normalizeWords(themeBlob)) {
            if (sugWords.has(w)) score += 3;
        }
        for (const q of theme.customerQuotes || []) {
            for (const w of normalizeWords(q)) {
                if (sugWords.has(w)) score += 1;
            }
        }
        return { theme, score };
    });

    const positive = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    if (positive.length > 0) {
        return positive.slice(0, 4).map((s) => s.theme);
    }

    const withQuotes = themes
        .filter((t) => (t.customerQuotes?.length ?? 0) > 0)
        .sort((a, b) => (b.mentions ?? 0) - (a.mentions ?? 0));
    if (withQuotes.length > 0) {
        return withQuotes.slice(0, 3);
    }

    return themes.slice(0, 3);
}
