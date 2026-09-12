import { describe, expect, it, vi } from "vitest";
import { loadCampaignAudience } from "@/services/campaigns/campaign-audience";
import { campaignSendSchema } from "@/services/campaigns/campaigns-schema";

function clientFor(rows: { id: string; first_name: string; last_name: null; phone: string; email: null; is_opted_out: boolean }[]) {
    const query = { select: vi.fn(), eq: vi.fn(), in: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockResolvedValue({ data: rows, error: null });
    const client = { from: vi.fn().mockReturnValue(query) } as unknown as Parameters<typeof loadCampaignAudience>[0];
    return { client, query };
}

describe("selected campaign recipient access", () => {
    it("scopes recipient lookup to the campaign business and rejects incomplete selections", async () => {
        const { client, query } = clientFor([]);
        await expect(loadCampaignAudience(client, "authorized-business", ["foreign-customer"], "sms")).rejects.toThrow("no longer available");
        expect(query.eq).toHaveBeenCalledWith("business_id", "authorized-business");
    });
    it("deduplicates recipients and rechecks opt-out on the server", async () => {
        const { client } = clientFor([
            { id: "a", first_name: "A", last_name: null, phone: "123", email: null, is_opted_out: false },
            { id: "b", first_name: "B", last_name: null, phone: "456", email: null, is_opted_out: true },
        ]);
        expect(await loadCampaignAudience(client, "business", ["a", "a", "b"], "sms")).toEqual([
            { customerId: "a", name: "A", phone: "123", email: undefined },
        ]);
    });
    it("rejects ambiguous or oversized recipient requests", () => {
        const id = "11111111-1111-4111-8111-111111111111";
        expect(campaignSendSchema.safeParse({ contacts: [{ phone: "123" }], customerIds: [id] }).success).toBe(false);
        expect(campaignSendSchema.safeParse({ customerIds: Array.from({ length: 501 }, () => id) }).success).toBe(false);
        expect(campaignSendSchema.safeParse({ customerIds: [id] }).success).toBe(true);
    });
});
