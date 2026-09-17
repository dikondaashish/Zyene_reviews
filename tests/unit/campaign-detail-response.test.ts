import { afterEach, expect, it, vi } from "vitest";
import { fetchCampaignDetail, sendCampaignContacts } from "@/app/(dashboard)/campaigns/[id]/campaign-detail-api";
afterEach(() => vi.unstubAllGlobals());
it("loads the saved campaign from the API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { campaign: { id: "saved" }, requests: [] } }))));
    const onSuccess = vi.fn();
    const onMissing = vi.fn();
    await fetchCampaignDetail("saved", onSuccess, onMissing);
    expect(onSuccess).toHaveBeenCalledWith({ id: "saved" }, []);
    expect(onMissing).not.toHaveBeenCalled();
});
it("reads queue counts from the send response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { queuedCount: 3, skippedCount: 1 } }))));
    await expect(sendCampaignContacts("saved", [{ phone: "123" }])).resolves.toEqual({ ok: true, result: { queuedCount: 3, skippedCount: 1 } });
});
