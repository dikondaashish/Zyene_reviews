import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ReviewsPageClientPrivatePanel } from "@/components/reviews/reviews-page-client-private-panel";

vi.mock("@/components/reviews/private-feedback-card", () => ({ PrivateFeedbackCard: () => createElement("article", null, "Existing feedback") }));

describe("private feedback loading", () => {
    it("announces loading without showing a false empty state", () => {
        const html = renderToStaticMarkup(createElement(ReviewsPageClientPrivatePanel, { loading: true, reviews: [] }));
        expect(html).toContain('role="status"');
        expect(html).toContain("Loading private feedback");
        expect(html).not.toContain("No private feedback yet");
        expect(html).not.toContain('inert=""');
    });

    it("only shows the empty state when loading has finished", () => {
        const html = renderToStaticMarkup(createElement(ReviewsPageClientPrivatePanel, { loading: false, reviews: [] }));
        expect(html).toContain("No private feedback yet");
        expect(html).not.toContain("Loading private feedback");
    });
});
