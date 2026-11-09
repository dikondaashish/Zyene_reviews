import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ resolve: vi.fn(), apply: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/services/review-requests/email-unsubscribe", () => ({
    resolveUnsubscribeTarget: m.resolve, applyUnsubscribe: m.apply,
}));

import { POST } from "@/app/api/review-requests/unsubscribe/route";

const URL_WITH_SIG = "https://app.example.com/api/review-requests/unsubscribe?ref=req-1&sig=good";

describe("review request unsubscribe POST", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        m.resolve.mockResolvedValue({ requestId: "req-1" });
        m.apply.mockResolvedValue(undefined);
    });

    it("honours an RFC 8058 one-click POST that arrives with an empty body", async () => {
        const res = await POST(new Request(URL_WITH_SIG, { method: "POST" }));
        expect(res.status).toBe(200);
        expect(m.resolve).toHaveBeenCalledWith("req-1", "good");
        expect(m.apply).toHaveBeenCalledWith(expect.anything(), "one_click");
    });

    it("honours a one-click POST sent as JSON", async () => {
        const res = await POST(new Request(URL_WITH_SIG, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
        }));
        expect(res.status).toBe(200);
        expect(m.apply).toHaveBeenCalledWith(expect.anything(), "one_click");
    });

    it("still handles the standard form one-click body", async () => {
        const body = new URLSearchParams({ "List-Unsubscribe": "One-Click" });
        const res = await POST(new Request(URL_WITH_SIG, { method: "POST", body }));
        expect(res.status).toBe(200);
        expect(m.apply).toHaveBeenCalledWith(expect.anything(), "one_click");
    });

    it("rejects a bad signature without unsubscribing", async () => {
        m.resolve.mockResolvedValue(null);
        const res = await POST(new Request(URL_WITH_SIG, { method: "POST" }));
        expect(res.status).toBe(400);
        expect(m.apply).not.toHaveBeenCalled();
    });
});
