import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ update: vi.fn(), eq: vi.fn(), is: vi.fn(), admin: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { GET, POST } from "@/app/api/marketing/newsletter/unsubscribe/route";

const id = "9ea3634a-3e04-4d62-bf87-4f1d48d41bdc";
const url = `https://www.zyenereviews.com/api/marketing/newsletter/unsubscribe?id=${id}`;
const post = (destination = url, body = "List-Unsubscribe=One-Click") => new Request(destination, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body,
});
beforeEach(() => {
    vi.clearAllMocks();
    mocks.admin.mockReturnValue({ from: () => ({ update: mocks.update }) });
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ is: mocks.is });
    mocks.is.mockResolvedValue({ error: null });
});

describe("email one-click unsubscribe", () => {
    it("unsubscribes the opaque ID from an RFC 8058 POST without a login or redirect", async () => {
        const response = await POST(post());
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ unsubscribed: true });
        expect(mocks.eq).toHaveBeenCalledWith("id", id);
        expect(mocks.is).toHaveBeenCalledWith("unsubscribed_at", null);
        expect(mocks.update).toHaveBeenCalledWith({ unsubscribed_at: expect.any(String) });
    });
    it("rejects malformed links without writing subscription state", async () => {
        expect((await POST(post(url.replace(id, "invalid")))).status).toBe(400);
        expect(mocks.admin).not.toHaveBeenCalled();
        const response = await GET(new Request(url.replace(id, "invalid")));
        expect(response.headers.get("location")).toContain("error=missing");
        expect(response.headers.get("location")).not.toContain("id=invalid");
    });
    it("reports a provider failure instead of falsely acknowledging the opt-out", async () => {
        mocks.is.mockResolvedValue({ error: { message: "synthetic unavailable" } });
        const response = await POST(post());
        expect(response.status).toBe(500);
        expect(await response.json()).not.toHaveProperty("unsubscribed");
    });
    it("keeps browser form confirmation and prevents GET prefetches from opting people out", async () => {
        expect((await GET(new Request(url))).status).toBe(303);
        expect(mocks.admin).not.toHaveBeenCalled();
        const response = await POST(post(url, `id=${id}`));
        expect(response.status).toBe(303);
        expect(response.headers.get("location")).toContain("success=1");
    });
    it("returns a structured error for an unreadable request body", async () => {
        expect((await POST(new Request(url, { method: "POST", body: "invalid" }))).status).toBe(400);
        expect(mocks.admin).not.toHaveBeenCalled();
    });
});
