import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), admin: vi.fn(), context: vi.fn(), access: vi.fn(), manage: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: m.client }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: m.admin }));
vi.mock("@/lib/auth/business-context", () => ({ getActiveBusinessId: m.context }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: m.access }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: m.manage }));
import { requirePhase2Context } from "@/app/(dashboard)/google-seo-aeo/phase-2/action-context";
import { GET } from "@/app/api/aeo/reports/[reportId]/route";
import { POST } from "@/app/api/aeo/crawler-log-sources/route";
const ID = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
    vi.resetAllMocks();
    const query = { select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: { business_id: "foreign", storage_path: "foreign/report.pdf", html: "report" } }) };
    m.client.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: "u" } } }) }, from: () => query });
    m.context.mockResolvedValue({ businessId: "b", business: { id: "b" }, organization: { id: "o" } });
    m.access.mockResolvedValue(false); m.manage.mockResolvedValue(false);
});
describe("AEO privileged access", () => {
    it("denies read-only or revoked membership before creating an admin context", async () => {
        await expect(requirePhase2Context()).rejects.toThrow("Forbidden");
        expect(m.access).toHaveBeenCalledWith(expect.anything(), "u", "b", true);
        expect(m.admin).not.toHaveBeenCalled();
    });
    it("requires management authority for integration actions", async () => {
        m.access.mockResolvedValue(true);
        await expect(requirePhase2Context(true)).rejects.toThrow("Forbidden");
        expect(m.manage).toHaveBeenCalledWith(expect.anything(), "u", "b");
        expect(m.admin).not.toHaveBeenCalled();
    });
    it.each(["html", "pdf"])("denies a foreign report before serving %s or signing storage", async (format) => {
        const result = await GET(new Request(`http://localhost/report?format=${format}`), { params: Promise.resolve({ reportId: ID }) });
        expect(result.status).toBe(404); expect(m.admin).not.toHaveBeenCalled();
    });
    it("allows an explicitly authorized writer", async () => {
        m.access.mockResolvedValue(true); m.admin.mockReturnValue({ server: "client" });
        expect((await requirePhase2Context()).businessId).toBe("b");
        expect(m.admin).toHaveBeenCalledOnce();
    });
    it("denies ingestion-key creation to a viewer or foreign tenant before admin access", async () => {
        const result = await POST(new Request("http://localhost", { method: "POST", body: JSON.stringify({
            businessId: ID, name: "Log source", source: "manual",
        }) }));
        expect(result.status).toBe(403); expect(m.admin).not.toHaveBeenCalled();
    });
});
