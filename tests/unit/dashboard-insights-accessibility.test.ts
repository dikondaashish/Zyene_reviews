import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SmartInsightsCardSuggestionsTab } from "@/components/dashboard/smart-insights-card-suggestions-tab";
import { SmartInsightsCardTabToggle } from "@/components/dashboard/smart-insights-card-tab-toggle";

const props = {
  suggestions: [{ title: "Respond to waiting customers", urgency: "Now", impact: "High", effort: "Low", description: "Acknowledge their feedback." }],
  dismissedIndices: new Set<number>(),
  onSuggestionHeaderClick: vi.fn(), onTakeAction: vi.fn(), onSeeExamples: vi.fn(), onDismiss: vi.fn(),
};

describe("insights keyboard accessibility", () => {
  it("uses a native disclosure button and removes collapsed actions from keyboard navigation", () => {
    const html = renderToStaticMarkup(createElement(SmartInsightsCardSuggestionsTab, { ...props, expandedSuggestion: null }));
    expect(html).toMatch(/<button[^>]*aria-expanded="false"/);
    expect(html).toContain('inert=""');
    const target = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(target).toBeTruthy();
    expect(html).toContain(`id="${target}"`);
  });
  it("makes expanded actions available and preserves dismissal", () => {
    const html = renderToStaticMarkup(createElement(SmartInsightsCardSuggestionsTab, { ...props, expandedSuggestion: 0 }));
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('inert=""');
    expect(html).toContain("Take action");
    const dismissed = renderToStaticMarkup(createElement(SmartInsightsCardSuggestionsTab, { ...props, expandedSuggestion: null, dismissedIndices: new Set([0]) }));
    expect(dismissed).not.toContain(props.suggestions[0].title);
  });
  it.each(["themes", "suggestions"] as const)("exposes exactly one selected choice for %s", (activeTab) => {
    const html = renderToStaticMarkup(createElement(SmartInsightsCardTabToggle, { activeTab, onTabChange: vi.fn() }));
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
  });
});
