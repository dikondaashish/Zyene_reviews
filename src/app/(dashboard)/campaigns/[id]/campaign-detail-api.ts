import { toast } from "sonner";
import type { Campaign } from "./campaign-detail-types";

export async function fetchCampaignDetail(
    campaignId: string,
    onSuccess: (campaign: Campaign, requests: unknown[]) => void,
    onMissing: () => void,
    onFinally?: () => void
) {
    try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) {
            onMissing();
            return;
        }
        const envelope = await res.json();
        const data = envelope.data;
        if (!data?.campaign) { onMissing(); return; }
        onSuccess(data.campaign, data.requests || []);
    } catch {
        onMissing();
    } finally {
        onFinally?.();
    }
}

export async function patchCampaignStatus(campaignId: string, newStatus: string) {
    const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
    });
    return res.ok;
}

export async function sendCampaignContacts(campaignId: string, contacts: { name?: string; phone?: string; email?: string }[]) {
    const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
    });
    const result = await res.json();
    return { ok: res.ok, result: res.ok ? result.data : result };
}

export function toastCampaignSendResult(
    result: { sent?: number; skipped?: number; failed?: number; queuedCount?: number; skippedCount?: number },
    verb: "Sent" | "Imported"
) {
    if (result.queuedCount !== undefined) {
        toast.success(`${result.queuedCount} contacts queued · ${result.skippedCount ?? 0} skipped`);
    } else {
        toast.message(`${verb}: ${result.sent ?? 0} · Skipped: ${result.skipped ?? 0} · Failed: ${result.failed ?? 0}`);
    }
}
