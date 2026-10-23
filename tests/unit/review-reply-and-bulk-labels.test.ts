import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ReviewCardComposer, replyVisibilityNote } from "@/components/reviews/review-card-composer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: () => {} }) }));
const { BulkReviewActionBar } = await import("@/components/reviews/bulk-review-action-bar");

describe("reply visibility note", () => {
    it.each([
        ["google", false, "Posts publicly on Google under your business name."],
        ["facebook", false, "Posts publicly on Facebook under your business name."],
        ["tripadvisor", false, "Posts publicly on the review site under your business name."],
        ["google", true, "Replaces your public reply on Google."],
    ])("%s, editing %s", (platform, editing, note) => {
        expect(replyVisibilityNote(platform, editing)).toBe(note);
    });
});

function composer(isEditingReply = false, isSubmitting = false) {
    return renderToStaticMarkup(createElement(ReviewCardComposer, {
        review: { id: "r1", platform: "google" } as never,
        isEditingReply, replyText: "Thanks!", isAiTyping: false, isSubmitting,
        activeTone: null, loadingTone: null,
        onReplyTextChange: () => {}, onToneClick: () => {}, onCancelReplyComposer: () => {}, onSubmit: () => {},
    }));
}

describe("reply composer", () => {
    it("warns that the reply goes public before the owner clicks Post reply", () => {
        const html = composer();
        expect(html).toContain("Posts publicly on Google under your business name.");
        expect(html).toContain(">Post reply</button>");
        expect(html).not.toContain("Post Reply");
    });

    it("uses edit wording when changing an existing reply", () => {
        const html = composer(true);
        expect(html).toContain("Replaces your public reply on Google.");
        expect(html).toContain("Update reply");
    });

    it("shows progress wording while posting", () => {
        expect(composer(false, true)).toContain("Posting…");
    });
});

describe("bulk action bar", () => {
    const html = renderToStaticMarkup(createElement(BulkReviewActionBar, {
        selectedIds: ["a", "b"], onClearSelection: () => {}, businessId: "biz",
    }));

    it("names what each bulk action does", () => {
        expect(html).toContain("Mark as needs reply");
        expect(html).toContain("Mark as ignored");
        expect(html).not.toMatch(/>\s*Pending\s*</);
    });

    it("hides itself when nothing is selected", () => {
        expect(renderToStaticMarkup(createElement(BulkReviewActionBar, { selectedIds: [], onClearSelection: () => {}, businessId: "biz" }))).toBe("");
    });
});
