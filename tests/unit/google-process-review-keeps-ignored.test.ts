import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ enqueue: vi.fn(), upserts: [] as Array<Record<string, unknown>> }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/services/reviews/auto-reply-eligibility", () => ({
    enqueueAutoReplyJob: m.enqueue,
    // Every rule would allow an auto-reply; only the reply state should stop it.
    reviewQualifiesForAutoReplyEnqueue: () => true,
}));

import { processGoogleReview } from "@/services/google/sync-service/process-review";

const admin = {
    from: () => ({
        upsert: (row: Record<string, unknown>) => {
            m.upserts.push(row);
            return { select: () => ({ single: async () => ({ data: { id: "rev-1", sentiment: "positive", text: "ok", created_at: "2026-01-01T00:00:00Z" }, error: null }) }) };
        },
    }),
} as never;

const unreplied = {
    reviewId: "g-1", starRating: "FIVE", comment: "Great", createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(), reviewer: { displayName: "Ann" },
} as never;

describe("processGoogleReview reply state", () => {
    beforeEach(() => {
        m.upserts.length = 0;
        m.enqueue.mockReset();
    });

    it("keeps an Ignored review ignored and never auto-replies to it", async () => {
        await processGoogleReview(admin, { id: "p1", business_id: "b1" } as never, unreplied, {} as never, {
            existing: { content_hash: "old", response_status: "ignored" },
        });
        expect(m.upserts[0].response_status).toBe("ignored");
        expect(m.enqueue).not.toHaveBeenCalled();
    });

    it("still queues auto-reply for a genuinely pending review", async () => {
        await processGoogleReview(admin, { id: "p1", business_id: "b1" } as never, unreplied, {} as never, {
            existing: null,
        });
        expect(m.upserts[0].response_status).toBe("pending");
        expect(m.enqueue).toHaveBeenCalledWith("rev-1");
    });
});
