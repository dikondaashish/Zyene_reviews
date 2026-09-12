import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ user: vi.fn(), access: vi.fn(), from: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: m.user }, from: m.from }) }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: m.access }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: m.limit }));
import { POST } from "@/app/api/requests/preview/route";
const req = () => new Request("https://example.test/api/requests/preview", { method: "POST", body: JSON.stringify({ businessId: "11111111-1111-4111-8111-111111111111", customerName: "Alex" }) });
beforeEach(() => {
    vi.clearAllMocks();
    m.user.mockResolvedValue({ data: { user: { id: "user" } } });
    m.access.mockResolvedValue(true);
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { name: "Real Business", slug: "real-business", organization_id: "org", timezone: "America/New_York" }, error: null }) };
    m.from.mockReturnValue(query);
    m.limit.mockResolvedValue({ max: 50, remaining: 23 });
});
it("previews real business copy without creating requests or sending messages", async () => {
    const response = await POST(req());
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sms).toContain("Hi Alex! Thanks for visiting Real Business.");
    expect(data.sms).toContain("/real-business?ref=[request-id]");
    expect(data.remainingSms).toBe(23);
    expect(m.from).toHaveBeenCalledExactlyOnceWith("businesses");
});
it("rejects another business before reading message configuration or quotas", async () => {
    m.access.mockResolvedValue(false);
    expect((await POST(req())).status).toBe(403);
    expect(m.from).not.toHaveBeenCalled();
    expect(m.limit).not.toHaveBeenCalled();
});
it("requires sign-in", async () => {
    m.user.mockResolvedValue({ data: { user: null } });
    expect((await POST(req())).status).toBe(401);
});
