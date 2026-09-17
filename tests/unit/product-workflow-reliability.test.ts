import { afterEach, describe, expect, it, vi } from "vitest";
import { executeCustomerBulkAction } from "@/components/customers/customer-bulk-action-request";
import { selectCampaignAudience } from "@/services/campaigns/campaign-audience";
import { createAndQueueCampaign } from "@/app/(dashboard)/campaigns/new/create-and-queue-campaign";

afterEach(() => vi.unstubAllGlobals());

describe("customer action outcomes", () => {
    it("rejects HTTP failures instead of announcing success", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Monthly limit reached" }), { status: 403 })));
        await expect(executeCustomerBulkAction({ ids: ["a"], businessId: "b", action: "request" })).rejects.toThrow("Monthly limit reached");
    });
    it("preserves partial send counts", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, sent: 2, failed: 1, limitReached: true }))));
        await expect(executeCustomerBulkAction({ ids: ["a", "b", "c", "d"], businessId: "b", action: "request" })).resolves.toMatchObject({ sent: 2, failed: 1, limitReached: true });
    });
});

describe("campaign audience", () => {
    const rows = [
        { id: "1", first_name: "A", last_name: "One", phone: "123", email: null, is_opted_out: false },
        { id: "2", first_name: "B", last_name: null, phone: "234", email: "b@example.com", is_opted_out: true },
        { id: "3", first_name: "C", last_name: null, phone: null, email: "c@example.com", is_opted_out: false },
    ];
    it("excludes opted-out customers and contacts without the chosen channel", () => {
        expect(selectCampaignAudience(rows, "sms").map(c => c.customerId)).toEqual(["1"]);
        expect(selectCampaignAudience(rows, "email").map(c => c.customerId)).toEqual(["3"]);
    });
    it("keeps the selected audience and created campaign on a failed enqueue", async () => {
        const fetcher = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ campaign: { id: "new-id" } }), { status: 201 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Queue unavailable" }), { status: 503 }));
        vi.stubGlobal("fetch", fetcher);
        const onCreated = vi.fn();
        await expect(createAndQueueCampaign({ form: { name: "Test" }, status: "active", customerIds: ["1"], onCreated })).rejects.toThrow("Queue unavailable");
        expect(onCreated).toHaveBeenCalledWith("new-id");
        expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ customerIds: ["1"] });
    });
    it("retries queueing without creating a duplicate campaign", async () => {
        const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { queuedCount: 1, skippedCount: 0 } })));
        vi.stubGlobal("fetch", fetcher);
        await expect(createAndQueueCampaign({ form: { name: "Test" }, status: "active", customerIds: ["1"], existingCampaignId: "saved-id", onCreated: vi.fn() })).resolves.toMatchObject({ campaignId: "saved-id", queuedCount: 1 });
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(fetcher.mock.calls[0][0]).toBe("/api/campaigns/saved-id/send");
    });
});
