import { describe, expect, it } from "vitest";
import {
    resolveSyncedReplyState,
    ZYENE_REPLY_PROPAGATION_GRACE_MS,
} from "@/services/google/sync-service/synced-reply-state";
import { sameReviewReplyText } from "@/services/google/sync-service/helpers";
import { REVIEW_RESPONSE_SOURCE_GOOGLE, REVIEW_RESPONSE_SOURCE_ZYENE } from "@/lib/reviews/response-source";

const NOW = Date.parse("2026-11-08T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("resolveSyncedReplyState", () => {
    it("takes Google's reply when Google lists one", () => {
        expect(resolveSyncedReplyState({ comment: "Thanks!", updateTime: ago(0) }, null, sameReviewReplyText, NOW))
            .toMatchObject({ response_status: "responded", response_text: "Thanks!", response_source: REVIEW_RESPONSE_SOURCE_GOOGLE });
    });

    it("keeps the Zyene source when Google shows the same reply text", () => {
        const state = resolveSyncedReplyState(
            { comment: "Thanks!", updateTime: ago(0) },
            { response_status: "responded", response_source: REVIEW_RESPONSE_SOURCE_ZYENE, response_text: "Thanks!" },
            sameReviewReplyText, NOW,
        );
        expect(state.response_source).toBe(REVIEW_RESPONSE_SOURCE_ZYENE);
    });

    it("keeps an owner's Ignored choice when Google has no reply (was reset to pending)", () => {
        expect(resolveSyncedReplyState(undefined, { response_status: "ignored" }, sameReviewReplyText, NOW).response_status)
            .toBe("ignored");
    });

    it("keeps a reply Zyene just posted that Google hasn't listed yet", () => {
        const state = resolveSyncedReplyState(undefined, {
            response_status: "responded", response_source: REVIEW_RESPONSE_SOURCE_ZYENE,
            response_text: "Thank you", responded_at: ago(5 * 60_000),
        }, sameReviewReplyText, NOW);
        expect(state).toMatchObject({ response_status: "responded", response_text: "Thank you" });
    });

    it("reverts to pending once the grace window passes (reply removed on Google)", () => {
        const state = resolveSyncedReplyState(undefined, {
            response_status: "responded", response_source: REVIEW_RESPONSE_SOURCE_ZYENE,
            response_text: "Thank you", responded_at: ago(ZYENE_REPLY_PROPAGATION_GRACE_MS + 1),
        }, sameReviewReplyText, NOW);
        expect(state.response_status).toBe("pending");
    });

    it("does not trust a non-Zyene 'responded' without a Google reply", () => {
        const state = resolveSyncedReplyState(undefined, {
            response_status: "responded", response_source: REVIEW_RESPONSE_SOURCE_GOOGLE, responded_at: ago(60_000),
        }, sameReviewReplyText, NOW);
        expect(state.response_status).toBe("pending");
    });

    it("is pending for a new review", () => {
        expect(resolveSyncedReplyState(undefined, null, sameReviewReplyText, NOW))
            .toEqual({ response_status: "pending", response_text: null, responded_at: null, response_source: null });
    });
});
