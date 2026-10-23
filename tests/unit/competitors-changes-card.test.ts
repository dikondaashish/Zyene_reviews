import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COLLAPSED_CHANGE_COUNT, CompetitorsChangesCard } from "@/app/(dashboard)/competitors/competitors-changes-card";
import type { ChangeFeedItem } from "@/lib/competitors/change-feed";

function feed(count: number): ChangeFeedItem[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `c${i}`,
        tone: "neutral",
        isAlert: false,
        text: `Change number ${i + 1}.`,
        createdAt: new Date(Date.UTC(2026, 9, 20 - i)).toISOString(),
    })) as ChangeFeedItem[];
}

const render = (items: ChangeFeedItem[]) =>
    renderToStaticMarkup(createElement(CompetitorsChangesCard, { items, rangeLabel: "30 days" }));

describe("competitor changes card", () => {
    it("starts collapsed, showing only the newest changes and a show-all button", () => {
        const html = render(feed(20));
        expect(html.match(/<li\b/g)).toHaveLength(COLLAPSED_CHANGE_COUNT);
        expect(html).toContain("Change number 1.");
        expect(html).not.toContain(`Change number ${COLLAPSED_CHANGE_COUNT + 1}.`);
        expect(html).toContain('aria-expanded="false"');
        expect(html).toContain("Show all 20 changes");
    });

    it("shows no toggle when everything already fits", () => {
        const html = render(feed(COLLAPSED_CHANGE_COUNT));
        expect(html.match(/<li\b/g)).toHaveLength(COLLAPSED_CHANGE_COUNT);
        expect(html).not.toContain("Show all");
    });
});
