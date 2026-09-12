import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SmartInsightsCardThemesTab } from "@/components/dashboard/smart-insights-card-themes-tab";
import { SmartInsightsCardSuggestionsTab } from "@/components/dashboard/smart-insights-card-suggestions-tab";
import { SmartInsightsCardTabToggle } from "@/components/dashboard/smart-insights-card-tab-toggle";
import { SmartInsightsCardHeader } from "@/components/dashboard/smart-insights-card-header";

const theme = { name: "Helpful service", mentions: 12, sentiment: "positive", summaryQuote: "The team made us feel welcome.", customerQuotes: ["Helpful people and a lovely experience."] };
const noop = () => {};
const fixture = renderToStaticMarkup(createElement("div", { "data-dashboard-shell": true },
  createElement("h1", { "data-testid": "page-title" }, "Reviews"),
  createElement("p", { "data-testid": "body-copy" }, "Manage and respond to customer reviews."),
  createElement("main", { className: "mx-auto max-w-5xl space-y-6 p-4" },
    createElement("section", { className: "rounded-2xl border border-border bg-card p-5" },
      createElement(SmartInsightsCardHeader, { reviewCount: 24, firstPart: "Customers love your service.", secondPart: "Keep the momentum.", positivePct: 92 }),
      createElement(SmartInsightsCardTabToggle, { activeTab: "themes", onTabChange: noop }),
      createElement(SmartInsightsCardThemesTab, { themes: [theme, { ...theme, name: "Wait times", sentiment: "negative" }], selectedTheme: theme, selectedThemeIndex: 0, onSelectTheme: noop }),
    ),
    createElement(SmartInsightsCardSuggestionsTab, {
      suggestions: [{ title: "Follow up with your customers", urgency: "Now", impact: "High", effort: "Low", description: "Thank customers for their feedback." }],
      expandedSuggestion: null, dismissedIndices: new Set<number>(), onSuggestionHeaderClick: noop, onTakeAction: noop, onSeeExamples: noop, onDismiss: noop,
    }),
    createElement("p", { className: "bg-success/10 text-success rounded-lg p-4", "data-testid": "success" }, "Review request sent"),
    createElement("p", { className: "bg-warning/10 text-warning-foreground rounded-lg p-4", "data-testid": "warning" }, "Approaching your request limit"),
    createElement("button", { className: "bg-primary text-primary-foreground rounded-lg p-3", "data-testid": "action" }, "Request a review"),
  ),
));

process.stdout.write(fixture);
