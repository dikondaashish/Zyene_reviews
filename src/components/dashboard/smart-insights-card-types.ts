export interface SmartInsightsTheme {
    name: string;
    mentions: number;
    sentiment: string;
    summaryQuote: string;
    customerQuotes: string[];
}

export interface SmartInsightsSuggestion {
    title: string;
    urgency: string;
    impact: string;
    effort: string;
    description: string;
}

export interface SmartInsightsData {
    headline: string;
    themes: SmartInsightsTheme[];
    suggestions: SmartInsightsSuggestion[];
    reviewCount: number;
    message?: string;
}
