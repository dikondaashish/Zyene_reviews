import { z } from "zod";

const createdSchema = z.object({ campaign: z.object({ id: z.string().min(1) }) });
const queuedSchema = z.object({ queuedCount: z.number().int().nonnegative(), skippedCount: z.number().int().nonnegative().default(0) });

async function post(url: string, body: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const error = z.object({ error: z.string() }).safeParse(result);
        throw new Error(error.success ? error.data.error : "Could not save the campaign. Try again.");
    }
    return result;
}

export async function createAndQueueCampaign({ form, status, customerIds, existingCampaignId, onCreated }: {
    form: { name: string }; status: "draft" | "active"; customerIds: string[];
    existingCampaignId?: string; onCreated: (id: string) => void;
}) {
    let campaignId = existingCampaignId;
    if (!campaignId) {
        const created = createdSchema.parse(await post("/api/campaigns", { ...form, status }));
        campaignId = created.campaign.id;
        onCreated(campaignId);
    }
    if (status === "active" && customerIds.length > 0) {
        const result = z.object({ success: z.literal(true), data: queuedSchema }).parse(await post(`/api/campaigns/${campaignId}/send`, { customerIds })).data;
        return { campaignId, ...result };
    }
    return { campaignId, queuedCount: 0, skippedCount: 0 };
}
