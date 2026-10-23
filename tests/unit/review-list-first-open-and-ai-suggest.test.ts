import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/reviews/review-card", () => ({
    ReviewCard: () => createElement("div", { "data-testid": "review-card" }, "full review"),
}));

const { CompactReviewRow } = await import("@/components/reviews/compact-review-row");
const { ReviewCardPendingReplyActions } = await import("@/components/reviews/review-card-pending-actions");

const review = { id: "r1", author_name: "Jordan Lee", rating: 5, platform: "google", text: "Great coffee", response_status: "pending" };

function row(open = false) {
    return renderToStaticMarkup(
        createElement(CompactReviewRow, {
            review: review as never,
            googleMapsListingUrl: null,
            planAllowsAiReplies: true,
            isSelected: false,
            onSelect: () => {},
            open,
            onOpenChange: () => {},
        }),
    );
}

describe("review list rows", () => {
    it("opens the first review like the first FAQ answer", () => {
        const html = row(true);
        expect(html).toContain('aria-expanded="true"');
        expect(html).toContain("full review");
        expect(html).toContain("Close review");
    });

    it("keeps the other reviews closed", () => {
        const html = row();
        expect(html).toContain('aria-expanded="false"');
        expect(html).not.toContain("full review");
        expect(html).toContain("Read &amp; reply");
    });
});

describe("AI suggest button", () => {
    it("is a soft tint that deepens on hover, not a solid orange button", () => {
        const html = renderToStaticMarkup(
            createElement(ReviewCardPendingReplyActions, {
                review: review as never,
                isReplying: false,
                activeTone: null,
                onCancelReplyComposer: () => {},
                onSetReplying: () => {},
                onToneClick: () => {},
                onSuggestProfessional: () => {},
            }),
        );
        const aiButton = html.match(/<button[^>]*>(?:(?!<\/button>).)*AI suggest/)?.[0] ?? "";
        expect(aiButton).toContain('data-variant="outline"');
        expect(aiButton).toContain("hover:bg-primary/20");
        expect(aiButton).toContain("hover:text-primary");
        expect(aiButton).not.toContain("hover:bg-accent");
    });
});
