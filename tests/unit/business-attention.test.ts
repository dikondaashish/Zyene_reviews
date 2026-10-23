import { describe, expect, it } from "vitest";
import { attentionRank, getBusinessAttention, needsAttention, summarizeBusinesses } from "@/components/businesses/business-attention";
import type { BusinessDirectoryEntry } from "@/types/business-directory";

const entry = (patch: Partial<BusinessDirectoryEntry> = {}): BusinessDirectoryEntry => ({
    id: "b", name: "Shop", category: "Cafe", address: "", logoUrl: null, status: "active",
    googleStatus: "connected", rating: 4.5, reviewCount: 10, pendingReviews: 0, ...patch,
});

describe("getBusinessAttention", () => {
    it("puts a broken Google connection ahead of waiting reviews", () => {
        const attention = getBusinessAttention(entry({ googleStatus: "needs_reconnect", pendingReviews: 4 }));
        expect(attention).toMatchObject({ tone: "danger", action: { destination: "/settings/integrations" } });
    });

    it("asks to connect Google when it never was", () => {
        expect(getBusinessAttention(entry({ googleStatus: "not_connected" })).action?.label).toBe("Connect Google");
    });

    it("counts waiting reviews with correct grammar", () => {
        expect(getBusinessAttention(entry({ pendingReviews: 1 })).message).toBe("1 review is waiting for a reply.");
        expect(getBusinessAttention(entry({ pendingReviews: 3 })).message).toBe("3 reviews are waiting for a reply.");
    });

    it("is all caught up otherwise", () => {
        expect(needsAttention(entry())).toBe(false);
        expect(getBusinessAttention(entry()).action).toBeNull();
    });
});

describe("attentionRank", () => {
    it("orders danger, then warning, then ok", () => {
        const ranks = [entry(), entry({ pendingReviews: 2 }), entry({ googleStatus: "needs_reconnect" })].map(attentionRank);
        expect(ranks).toEqual([2, 1, 0]);
    });
});

describe("summarizeBusinesses", () => {
    it("weights the average rating by review count and skips unrated locations", () => {
        const summary = summarizeBusinesses([
            entry({ rating: 5, reviewCount: 30 }),
            entry({ rating: 3, reviewCount: 10, pendingReviews: 2 }),
            entry({ rating: null, reviewCount: 0, googleStatus: "not_connected" }),
        ]);
        expect(summary).toEqual({
            locations: 3, averageRating: 4.5, totalReviews: 40, waitingForReply: 2, googleConnected: 2, needingAttention: 2,
        });
    });

    it("reports no average when nothing is rated", () => {
        expect(summarizeBusinesses([entry({ rating: null, reviewCount: 0 })]).averageRating).toBeNull();
    });
});
