import { describe, expect, it, vi } from "vitest";
import { createFakeDb } from "./helpers/fake-supabase";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { failRequestAfterDispatchError } from "@/lib/review-requests/fail-request-on-dispatch-error";

describe("failRequestAfterDispatchError", () => {
    it("moves a request stuck in 'sending' to 'failed' with a reason", async () => {
        const db = createFakeDb({ review_requests: [{ id: "r1", business_id: "b1", status: "sending" }] });
        await failRequestAfterDispatchError(db.client as never, "r1", "b1", new Error("ledger claim failed"));
        expect(db.tables.review_requests[0]).toMatchObject({ status: "failed" });
        expect(db.tables.review_requests[0].error_message).toBeTruthy();
    });

    it("never overwrites a request that already moved on, or another tenant's", async () => {
        const db = createFakeDb({ review_requests: [
            { id: "r1", business_id: "b1", status: "sent" },
            { id: "r2", business_id: "other", status: "sending" },
        ] });
        await failRequestAfterDispatchError(db.client as never, "r1", "b1", new Error("x"));
        await failRequestAfterDispatchError(db.client as never, "r2", "b1", new Error("x"));
        expect(db.tables.review_requests.map((r) => r.status)).toEqual(["sent", "sending"]);
    });
});
